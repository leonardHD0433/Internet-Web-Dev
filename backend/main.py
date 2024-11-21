from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from routes import router

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[f"http://localhost:{os.getenv('FRONTEND_PORT')}"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router, prefix="")

