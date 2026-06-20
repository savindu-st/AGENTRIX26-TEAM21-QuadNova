import hashlib
import logging
from sqlalchemy.orm import Session
from backend.app.models.area import Area
from backend.app.models.trusted_source import TrustedSource
from backend.app.models.user import User

logger = logging.getLogger("prajanavigator.seeder")

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# ──────────────────────────────────────────────
# ALL 25 Sri Lankan Districts
# ──────────────────────────────────────────────
ALL_DISTRICTS = [
    {"name": "Colombo",      "description": "Colombo District, Western Province"},
    {"name": "Gampaha",      "description": "Gampaha District, Western Province"},
    {"name": "Kalutara",     "description": "Kalutara District, Western Province"},
    {"name": "Kandy",        "description": "Kandy District, Central Province"},
    {"name": "Matale",       "description": "Matale District, Central Province"},
    {"name": "Nuwara Eliya", "description": "Nuwara Eliya District, Central Province"},
    {"name": "Galle",        "description": "Galle District, Southern Province"},
    {"name": "Matara",       "description": "Matara District, Southern Province"},
    {"name": "Hambantota",   "description": "Hambantota District, Southern Province"},
    {"name": "Jaffna",       "description": "Jaffna District, Northern Province"},
    {"name": "Kilinochchi",  "description": "Kilinochchi District, Northern Province"},
    {"name": "Mannar",       "description": "Mannar District, Northern Province"},
    {"name": "Mullaitivu",   "description": "Mullaitivu District, Northern Province"},
    {"name": "Vavuniya",     "description": "Vavuniya District, Northern Province"},
    {"name": "Trincomalee",  "description": "Trincomalee District, Eastern Province"},
    {"name": "Batticaloa",   "description": "Batticaloa District, Eastern Province"},
    {"name": "Ampara",       "description": "Ampara District, Eastern Province"},
    {"name": "Kurunegala",   "description": "Kurunegala District, North Western Province"},
    {"name": "Puttalam",     "description": "Puttalam District, North Western Province"},
    {"name": "Anuradhapura", "description": "Anuradhapura District, North Central Province"},
    {"name": "Polonnaruwa",  "description": "Polonnaruwa District, North Central Province"},
    {"name": "Badulla",      "description": "Badulla District, Uva Province"},
    {"name": "Monaragala",   "description": "Monaragala District, Uva Province"},
    {"name": "Ratnapura",    "description": "Ratnapura District, Sabaragamuwa Province"},
    {"name": "Kegalle",      "description": "Kegalle District, Sabaragamuwa Province"},
]

# ──────────────────────────────────────────────
# Admin users — one per district
# username = district name lowercased + "_admin"
# password = district name lowercased + "2024"
# ──────────────────────────────────────────────
def make_district_users(districts):
    users = []
    for d in districts:
        slug = d["name"].lower().replace(" ", "")
        users.append({
            "username": f"{slug}_admin",
            "email":    f"{slug}@prajanavigator.lk",
            "password": f"{slug}2024",
            "role":     "admin",
            "city":     d["name"],
        })
    return users

# ──────────────────────────────────────────────
# Services (unchanged from before)
# ──────────────────────────────────────────────
DEFAULT_SERVICES = [
    {"source_type": "service", "name": "National Identity Card (NIC) Renewal",
     "description": "Process to renew expired, damaged, or lost National Identity Cards.",
     "category": "ID Renewal", "fee": 500.0, "processing_time": "7 Days"},
    {"source_type": "service", "name": "Passport Application",
     "description": "Process to apply for standard all-countries passport.",
     "category": "Passport", "fee": 3500.0, "processing_time": "14 Days"},
    {"source_type": "service", "name": "Tree Felling Permit",
     "description": "Process to obtain a legal permit to fell trees on private or public land.",
     "category": "Environment", "fee": 750.0, "processing_time": "5 Days"},
    {"source_type": "service", "name": "Driving License Renewal",
     "description": "Renewal of light vehicle or heavy vehicle driving licenses.",
     "category": "License", "fee": 2500.0, "processing_time": "1 Day"},
    {"source_type": "service", "name": "Birth Certificate Correction",
     "description": "Correction of errors in birth certificates.",
     "category": "Civil Registration", "fee": 200.0, "processing_time": "10 Days"},
    {"source_type": "service", "name": "Land Deed Transfer",
     "description": "Transfer of land ownership via deed.",
     "category": "Land", "fee": 5000.0, "processing_time": "21 Days"},
    {"source_type": "service", "name": "Vehicle Revenue License",
     "description": "Annual revenue license renewal for motor vehicles.",
     "category": "Revenue", "fee": 1200.0, "processing_time": "1 Day"},
    {"source_type": "service", "name": "Business Registration",
     "description": "Register a new sole proprietorship or partnership business.",
     "category": "Business", "fee": 1500.0, "processing_time": "3 Days"},
]

