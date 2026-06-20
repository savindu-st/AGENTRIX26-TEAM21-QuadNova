from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CitizenCaseBase(BaseModel):
    citizen_name: str
    district: str
    description: str

class CitizenCaseCreate(CitizenCaseBase):
    user_id: Optional[int] = None

class CitizenCaseUpdateStatus(BaseModel):
    status: str

class CitizenCaseResponse(CitizenCaseBase):
    id: int
    user_id: Optional[int]
    detected_service: Optional[str]
    status: str
    visitguard_score: int
    risk_level: str
    created_at: datetime

    class Config:
        from_attributes = True
