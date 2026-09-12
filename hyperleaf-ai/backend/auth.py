import os
import requests
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://rrrbmuqhjvkkkxuhrogk.supabase.co")
SUPABASE_ANON_KEY = os.getenv(
    "SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycmJtdXFoanZra2t4dWhyb2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNDY3NTgsImV4cCI6MjEwMzkyMjc1OH0.CtGB7UcOyO-DIGDGJihLOMS_0JoFRT1krTkmuY1uY-E"
)
SECRET_KEY = os.getenv("SECRET_KEY", "Your_Key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

router = APIRouter(prefix="/auth", tags=["auth"])

def verify_password(plain_password, hashed_password):
    if not hashed_password:
        return False
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    # 1. First, attempt validation via Supabase Auth
    try:
        sb_resp = requests.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {token}"
            },
            timeout=5
        )
        if sb_resp.status_code == 200:
            sb_user = sb_resp.json()
            user_id = sb_user.get("id")
            email = sb_user.get("email")
            meta = sb_user.get("user_metadata", {})
            username = meta.get("username") or (email.split("@")[0] if email else user_id)
            role = meta.get("role", "farmer")
            preferred_language = meta.get("preferred_language", "en")

            # Find or auto-sync user in the database
            user = db.query(models.User).filter(models.User.id == user_id).first()
            if not user:
                user = db.query(models.User).filter(models.User.email == email).first()
                if user:
                    user.id = user_id
                    db.commit()
                else:
                    user = models.User(
                        id=user_id,
                        email=email,
                        username=username,
                        role=role,
                        preferred_language=preferred_language
                    )
                    db.add(user)
                    db.commit()
                    db.refresh(user)
            return user
    except Exception as e:
        print(f"Supabase auth check error: {e}")

    # 2. Fallback to local JWT validation
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        id=f"local_{int(datetime.utcnow().timestamp())}",
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role or "farmer",
        preferred_language=user.preferred_language or "en"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user
