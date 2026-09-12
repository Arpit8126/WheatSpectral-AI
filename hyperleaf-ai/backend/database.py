import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Database credentials
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
engine = None

if SQLALCHEMY_DATABASE_URL:
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    try:
        temp_engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"connect_timeout": 2})
        with temp_engine.connect() as conn:
            pass
        engine = temp_engine
        print("[SUCCESS] Connected to Supabase PostgreSQL database successfully.")
    except Exception as e:
        print("[INFO] Could not reach Supabase PostgreSQL direct port. Falling back to local SQLite database.")
        engine = None

if not engine:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./spectral_wheat.db"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
