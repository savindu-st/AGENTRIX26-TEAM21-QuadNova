import logging
from sqlalchemy.orm import Session
from backend.app.models.area import Area
from backend.app.models.trusted_source import TrustedSource
from backend.app.models.user import User

logger = logging.getLogger("prajanavigator.seeder")

def seed_db(db: Session):
    # 1. Seed default admin user if not exists
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        logger.info("Seeding default admin user...")
        # simple password hash representation for the competition hackathon
        new_admin = User(
            username="admin",
            email="admin@prajanavigator.lk",
            password_hash="pbkdf2:sha256:default_admin_hash",
            role="admin"
        )
        db.add(new_admin)
        db.commit()

    # 2. Seed default areas
    default_areas = [
        {"name": "Colombo", "description": "Colombo District, Western Province"},
        {"name": "Matara", "description": "Matara District, Southern Province"},
        {"name": "Kandy", "description": "Kandy District, Central Province"},
        {"name": "Galle", "description": "Galle District, Southern Province"},
        {"name": "Jaffna", "description": "Jaffna District, Northern Province"},
        {"name": "Kurunegala", "description": "Kurunegala District, North Western Province"},
    ]
    for area_data in default_areas:
        existing = db.query(Area).filter(Area.name == area_data["name"]).first()
        if not existing:
            logger.info(f"Seeding area: {area_data['name']}")
            db.add(Area(**area_data))
    db.commit()

    # 3. Seed default services (trusted_sources with source_type = "service")
    default_services = [
        {
            "source_type": "service",
            "name": "National Identity Card (NIC) Renewal",
            "description": "Process to renew expired, damaged, or lost National Identity Cards.",
            "category": "ID Renewal",
            "fee": 500.0,
            "processing_time": "7 Days"
        },
        {
            "source_type": "service",
            "name": "Passport Application",
            "description": "Process to apply for standard all-countries passport.",
            "category": "Passport",
            "fee": 3500.0,
            "processing_time": "14 Days"
        },
        {
            "source_type": "service",
            "name": "Tree Felling Permit",
            "description": "Process to obtain a legal permit to fell trees on private or public land.",
            "category": "Environment",
            "fee": 750.0,
            "processing_time": "5 Days"
        },
        {
            "source_type": "service",
            "name": "Driving License Renewal",
            "description": "Renewal of light vehicle or heavy vehicle driving licenses.",
            "category": "License",
            "fee": 2500.0,
            "processing_time": "1 Day"
        }
    ]
    for svc in default_services:
        existing = db.query(TrustedSource).filter(
            TrustedSource.source_type == "service",
            TrustedSource.name == svc["name"]
        ).first()
        if not existing:
            logger.info(f"Seeding service: {svc['name']}")
            db.add(TrustedSource(**svc))
    db.commit()

    # 4. Seed default offices (trusted_sources with source_type = "office")
    default_offices = [
        {
            "source_type": "office",
            "name": "Colombo Divisional Secretariat Office",
            "description": "Divisional Secretariat office managing public administration in Colombo.",
            "district": "Colombo",
            "office_type": "Divisional Secretariat",
            "address": "Dam Street, Colombo 12"
        },
        {
            "source_type": "office",
            "name": "Matara Divisional Secretariat Office",
            "description": "Divisional Secretariat office managing public administration in Matara.",
            "district": "Matara",
            "office_type": "Divisional Secretariat",
            "address": "Beach Road, Matara"
        },
        {
            "source_type": "office",
            "name": "Kandy Divisional Secretariat Office",
            "description": "Divisional Secretariat office managing public administration in Kandy.",
            "district": "Kandy",
            "office_type": "Divisional Secretariat",
            "address": "William Gopallawa Mawatha, Kandy"
        }
    ]
    for off in default_offices:
        existing = db.query(TrustedSource).filter(
            TrustedSource.source_type == "office",
            TrustedSource.name == off["name"]
        ).first()
        if not existing:
            logger.info(f"Seeding office: {off['name']}")
            db.add(TrustedSource(**off))
    db.commit()

    # 5. Seed default officers (trusted_sources with source_type = "officer")
    # Link officers to their respective offices
    offices_in_db = db.query(TrustedSource).filter(TrustedSource.source_type == "office").all()
    office_map = {o.name: o.id for o in offices_in_db}

    default_officers = [
        {
            "source_type": "officer",
            "name": "Mr. K. A. Perera",
            "description": "Assistant Divisional Secretary in Colombo",
            "office_name": "Colombo Divisional Secretariat Office",
            "role": "Assistant Divisional Secretary",
            "room_number": "Room 14, Environment & Land Branch (Counter 4)",
            "available_days": "Tuesdays and Wednesdays",
            "available_time": "9:00 AM - 1:00 PM",
            "status": "Available"
        },
        {
            "source_type": "officer",
            "name": "Mrs. S. Silva",
            "description": "Senior Executive Officer in Matara",
            "office_name": "Matara Divisional Secretariat Office",
            "role": "Senior Executive Officer",
            "room_number": "Room 5, Main Hall",
            "available_days": "Mondays and Thursdays",
            "available_time": "8:30 AM - 2:00 PM",
            "status": "Available"
        },
        {
            "source_type": "officer",
            "name": "Mr. A. Bandara",
            "description": "Land Administration Officer in Kandy",
            "office_name": "Kandy Divisional Secretariat Office",
            "role": "Land Administration Officer",
            "room_number": "Room 12, Floor 2",
            "available_days": "Wednesdays and Fridays",
            "available_time": "9:00 AM - 3:00 PM",
            "status": "Available"
        }
    ]

    for offr in default_officers:
        existing = db.query(TrustedSource).filter(
            TrustedSource.source_type == "officer",
            TrustedSource.name == offr["name"]
        ).first()
        if not existing:
            office_name = offr.pop("office_name")
            office_id = office_map.get(office_name)
            offr["office_id"] = office_id
            logger.info(f"Seeding officer: {offr['name']}")
            db.add(TrustedSource(**offr))
    db.commit()

    logger.info("Database seeding completed.")
