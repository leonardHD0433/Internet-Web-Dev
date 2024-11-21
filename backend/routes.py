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
def login(email: str, password: str, db: Session = Depends(get_db)):
    print(f"Login attempt - email: {email}, password: {password}")
    # user = db.query(Users).filter(Users.user_id == user_id).first()
    # if user and user.password == password:
    #     return {"success": True, "user_id": user.user_id}
    # raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"success": True, "email": email, "password": password}

@router.get("/register")
def register(name: str, email: str, username: str, password: str, db: Session = Depends(get_db)):
    print(f"Registration attempt - name: {name}, email: {email}, username: {username}, password: {password}")
    # user = db.query(Users).filter(Users.user_id == user_id).first()
    # if user:
    #     raise HTTPException(status_code=400, detail="User already exists")
    # new_user = Users(user_id=user_id, password=password)
    # db.add(new_user)
    # db.commit()
    return {"success": True, "name": name, "email": email, "username": username, "password": password}
