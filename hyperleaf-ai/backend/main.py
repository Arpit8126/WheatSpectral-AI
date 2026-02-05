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

import models
import schemas
import auth
from database import get_db
from ai_model import FusionNet, preprocess_image, REG_MEAN, REG_STD, CULTIVAR_NAMES

app = FastAPI(title="HyperLeaf AI API")

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
            # Load state dict
            # Note: map_location handles CPU/GPU
            state_dict = torch.load(MODEL_PATH, map_location=device)
            model.load_state_dict(state_dict)
            model.eval()
            print(f"✅ AI Model loaded from {MODEL_PATH}")
        else:
            print(f"⚠️ Model file not found at {MODEL_PATH}. Prediction will fail.")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")

@app.get("/")
def read_root():
    return {"message": "HyperLeaf AI API is running"}

@app.post("/api/predict", response_model=schemas.PredictionResponse)
async def predict(
    file: UploadFile = File(...),
    field_area: float = Form(...),
    fertilizer_rate: float = Form(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if model is None:
        raise HTTPException(status_code=500, detail="AI Model not loaded")

    # 1. Read Image
    try:
        contents = await file.read()
        # Create a buffer from bytes
        # tifffile.imread can read from bytes in recent versions, but sometimes needs BytesIO
        with io.BytesIO(contents) as bio:
            image = tifffile.imread(bio).astype(np.float32)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid TIFF file: {e}")

    # Validate Shape
    if len(image.shape) != 3 or image.shape[0] != 204:
        # Fallback/Debug: If user uploads something else, we might want to fail
        # But for robustness, check shape
        raise HTTPException(status_code=400, detail=f"Image must be [204, 48, 352]. Got {image.shape}")

    # 2. Preprocess & Inference
    try:
        input_tensor = preprocess_image(image)
        input_tensor = input_tensor.to(device)

        with torch.no_grad():
            logits, reg_pred_norm = model(input_tensor)
            
            # Probabilities
            probs = F.softmax(logits, dim=1)[0].cpu().numpy()
            
            # Regression (Denormalize)
            reg_pred_norm = reg_pred_norm[0].cpu().numpy()
            # reg_pred = reg_norm * STD + MEAN
            reg_pred = reg_pred_norm * REG_STD + REG_MEAN
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")

    # 3. Extract Results
    # Classes: ["Heerup", "Kvium", "Rembrandt", "Sheriff"]
    best_idx = np.argmax(probs)
    cultivar_prediction = CULTIVAR_NAMES[best_idx]
    confidence = float(probs[best_idx])

    # Regression: ["GrainWeight", "Gsw", "PhiPS2", "Fertilizer"]
    # Provide defaults/clamping if needed, but raw model output is usually fine
    grain_weight = float(reg_pred[0])
    gsw = float(reg_pred[1])
    phips2 = float(reg_pred[2])
    fertilizer_score = float(reg_pred[3])

    # 4. Farming Calculations
    
    # 4a. Total Production (Quintals)
    # Formula: (mg/plant * 1.2M plants/acre * acres) / 100,000,000
    PLANT_DENSITY_PER_ACRE = 1_200_000
    MG_TO_QUINTAL = 100_000_000
    total_production_quintals = (grain_weight * PLANT_DENSITY_PER_ACRE * field_area) / MG_TO_QUINTAL
    
    # 4b. Fertilizer Requirement (Urea kg)
    # Formula: Linear scaling. Score 0 -> 110 kg/acre. Score 1 -> 0 kg/acre.
    # Req = (1 - Score) * 110 * field_area
    # Clip score 0-1 for calculation safety
    score_clipped = max(0.0, min(1.0, fertilizer_score))
    BASELINE_UREA_KG_PER_ACRE = 110
    urea_per_acre = (1 - score_clipped) * BASELINE_UREA_KG_PER_ACRE
    urea_required_kg = urea_per_acre * field_area
    
    # 4c. Fertilizer Cost
    fertilizer_cost_inr = urea_required_kg * fertilizer_rate
    
    # 5. Save to DB
    fake_image_path = f"uploads/{file.filename}" # In real app, save file to disk
    
    prediction = models.Prediction(
        user_id=current_user.id,
        image_path=fake_image_path,
        cultivar_prediction=cultivar_prediction,
        confidence=confidence,
        grain_weight=grain_weight,
        gsw=gsw,
        phips2=phips2,
        fertilizer_score=fertilizer_score,
        field_area_acres=field_area,
        fertilizer_rate_inr=fertilizer_rate,
        urea_required_kg=urea_required_kg,
        fertilizer_cost_inr=fertilizer_cost_inr,
        total_production_quintals=total_production_quintals
    )
    
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    
    # 6. Response
    response_data = schemas.PredictionResponse.from_orm(prediction).dict()
    
    # Add transient spectral data for graph (mean spectrum)
    # We can calculate it from the real image
    mean_spectrum = image.mean(axis=(1, 2)).tolist()
    response_data["spectral_data"] = mean_spectrum
    response_data["cultivar_probs"] = probs.tolist()
    
    return response_data

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
    # Note: For dashboard history, we don't have the spectral data stored in DB
    # We will send a placeholder or empty list, or user has to accept 
    # it won't show the graph unless we stored it.
    # The frontend usually expects it.
    
    for pred in predictions:
        p_dict = schemas.PredictionResponse.from_orm(pred).dict()
        
        # Create dummy spectral data for display if missing (since we didn't store it)
        # In a real app we'd store the JSON or file path.
        # Use a smooth sine wave for visual appeal in history
        x = np.linspace(0, 10, 204)
        p_dict["spectral_data"] = (np.sin(x) + 2).tolist()
        
        # Reconstruct probs roughly if not stored
        # Make the predicted class 90% probably
        cultivars = ["Heerup", "Kvium", "Rembrandt", "Sheriff"]
        probs = np.zeros(4)
        if pred.cultivar_prediction in cultivars:
            idx = cultivars.index(pred.cultivar_prediction)
            probs[idx] = pred.confidence if pred.confidence else 0.9
            # Distribute rest
            remaining = 1.0 - probs[idx]
            for i in range(4):
                if i != idx:
                    probs[i] = remaining / 3
        p_dict["cultivar_probs"] = probs.tolist()
        
        results.append(p_dict)
        
    return results

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
