import torch
import torch.nn.functional as F
import numpy as np
import io
import tifffile
from sqlalchemy.orm import Session
from fastapi import HTTPException

import models
import schemas
from ai_model import FusionNet, preprocess_image, REG_MEAN, REG_STD, CULTIVAR_NAMES

# Constants used in calculations
# Updated from 1,200,000 to 150,000 based on standard agricultural densities (user feedback)
PLANT_DENSITY_PER_ACRE = 150_000
MG_TO_QUINTAL = 100_000_000
BASELINE_UREA_KG_PER_ACRE = 110

async def process_prediction(
    image_bytes: bytes,
    field_area: float,
    fertilizer_rate: float,
    user: models.User,
    db: Session,
    model: FusionNet,
    device: torch.device,
    filename: str = "upload.tif"
) -> dict:
    """
    Core prediction logic reused by API and WhatsApp Bot.
    """
    if model is None:
        raise HTTPException(status_code=500, detail="AI Model not loaded")

    # 1. Read Image
    try:
        # tifffile.imread can read from bytes in recent versions, but sometimes needs BytesIO
        with io.BytesIO(image_bytes) as bio:
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
    grain_weight = float(reg_pred[0])
    gsw = float(reg_pred[1])
    phips2 = float(reg_pred[2])
    fertilizer_score = float(reg_pred[3])

    # 4. Farming Calculations
    
    # 4a. Total Production (Quintals)
    total_production_quintals = (grain_weight * PLANT_DENSITY_PER_ACRE * field_area) / MG_TO_QUINTAL
    
    # 4b. Fertilizer Requirement (Urea kg)
    score_clipped = max(0.0, min(1.0, fertilizer_score))
    urea_per_acre = (1 - score_clipped) * BASELINE_UREA_KG_PER_ACRE
    urea_required_kg = urea_per_acre * field_area
    
    # 4c. Fertilizer Cost
    fertilizer_cost_inr = urea_required_kg * fertilizer_rate
    
    # 5. Save to DB
    fake_image_path = f"uploads/{filename}" # In real app, save file to disk
    
    prediction = models.Prediction(
        user_id=user.id,
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
    
    # 6. Response Construction
    response_data = schemas.PredictionResponse.from_orm(prediction).dict()
    
    # Add transient spectral data for graph (mean spectrum)
    mean_spectrum = image.mean(axis=(1, 2)).tolist()
    response_data["spectral_data"] = mean_spectrum
    response_data["cultivar_probs"] = probs.tolist()
    
    return response_data
