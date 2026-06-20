import json
from app.database.db import SessionLocal
from app.models.area import Area
from app.models.trusted_source import TrustedSource
from app.models.user import User

def seed_db():
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.username == "admin").first():
            user = User(
                username="admin",
                email="admin@prajanavigator.gov.lk",
                role="admin",
                phone_number="0712345678"
            )
            db.add(user)
            
        districts = ["Matara", "Colombo", "Galle", "Kandy"]
        areas_dict = {}
        for d in districts:
            area = db.query(Area).filter(Area.name == d).first()
            if not area:
                area = Area(name=d, district=f"{d} District", description=f"Administrative Area of {d}")
                db.add(area)
                db.flush()
            areas_dict[d] = area
            
        services_data = [
            {
                "title": "NIC Renewal",
                "content": "Official guidelines for renewing your Sri Lankan National Identity Card (NIC). You must submit proof of identity, birth certificate, and photographs.",
                "category": "Identity",
                "fee": 500.0,
                "processing_time": "7-14 working days",
                "required_documents": ["Birth Certificate", "Old NIC", "Identity Photos"]
            },
            {
                "title": "Passport Application",
                "content": "Official process for obtaining a new passport. Requires birth certificate, NIC, and photographs matching the ICAO standard.",
                "category": "Travel",
                "fee": 3500.0,
                "processing_time": "1 working day (one-day service) or 10 days (normal)",
                "required_documents": ["Birth Certificate", "NIC", "ICAO Photograph Receipt"]
            },
            {
                "title": "Driving License Renewal",
                "content": "Official guidelines for renewing a driving license. Requires a medical certificate from NTMI and the old driving license.",
                "category": "Transportation",
                "fee": 1500.0,
                "processing_time": "Same day",
                "required_documents": ["Medical Certificate", "Old Driving License", "NIC"]
            }
        ]
        
        for s in services_data:
            ts = db.query(TrustedSource).filter(TrustedSource.title == s["title"], TrustedSource.source_type == "service").first()
            if not ts:
                ts = TrustedSource(
                    title=s["title"],
                    content=s["content"],
                    source_type="service",
                    category=s["category"],
                    fee=s["fee"],
                    processing_time=s["processing_time"],
                    required_documents=json.dumps(s["required_documents"])
                )
                db.add(ts)
                
        offices_data = [
            {
                "name": "Matara Divisional Secretariat",
                "district": "Matara",
                "office_type": "Divisional Secretariat",
                "address": "Fort, Matara",
                "notes": "Main office for NIC applications in Matara district. Expect higher crowd on Mondays."
            },
            {
                "name": "Department of Registration of Persons",
                "district": "Colombo",
                "office_type": "Department Head Office",
                "address": "Suhurupaya, Battaramulla",
                "notes": "National headquarters. Standard processing office."
            }
        ]
        
        for o in offices_data:
            ts = db.query(TrustedSource).filter(TrustedSource.title == o["name"], TrustedSource.source_type == "office").first()
            if not ts:
                ts = TrustedSource(
                    title=o["name"],
                    content=o["notes"],
                    source_type="office",
                    category=o["district"],
                    office_type=o["office_type"],
                    address=o["address"]
                )
                db.add(ts)
                
        officers_data = [
            {
                "office_name": "Matara Divisional Secretariat",
                "officer_name": "Mr. K. L. Perera",
                "officer_role": "Asst. Commissioner",
                "room_number": "Counter 04",
                "available_days": "Monday, Wednesday, Friday",
                "available_time": "08:30 AM - 04:15 PM",
                "status": "Available"
            },
            {
                "office_name": "Department of Registration of Persons",
                "officer_name": "Mrs. S. Jayasinghe",
                "officer_role": "Director Registration",
                "room_number": "Room 102 (First Floor)",
                "available_days": "Monday, Tuesday, Wednesday, Thursday, Friday",
                "available_time": "09:00 AM - 03:00 PM",
                "status": "Available"
            }
        ]
        
        for o in officers_data:
            ts = db.query(TrustedSource).filter(TrustedSource.title == o["officer_name"], TrustedSource.source_type == "officer").first()
            if not ts:
                ts = TrustedSource(
                    title=o["officer_name"],
                    content="Office staff member availability",
                    source_type="officer",
                    category=o["office_name"],
                    officer_role=o["officer_role"],
                    room_number=o["room_number"],
                    available_days=o["available_days"],
                    available_time=o["available_time"],
                    status=o["status"]
                )
                db.add(ts)
                
        db.commit()
        print("Database successfully seeded!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
