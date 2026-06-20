from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import engine
from app.database.base import Base
from app.api.v1.routes import api_router
from app import models

# Auto-create SQLite tables on startup
Base.metadata.create_all(bind=engine)

# Seed database on startup if empty
from app.database.seed import seed_db
from app.database.db import SessionLocal
from app.models.trusted_source import TrustedSource

db = SessionLocal()
try:
    if db.query(TrustedSource).count() == 0:
        seed_db()
except Exception as e:
    print(f"Failed to auto-seed: {e}")
finally:
    db.close()

app = FastAPI(title="PrajaNavigator AI API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "PrajaNavigator AI Backend is running!"}

# Include API routes
app.include_router(api_router, prefix="/api/v1")
