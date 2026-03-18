from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
# Import all models to register them with SQLAlchemy
from app.models import hospital, service, hospital_service, service_availability, appointment
import uuid
from datetime import datetime

def seed_database():
    db = SessionLocal()
    try:
        # Check if hospital already exists
        existing_hospital = db.query(hospital.Hospital).filter(
            hospital.Hospital.name == "City Hospital"
        ).first()
        
        if existing_hospital:
            return
        
        # Create hospital
        new_hospital = hospital.Hospital(
            name="City Hospital",
            state="Andhra Pradesh", 
            district="Kakinada",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(new_hospital)
        db.flush()  # Get the ID without committing
        
        # Create services if they don't exist
        cardiology_service = db.query(service.Service).filter(
            service.Service.name == "Cardiology"
        ).first()
        
        if not cardiology_service:
            cardiology_service = service.Service(name="Cardiology")
            db.add(cardiology_service)
            db.flush()
        
        ophthalmology_service = db.query(service.Service).filter(
            service.Service.name == "Ophthalmology"
        ).first()
        
        if not ophthalmology_service:
            ophthalmology_service = service.Service(name="Ophthalmology")
            db.add(ophthalmology_service)
            db.flush()
        
        # Link services to hospital
        hospital_service_1 = hospital_service.HospitalService(
            hospital_id=new_hospital.id,
            service_id=cardiology_service.id,
            default_max_tokens_per_day=40,
            avg_consultation_time_minutes=5
        )
        db.add(hospital_service_1)
        
        hospital_service_2 = hospital_service.HospitalService(
            hospital_id=new_hospital.id,
            service_id=ophthalmology_service.id,
            default_max_tokens_per_day=40,
            avg_consultation_time_minutes=5
        )
        db.add(hospital_service_2)
        
        # Commit all changes
        db.commit()
        
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
