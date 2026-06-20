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
    Generates standard helper responses based on prompt keywords when in mock mode.
    """
    prompt_lower = prompt.lower()
    
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

