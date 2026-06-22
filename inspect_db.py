import sys
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set database path
db_url = "sqlite:///c:/Users/User/Documents/projects/agentrix/AGENTRIX26-TEAM21-QuadNova/backend/prajanavigator.db"
engine = create_engine(db_url)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

print("--- Citizen Cases ---")
from backend.app.models.citizen_case import CitizenCase
cases = db.query(CitizenCase).all()
for c in cases:
    print(f"ID: {c.id}, Name: {c.citizen_name}, Status: {c.status}")

print("\n--- AI Responses ---")
from backend.app.models.ai_response import AIResponse
ai_resps = db.query(AIResponse).all()
for r in ai_resps:
    print(f"Case ID: {r.case_id}")
    try:
        data = json.loads(r.response_text)
        print(f"  Status in state: {data.get('status')}")
        print(f"  Visit plan: {data.get('visitPlan') is not None}")
        print(f"  Documents: {len(data.get('documents', []))}")
        print(f"  Required docs: {data.get('requiredDocs')}")
    except Exception as e:
        print(f"  Error loading response_text: {e}")
