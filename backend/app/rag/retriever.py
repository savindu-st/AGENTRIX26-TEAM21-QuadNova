import logging
from typing import List, Dict, Any
from backend.app.rag.embeddings import get_cached_or_new_embedding, calculate_cosine_similarity
from backend.app.rag.knowledge_loader import get_rag_index

logger = logging.getLogger("prajanavigator.retriever")


def retrieve_chunks(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Computes the embedding of the query, calculates similarity with all chunks
    in the RAG index, and returns the top `limit` matching chunks.
    """
    try:
        # Get query embedding
        query_embedding = get_cached_or_new_embedding(query)
        
        # Get loaded RAG index
        index = get_rag_index()
        
        results = []
        for item in index:
            similarity = calculate_cosine_similarity(query_embedding, item["embedding"])
            results.append({
                "text": item["text"],
                "metadata": item["metadata"],
                "score": similarity
            })
            
        # Sort in descending order of similarity
        results.sort(key=lambda x: x["score"], reverse=True)
        
        # Log top retrieve results for debugging
        top_matches = results[:limit]
        logger.info(f"Retrieved {len(top_matches)} chunks for query: '{query[:30]}...'")
        for idx, match in enumerate(top_matches):
            logger.debug(f"Match {idx+1}: Score={match['score']:.4f}, Source={match['metadata']['source_type']}")
            
        return top_matches
        
    except Exception as e:
        logger.error(f"Error during retrieval: {e}")
        return []

