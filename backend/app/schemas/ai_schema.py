from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

class AIAnalyzeRequest(BaseModel):
    case_id: str

class AIAnswerRequest(BaseModel):
    caseId: str
    answers: Dict[str, Any]

class AIResponseSchema(BaseModel):
    id: int
    case_id: str
    response_text: str
    created_at: datetime

    class Config:
        from_attributes = True
