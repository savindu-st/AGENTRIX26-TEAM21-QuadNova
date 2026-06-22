from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TrustedSourceBase(BaseModel):
    name: str
    description: Optional[str] = None

# Services schema mapping to TrustedSource
class ServiceCreate(TrustedSourceBase):
    category: Optional[str] = None
    fee: Optional[float] = 0.0
    processing_time: Optional[str] = None

class ServiceResponse(TrustedSourceBase):
    id: int
    category: Optional[str] = None
    fee: Optional[float] = None
    processing_time: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Offices schema mapping to TrustedSource
class OfficeCreate(TrustedSourceBase):
    district: str
    office_type: Optional[str] = None
    address: Optional[str] = None

class OfficeResponse(TrustedSourceBase):
    id: int
    district: str
    office_type: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Officers schema mapping to TrustedSource
class OfficerCreate(TrustedSourceBase):
    office_id: Optional[int] = None
    role: Optional[str] = None
    room_number: Optional[str] = None
    available_days: Optional[str] = None
    available_time: Optional[str] = None
    status: Optional[str] = "Available"

class OfficerResponse(TrustedSourceBase):
    id: int
    office_id: Optional[int] = None
    role: Optional[str] = None
    room_number: Optional[str] = None
    available_days: Optional[str] = None
    available_time: Optional[str] = None
    status: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
