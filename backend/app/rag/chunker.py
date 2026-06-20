import re
from typing import List, Dict, Any

def chunk_text(text: str, chunk_size: int = 150, overlap: int = 30) -> List[str]:
    """
    Splits text into chunks of `chunk_size` words with `overlap` words.
    """
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    words = text.split(' ')
    
    if len(words) <= chunk_size:
        return [text]
        
    chunks = []
    i = 0
    while i < len(words):
        chunk_words = words[i:i + chunk_size]
        chunks.append(" ".join(chunk_words))
        # Move forward by chunk_size - overlap
        i += (chunk_size - overlap)
        
    return chunks


def create_chunks_from_document(
    content: str, 
    metadata: Dict[str, Any], 
    chunk_size: int = 150, 
    overlap: int = 30
) -> List[Dict[str, Any]]:
    """
    Takes a full document string and metadata, chunks it, and attaches the metadata to each chunk.
    """
    text_chunks = chunk_text(content, chunk_size, overlap)
    chunks_with_metadata = []
    
    for idx, text in enumerate(text_chunks):
        chunk_meta = metadata.copy()
        chunk_meta["chunk_index"] = idx
        chunks_with_metadata.append({
            "text": text,
            "metadata": chunk_meta
        })
        
    return chunks_with_metadata

