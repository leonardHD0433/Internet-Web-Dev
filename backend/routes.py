from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from .models import SessionLocal, Login

app = FastAPI()

# Allow CORS for the React frontend
origins = [
    "http://localhost:3000",  # React frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI backend!"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}

@app.post("/items/")
def create_item(item: dict):
    return {"item": item}

# Pydantic model for login request validation
class LoginRequest(BaseModel):
    email: str
    password: str

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create a route to handle the form submission
@app.get('/login')
def submit(login_request: LoginRequest, db: Session = Depends(get_db)):
    email = login_request.email
    passwd = login_request.password

    # Compare against database
    login = db.query(Login).filter_by(email=email).first()

    if login and login.passwd == passwd:
        # Generate and send verification code
        return {"success": True, "message": "Login successful"}
    else:
        raise HTTPException(status_code=400, detail="Invalid credentials")