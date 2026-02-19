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
    
    # Market Data (Optional as it might not be calculated yet)
    recommended_market: Optional[str] = None
    market_price: Optional[float] = None
    transport_cost: Optional[float] = None
    net_profit: Optional[float] = None
    mandi_distance: Optional[float] = None
    
    # Transient fields
    spectral_data: Optional[List[float]] = None
    cultivar_probs: Optional[List[float]] = None

    class Config:
        from_attributes = True

# --- Market Linkage Schemas ---

class MandiPrice(BaseModel):
    state: str
    district: str
    market: str
    commodity: str
    variety: str
    grade: str
    min_price: float
    max_price: float
    modal_price: float
    arrival_date: str
    distance_km: Optional[float] = None  # Mocked distance from user

class MarketStrategy(BaseModel):
    recommended_market: str
    recommended_price: float
    total_revenue: float
    transport_cost: float
    net_profit: float
    recommendation_text: str
    alternative_markets: List[MandiPrice]
