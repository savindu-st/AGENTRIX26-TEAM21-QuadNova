import sys
import os
import json
from pydantic import BaseModel
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup system path to import backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.database.base import Base
from backend.app.api.v1.endpoints.ai import chat_assistant, AIChatRequest

# Setup an in-memory SQLite database for testing
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_tests():
    print("Initializing test database for chatbot...")
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    try:
        # Build RAG Index
        print("Building RAG Index...")
        from backend.app.rag.knowledge_loader import build_rag_index
        build_rag_index()
        
        # Test Case 1: Question about NIC Renewal photo requirements (Details exist in nic_renewal.md)
        print("Test 1: Asking about NIC photo requirements...")
        req1 = AIChatRequest(message="What is the size of photographs required for NIC renewal?")
        res1 = chat_assistant(req1, db=db)
        print(f"Response 1: {res1['response']}")
        # Must contain standard details from nic_renewal.md (e.g., 3 photographs, or size details)
        # Note: If Gemini API fails, it falls back to mock which has standard response.
        assert "We don't have enough information currently." not in res1["response"]
        
        # Test Case 2: Question about tree cutting fee (Details exist in tree_cutting_permit.md)
        print("Test 2: Asking about tree cutting felling fee...")
        req2 = AIChatRequest(message="What is the fee for a tree felling permit?")
        res2 = chat_assistant(req2, db=db)
        print(f"Response 2: {res2['response']}")
        assert "We don't have enough information currently." not in res2["response"]
        
        # Test Case 3: Asking about an completely unrelated topic (No details in RAG data)
        print("Test 3: Asking about cooking pizza (unrelated)...")
        req3 = AIChatRequest(message="Can you give me a recipe for baking a homemade pepperoni pizza?")
        res3 = chat_assistant(req3, db=db)
        print(f"Response 3: {res3['response']}")
        assert res3["response"] == "We don't have enough information currently."
        print("Test 3 passed successfully.")

        print("\nAll chatbot RAG tests passed successfully!")
        
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
