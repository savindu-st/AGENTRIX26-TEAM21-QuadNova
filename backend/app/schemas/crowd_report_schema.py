from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CrowdReportBase(BaseModel):
    office_name: str
    report_text: str

class CrowdReportCreate(CrowdReportBase):
    case_id: Optional[int] = None
    area_id: Optional[int] = None

class CrowdReportVerify(BaseModel):
    verification_status: str  # "Verified", "Rejected", "Pending"

class CrowdReportResponse(CrowdReportBase):
    id: int
    case_id: Optional[int]
    area_id: Optional[int]
    verification_status: str
    upvotes: int
    created_at: datetime

    class Config:
        from_attributes = True