# ──────────────────────────────────────────────
# Offices — one per district
# ──────────────────────────────────────────────
def make_offices(districts):
    return [
        {
            "source_type": "office",
            "name": f"{d['name']} Divisional Secretariat Office",
            "description": f"Divisional Secretariat managing public administration in {d['name']}.",
            "district": d["name"],
            "office_type": "Divisional Secretariat",
            "address": f"Main Road, {d['name']}",
        }
        for d in districts
    ]

# ──────────────────────────────────────────────
# Officers — one per district office
# ──────────────────────────────────────────────
def make_officers(districts):
    officers = []
    roles = ["Assistant Divisional Secretary", "Senior Executive Officer",
             "Land Administration Officer", "Civil Registration Officer",
             "Revenue Inspector"]
    for i, d in enumerate(districts):
        role = roles[i % len(roles)]
        officers.append({
            "source_type": "officer",
            "name": f"Officer – {d['name']}",
            "description": f"{role} in {d['name']} DS Office",
            "office_name": f"{d['name']} Divisional Secretariat Office",
            "role": role,
            "room_number": f"Room {(i % 10) + 1}, Ground Floor",
            "available_days": "Mondays to Fridays",
            "available_time": "8:30 AM – 4:00 PM",
            "status": "Available",
        })
    return officers


# ──────────────────────────────────────────────
# MAIN SEED FUNCTION
# ──────────────────────────────────────────────
def seed_db(db: Session):

    # 1. Super admin (always present)
    if not db.query(User).filter(User.username == "admin").first():
        logger.info("Seeding super admin user...")
        db.add(User(
            username="admin",
            email="admin@prajanavigator.lk",
            password_hash=hash_password("admin123"),
            role="admin",
            city=None,
        ))
        db.commit()
    else:
        # Ensure password is always correct SHA-256
        admin = db.query(User).filter(User.username == "admin").first()
        admin.password_hash = hash_password("admin123")
        db.commit()

    # 2. Seed all 25 districts as Areas
    for area_data in ALL_DISTRICTS:
        if not db.query(Area).filter(Area.name == area_data["name"]).first():
            logger.info(f"Seeding area: {area_data['name']}")
            db.add(Area(**area_data))
    db.commit()

    # 3. Seed one admin user per district
    for u in make_district_users(ALL_DISTRICTS):
        if not db.query(User).filter(User.username == u["username"]).first():
            logger.info(f"Seeding district admin: {u['username']} ({u['city']})")
            db.add(User(
                username=u["username"],
                email=u["email"],
                password_hash=hash_password(u["password"]),
                role=u["role"],
                city=u["city"],
            ))
    db.commit()

    # 4. Seed services
    for svc in DEFAULT_SERVICES:
        if not db.query(TrustedSource).filter(
            TrustedSource.source_type == "service",
            TrustedSource.name == svc["name"]
        ).first():
            logger.info(f"Seeding service: {svc['name']}")
            db.add(TrustedSource(**svc))
    db.commit()

    # 5. Seed offices (one per district)
    for off in make_offices(ALL_DISTRICTS):
        if not db.query(TrustedSource).filter(
            TrustedSource.source_type == "office",
            TrustedSource.name == off["name"]
        ).first():
            logger.info(f"Seeding office: {off['name']}")
            db.add(TrustedSource(**off))
    db.commit()

    # 6. Seed officers (one per district office)
    offices_in_db = db.query(TrustedSource).filter(TrustedSource.source_type == "office").all()
    office_map = {o.name: o.id for o in offices_in_db}

    for offr_data in make_officers(ALL_DISTRICTS):
        if not db.query(TrustedSource).filter(
            TrustedSource.source_type == "officer",
            TrustedSource.name == offr_data["name"]
        ).first():
            office_name = offr_data.pop("office_name")
            offr_data["office_id"] = office_map.get(office_name)
            logger.info(f"Seeding officer: {offr_data['name']}")
            db.add(TrustedSource(**offr_data))
    db.commit()

    logger.info("✅ Database seeding completed.")
