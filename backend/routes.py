from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from urllib.parse import unquote
from database import get_db, test_db_connection
from models import (
    SessionLocal, Users
)

# Initialize router instead of app
router = APIRouter()

@router.get("/api/health")
def health_check():
    return {"status": "healthy"}

@router.get("/api/db-check")
def db_check():
    db_status = test_db_connection()
    return {
        "status": "connected" if db_status else "disconnected"
    }

@router.get("/login")
def login(user_id: int, password: str, db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.user_id == user_id).first()
    if user and user.password == password:
        return {"success": True, "user_id": user.user_id}
    raise HTTPException(status_code=401, detail="Invalid credentials")

