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

from backend.app.rag.retriever import retrieve_chunks
from backend.app.rag.source_ranker import rank_sources
from backend.app.integrations.gemini_client import ask_gemini

logger = logging.getLogger("prajanavigator.ai_endpoint")
ai_router = APIRouter()

# Share the same default follow-ups as citizen_cases.py
from backend.app.api.v1.endpoints.citizen_cases import DEFAULT_QUESTIONS, get_full_case_state

def extract_form_details_from_text(context: str, detected_service: str) -> dict:
    """
    Parses form details dynamically from the retrieved RAG context using regular expressions,
    or falls back to service-specific standard details.
    """
    import re
    title_match = re.search(r'(?:Form Title|Form Name)[\s\*\:\-]+([^\n\r]+)', context, re.IGNORECASE)
    act_match = re.search(r'(?:Form Act|Act)[\s\*\:\-]+([^\n\r]+)', context, re.IGNORECASE)
    subtitle_match = re.search(r'(?:Form Subtitle|Subtitle)[\s\*\:\-]+([^\n\r]+)', context, re.IGNORECASE)
    field_label_match = re.search(r'(?:Form Field Label|Field Label)[\s\*\:\-]+([^\n\r]+)', context, re.IGNORECASE)
    field_value_match = re.search(r'(?:Form Field Value|Field Value)[\s\*\:\-]+([^\n\r]+)', context, re.IGNORECASE)
    desc_label_match = re.search(r'(?:Form Description Label|Description Label)[\s\*\:\-]+([^\n\r]+)', context, re.IGNORECASE)
    default_desc_match = re.search(r'(?:Form Default Description|Default Description)[\s\*\:\-]+([^\n\r]+)', context, re.IGNORECASE)
    
    details = {}
    if title_match: details["title"] = title_match.group(1).strip().strip("*")
    if act_match: details["act"] = act_match.group(1).strip().strip("*")
    if subtitle_match: details["subtitle"] = subtitle_match.group(1).strip().strip("*")
    if field_label_match: details["fieldLabel"] = field_label_match.group(1).strip().strip("*")
    if field_value_match: details["fieldValue"] = field_value_match.group(1).strip().strip("*")
    if desc_label_match: details["descLabel"] = desc_label_match.group(1).strip().strip("*")
    if default_desc_match: details["defaultDesc"] = default_desc_match.group(1).strip().strip("*")
    
    # Check if we have complete details, otherwise use fallback values based on detected_service keywords
    svc_lower = detected_service.lower()
    if not details.get("title"):
        if "nic" in svc_lower or "identity" in svc_lower:
            details["title"] = "Form M.T. 1 (DRP-V1)"
            details["act"] = "REGISTRATION OF PERSONS ACT, NO. 32 OF 1968"
            details["subtitle"] = "Application for Registration and Issue of a National Identity Card (NIC)"
            details["fieldLabel"] = "4. Purpose of Application:"
            details["fieldValue"] = "Renewal of Identity Card due to expiration or damage"
            details["descLabel"] = "5. Personal identification details & remarks:"
            details["defaultDesc"] = "Renewal of national identity card due to expiry of old card"
        elif "passport" in svc_lower or "travel" in svc_lower:
            details["title"] = "Form K-35 A"
            details["act"] = "IMMIGRANTS AND EMIGRANTS ACT, NO. 20 OF 1948"
            details["subtitle"] = "Application for a Sri Lankan Passport / Travel Document"
            details["fieldLabel"] = "4. Passport Category:"
            details["fieldValue"] = "All Countries / Emergency Certificate"
            details["descLabel"] = "5. Travel details & purpose description:"
            details["defaultDesc"] = "Requesting normal service standard passport issue"
        elif "tree" in svc_lower or "felling" in svc_lower or "cut" in svc_lower:
            details["title"] = "Schedule II - Form A"
            details["act"] = "Felling of Trees (Control) Act, No. 9 of 1951"
            details["subtitle"] = "Application for Permission to Cut down or Remove a Jak, Breadfruit, or Palmyra Tree"
            details["fieldLabel"] = "4. Species of Tree:"
            details["fieldValue"] = "Jak Tree (Artocarpus heterophyllus)"
            details["descLabel"] = "5. Description of land and reasons for the request:"
            details["defaultDesc"] = "Requesting tree felling permit due to structural hazard"
        elif "license" in svc_lower or "driving" in svc_lower:
            details["title"] = "Form DL-1"
            details["act"] = "MOTOR TRAFFIC ACT, NO. 14 OF 1951"
            details["subtitle"] = "Application for the Renewal / Issue of Driving License"
            details["fieldLabel"] = "4. Driving Vehicle Class:"
            details["fieldValue"] = "Class B (Light Cars & Dual Purpose Vehicles)"
            details["descLabel"] = "5. License validity renewal justifications:"
            details["defaultDesc"] = "Renewal of standard vehicle driving license"
        else:
            details["title"] = "General Form"
            details["act"] = "PUBLIC SERVICE ACT"
            details["subtitle"] = "Application for public service assistance"
            details["fieldLabel"] = "4. Category:"
            details["fieldValue"] = "General Request"
            details["descLabel"] = "5. Request details & remarks:"
            details["defaultDesc"] = "Requesting general public service coordination"
            
    # Ensure default labels/descriptions exist
    if "descLabel" not in details:
        details["descLabel"] = "5. Description and reasons for the request:"
    if "defaultDesc" not in details:
        details["defaultDesc"] = "Requesting service support"
        
    return details


