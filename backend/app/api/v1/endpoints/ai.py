import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.db import get_db
from backend.app.models.citizen_case import CitizenCase
from backend.app.models.ai_response import AIResponse
from backend.app.models.trusted_source import TrustedSource
from backend.app.schemas.ai_schema import AIAnalyzeRequest, AIAnswerRequest
from backend.app.schemas.citizen_case_schema import CitizenCaseFullStateResponse

logger = logging.getLogger("prajanavigator.ai_endpoint")
ai_router = APIRouter()

# Share the same default follow-ups as citizen_cases.py
from backend.app.api.v1.endpoints.citizen_cases import DEFAULT_QUESTIONS, get_full_case_state

def run_ai_analysis(db_case: CitizenCase, db: Session) -> dict:
    ai_resp = db.query(AIResponse).filter(AIResponse.case_id == db_case.id).first()
    if not ai_resp:
        initial_state = {
            "questions": DEFAULT_QUESTIONS,
            "documents": [],
            "visitPlan": None,
            "requiredDocs": []
        }
        ai_resp = AIResponse(case_id=db_case.id, response_text=json.dumps(initial_state))
        db.add(ai_resp)
        db.commit()
        db.refresh(ai_resp)

    state = json.loads(ai_resp.response_text)
    questions = state.get("questions", DEFAULT_QUESTIONS)
    documents = state.get("documents", [])
    
    # Check for unanswered questions
    unanswered = [q for q in questions if not q.get("answered")]
    
    if len(unanswered) > 0:
        db_case.status = "clarification"
        state["status"] = "clarification"
        state["visitPlan"] = None
        state["requiredDocs"] = []
        ai_resp.response_text = json.dumps(state)
        db.commit()
        return get_full_case_state(db_case, db)
        
    # Check if documents are uploaded
    if len(documents) == 0:
        db_case.status = "upload"
        state["status"] = "upload"
        
        # Determine required documents based on answers
        required = ["NIC Front & Back"]
        is_deed_required = True
        is_gn_required = True
        for q in questions:
            if q["id"] == "q2" and q["answer"] == "No":
                is_deed_required = False
            if q["id"] == "q3" and q["answer"] == "No, and it is not required":
                is_gn_required = False
                
        if is_deed_required:
            required.append("Land Deed Copy")
        if is_gn_required:
            required.append("Grama Niladhari Letter")
        else:
            required.append("GN Recommendation Request Form")
            
        state["requiredDocs"] = required
        state["visitPlan"] = None
        ai_resp.response_text = json.dumps(state)
        db.commit()
        return get_full_case_state(db_case, db)
        
    # Generate final visit plan
    db_case.status = "plan"
    state["status"] = "plan"
    
    is_deed_original = False
    is_gn_ready = False
    is_close_to_building = False
    for q in questions:
        if q["id"] == "q2" and q["answer"] == "Yes":
            is_deed_original = True
        if q["id"] == "q3" and q["answer"] == "Yes":
            is_gn_ready = True
        if q["id"] == "q4" and q["answer"] == "Yes":
            is_close_to_building = True
            
    # Calculate score
    score = 70
    if is_deed_original:
        score += 15
    if is_gn_ready:
        score += 10
    if is_close_to_building:
        score -= 15
        
    score = max(15, min(98, score))
    db_case.visitguard_score = score
    
    risk_level = "Ready"
    if score < 50:
        risk_level = "High Risk"
    elif score < 80:
        risk_level = "Moderate"
        
    db_case.risk_level = risk_level
    
    # Query database for matching office
    office = db.query(TrustedSource).filter(
        TrustedSource.source_type == "office",
        TrustedSource.district == db_case.district
    ).first()
    
    if not office:
        office = db.query(TrustedSource).filter(
            TrustedSource.source_type == "office"
        ).first()
        
    office_name = office.name if office else f"{db_case.district} Divisional Secretariat Office"
    office_id = office.id if office else None
    
    # Query database for matching officer
    officer = None
    if office_id:
        officer = db.query(TrustedSource).filter(
            TrustedSource.source_type == "officer",
            TrustedSource.office_id == office_id
        ).first()
        
    if not officer:
        officer = db.query(TrustedSource).filter(
            TrustedSource.source_type == "officer"
        ).first()
        
    officer_name = officer.name if officer else "Mr. K. A. Perera"
    officer_role = officer.role if officer else "Assistant Divisional Secretary"
    room_number = officer.room_number if officer else "Room 14, Environment & Land Branch (Counter 4)"
    available_days = officer.available_days if officer else "Tuesdays and Wednesdays"
    available_time = officer.available_time if officer else "9:00 AM - 1:00 PM"
    
    # Build timeline steps
    timeline = [
        {
            "step": 1,
            "title": "Reception Validation",
            "description": f"Go to the Main Reception desk at {office_name}, present your VisitGuard Readiness QR Code to receive your token.",
            "status": "ready"
        },
        {
            "step": 2,
            "title": "Document Inspection",
            "description": f"Submit your original National Identity Card and Land Deed at {room_number} to {officer_name} ({officer_role}).",
            "status": "ready" if is_deed_original else "warning"
        },
        {
            "step": 3,
            "title": "Submit GN Recommendation",
            "description": "Hand over the verified Grama Niladhari letter signed by the Divisional GN officer." if is_gn_ready else "Fill form 102-B for GN clearance since you do not have the certified GN letter yet.",
            "status": "ready" if is_gn_ready else "warning"
        },
        {
            "step": 4,
            "title": "Fee Payment & Scheduling",
            "description": "Pay the application processing fee of LKR 750.00 at Cashier Counter 2 and receive the inspection schedule slip.",
            "status": "pending"
        }
    ]
    
    verified_checklist = [
        "National Identity Card (NIC) - OCR Verified",
        "Original Land Deed - Checked" if is_deed_original else None,
        "Grama Niladhari Letter - Checked" if is_gn_ready else None
    ]
    verified_checklist = [item for item in verified_checklist if item is not None]
    
    missing_checklist = [
        "Notarized certified copy of Land Deed (required as original is missing)" if not is_deed_original else None,
        "Formal Request for GN field inspection letter" if not is_gn_ready else None,
        "LKR 750.00 cash for processing fee (Cards not accepted at this counter)"
    ]
    missing_checklist = [item for item in missing_checklist if item is not None]
    
    talking_points = [
        f"I wish to apply for a {db_case.detected_service} for my property in {db_case.district}.",
        "I have brought the original Land Deed and the Grama Niladhari validation certificate." if is_deed_original and is_gn_ready else "I do not have the original Land Deed, but I have brought a certified notary copy.",
        "The tree is close to my house. I have photos showing that the roots are damaging the foundation." if is_close_to_building else "The tree is in an open field, and it does not block public paths or power cables."
    ]
    
    state["visitPlan"] = {
        "score": score,
        "riskLevel": risk_level,
        "officeName": office_name,
        "roomCounter": room_number,
        "officerName": officer_name,
        "availableHours": f"{available_time} ({available_days})",
        "timeline": timeline,
        "checklist": {
            "verified": verified_checklist,
            "missing": missing_checklist,
            "talkingPoints": talking_points
        }
    }
    
    ai_resp.response_text = json.dumps(state)
    db.commit()
    
    return get_full_case_state(db_case, db)


@ai_router.post("/analyze", response_model=CitizenCaseFullStateResponse)
def analyze_case(req: AIAnalyzeRequest, db: Session = Depends(get_db)):
    db_case = db.query(CitizenCase).filter(CitizenCase.id == req.case_id).first()
    if not db_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case {req.case_id} not found"
        )
    return run_ai_analysis(db_case, db)
