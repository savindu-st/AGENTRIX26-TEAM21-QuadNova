import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database.db import engine, SessionLocal
from backend.app.database.base import Base
from backend.app.database.seed import seed_db
from backend.app.api.v1.routes import api_router

# Set up logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("prajanavigator.main")

# Initialize database tables on startup
logger.info("Initializing database tables...")
Base.metadata.create_all(bind=engine)

# ── Migrate: add 'city' column to users if it doesn't exist ──
try:
    with engine.connect() as conn:
        conn.execute(__import__('sqlalchemy').text("ALTER TABLE users ADD COLUMN city TEXT"))
        conn.commit()
        logger.info("Migration: added 'city' column to users table")
except Exception as e:
    if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
        logger.info("Migration: 'city' column already exists, skipping")
    else:
        logger.warning(f"Migration warning: {e}")

# Seed database
logger.info("Seeding database default records...")
db = SessionLocal()
try:
    seed_db(db)
finally:
    db.close()

app = FastAPI(title="PrajaNavigator AI API")

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers under /api/v1
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "PrajaNavigator AI Backend is running!"}
