from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class AIAnalyzeRequest(BaseModel):
    case_id: int
    description: str
    district: str
    available_documents: List[str]

class AIResponseBase(BaseModel):
    answer: str
    checklist: Optional[str] = None
    missing_documents: Optional[str] = None
    recommended_steps: Optional[str] = None

class AIResponseSchema(AIResponseBase):
    id: int
    case_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AIAnalyzeResponse(BaseModel):
    service_name: str
    office: Optional[str] = None
    required_documents: List[str] = []
    missing_documents: List[str] = []
    steps: List[str] = []
    visitguard_score: int
    risk_level: str
    counter_phrase: Optional[str] = None
    office_details: Optional[Dict[str, Any]] = None
    officer_details: Optional[Dict[str, Any]] = None
