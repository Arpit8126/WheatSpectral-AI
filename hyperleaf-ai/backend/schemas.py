from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: str
    preferred_language: Optional[str] = "en"

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "farmer"

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class PredictionBase(BaseModel):
    pass

class PredictionResponse(BaseModel):
    id: int
    image_path: str
    cultivar_prediction: str
    confidence: float
    grain_weight: float
    gsw: float
    phips2: float
    fertilizer_score: float
    field_area_acres: float
    fertilizer_rate_inr: float
    urea_required_kg: float
    fertilizer_cost_inr: float
    total_production_quintals: float
    created_at: datetime
    
    # Transient fields
    spectral_data: Optional[List[float]] = None
    cultivar_probs: Optional[List[float]] = None

    class Config:
        from_attributes = True
