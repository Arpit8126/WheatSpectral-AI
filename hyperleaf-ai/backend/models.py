from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="farmer") # 'admin' or 'farmer'
    preferred_language = Column(String, default="en") # 'en' or 'hi'
    created_at = Column(DateTime, default=datetime.utcnow)

    predictions = relationship("Prediction", back_populates="owner")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    image_path = Column(String)
    
    # Prediction Results
    cultivar_prediction = Column(String)
    confidence = Column(Float)
    
    # Regression Outputs
    grain_weight = Column(Float)
    gsw = Column(Float)
    phips2 = Column(Float)
    fertilizer_score = Column(Float)
    
    # User Inputs & Calculated Fields
    field_area_acres = Column(Float)
    fertilizer_rate_inr = Column(Float)
    
    urea_required_kg = Column(Float)
    fertilizer_cost_inr = Column(Float)
    total_production_quintals = Column(Float)
    
    # Market Linkage Data (Persisted)
    recommended_market = Column(String, nullable=True)
    market_price = Column(Float, nullable=True)     # Price per quintal
    transport_cost = Column(Float, nullable=True)   # Total transport cost
    net_profit = Column(Float, nullable=True)       # Estimated Net Profit
    mandi_distance = Column(Float, nullable=True)   # Distance to recommended mandi
    market_updated_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="predictions")
