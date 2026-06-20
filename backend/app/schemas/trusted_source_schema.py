from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Services
class ServiceBase(BaseModel):
    name: str
    category: str
    description: str
    fee: float
    processing_time: str
    required_documents: List[str] = []

class ServiceCreate(ServiceBase):
    pass

class ServiceResponse(ServiceBase):
    id: int

    class Config:
        from_attributes = True

# Offices
class OfficeBase(BaseModel):
    name: str
    district: str
    office_type: str
    address: str
    notes: Optional[str] = ""

class OfficeCreate(OfficeBase):
    pass

class OfficeResponse(OfficeBase):
    id: int

    class Config:
        from_attributes = True

# Officers
class OfficerBase(BaseModel):
    office_name: str
    officer_name: str
    officer_role: str
    room_number: str
    available_days: str
    available_time: str
    status: str

class OfficerCreate(OfficerBase):
    pass

class OfficerResponse(OfficerBase):
    id: int

    class Config:
        from_attributes = True

# General TrustedSource Schemas
class TrustedSourceBase(BaseModel):
    title: str
    content: str
    source_type: str
    category: Optional[str] = None
    fee: Optional[float] = 0.0
    processing_time: Optional[str] = None
    required_documents: Optional[str] = None
    url: Optional[str] = None

class TrustedSourceCreate(TrustedSourceBase):
    pass

class TrustedSourceResponse(TrustedSourceBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True
