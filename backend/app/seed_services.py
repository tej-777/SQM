"""
Seed script for real medical services
Run this script to populate the services table with proper medical services
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.service import Service
from datetime import datetime

# Real medical services
MEDICAL_SERVICES = [
    "Cardiology",
    "Orthopedics", 
    "Dermatology",
    "Pediatrics",
    "General Medicine",
    "ENT (Ear, Nose, Throat)",
    "Neurology",
    "Gynecology",
    "Oncology",
    "Emergency Medicine",
    "Radiology",
    "Pulmonology",
    "Urology",
    "Gastroenterology",
    "Psychiatry"
]

def seed_services():
    """Seed medical services into the database"""
    db = SessionLocal()
    try:
        print("Starting medical services seeding...")
        
        # Get existing services
        existing_services = {service.name: service for service in db.query(Service).all()}
        print(f"Found {len(existing_services)} existing services")
        
        # Add new services
        added_count = 0
        for service_name in MEDICAL_SERVICES:
            if service_name not in existing_services:
                print(f"Adding service: {service_name}")
                new_service = Service(
                    name=service_name,
                    created_at=datetime.utcnow()
                )
                db.add(new_service)
                added_count += 1
            else:
                print(f"Service already exists: {service_name}")
        
        # Commit changes
        if added_count > 0:
            db.commit()
            print(f"✅ Successfully added {added_count} new medical services")
        else:
            print("✅ All medical services already exist")
            
        # Show final services
        final_services = db.query(Service).order_by(Service.name).all()
        print(f"\nFinal services list ({len(final_services)} total):")
        for service in final_services:
            print(f"  - {service.name}")
            
    except Exception as e:
        print(f"❌ Error seeding services: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_services()
