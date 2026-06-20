from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

class CitizenCaseBase(BaseModel):
    citizen_name: str
    district: str
    description: str

class CitizenCaseCreate(BaseModel):
    citizen_name: Optional[str] = None
    fullName: Optional[str] = None
    district: str
    description: Optional[str] = None
    serviceNeed: Optional[str] = None
    available_documents: Optional[List[str]] = []
    availableDocuments: Optional[List[str]] = []

class CitizenCaseUpdateStatus(BaseModel):
    status: str

class CitizenCaseResponse(CitizenCaseBase):
    id: str
    detected_service: Optional[str] = None
    status: str
    visitguard_score: int
    risk_level: str
    created_at: datetime

    class Config:
        from_attributes = True

# High-fidelity response structures expected by the frontend
class CaseQuestion(BaseModel):
    id: str
    text: str
    options: List[str]
    type: str  # e.g., 'select', 'radio'
    answered: bool
    answer: Optional[str] = None

class DocumentStatus(BaseModel):
    name: str
    status: str
    url: str

class VisitTimelineStep(BaseModel):
    step: int
    title: str
    description: str
    status: str

class VisitPlanChecklist(BaseModel):
    verified: List[str]
    missing: List[str]
    talkingPoints: List[str]

class VisitPlan(BaseModel):
    score: int
    riskLevel: str
    officeName: str
    roomCounter: str
    officerName: str
    availableHours: str
    timeline: List[VisitTimelineStep]
    checklist: VisitPlanChecklist

class FormDetails(BaseModel):
    title: str
    act: str
    subtitle: str
    fieldLabel: str
    fieldValue: str
    descLabel: str
    defaultDesc: str

class CitizenCaseFullStateResponse(BaseModel):
    caseId: str
    citizenData: Dict[str, Any]
    status: str
    questions: List[CaseQuestion]
    documents: List[DocumentStatus]
    visitPlan: Optional[VisitPlan] = None
    requiredDocs: Optional[List[str]] = []
    formDetails: Optional[Dict[str, Any]] = None