def get_fallback_visit_plan(db_case: CitizenCase, db: Session) -> dict:
    # Try to find an office in the user's district
    office = db.query(TrustedSource).filter(
        TrustedSource.source_type == "office",
        TrustedSource.district == db_case.district
    ).first()
    
    # Fallback to the first office if none found for the district
    if not office:
        office = db.query(TrustedSource).filter(TrustedSource.source_type == "office").first()
        
    if not office:
        # Hardcoded absolute defaults if database has nothing
        office_name = "Colombo Divisional Secretariat Office"
        room_counter = "Room 14, Environment & Land Branch (Counter 4)"
        officer_name = "Mr. K. A. Perera (Assistant Divisional Secretary)"
        available_hours = "9:00 AM - 1:00 PM (Tuesdays and Wednesdays)"
    else:
        office_name = office.name
        # Find officer linked to this office
        officer = db.query(TrustedSource).filter(
            TrustedSource.source_type == "officer",
            TrustedSource.office_id == office.id
        ).first()
        if not officer:
            room_counter = "Room 14, Counter 4"
            officer_name = "Divisional Officer in Charge"
            available_hours = "9:00 AM - 1:00 PM (Tuesdays and Wednesdays)"
        else:
            room_counter = f"Room {officer.room_number}" if officer.room_number else "Main Counter"
            officer_name = f"{officer.name} ({officer.role})" if officer.role else officer.name
            available_days_str = officer.available_days or "Tuesdays and Wednesdays"
            available_time_str = officer.available_time or "9:00 AM - 1:00 PM"
            available_hours = f"{available_time_str} ({available_days_str})"

    detected_svc = db_case.detected_service or "Other Service"
    timeline = [
        {
            "step": 1,
            "title": "Reception Validation",
            "description": "Go to the Main Reception desk, present your VisitGuard Readiness QR Code to receive your token.",
            "status": "ready"
        },
        {
            "step": 2,
            "title": "Document Submission",
            "description": f"Submit your verified documents at {room_counter} to Officer {officer_name.split(' (')[0]}.",
            "status": "ready"
        },
        {
            "step": 3,
            "title": "Fee Payment",
            "description": "Pay the application fee in cash at the cashier desk and collect your receipt.",
            "status": "pending"
        }
    ]

    checklist = {
        "verified": ["National Identity Card (NIC) - Checked"],
        "missing": ["Processing Fee (in cash)"],
        "talkingPoints": [f"I am here to apply for {detected_svc}."]
    }

    return {
        "score": 75,
        "riskLevel": "Ready",
        "officeName": office_name,
        "roomCounter": room_counter,
        "officerName": officer_name,
        "availableHours": available_hours,
        "timeline": timeline,
        "checklist": checklist
    }


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
        
        # Call RAG to get the matching required documents dynamically
        try:
            retrieved = retrieve_chunks(db_case.description, limit=5)
            ranked = rank_sources(retrieved)
            official_rules = "\n".join(ranked.get("official_rules", []))
        except Exception as e:
            logger.error(f"RAG retrieval failed: {e}")
            official_rules = ""
            
        # Ask Gemini to tell us what documents are required based on RAG rules
        prompt = f"""
You are the "Sri Lanka Public Service Navigator Agent". Identify the required documents for the following citizen request and context.

Citizen Request: {db_case.description}
District: {db_case.district}

Official rules context from RAG circulars:
{official_rules}

User answers to follow-up questions:
{json.dumps(questions, indent=2)}

Please return a JSON list of required documents for this service.
Examples of document names to output: "NIC Front & Back", "Original Land Deed copy", "Grama Niladhari Letter", "GN Recommendation Request Form", "Birth Certificate", "Marriage Certificate", "Photos (3 copies)".
Format the output as a valid JSON list of strings, for example:
["NIC Front & Back", "Birth Certificate", "Grama Niladhari Letter"]
Return ONLY the JSON list. Do not include any markdown backticks or conversations.
"""
        try:
            resp = ask_gemini(prompt)
            cleaned = resp.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            required = json.loads(cleaned)
            if not isinstance(required, list):
                required = ["NIC Front & Back", "Birth Certificate"]
        except Exception as e:
            logger.error(f"Gemini document analysis failed: {e}. Using fallback.")
            # Fallback to standard check
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
        
    # Generate final visit plan (status = "plan")
    db_case.status = "plan"
    state["status"] = "plan"
    
    # 1. Retrieve RAG context
    try:
        retrieved = retrieve_chunks(db_case.description, limit=8)
        ranked = rank_sources(retrieved)
        official_rules_text = "\n".join(ranked.get("official_rules", []))
        district_notes_text = "\n".join(ranked.get("district_notes", []))
        suggestions_text = "\n".join(ranked.get("verified_suggestions", []))
    except Exception as e:
        logger.error(f"RAG retrieval failed: {e}")
        official_rules_text = ""
        district_notes_text = ""
        suggestions_text = ""
        
    context_block = f"""
Official Rules:
{official_rules_text}

District Specific Circulars/Notes:
{district_notes_text}

Verified Community Suggestions:
{suggestions_text}
"""
    
    # 2. Get local offices & officers in the user's district
    offices = db.query(TrustedSource).filter(
        TrustedSource.source_type == "office",
        TrustedSource.district == db_case.district
    ).all()
    if not offices:
        offices = db.query(TrustedSource).filter(TrustedSource.source_type == "office").all()
        
    offices_desc = []
    for o in offices:
        officers = db.query(TrustedSource).filter(
            TrustedSource.source_type == "officer",
            TrustedSource.office_id == o.id
        ).all()
        officers_desc = [f"- {of.name} ({of.role}), Room {of.room_number}, Available: {of.available_time} on {of.available_days}, Status: {of.status}" for of in officers]
        officers_str = "\n".join(officers_desc)
        offices_desc.append(f"Office: {o.name} (Address: {o.address}, District: {o.district}, ID: {o.id})\nOfficers:\n{officers_str}")
        
    offices_context = "\n\n".join(offices_desc)
    
    # 3. Formulate answers
    questions_text = ""
    for q in questions:
        if q.get("answered"):
            questions_text += f"- Question: {q['text']}\n  Answer: {q['answer']}\n"
            


    # 4. Prompt Gemini to generate final VisitPlan and FormDetails dynamically
    prompt = f"""
You are the "Sri Lanka Public Service Navigator Agent". Your job is to analyze the citizen's request, RAG circulars, and available local office/officer data to produce a personalized visit roadmap, a readiness score, and details of the required government application form to autofill.

Citizen Request:
"{db_case.description}"

District:
"{db_case.district}"

Answers to Follow-up Questions:
{questions_text}

Uploaded Documents by Citizen:
{", ".join([d["name"] for d in documents])}

RAG Knowledge circulars:
{context_block}

Available Offices and Officers:
{offices_context}

Please formulate the strategy and return a clean JSON block matching the structure below.
Determine the correct form details (title, act, subtitle, fieldLabel, fieldValue, descLabel, defaultDesc) directly by searching and extracting from the RAG knowledge reference context. Look for metadata under "Form Details" section in the rules. Do not use hardcoded choices or fallbacks.

Output format JSON:
{{
  "detected_service": "Exact Service Name",
  "visitguard_score": 85, // integer from 15 to 98 based on user readiness
  "risk_level": "Ready", // or "Moderate", "High Risk"
  "form_details": {{
    "title": "Form Name (e.g. Form M.T. 1 (DRP-V1))",
    "act": "Legal Act (e.g. REGISTRATION OF PERSONS ACT, NO. 32 OF 1968)",
    "subtitle": "Subtitle of form",
    "fieldLabel": "Field label label",
    "fieldValue": "Field value",
    "descLabel": "Description field label",
    "defaultDesc": "Default description value"
  }},
  "visitPlan": {{
    "score": 85,
    "riskLevel": "Ready",
    "officeName": "Name of the office selected from available offices context",
    "roomCounter": "Room number / counter of selected officer",
    "officerName": "Name of selected officer",
    "availableHours": "Available days & time",
    "timeline": [
      {{
        "step": 1,
        "title": "Reception Validation",
        "description": "Go to reception and show QR code to get ticket",
        "status": "ready"
      }}
    ],
    "checklist": {{
      "verified": ["NIC Front & Back - OCR Verified", ...],
      "missing": ["Missing document", ...],
      "talkingPoints": ["Phrase to say to officer"]
    }}
  }}
}}
Return ONLY the raw JSON block. Do not include markdown code block wrappers (like ```json).
"""
    try:
        resp = ask_gemini(prompt)
        cleaned = resp.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        result_json = json.loads(cleaned)
    except Exception as e:
        logger.error(f"Gemini final plan analysis failed: {e}")
        result_json = {}
        
    # Apply to db_case and state
    if result_json:
        db_case.detected_service = result_json.get("detected_service", db_case.detected_service)
        db_case.visitguard_score = result_json.get("visitguard_score", db_case.visitguard_score)
        db_case.risk_level = result_json.get("risk_level", db_case.risk_level)
        
        state["visitPlan"] = result_json.get("visitPlan")
        
        detected_svc = result_json.get("detected_service", db_case.detected_service)
        # Parse / extract form details from prompt context if missing or extract from output
        form_det = result_json.get("form_details") or {}
        if not form_det.get("title"):
            form_det = extract_form_details_from_text(context_block, detected_svc)
        state["formDetails"] = form_det
    else:
        # Default fallback if LLM failed completely
        desc_lower = db_case.description.lower()
        if "nic" in desc_lower or "identity" in desc_lower:
            db_case.detected_service = "National Identity Card (NIC) Renewal"
        elif "passport" in desc_lower or "travel" in desc_lower:
            db_case.detected_service = "Passport Application"
        elif "license" in desc_lower or "driving" in desc_lower:
            db_case.detected_service = "Driving License Renewal"
        else:
            db_case.detected_service = "Tree Felling Permit"
            
        db_case.visitguard_score = 70
        db_case.risk_level = "Ready"
        state["visitPlan"] = get_fallback_visit_plan(db_case, db)
        state["formDetails"] = extract_form_details_from_text(context_block, db_case.detected_service)
        
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


