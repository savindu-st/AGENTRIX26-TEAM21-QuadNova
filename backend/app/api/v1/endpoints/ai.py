from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json
from app.database.db import get_db
from app.models.citizen_case import CitizenCase
from app.models.ai_response import AIResponse
from app.models.trusted_source import TrustedSource
from app.schemas.ai_schema import AIAnalyzeRequest, AIAnalyzeResponse

router = APIRouter()

@router.post("/analyze", response_model=AIAnalyzeResponse)
def analyze_case(req: AIAnalyzeRequest, db: Session = Depends(get_db)):
    case = db.query(CitizenCase).filter(CitizenCase.id == req.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    services = db.query(TrustedSource).filter(TrustedSource.source_type == "service").all()
    matched_service = None
    
    desc_lower = req.description.lower()
    for s in services:
        if s.title.lower() in desc_lower or any(word in desc_lower for word in s.title.lower().split()):
            matched_service = s
            break
            
    if not matched_service and services:
        matched_service = services[0]
        
    service_name = matched_service.title if matched_service else "General Inquiry"
    
    required_docs = []
    if matched_service and matched_service.required_documents:
        try:
            required_docs = json.loads(matched_service.required_documents)
        except Exception:
            required_docs = []
            
    if not required_docs:
        required_docs = ["National Identity Card (NIC)", "Proof of Address"]
        
    available_normalized = [doc.lower().strip() for doc in req.available_documents]
    missing_docs = []
    matched_count = 0
    for rd in required_docs:
        if rd.lower().strip() in available_normalized:
            matched_count += 1
        else:
            missing_docs.append(rd)
            
    visitguard_score = int((matched_count / len(required_docs)) * 100) if required_docs else 100
    
    if visitguard_score >= 80:
        risk_level = "Low"
    elif visitguard_score >= 50:
        risk_level = "Medium"
    else:
        risk_level = "High"
        
    office_details = {}
    officer_details = {}
    office_name = "Divisional Secretariat"
    
    office_ts = db.query(TrustedSource).filter(
        TrustedSource.source_type == "office",
        (TrustedSource.category.icontains(req.district) | TrustedSource.title.icontains(req.district))
    ).first()
    
    if not office_ts:
        office_ts = db.query(TrustedSource).filter(TrustedSource.source_type == "office").first()
        
    if office_ts:
        office_name = office_ts.title
        office_details = {
            "name": office_ts.title,
            "office_type": office_ts.office_type or "",
            "address": office_ts.address or "",
            "notes": office_ts.content
        }
        
        officer_ts = db.query(TrustedSource).filter(
            TrustedSource.source_type == "officer",
            TrustedSource.category == office_name
        ).first()
        if officer_ts:
            officer_details = {
                "name": officer_ts.title,
                "role": officer_ts.officer_role or "",
                "room_number": officer_ts.room_number or "",
                "available_days": officer_ts.available_days or "",
                "available_time": officer_ts.available_time or "",
                "status": officer_ts.status or ""
            }
            
    steps = [
        f"Ensure you have all required documents: {', '.join(required_docs)}.",
        f"Proceed to the {office_name}."
    ]
    if officer_details.get("name"):
        steps.append(f"Go to Counter/Room {officer_details.get('room_number', 'N/A')} and ask for officer {officer_details.get('name')}.")
    else:
        steps.append("Inquire at the main reception desk for the respective counter.")
    steps.append("Submit your documents and pay any required fee.")
    
    counter_phrase = f"Hello, I am here to submit my application for {service_name}. Here are my documents."
    
    case.detected_service = service_name
    case.visitguard_score = visitguard_score
    case.risk_level = risk_level
    case.status = "Ready to Visit" if visitguard_score >= 80 else "Need More Information"
    
    answer_text = f"Based on your request to process '{service_name}' in {req.district}, we have analyzed your pre-visit readiness. Your VisitGuard Score is {visitguard_score}% (Risk Level: {risk_level})."
    
    ai_response = AIResponse(
        case_id=case.id,
        answer=answer_text,
        checklist=json.dumps(required_docs),
        missing_documents=json.dumps(missing_docs),
        recommended_steps=json.dumps(steps)
    )
    db.add(ai_response)
    db.commit()
    db.refresh(case)
    
    return AIAnalyzeResponse(
        service_name=service_name,
        office=office_name,
        required_documents=required_docs,
        missing_documents=missing_docs,
        steps=steps,
        visitguard_score=visitguard_score,
        risk_level=risk_level,
        counter_phrase=counter_phrase,
        office_details=office_details,
        officer_details=officer_details
    )
