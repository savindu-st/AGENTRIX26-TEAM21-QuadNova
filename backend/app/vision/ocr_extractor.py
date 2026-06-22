import json
import logging
from backend.app.core.config import settings

logger = logging.getLogger("prajanavigator.ocr_extractor")

# Try to import google-generativeai
GENAI_AVAILABLE = False
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    logger.warning("google-generativeai package not installed in ocr_extractor.")

# Configure Gemini if available
if GENAI_AVAILABLE and settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)


def extract_details_from_document(file_bytes: bytes, filename: str) -> dict:
    """
    Uses Gemini 2.5 Flash to extract structured citizen profile data from uploaded files.
    Falls back to smart mock heuristics if Gemini API key is missing or calls fail.
    """
    # Heuristics fallback first (or if API fails)
    filename_lower = filename.lower()
    
    # Pre-populate heuristics with some default mock data
    mock_data = {
        "fullName": "Pasindu Bandara",
        "nicNumber": "199512345678",
        "dob": "1995-05-12",
        "gender": "Male",
        "address": "No. 12, Flower Road, Colombo 03",
        "district": "Colombo",
        "landDeedNo": None,
        "landOwner": None
    }
    
    if "deed" in filename_lower or "land" in filename_lower:
        mock_data["landDeedNo"] = "LD-88421-2023"
        mock_data["landOwner"] = "Pasindu Bandara"
        mock_data["district"] = "Colombo"

    if GENAI_AVAILABLE and settings.GEMINI_API_KEY:
        try:
            logger.info(f"Calling Gemini to extract details from document: {filename}")
            
            # Determine mime type based on filename extension
            mime_type = "application/pdf"
            if filename_lower.endswith(".png"):
                mime_type = "image/png"
            elif filename_lower.endswith((".jpg", ".jpeg")):
                mime_type = "image/jpeg"
                
            model = genai.GenerativeModel("gemini-2.5-flash")
            
            image_part = {
                "mime_type": mime_type,
                "data": file_bytes
            }
            
            prompt = """
            Analyze this uploaded document. It is a government or identity document of a citizen (like a National Identity Card / NIC, Birth Certificate, Land Deed, or Utility Bill).
            Please extract the following fields in structured JSON format if they are present:
            1. fullName (Full Name of the citizen / applicant)
            2. nicNumber (National Identity Card Number, if present)
            3. dob (Date of Birth, formatted as YYYY-MM-DD if present)
            4. gender (Male / Female if present)
            5. address (Residential address of the applicant)
            6. district (The administrative district of the document or address, e.g., Colombo, Matara, Gampaha)
            7. landDeedNo (Land Deed or ownership serial/reference number, if this is a land deed)
            8. landOwner (Owner of the land, if this is a land deed)

            Return the output strictly as a JSON object matching these exact keys. If any field is not present or cannot be read, set its value to null.
            Do not wrap the response in markdown code blocks or add any other text.
            """
            
            response = model.generate_content([prompt, image_part])
            response_text = response.text.strip()
            
            # Clean up markdown code blocks if any
            if response_text.startswith("```"):
                lines = response_text.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].startswith("```"):
                    lines = lines[:-1]
                response_text = "\n".join(lines).strip()
                
            extracted_json = json.loads(response_text)
            
            # Validate structure, replacing null with fallback if keys are missing
            validated = {}
            for key in ["fullName", "nicNumber", "dob", "gender", "address", "district", "landDeedNo", "landOwner"]:
                validated[key] = extracted_json.get(key, mock_data.get(key))
            
            logger.info("Successfully extracted details using Gemini.")
            return validated
            
        except Exception as e:
            logger.error(f"Error extracting details with Gemini: {e}. Falling back to mock heuristics.")
            return mock_data
    else:
        logger.info(f"Gemini API key not configured. Using mock heuristics for document: {filename}")
        return mock_data


