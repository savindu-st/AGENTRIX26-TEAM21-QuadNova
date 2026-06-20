import os
import glob
import logging
from typing import List, Dict, Any
from sqlalchemy import create_engine, text
from backend.app.core.constants import RAG_DATA_DIR, LAYER_1_OFFICIAL, LAYER_2_CIRCULAR, LAYER_3_COMMUNITY
from backend.app.core.config import settings
from backend.app.rag.chunker import create_chunks_from_document
from backend.app.rag.embeddings import get_cached_or_new_embedding, load_embeddings_cache

logger = logging.getLogger("prajanavigator.knowledge_loader")

# In-memory index of all chunks and their embeddings
# Format: List of dicts, each having:
# {
#   "text": str,
#   "embedding": List[float],
#   "metadata": {
#       "source_type": "official"|"circular"|"community",
#       "source_id": str,
#       "title": str,
#       "district": Optional[str],
#       "office_name": Optional[str],
#       "verification_status": Optional[str],
#       ...
#   }
# }
_chunk_index: List[Dict[str, Any]] = []


def parse_markdown_metadata(content: str) -> Dict[str, Any]:
    """
    Simple parser to extract key-value metadata from markdown headers.
    Matches lines like: **Service Name**: National Identity Card (NIC) Renewal
    """
    metadata = {}
    lines = content.split("\n")
    for line in lines:
        if line.startswith("**") or line.startswith("*"):
            # Clean up line format
            cleaned = line.strip("* ")
            if ":" in cleaned:
                key, val = cleaned.split(":", 1)
                key = key.strip().lower().replace(" ", "_")
                val = val.strip()
                metadata[key] = val
    return metadata


def load_static_documents() -> List[Dict[str, Any]]:
    """
    Loads markdown files from the RAG data directory.
    Identifies Layer 1 (Official) and Layer 2 (Circulars) based on file naming/content.
    """
    documents = []
    
    # Ensure data directory exists
    if not os.path.exists(RAG_DATA_DIR):
        os.makedirs(RAG_DATA_DIR, exist_ok=True)
        
    search_path = os.path.join(RAG_DATA_DIR, "*.md")
    files = glob.glob(search_path)
    
    for filepath in files:
        filename = os.path.basename(filepath)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
                
            metadata = parse_markdown_metadata(content)
            metadata["filename"] = filename
            
            # Categorize layer based on filename/metadata
            if "circular" in filename.lower() or "circular" in content.lower():
                metadata["source_type"] = LAYER_2_CIRCULAR
            else:
                metadata["source_type"] = LAYER_1_OFFICIAL
                
            metadata["title"] = metadata.get("service_name", filename)
            
            documents.append({
                "content": content,
                "metadata": metadata
            })
        except Exception as e:
            logger.error(f"Error loading static file {filename}: {e}")
            
    return documents


def load_database_crowd_reports() -> List[Dict[str, Any]]:
    """
    Loads crowd reports (Layer 3) from SQLite database.
    If database is not available or empty, returns default mock community reports for testing.
    """
    reports = []
    
    # Check if SQLite DB file exists
    db_path = settings.DATABASE_URL.replace("sqlite:///", "./").replace("sqlite://", "")
    db_exists = os.path.exists(db_path)
    
    if db_exists:
        try:
            # Connect to database using standard sqlalchemy
            engine = create_engine(settings.DATABASE_URL)
            with engine.connect() as connection:
                query = text("""
                    SELECT id, case_id, office_id, report_text, verification_status, created_at 
                    FROM crowd_reports
                """)
                result = connection.execute(query)
                for row in result:
                    # Look up office details if possible
                    office_name = None
                    district = None
                    if row.office_id:
                        office_q = connection.execute(
                            text("SELECT name, district FROM offices WHERE id = :oid"), 
                            {"oid": row.office_id}
                        ).fetchone()
                        if office_q:
                            office_name, district = office_q[0], office_q[1]
                            
                    reports.append({
                        "id": row.id,
                        "report_text": row.report_text,
                        "verification_status": row.verification_status,
                        "office_name": office_name,
                        "district": district
                    })
        except Exception as e:
            logger.warning(f"Failed to fetch crowd reports from DB ({e}). Using mock database reports fallback.")
    
    # If no DB reports, load mock crowd reports to enable robust RAG testing
    if not reports:
        reports = [
            # A verified suggestion (approved by admin)
            {
                "id": 1,
                "report_text": (
                    "Verified Community Note for NIC Renewal at Matara: "
                    "Confirming that they strictly require the GN residence certificate. "
                    "Admin Approved Resolution: Make sure to get Grama Niladhari residence certificate sign-off."
                ),
                "verification_status": "Verified",
                "office_name": "Matara Divisional Secretariat",
                "district": "Matara"
            },
            # An unverified contradiction (pending admin review)
            {
                "id": 2,
                "report_text": (
                    "Community update: The fee for NIC Renewal at Matara is now 700 LKR "
                    "because they charge an extra 200 LKR for photograph scanning fee at the local desk."
                ),
                "verification_status": "Pending",
                "office_name": "Matara Divisional Secretariat",
                "district": "Matara"
            }
        ]
        
    # Convert into standard RAG document format
    docs = []
    for r in reports:
        content = r["report_text"]
        meta = {
            "source_type": LAYER_3_COMMUNITY,
            "source_id": f"crowd_{r['id']}",
            "title": f"Community Feedback - {r.get('office_name') or 'General'}",
            "verification_status": r["verification_status"],
            "office_name": r.get("office_name"),
            "district": r.get("district")
        }
        docs.append({
            "content": content,
            "metadata": meta
        })
        
    return docs


def build_rag_index() -> int:
    """
    Reads static markdown documents (official rules and circulars) and community reports,
    chunks them, generates vector embeddings, and builds the memory retrieval index.
    Returns the total number of chunks indexed.
    """
    global _chunk_index
    _chunk_index = []
    
    # 1. Load embeddings cache
    load_embeddings_cache()
    
    # 2. Gather all sources
    documents = []
    documents.extend(load_static_documents())
    documents.extend(load_database_crowd_reports())
    
    # 3. Chunk documents and compute embeddings
    for doc in documents:
        content = doc["content"]
        meta = doc["metadata"]
        
        # Word chunk size 150, overlap 30
        chunks = create_chunks_from_document(content, meta, chunk_size=150, overlap=30)
        
        for ch in chunks:
            chunk_text = ch["text"]
            chunk_metadata = ch["metadata"]
            
            try:
                # Retrieve from cache or generate via Gemini client
                embedding = get_cached_or_new_embedding(chunk_text)
                
                _chunk_index.append({
                    "text": chunk_text,
                    "embedding": embedding,
                    "metadata": chunk_metadata
                })
            except Exception as e:
                logger.error(f"Failed to generate embedding for chunk: {chunk_text[:30]}... ({e})")
                
    logger.info(f"RAG Index built successfully with {len(_chunk_index)} chunks.")
    return len(_chunk_index)


def get_rag_index() -> List[Dict[str, Any]]:
    """
    Returns the loaded chunk index. If the index is empty, builds it.
    """
    global _chunk_index
    if not _chunk_index:
        build_rag_index()
    return _chunk_index

