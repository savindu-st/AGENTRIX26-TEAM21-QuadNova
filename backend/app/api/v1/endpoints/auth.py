import hashlib
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.db import get_db
from backend.app.models.user import User
from backend.app.models.area import Area
from pydantic import BaseModel
from typing import Optional

auth_router = APIRouter()

# ── helpers ──────────────────────────────────
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain: str, stored: str) -> bool:
    if stored == hash_password(plain):
        return True
    if stored.startswith("$2"):
        try:
            import bcrypt
            return bcrypt.checkpw(plain.encode(), stored.encode())
        except Exception:
            pass
    return False

# ── schemas ───────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str
    city: Optional[str] = None   # optional: filter by district

# ── endpoints ────────────────────────────────
@auth_router.post("/login")
def admin_login(credentials: LoginRequest, db: Session = Depends(get_db)):
    # Always look up by username only first
    user = db.query(User).filter(User.username == credentials.username).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if user.role not in ("admin", "officer"):
        raise HTTPException(status_code=403, detail="Access denied. Admin privileges required.")

    # If user is a district admin (has a city), and a city was provided in login,
    # make sure they match. Super admin (city=None) can log in from any district.
    if user.city and credentials.city and user.city != credentials.city:
        raise HTTPException(status_code=403, detail=f"This account belongs to {user.city} district, not {credentials.city}.")

    return {
        "success": True,
        "user": {
            "id":       user.id,
            "username": user.username,
            "email":    user.email,
            "role":     user.role,
            "city":     user.city,
        }
    }

@auth_router.get("/districts")
def list_districts(db: Session = Depends(get_db)):
    """Return all seeded district names for the login dropdown."""
    areas = db.query(Area).order_by(Area.name).all()
    return [{"id": a.id, "name": a.name} for a in areas]

@auth_router.post("/seed-admin")
def seed_admin(db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == "admin").first()
    if existing:
        return {"message": "Admin already exists", "username": existing.username}
    db.add(User(
        username="admin",
        email="admin@prajanavigator.lk",
        password_hash=hash_password("admin123"),
        role="admin",
        city=None,
    ))
    db.commit()
    return {"message": "Admin created", "username": "admin", "password": "admin123"}

@auth_router.post("/reset-admin-password")
def reset_admin_password(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == "admin").first()
    if not user:
        raise HTTPException(status_code=404, detail="Admin not found")
    user.password_hash = hash_password("admin123")
    db.commit()
    return {"message": "Admin password reset to admin123"}
