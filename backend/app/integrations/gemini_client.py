import logging
import hashlib
import math
from typing import List, Optional
from backend.app.core.config import settings

logger = logging.getLogger("prajanavigator.gemini")

# Try importing google-generativeai, fallback to mock if not installed or API key missing
GENAI_AVAILABLE = False
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    logger.warning("google-generativeai package not installed. Running in MOCK mode.")

# Configure Gemini if available and key exists
if GENAI_AVAILABLE and settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    logger.info("Gemini client successfully configured.")
else:
    logger.warning("GEMINI_API_KEY is missing or client is unavailable. Gemini is running in MOCK mode.")


def get_mock_embedding(text: str, dimension: int = 768) -> List[float]:
    """
    Generates a deterministic embedding vector using word hashing.
    Enables cosine similarity to act as a keyword-overlap semantic search.
    """
    vec = [0.0] * dimension
    words = [w.strip(".,!?()\"';:") for w in text.lower().split()]
    words = [w for w in words if w]
    
    if not words:
        vec[0] = 1.0
        return vec
        
    for word in words:
        h = hashlib.sha256(word.encode('utf-8')).hexdigest()
        for i in range(4):
            part = h[i*8 : (i+1)*8]
            val = int(part, 16)
            idx = val % dimension
            vec[idx] += (val % 100) / 100.0
            
    mag = math.sqrt(sum(x*x for x in vec))
    if mag > 0:
        vec = [x / mag for x in vec]
    else:
        vec[0] = 1.0
    return vec


