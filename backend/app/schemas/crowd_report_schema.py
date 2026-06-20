from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CrowdReportBase(BaseModel):
    case_id: Optional[str] = None
    office_id: Optional[int] = None
    report_text: str

class CrowdReportCreate(CrowdReportBase):
    pass

class CrowdReportVerify(BaseModel):
    verification_status: str  # 'Verified', 'Rejected', 'Pending'

class CrowdReportResponse(CrowdReportBase):
    id: int
    verification_status: str
    created_at: datetime

    class Config:
        from_attributes = True
