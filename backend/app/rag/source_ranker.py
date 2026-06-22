import re
import logging
from typing import List, Dict, Any
from backend.app.core.constants import LAYER_1_OFFICIAL, LAYER_2_CIRCULAR, LAYER_3_COMMUNITY

logger = logging.getLogger("prajanavigator.source_ranker")


def extract_numbers(text: str) -> List[int]:
    """
    Extracts numbers representing potential fees or numeric values.
    """
    return [int(num) for num in re.findall(r'\b\d{3,4}\b', text)]


def detect_conflicts(official_chunks: List[str], circular_chunks: List[str], community_chunk: Dict[str, Any]) -> List[str]:
    """
    Compares a community chunk against official/circular rules to find contradictions.
    Looks for:
    1. Fee mismatches (different price numbers).
    2. Document discrepancies (e.g. additional documents mentioned).
    """
    conflicts = []
    comm_text = community_chunk["text"]
    
    # 1. Check for fee mismatch
    official_all_text = " ".join(official_chunks + circular_chunks).lower()
    comm_numbers = extract_numbers(comm_text)
    off_numbers = extract_numbers(official_all_text)
    
    for num in comm_numbers:
        # If community text has a fee number not in official text, flag potential conflict
        if off_numbers and num not in off_numbers:
            conflicts.append(
                f"Fee discrepancy: Community mentions a fee of {num} LKR which is not in official rules ({off_numbers[0]} LKR)."
            )
            
    # 2. Check for missing/additional document conflict
    key_docs = ["residence certificate", "affidavit", "police report", "photocopy", "grama niladhari certificate"]
    for doc in key_docs:
        if doc in comm_text.lower() and doc not in official_all_text:
            conflicts.append(
                f"Unwritten document request: Community mentions '{doc}' which is not part of the official requirements list."
            )
            
    return conflicts


def rank_sources(retrieved_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Groups retrieved chunks by layer, separates verified from pending community updates,
    detects conflicts between pending reports and official rules, and formats a clean structured response.
    """
    official_data = []
    circular_data = []
    verified_community = []
    pending_community = []
    contradictions = []
    
    # Group by layer
    for item in retrieved_chunks:
        text = item["text"]
        meta = item["metadata"]
        score = item["score"]
        
        # Only process relevant chunks
        if score < 0.2:
            continue
            
        layer = meta.get("source_type")
        
        if layer == LAYER_1_OFFICIAL:
            official_data.append(text)
        elif layer == LAYER_2_CIRCULAR:
            circular_data.append(text)
        elif layer == LAYER_3_COMMUNITY:
            status = meta.get("verification_status", "Pending")
            record = {
                "text": text,
                "score": score,
                "office_name": meta.get("office_name"),
                "district": meta.get("district"),
                "source_id": meta.get("source_id")
            }
            if status == "Verified":
                verified_community.append(record)
            else:
                pending_community.append(record)
                
    # Detect conflicts for pending community reports
    for comm_item in pending_community:
        found_conflicts = detect_conflicts(official_data, circular_data, comm_item)
        if found_conflicts:
            contradictions.extend(found_conflicts)
            
    # Prepare suggestions block (user instructions)
    # Verified community updates are treated as official suggestions (since admin approved them)
    # Pending community updates are kept as warning suggestions
    suggestions = []
    for v in verified_community:
        suggestions.append({
            "type": "verified_update",
            "message": v["text"],
            "suggestion": "Recommended: This update has been verified by administrators and should be followed."
        })
        
    for p in pending_community:
        suggestions.append({
            "type": "community_tip",
            "message": p["text"],
            "suggestion": "Optional Tip: Other citizens recently reported this, but it is not yet officially verified. Prepare at your own discretion."
        })
        
    # Return structured hierarchy
    return {
        "official_rules": official_data,
        "district_notes": circular_data,
        "verified_suggestions": [v["text"] for v in verified_community],
        "suggestions": suggestions,
        "contradictions": contradictions,
        "needs_verification": len(contradictions) > 0
    }

