import os
import json
import math
import logging
from typing import List, Dict
from backend.app.core.constants import EMBEDDINGS_CACHE_FILE
from backend.app.integrations.gemini_client import get_embedding

logger = logging.getLogger("prajanavigator.embeddings")

# Global in-memory cache for embeddings
_embeddings_cache: Dict[str, List[float]] = {}


def load_embeddings_cache() -> None:
    """
    Loads embeddings cache from a local JSON file.
    """
    global _embeddings_cache
    if os.path.exists(EMBEDDINGS_CACHE_FILE):
        try:
            with open(EMBEDDINGS_CACHE_FILE, "r", encoding="utf-8") as f:
                _embeddings_cache = json.load(f)
            logger.info(f"Loaded {len(_embeddings_cache)} embeddings from cache file.")
        except Exception as e:
            logger.error(f"Failed to load embeddings cache: {e}")
            _embeddings_cache = {}
    else:
        _embeddings_cache = {}


def save_embeddings_cache() -> None:
    """
    Saves the in-memory embeddings cache to a local JSON file.
    """
    global _embeddings_cache
    # Ensure directory exists
    cache_dir = os.path.dirname(EMBEDDINGS_CACHE_FILE)
    if cache_dir and not os.path.exists(cache_dir):
        os.makedirs(cache_dir, exist_ok=True)
        
    try:
        with open(EMBEDDINGS_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(_embeddings_cache, f, ensure_ascii=False, indent=2)
        logger.info(f"Saved {len(_embeddings_cache)} embeddings to cache file.")
    except Exception as e:
        logger.error(f"Failed to save embeddings cache: {e}")


def get_cached_or_new_embedding(text: str) -> List[float]:
    """
    Retrieves the embedding for the given text. Checks cache first,
    otherwise requests from Gemini client and updates the cache.
    """
    global _embeddings_cache
    
    # Simple normalization of whitespace for key uniformity
    cache_key = " ".join(text.split())
    
    if cache_key in _embeddings_cache:
        return _embeddings_cache[cache_key]
        
    # Generate embedding
    embedding = get_embedding(cache_key)
    _embeddings_cache[cache_key] = embedding
    
    # Auto-save occasionally or just defer to manual save. 
    # For simplicity, we save after adding new keys
    save_embeddings_cache()
    
    return embedding


def calculate_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculates the cosine similarity between two numeric vectors in pure Python.
    """
    if len(vec1) != len(vec2):
        return 0.0
        
    dot_product = sum(x * y for x, y in zip(vec1, vec2))
    magnitude1 = math.sqrt(sum(x * x for x in vec1))
    magnitude2 = math.sqrt(sum(y * y for y in vec2))
    
    if magnitude1 == 0.0 or magnitude2 == 0.0:
        return 0.0
        
    return dot_product / (magnitude1 * magnitude2)

