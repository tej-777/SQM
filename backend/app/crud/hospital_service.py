from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.hospital_service import HospitalService
from app.models.hospital import Hospital
from app.models.service import Service
from app.schemas.hospital_service import HospitalServiceCreate, HospitalServiceUpdate
from typing import List, Optional
import uuid

def _validate_hospital_service_data(db: Session, hospital_id: uuid.UUID, service_id: uuid.UUID):
    """Validate that hospital and service exist."""
    # Check if hospital exists
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise ValueError(f"Hospital with ID {hospital_id} not found")
    
    # Check if service exists
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise ValueError(f"Service with ID {service_id} not found")

def create_hospital_service(db: Session, hospital_service_data: HospitalServiceCreate) -> HospitalService:
    """
    Create a new hospital service with proper validation.
    """
    try:
        # Validate that hospital and service exist
        _validate_hospital_service_data(
            db, 
            hospital_service_data.hospital_id, 
            hospital_service_data.service_id
        )
        
        # Check for duplicate hospital-service pair
        existing = db.query(HospitalService).filter(
            HospitalService.hospital_id == hospital_service_data.hospital_id,
            HospitalService.service_id == hospital_service_data.service_id
        ).first()
        
        if existing:
            raise ValueError("This hospital service combination already exists")
        
        db_hospital_service = HospitalService(**hospital_service_data.model_dump())
        db.add(db_hospital_service)
        db.commit()
        db.refresh(db_hospital_service)
        return db_hospital_service
        
    except IntegrityError as e:
        db.rollback()
        
        # Check if it's the unique constraint violation
        if "hospital_service_uc" in str(e):
            raise ValueError("This hospital service combination already exists")
        else:
            raise ValueError("Database integrity error: " + str(e))
            
    except ValueError:
        db.rollback()
        raise  # Re-raise validation errors
        
    except Exception as e:
        db.rollback()
        raise ValueError(f"Error creating hospital service: {str(e)}")

def get_hospital_service(db: Session, hospital_service_id: uuid.UUID) -> Optional[HospitalService]:
    """Get a single hospital service by ID."""
    return db.query(HospitalService).filter(HospitalService.id == hospital_service_id).first()

def get_hospital_services(db: Session, skip: int = 0, limit: int = 100) -> List[HospitalService]:
    """Get a list of hospital services with pagination."""
    return db.query(HospitalService).offset(skip).limit(limit).all()

def get_hospital_services_by_hospital(db: Session, hospital_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[HospitalService]:
    """Get hospital services by hospital ID."""
    return db.query(HospitalService).filter(
        HospitalService.hospital_id == hospital_id
    ).offset(skip).limit(limit).all()

def get_hospital_services_by_service(db: Session, service_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[HospitalService]:
    """Get hospital services by service ID."""
    return db.query(HospitalService).filter(
        HospitalService.service_id == service_id
    ).offset(skip).limit(limit).all()

def update_hospital_service(db: Session, hospital_service_id: uuid.UUID, hospital_service_data: HospitalServiceUpdate) -> Optional[HospitalService]:
    """
    Update an existing hospital service with proper validation.
    """
    db_hospital_service = db.query(HospitalService).filter(HospitalService.id == hospital_service_id).first()
    if not db_hospital_service:
        raise ValueError("Hospital service not found")
        
    try:
        update_data = hospital_service_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_hospital_service, field, value)
            
        db.commit()
        db.refresh(db_hospital_service)
        return db_hospital_service
        
    except IntegrityError as e:
        db.rollback()
        raise ValueError("Database integrity error: " + str(e))
        
    except Exception as e:
        db.rollback()
        raise ValueError(f"Error updating hospital service: {str(e)}")

def delete_hospital_service(db: Session, hospital_service_id: uuid.UUID) -> bool:
    """
    Delete a hospital service by ID.
    """
    db_hospital_service = db.query(HospitalService).filter(HospitalService.id == hospital_service_id).first()
    if not db_hospital_service:
        raise ValueError("Hospital service not found")
        
    try:
        db.delete(db_hospital_service)
        db.commit()
        return True
        
    except Exception as e:
        db.rollback()
        raise ValueError(f"Error deleting hospital service: {str(e)}")
