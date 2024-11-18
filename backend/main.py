from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def test_db_connection():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DATABASE_HOST'),
            user=os.getenv('DATABASE_USER'),
            password=os.getenv('DATABASE_PASSWORD'),
            database=os.getenv('DATABASE_NAME'),
            port=os.getenv('DATABASE_PORT')
        )
        if conn.is_connected():
            conn.close()
            return True
        return False
    except mysql.connector.Error as err:
        print(f"Database error: {err}")  # Add logging
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")  # Add logging
        return False

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/db-check")
def db_check():
    is_connected = test_db_connection()
    return {"status": "connected" if is_connected else "disconnected"}