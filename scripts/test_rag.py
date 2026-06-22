import os
import sys
import logging

# Ensure project root is in the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("test_rag")

from backend.app.rag.knowledge_loader import build_rag_index
from backend.app.rag.retriever import retrieve_chunks
from backend.app.rag.source_ranker import rank_sources


def run_test():
    logger.info("Initializing PrajaNavigator RAG Verification...")
    
    # 1. Build the RAG vector index
    num_chunks = build_rag_index()
    logger.info(f"Indexed {num_chunks} chunks successfully.")
    
    # 2. Define test queries
    test_queries = [
        "What are the official NIC renewal requirements?",
        "NIC renewal in Matara Divisional Secretariat documents and fees"
    ]
    
    for q in test_queries:
        print("\n" + "="*80)
        print(f"QUERY: '{q}'")
        print("="*80)
        
        # Retrieve relevant chunks
        chunks = retrieve_chunks(q, limit=4)
        
        # Rank sources and check for contradictions
        ranked_result = rank_sources(chunks)
        
        print("\n[Layer 1: Official Rules]")
        for chunk in ranked_result["official_rules"]:
            print(f"- {chunk}")
            
        print("\n[Layer 2: District/Office Notes]")
        if ranked_result["district_notes"]:
            for chunk in ranked_result["district_notes"]:
                print(f"- {chunk}")
        else:
            print("  No district circular notes found.")
            
        print("\n[Layer 3: Community Updates & Suggestions]")
        if ranked_result["suggestions"]:
            for sugg in ranked_result["suggestions"]:
                print(f"- Type: {sugg['type'].upper()}")
                print(f"  Message: {sugg['message']}")
                print(f"  Action: {sugg['suggestion']}")
        else:
            print("  No community suggestions found.")
            
        print("\n[Verification & Contradictions]")
        print(f"Needs Verification Flag: {ranked_result['needs_verification']}")
        if ranked_result["contradictions"]:
            for contradiction in ranked_result["contradictions"]:
                print(f"[CONFLICT] {contradiction}")
        else:
            print("  No contradictions detected between community feedback and official rules.")
            
    print("\n" + "="*80)
    logger.info("PrajaNavigator RAG Verification Complete.")


if __name__ == "__main__":
    run_test()