from pydantic import BaseModel
from typing import Optional

class AIChatRequest(BaseModel):
    message: str
    case_id: Optional[str] = None

@ai_router.post("/chat")
def chat_assistant(req: AIChatRequest, db: Session = Depends(get_db)):
    # 1. Retrieve matching chunks from RAG index
    chunks = []
    try:
        from backend.app.rag.retriever import retrieve_chunks
        chunks = retrieve_chunks(req.message, limit=5)
    except Exception as e:
        logger.error(f"Failed to retrieve chunks for chatbot: {e}")
        
    context_lines = []
    for c in chunks:
        context_lines.append(f"- Document Context: {c['text']}")
        
    context_text = "\n".join(context_lines)
    
    # 2. Formulate prompt for Gemini
    prompt = f"""
You are the "PrajaNavigator Clarification Assistant". Your job is to answer the user's question about their government visit, using ONLY the following retrieved document context.

Retrieved Context:
{context_text}

User Question:
"{req.message}"

Instructions:
1. Answer the user's question accurately and concisely using ONLY facts mentioned in the Retrieved Context.
2. If the answer to the user's question is not explicitly mentioned or cannot be directly derived from the Retrieved Context, you MUST respond with exactly: "We don't have enough information currently."
3. Do not use any external knowledge. If the context does not have the details, do not try to search or assume; respond with "We don't have enough information currently."

Answer:
"""
    try:
        from backend.app.integrations.gemini_client import ask_gemini
        response = ask_gemini(prompt).strip()
    except Exception as e:
        logger.error(f"Gemini call failed in chat assistant: {e}")
        response = "We don't have enough information currently."
        
    # Heuristics: if response implies lack of info, convert to standard text
    response_lower = response.lower().strip()
    if not response or "we don't have enough information" in response_lower or "not explicitly mentioned" in response_lower or "insufficient information" in response_lower or "does not contain" in response_lower:
        response = "We don't have enough information currently."
        
    return {"response": response}
