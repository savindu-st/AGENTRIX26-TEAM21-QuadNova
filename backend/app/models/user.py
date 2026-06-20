from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.database.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)
    role = Column(String, default="citizen")  # "citizen", "admin", "officer"
    phone_number = Column(String, nullable=True)
    preferred_language = Column(String, default="English")
    created_at = Column(DateTime, default=datetime.utcnow)
