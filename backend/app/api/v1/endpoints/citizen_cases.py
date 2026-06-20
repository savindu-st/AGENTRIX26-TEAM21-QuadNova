import json
import random
import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from backend.app.database.db import get_db
from backend.app.models.citizen_case import CitizenCase
from backend.app.models.ai_response import AIResponse
from backend.app.schemas.citizen_case_schema import (
    CitizenCaseCreate, CitizenCaseResponse, CitizenCaseUpdateStatus,
    CitizenCaseFullStateResponse, CaseQuestion, DocumentStatus
)

cases_router = APIRouter()

# Default follow-up questions to initialize when case is created
DEFAULT_QUESTIONS = [
    {
        "id": "q1",
        "text": "Which district was your land deed / birth certificate issued in?",
        "options": ["Colombo", "Gampaha", "Kandy", "Galle", "Jaffna", "Kurunegala", "Other"],
        "type": "select",
        "answered": False,
        "answer": None
    },
    {
        "id": "q2",
        "text": "Do you have the original Land Deed document signed by a licensed notary?",
        "options": ["Yes", "No"],
        "type": "radio",
        "answered": False,
        "answer": None
    },
    {
        "id": "q3",
        "text": "Do you have a recent verification letter from the Grama Niladhari (GN)?",
        "options": ["Yes", "No, but I can obtain one", "No, and it is not required"],
        "type": "radio",
        "answered": False,
        "answer": None
    },
    {
        "id": "q4",
        "text": "Is the tree to be cut within 10 meters of a permanent building or main power lines?",
        "options": ["Yes", "No"],
        "type": "radio",
        "answered": False,
        "answer": None
    }
]

def get_full_case_state(db_case: CitizenCase, db: Session) -> Dict[str, Any]:
    # Query AI response
    ai_resp = db.query(AIResponse).filter(AIResponse.case_id == db_case.id).first()
    
    questions = DEFAULT_QUESTIONS
    documents = []
    visit_plan = None
    required_docs = []
    form_details = None
    
    if ai_resp:
        try:
            state = json.loads(ai_resp.response_text)
            questions = state.get("questions", DEFAULT_QUESTIONS)
            documents = state.get("documents", [])
            visit_plan = state.get("visitPlan")
            required_docs = state.get("requiredDocs", [])
            form_details = state.get("formDetails")
        except Exception:
            pass
            
    return {
        "caseId": db_case.id,
        "citizenData": {
            "fullName": db_case.citizen_name,
            "citizen_name": db_case.citizen_name,
            "district": db_case.district,
            "description": db_case.description,
            "detected_service": db_case.detected_service,
            "extractedDetails": db_case.extracted_details
        },
        "status": db_case.status,
        "questions": questions,
        "documents": documents,
        "visitPlan": visit_plan,
        "requiredDocs": required_docs,
        "formDetails": form_details
    }

@cases_router.post("/", response_model=CitizenCaseFullStateResponse, status_code=status.HTTP_201_CREATED)
def create_case(case_in: CitizenCaseCreate, db: Session = Depends(get_db)):
    # Generate unique ID e.g., CAS-XXXX
    case_id = f"CAS-{random.randint(1000, 9999)}"
    
    citizen_name = case_in.fullName or case_in.citizen_name or "Anonymous"
    description = case_in.serviceNeed or case_in.description or ""
    
    # Detect simple service intent based on description
    desc = description.lower()
    detected_service = "Other Service"
    if "tree" in desc or "felling" in desc or "cut" in desc:
        detected_service = "Tree Felling Permit"
    elif "nic" in desc or "identity" in desc:
        detected_service = "National Identity Card (NIC) Renewal"
    elif "passport" in desc or "travel" in desc:
        detected_service = "Passport Application"
    elif "license" in desc or "driving" in desc:
        detected_service = "Driving License Renewal"
        
    db_case = CitizenCase(
        id=case_id,
        citizen_name=citizen_name,
        district=case_in.district,
        description=description,
        detected_service=detected_service,
        status="clarification",
        visitguard_score=70,
        risk_level="Ready"
    )
    
    # Save initial state in AI Response table
    initial_state = {
        "questions": DEFAULT_QUESTIONS,
        "documents": [],
        "visitPlan": None,
        "requiredDocs": []
    }
    
    db_ai = AIResponse(
        case_id=case_id,
        response_text=json.dumps(initial_state)
    )
    
    db.add(db_case)
    db.add(db_ai)
    db.commit()
    db.refresh(db_case)
    
    return get_full_case_state(db_case, db)