def get_embedding(text: str) -> List[float]:
    """
    Generates embedding vector for a given text.
    Falls back to mock embedding if Gemini is running in MOCK mode or API key is missing.
    """
    if GENAI_AVAILABLE and settings.GEMINI_API_KEY:
        try:
            # Using gemini-embedding-001
            result = genai.embed_content(
                model="models/gemini-embedding-001",
                content=text,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            logger.error(f"Error calling Gemini Embedding API: {e}. Falling back to mock embeddings.")
            return get_mock_embedding(text)
    else:
        return get_mock_embedding(text)


def ask_gemini(prompt: str) -> str:
    """
    Generates a text response from Gemini given a prompt.
    Falls back to a mock response generator if Gemini is running in MOCK mode.
    """
    if GENAI_AVAILABLE and settings.GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel("gemini-2.5-flash")
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error calling Gemini API: {e}. Falling back to mock generator.")
            return get_mock_completion(prompt)
    else:
        return get_mock_completion(prompt)


def get_mock_completion(prompt: str) -> str:
    """
    Generates standard helper responses or a mock structured JSON block matching the prompt
    requirements (for cases, visit plans, or document lists) when in mock mode.
    """
    prompt_lower = prompt.lower()
    
    # 1. Check if the prompt requests a JSON response (e.g. final plan or document list)
    if "json" in prompt_lower or "visitplan" in prompt_lower:
        # Check if it's the required documents JSON list
        if "required documents" in prompt_lower or "list of strings" in prompt_lower:
            if "nic" in prompt_lower or "identity" in prompt_lower:
                return '["NIC Front & Back", "Original Birth Certificate", "Grama Niladhari Letter"]'
            elif "passport" in prompt_lower:
                return '["NIC Front & Back", "Original Birth Certificate", "Grama Niladhari Letter", "Color Photos (3 copies)"]'
            elif "tree" in prompt_lower or "felling" in prompt_lower:
                return '["Original Land Deed Copy", "Grama Niladhari Recommendation Letter", "Tree Position Photographs"]'
            elif "license" in prompt_lower or "driving" in prompt_lower:
                return '["Current Driving License", "Medical Certificate (Form L9)", "NIC Copy"]'
            else:
                return '["NIC Front & Back", "Grama Niladhari Letter"]'
                
        # Otherwise, generate full dynamic plan and form details JSON
        # Detect service
        detected_service = "Tree Felling Permit"
        if "nic" in prompt_lower or "identity" in prompt_lower:
            detected_service = "National Identity Card (NIC) Renewal"
        elif "passport" in prompt_lower or "travel" in prompt_lower:
            detected_service = "Passport Application"
        elif "license" in prompt_lower or "driving" in prompt_lower:
            detected_service = "Driving License Renewal"
        elif "business" in prompt_lower:
            detected_service = "Local Business Registration"
        elif "birth" in prompt_lower:
            detected_service = "Birth Certificate Name Correction"
            
        # Parse form details dynamically from prompt context
        import re
        title_match = re.search(r'(?:Form Title|Form Name)[\s\*\:\-]+([^\n\r]+)', prompt, re.IGNORECASE)
        act_match = re.search(r'(?:Form Act|Act)[\s\*\:\-]+([^\n\r]+)', prompt, re.IGNORECASE)
        subtitle_match = re.search(r'(?:Form Subtitle|Subtitle)[\s\*\:\-]+([^\n\r]+)', prompt, re.IGNORECASE)
        field_label_match = re.search(r'(?:Form Field Label|Field Label)[\s\*\:\-]+([^\n\r]+)', prompt, re.IGNORECASE)
        field_value_match = re.search(r'(?:Form Field Value|Field Value)[\s\*\:\-]+([^\n\r]+)', prompt, re.IGNORECASE)
        desc_label_match = re.search(r'(?:Form Description Label|Description Label)[\s\*\:\-]+([^\n\r]+)', prompt, re.IGNORECASE)
        default_desc_match = re.search(r'(?:Form Default Description|Default Description)[\s\*\:\-]+([^\n\r]+)', prompt, re.IGNORECASE)
        
        form_title = title_match.group(1).strip().strip("*") if title_match else ""
        form_act = act_match.group(1).strip().strip("*") if act_match else ""
        form_subtitle = subtitle_match.group(1).strip().strip("*") if subtitle_match else ""
        form_field_label = field_label_match.group(1).strip().strip("*") if field_label_match else ""
        form_field_value = field_value_match.group(1).strip().strip("*") if field_value_match else ""
        form_desc_label = desc_label_match.group(1).strip().strip("*") if desc_label_match else ""
        form_default_desc = default_desc_match.group(1).strip().strip("*") if default_desc_match else ""
        
        # Fallbacks if regex didn't find them in prompt context
        svc_lower = detected_service.lower()
        if not form_title:
            if "nic" in svc_lower:
                form_title = "Form M.T. 1 (DRP-V1)"
                form_act = "REGISTRATION OF PERSONS ACT, NO. 32 OF 1968"
                form_subtitle = "Application for Registration and Issue of a National Identity Card (NIC)"
                form_field_label = "4. Purpose of Application:"
                form_field_value = "Renewal of Identity Card due to expiration or damage"
                form_desc_label = "5. Personal identification details & remarks:"
                form_default_desc = "Renewal of national identity card due to expiry of old card"
            elif "passport" in svc_lower:
                form_title = "Form K-35 A"
                form_act = "IMMIGRANTS AND EMIGRANTS ACT, NO. 20 OF 1948"
                form_subtitle = "Application for a Sri Lankan Passport / Travel Document"
                form_field_label = "4. Passport Category:"
                form_field_value = "All Countries / Emergency Certificate"
                form_desc_label = "5. Travel details & purpose description:"
                form_default_desc = "Requesting normal service standard passport issue"
            elif "tree" in svc_lower:
                form_title = "Schedule II - Form A"
                form_act = "Felling of Trees (Control) Act, No. 9 of 1951"
                form_subtitle = "Application for Permission to Cut down or Remove a Jak, Breadfruit, or Palmyra Tree"
                form_field_label = "4. Species of Tree:"
                form_field_value = "Jak Tree (Artocarpus heterophyllus)"
                form_desc_label = "5. Description of land and reasons for the request:"
                form_default_desc = "Requesting tree felling permit due to structural hazard"
            elif "license" in svc_lower:
                form_title = "Form DL-1"
                form_act = "MOTOR TRAFFIC ACT, NO. 14 OF 1951"
                form_subtitle = "Application for the Renewal / Issue of Driving License"
                form_field_label = "4. Driving Vehicle Class:"
                form_field_value = "Class B (Light Cars & Dual Purpose Vehicles)"
                form_desc_label = "5. License validity renewal justifications:"
                form_default_desc = "Renewal of standard vehicle driving license"
            else:
                form_title = "Form Section 27"
                form_act = "PUBLIC SERVICE ACT"
                form_subtitle = "Public Service Application"
                form_field_label = "4. Category:"
                form_field_value = "Standard Application"
                form_desc_label = "5. Detailed remarks & description:"
                form_default_desc = "Standard public service application request"
                
        # Match available officers/offices from context if possible
        office_name = "Colombo Divisional Secretariat Office"
        officer_name = "Mr. K. A. Perera"
        room_counter = "Room 14 (Counter 4)"
        available_hours = "Tuesdays and Wednesdays, 9:00 AM - 1:00 PM"
        
        if "matara" in prompt_lower:
            office_name = "Matara Divisional Secretariat Office"
            officer_name = "Mrs. S. Silva"
            room_counter = "Room 5 (Main Hall)"
            available_hours = "Mondays and Thursdays, 8:30 AM - 2:00 PM"
        elif "kandy" in prompt_lower:
            office_name = "Kandy Divisional Secretariat Office"
            officer_name = "Mr. A. Bandara"
            room_counter = "Room 12 (Floor 2)"
            available_hours = "Wednesdays and Fridays, 9:00 AM - 3:00 PM"
            
        import json
        res = {
            "detected_service": detected_service,
            "visitguard_score": 85,
            "risk_level": "Ready",
            "form_details": {
                "title": form_title,
                "act": form_act,
                "subtitle": form_subtitle,
                "fieldLabel": form_field_label,
                "fieldValue": form_field_value,
                "descLabel": form_desc_label,
                "defaultDesc": form_default_desc
            },
            "visitPlan": {
                "score": 85,
                "riskLevel": "Ready",
                "officeName": office_name,
                "roomCounter": room_counter,
                "officerName": officer_name,
                "availableHours": available_hours,
                "timeline": [
                    {
                        "step": 1,
                        "title": "Reception Verification",
                        "description": "Go to the reception counter and present your QR code to get your ticket.",
                        "status": "ready"
                    },
                    {
                        "step": 2,
                        "title": "Officer Evaluation",
                        "description": f"Go to {room_counter} and present your documents to {officer_name}.",
                        "status": "ready"
                    },
                    {
                        "step": 3,
                        "title": "Submission & Fee Payment",
                        "description": "Pay the official fees and get your copy of the stamped application receipt.",
                        "status": "ready"
                    }
                ],
                "checklist": {
                    "verified": ["NIC Front & Back - OCR Verified", "Birth Certificate - Match Confirmed"],
                    "missing": [],
                    "talkingPoints": [f"I am here to submit my application for {detected_service}.", f"All of my documents are verified."]
                }
            }
        }
        return json.dumps(res, ensure_ascii=False)

    # Standard plain text responses if not JSON
    if "nic" in prompt_lower:
        return (
            "Based on the processed query regarding National Identity Card (NIC) renewal, "
            "it is required that citizens submit their old NIC, an original birth certificate, "
            "and 3 recent photographs certified by the Grama Niladhari. "
            "Please visit the Divisional Secretariat of your region."
        )
    elif "passport" in prompt_lower:
        return (
            "For passport applications, you must provide your original birth certificate, "
            "your current NIC, and photocopies of both. "
            "Applications should be submitted to the Department of Immigration and Emigration "
            "or authorized Divisional Secretariats."
        )
    else:
        return (
            "This is a mock response from PrajaNavigator AI. The Gemini API is currently "
            "running without an active API key. Please configure GEMINI_API_KEY in the environment "
            "to enable live LLM generation. Prompt received: " + prompt[:100] + "..."
        )


