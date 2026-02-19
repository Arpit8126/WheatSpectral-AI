from fastapi import FastAPI, File, UploadFile, Depends, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn
import numpy as np
import io
import torch
import torch.nn.functional as F
import tifffile
import os
from datetime import datetime

import models
import schemas
import auth
from database import get_db
from ai_model import FusionNet, preprocess_image, REG_MEAN, REG_STD, CULTIVAR_NAMES
import prediction_service
import market_service

app = FastAPI(title="WheatSpectral AI API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Auth Router
app.include_router(auth.router)

# Include WhatsApp Router
# WhatsApp Router removed

# --- Model Loading ---
MODEL_PATH = "1D+2D CNN + Axial Attention.pt"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = None

@app.on_event("startup")
async def load_ai_model():
    global model
    try:
        if os.path.exists(MODEL_PATH):
            model = FusionNet().to(device)
            state_dict = torch.load(MODEL_PATH, map_location=device)
            model.load_state_dict(state_dict)
            model.eval()
            app.state.model = model
            app.state.device = device
            print(f"✅ AI Model loaded from {MODEL_PATH}")
        else:
            print(f"⚠️ Model file not found at {MODEL_PATH}. Prediction will fail.")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")

@app.get("/")
def read_root():
    return {"message": "WheatSpectral AI API is running"}

@app.post("/api/predict", response_model=schemas.PredictionResponse)
async def predict(
    file: UploadFile = File(...),
    field_area: float = Form(...),
    fertilizer_rate: float = Form(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    try:
        image_bytes = await file.read()
        return await prediction_service.process_prediction(
            image_bytes=image_bytes,
            field_area=field_area,
            fertilizer_rate=fertilizer_rate,
            user=current_user,
            db=db,
            model=model,
            device=device,
            filename=file.filename
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/users", response_model=list[schemas.UserResponse])
def get_all_users(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    users = db.query(models.User).filter(models.User.role == "farmer").all()
    return users

@app.get("/api/dashboard", response_model=list[schemas.PredictionResponse])
def get_dashboard_data(
    user_id: int | None = None, 
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(get_db)
):
    query = db.query(models.Prediction)
    
    if current_user.role == "admin":
        if user_id:
            query = query.filter(models.Prediction.user_id == user_id)
    else:
        query = query.filter(models.Prediction.user_id == current_user.id)
        
    predictions = query.order_by(models.Prediction.created_at.desc()).all()
    
    results = []
    
    for pred in predictions:
        p_dict = schemas.PredictionResponse.from_orm(pred).dict()
        
        # Create dummy spectral data for display if missing
        x = np.linspace(0, 10, 204)
        p_dict["spectral_data"] = (np.sin(x) + 2).tolist()
        
        # Reconstruct probs
        cultivars = ["Heerup", "Kvium", "Rembrandt", "Sheriff"]
        probs = np.zeros(4)
        if pred.cultivar_prediction in cultivars:
            idx = cultivars.index(pred.cultivar_prediction)
            probs[idx] = pred.confidence if pred.confidence else 0.9
            remaining = 1.0 - probs[idx]
            for i in range(4):
                if i != idx:
                    probs[i] = remaining / 3
        p_dict["cultivar_probs"] = probs.tolist()
        
        results.append(p_dict)
        
    return results

# --- Market Linkage Endpoints ---

@app.get("/api/market/prices", response_model=list[schemas.MandiPrice])
def get_market_prices(
    crop: str = "Wheat", 
    lat: float | None = None, 
    lon: float | None = None
):
    user_lat = float(lat) if lat is not None else market_service.DEFAULT_USER_LAT
    user_lon = float(lon) if lon is not None else market_service.DEFAULT_USER_LON
    
    return market_service.get_mandi_prices(crop, user_lat, user_lon)

@app.post("/api/market/strategy", response_model=schemas.MarketStrategy)
def get_market_strategy(
    prediction_id: int, 
    lat: float | None = Form(None), 
    lon: float | None = Form(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    print(f"DEBUG: Market Strategy Request - PredID: {prediction_id}, Lat: {lat}, Lon: {lon}")
    try:
        # Fetch prediction
        prediction = db.query(models.Prediction).filter(models.Prediction.id == prediction_id).first()
        if not prediction:
            print(f"DEBUG: Prediction {prediction_id} not found")
            raise HTTPException(status_code=404, detail="Prediction not found")
            
        # Check ownership
        if prediction.user_id != current_user.id and current_user.role != "admin":
            print(f"DEBUG: User {current_user.id} not authorized for Prediction {prediction_id}")
            raise HTTPException(status_code=403, detail="Not authorized to access this prediction")
            
        # Use provided lat/lon or default
        user_lat = float(lat) if lat is not None else market_service.DEFAULT_USER_LAT
        user_lon = float(lon) if lon is not None else market_service.DEFAULT_USER_LON
        if user_lat == 0 and user_lon == 0:
             print("DEBUG: Lat/Lon is 0, using defaults")
             user_lat = market_service.DEFAULT_USER_LAT
             user_lon = market_service.DEFAULT_USER_LON
             
        print(f"DEBUG: Calculation using user_lat={user_lat}, user_lon={user_lon}")
        
        # Calculate Strategy
        strategy = market_service.calculate_strategy(prediction, user_lat, user_lon)
        
        # --- PERSIST DATA TO DB ---
        print("DEBUG: Saving market strategy to DB...")
        prediction.recommended_market = strategy.recommended_market
        prediction.market_price = strategy.recommended_price
        prediction.transport_cost = strategy.transport_cost
        prediction.net_profit = strategy.net_profit
        
        # Calculate distance to recommended market if valid
        if strategy.recommended_market and strategy.recommended_market != "None":
             # We need to find the specific market object from alternatives or re-calculate
             # Simplify: Check alternatives first
             for m in strategy.alternative_markets:
                 if m.market == strategy.recommended_market:
                     prediction.mandi_distance = m.distance_km
                     break
        
        prediction.market_updated_at = datetime.utcnow()
        db.commit()
        db.refresh(prediction)
        print("DEBUG: Market Data Saved Successfully.")
        
        return strategy
    except Exception as e:
        print(f"DEBUG: Error in get_market_strategy: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Ensure port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