@cases_router.get("/", response_model=List[CitizenCaseResponse])
def list_cases(db: Session = Depends(get_db)):
    # Used by Admin dashboard
    cases = db.query(CitizenCase).all()
    # Ensure they map properly
    for c in cases:
        if not c.detected_service:
            c.detected_service = "General Query"
    return cases


@cases_router.get("/{case_id}", response_model=CitizenCaseFullStateResponse)
def get_case(case_id: str, db: Session = Depends(get_db)):
    db_case = db.query(CitizenCase).filter(CitizenCase.id == case_id).first()
    if not db_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case {case_id} not found"
        )
    return get_full_case_state(db_case, db)


@cases_router.patch("/{case_id}/status", response_model=CitizenCaseResponse)
def update_case_status(case_id: str, status_update: CitizenCaseUpdateStatus, db: Session = Depends(get_db)):
    db_case = db.query(CitizenCase).filter(CitizenCase.id == case_id).first()
    if not db_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case {case_id} not found"
        )
    db_case.status = status_update.status
    db.commit()
    db.refresh(db_case)
    return db_case


@cases_router.post("/{case_id}/upload")
def upload_case_document(case_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    db_case = db.query(CitizenCase).filter(CitizenCase.id == case_id).first()
    if not db_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case {case_id} not found"
        )
        
    ai_resp = db.query(AIResponse).filter(AIResponse.case_id == case_id).first()
    if not ai_resp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI State not initialized for this case"
        )
        
    # Standard save path inside the workspace for persistency
    upload_dir = os.path.join(os.getcwd(), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{case_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Update AI Response State documents list
    state = json.loads(ai_resp.response_text)
    docs = state.get("documents", [])
    
    new_doc = {
        "name": file.filename,
        "status": "success",
        "url": f"/uploads/{case_id}_{file.filename}"
    }
    docs.append(new_doc)
    state["documents"] = docs
    
    # Save back
    ai_resp.response_text = json.dumps(state)
    db.commit()
    
    return {"success": True, "case": get_full_case_state(db_case, db)}


@cases_router.post("/answer", response_model=CitizenCaseFullStateResponse)
def submit_answers(answer_in: Dict[str, Any], db: Session = Depends(get_db)):
    # The frontend payload structure is: { caseId: "CAS-...", answers: { q1: "...", q2: "..." } }
    # Or in some places { case_id: "...", answers: { ... } }
    case_id = answer_in.get("caseId") or answer_in.get("case_id")
    answers = answer_in.get("answers", {})
    
    if not case_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="caseId is required"
        )
        
    db_case = db.query(CitizenCase).filter(CitizenCase.id == case_id).first()
    if not db_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case {case_id} not found"
        )
        
    ai_resp = db.query(AIResponse).filter(AIResponse.case_id == case_id).first()
    if not ai_resp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI State not initialized for this case"
        )
        
    state = json.loads(ai_resp.response_text)
    questions = state.get("questions", DEFAULT_QUESTIONS)
    
    # Update question states
    for q in questions:
        q_id = q.get("id")
        if q_id in answers:
            q["answered"] = True
            q["answer"] = answers[q_id]
            
    state["questions"] = questions
    ai_resp.response_text = json.dumps(state)
    db.commit()
    
    # Import run_ai_analysis locally to prevent circular imports
    from backend.app.api.v1.endpoints.ai import run_ai_analysis
    return run_ai_analysis(db_case, db)
