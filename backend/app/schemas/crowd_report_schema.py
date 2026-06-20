from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class CrowdReportBase(BaseModel):
    case_id: Optional[str] = None
    office_id: Optional[int] = None
    report_text: str

# Accept the richer payload from the citizen frontend's CommunityUpdate form
class CrowdReportCreate(BaseModel):
    case_id: Optional[str] = None
    office_id: Optional[int] = None
    # Structured fields from CommunityUpdate.jsx
    office: Optional[str] = None
    counter: Optional[str] = None
    friction_tags: Optional[List[str]] = []
    comments: Optional[str] = None
    # Fallback raw text
    report_text: Optional[str] = None

class CrowdReportVerify(BaseModel):
    verification_status: str  # 'Verified', 'Rejected', 'Pending'

class CrowdReportResponse(BaseModel):
    id: int
    case_id: Optional[str] = None
    office_id: Optional[int] = None
    report_text: str
    verification_status: str
    created_at: datetime

    class Config:
        from_attributes = True
