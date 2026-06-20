from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: str
    role: str = "citizen"
    phone_number: Optional[str] = None
    preferred_language: str = "English"

class UserCreate(UserBase):
    password_hash: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
