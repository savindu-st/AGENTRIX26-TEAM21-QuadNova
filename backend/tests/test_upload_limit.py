import sys
import os
import shutil
import json
from io import BytesIO
from fastapi import HTTPException, UploadFile
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup system path to import backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.database.base import Base
from backend.app.models.citizen_case import CitizenCase
from backend.app.models.ai_response import AIResponse
from backend.app.api.v1.endpoints.citizen_cases import upload_case_document, delete_case_document

# Setup an in-memory SQLite database for testing
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_tests():
    print("Initializing test database...")
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    case_id = "CAS-TEST1"
    
    try:
        print("Creating dummy citizen case and AI state...")
        # 1. Setup a test case
        db_case = CitizenCase(
            id=case_id,
            citizen_name="Test Citizen",
            district="Colombo",
            description="Request for a Jak tree permit felling",
            status="upload",
            visitguard_score=70,
            risk_level="Ready"
        )
        
        initial_state = {
            "questions": [],
            "documents": [],
            "status": "upload",
            "visitPlan": None,
            "requiredDocs": ["NIC Front & Back", "Land Deed Copy"]
        }
        
        ai_resp = AIResponse(
            case_id=case_id,
            response_text=json.dumps(initial_state)
        )
        
        db.add(db_case)
        db.add(ai_resp)
        db.commit()
        
        # 2. Test uploading files
        print("Uploading file 1...")
        file1 = UploadFile(filename="nic_front.png", file=BytesIO(b"nic data"))
        res = upload_case_document(case_id=case_id, file=file1, db=db)
        assert res["success"] is True
        assert len(res["case"]["documents"]) == 1
        
        print("Uploading file 2...")
        file2 = UploadFile(filename="land_deed.pdf", file=BytesIO(b"land deed data"))
        res = upload_case_document(case_id=case_id, file=file2, db=db)
        assert len(res["case"]["documents"]) == 2
        
        print("Uploading file 3...")
        file3 = UploadFile(filename="gn_letter.png", file=BytesIO(b"gn letter data"))
        res = upload_case_document(case_id=case_id, file=file3, db=db)
        assert len(res["case"]["documents"]) == 3
        
        # 3. Test uploading 4th file (Should fail with HTTP 400)
        print("Attempting to upload file 4 (expecting 400 Bad Request)...")
        file4 = UploadFile(filename="extra.png", file=BytesIO(b"extra data"))
        try:
            upload_case_document(case_id=case_id, file=file4, db=db)
            raise AssertionError("Uploading a 4th document should have failed!")
        except HTTPException as e:
            assert e.status_code == 400
            assert "Maximum of 3 documents" in e.detail
            print("Successfully blocked 4th upload.")
            
        # 4. Test deleting a document
        print("Deleting document 'land_deed.pdf'...")
        res = delete_case_document(case_id=case_id, filename="land_deed.pdf", db=db)
        assert len(res["case"]["documents"]) == 2
        # Check that it's actually removed from the list
        doc_names = [d["name"] for d in res["case"]["documents"]]
        assert "land_deed.pdf" not in doc_names
        print("Deletion successful.")
        
        # 5. Upload file 4 again (Should succeed now since count went down to 2)
        print("Uploading file 4 again (expecting success)...")
        file4 = UploadFile(filename="extra.png", file=BytesIO(b"extra data"))
        res = upload_case_document(case_id=case_id, file=file4, db=db)
        assert len(res["case"]["documents"]) == 3
        doc_names = [d["name"] for d in res["case"]["documents"]]
        assert "extra.png" in doc_names
        print("Upload succeeded after deletion.")
        
        # 6. Delete all files and verify status resets to 'upload'
        print("Deleting all remaining files...")
        delete_case_document(case_id=case_id, filename="nic_front.png", db=db)
        delete_case_document(case_id=case_id, filename="gn_letter.png", db=db)
        res = delete_case_document(case_id=case_id, filename="extra.png", db=db)
        assert len(res["case"]["documents"]) == 0
        assert res["case"]["status"] == "upload"
        print("State status successfully reset to 'upload' when empty.")
        
        print("\nAll unit tests passed successfully!")
        
    finally:
        db.close()
        # Clean up any files that were physically saved to root uploads directory
        upload_dir = os.path.join(os.getcwd(), "uploads")
        for fname in ["nic_front.png", "land_deed.pdf", "gn_letter.png", "extra.png"]:
            p = os.path.join(upload_dir, f"{case_id}_{fname}")
            if os.path.exists(p):
                os.remove(p)


if __name__ == "__main__":
    run_tests()
