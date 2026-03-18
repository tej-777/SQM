from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.hospital import Hospital
from app.models.staff import Staff
from app.models.hospital_service import HospitalService
from app.schemas.hospital import HospitalCreate, HospitalUpdate
from app.schemas.staff import StaffCreate
from app.core.security import get_password_hash, create_access_token
from typing import List, Optional
import uuid

def get_hospital(db: Session, hospital_id: uuid.UUID) -> Optional[Hospital]:
    return db.query(Hospital).filter(Hospital.id == hospital_id).first()

def get_hospitals(db: Session, skip: int = 0, limit: int = 100) -> List[Hospital]:
    return db.query(Hospital).filter(
        Hospital.is_verified == True,
        Hospital.is_active == True
    ).offset(skip).limit(limit).all()

def get_hospitals_by_city(db: Session, city: str, skip: int = 0, limit: int = 100) -> List[Hospital]:
    return db.query(Hospital).filter(
        Hospital.city.ilike(f"%{city}%"),
        Hospital.is_verified == True,
        Hospital.is_active == True
    ).offset(skip).limit(limit).all()

def get_hospitals_by_district(db: Session, district: str, skip: int = 0, limit: int = 100) -> List[Hospital]:
    return db.query(Hospital).filter(
        Hospital.district.ilike(f"%{district}%"),
        Hospital.is_verified == True,
        Hospital.is_active == True
    ).offset(skip).limit(limit).all()

def create_hospital(db: Session, hospital: dict) -> Hospital:
    """
    Create a hospital with proper error handling for unique constraints.
    """
    try:
        # Generate registration number if not provided
        if not hospital.get("registration_number"):
            hospital["registration_number"] = f"REG{uuid.uuid4().hex[:8].upper()}"
        
        db_hospital = Hospital(**hospital)
        db.add(db_hospital)
        db.commit()
        db.refresh(db_hospital)
        return db_hospital
        
    except IntegrityError as e:
        db.rollback()
        
        # Check if it's an email unique constraint violation
        if "email" in str(e) and "unique" in str(e).lower():
            raise ValueError("Email already exists")
        elif "registration_number" in str(e) and "unique" in str(e).lower():
            raise ValueError("Registration number already exists")
        else:
            raise ValueError("Database integrity error: " + str(e))
            
    except Exception as e:
        db.rollback()
        raise ValueError(f"Error creating hospital: {str(e)}")

def create_hospital_with_admin(db: Session, hospital: dict) -> dict:
    """
    Create a hospital, admin staff account, and services with transaction safety
    """
    try:
        hospital_data = hospital["hospital"]
        admin_data = hospital["admin"]
        services_data = hospital.get("services", [])
        
        # Generate registration number if not provided
        if not hospital_data.get("registration_number"):
            hospital_data["registration_number"] = f"REG{uuid.uuid4().hex[:8].upper()}"
        
        # Create hospital first and commit to get ID
        db_hospital = Hospital(**hospital_data)
        db.add(db_hospital)
        db.commit()
        db.refresh(db_hospital)
        
        # Create admin staff account with hospital_id
        admin_staff = Staff(
            hospital_id=db_hospital.id,
            staff_id=admin_data["staff_id"],
            name=admin_data["name"],
            email=admin_data["email"],
            password_hash=get_password_hash(admin_data["staff_password"]),
            role="admin"
        )
        db.add(admin_staff)
        
        # Create hospital services
        hospital_services = []
        for service_data in services_data:
            # Validate service exists
            from app.models.service import Service
            service = db.query(Service).filter(Service.id == service_data["service_id"]).first()
            if not service:
                raise ValueError(f"Service with ID {service_data['service_id']} not found")
            
            hospital_service = HospitalService(
                hospital_id=db_hospital.id,
                service_id=service_data["service_id"],
                avg_consultation_time_minutes=service_data["avg_consultation_time_minutes"],
                default_max_tokens_per_day=service_data["default_max_tokens_per_day"]
            )
            db.add(hospital_service)
            hospital_services.append(hospital_service)
        
        # Single commit for staff and services
        db.commit()
        db.refresh(admin_staff)
        
        # Generate JWT token
        access_token = create_access_token(data={"sub": str(admin_staff.id), "role": "admin"})
        
        return {
            "hospital": db_hospital,
            "admin": admin_staff,
            "services": hospital_services,
            "access_token": access_token
        }
        
    except IntegrityError as e:
        db.rollback()
        
        # Check if it's an email unique constraint violation
        if "email" in str(e) and "unique" in str(e).lower():
            raise ValueError("Email already exists")
        elif "staff_id" in str(e) and "unique" in str(e).lower():
            raise ValueError("Staff ID already exists")
        elif "registration_number" in str(e) and "unique" in str(e).lower():
            raise ValueError("Registration number already exists")
        elif "_hospital_service_uc" in str(e):
            raise ValueError("Service already added to hospital")
        else:
            raise ValueError("Database integrity error: " + str(e))
            
    except Exception as e:
        db.rollback()
        raise ValueError(f"Error creating hospital and admin: {str(e)}")

def update_hospital(db: Session, hospital_id: uuid.UUID, hospital: HospitalUpdate) -> Optional[Hospital]:
    db_hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if db_hospital:
        update_data = hospital.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_hospital, field, value)
        db.commit()
        db.refresh(db_hospital)
    return db_hospital

def delete_hospital(db: Session, hospital_id: uuid.UUID) -> bool:
    db_hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if db_hospital:
        db.delete(db_hospital)
        db.commit()
        return True
    return False
    