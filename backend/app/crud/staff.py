from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.staff import Staff
from app.schemas.staff import StaffCreate, StaffUpdate
from app.core.security import get_password_hash
from typing import List, Optional
import uuid

def get_staff(db: Session, staff_id: uuid.UUID) -> Optional[Staff]:
    return db.query(Staff).filter(Staff.id == staff_id).first()

def get_staff_by_email(db: Session, email: str) -> Optional[Staff]:
    return db.query(Staff).filter(Staff.email == email).first()

def get_staff_by_hospital(db: Session, hospital_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Staff]:
    return db.query(Staff).filter(
        Staff.hospital_id == hospital_id,
        Staff.is_active == True
    ).offset(skip).limit(limit).all()

def create_staff(db: Session, staff: StaffCreate) -> Staff:
    """
    Create a staff member with proper error handling for unique constraints.
    """
    try:
        staff_data = staff.model_dump()
        password = staff_data.pop("password")
        staff_data["password_hash"] = get_password_hash(password)
        
        db_staff = Staff(**staff_data)
        db.add(db_staff)
        db.commit()
        db.refresh(db_staff)
        return db_staff
        
    except IntegrityError as e:
        db.rollback()
        
        # Check if it's an email unique constraint violation
        if "email" in str(e) and "unique" in str(e).lower():
            raise ValueError("Email already exists")
        else:
            raise ValueError("Database integrity error: " + str(e))
            
    except Exception as e:
        db.rollback()
        raise ValueError(f"Error creating staff: {str(e)}")

def update_staff(db: Session, staff_id: uuid.UUID, staff: StaffUpdate) -> Optional[Staff]:
    db_staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if db_staff:
        update_data = staff.model_dump(exclude_unset=True)
        
        # Handle password hashing if provided
        if "password" in update_data:
            password = update_data.pop("password")
            update_data["password_hash"] = get_password_hash(password)
        
        for field, value in update_data.items():
            setattr(db_staff, field, value)
        db.commit()
        db.refresh(db_staff)
    return db_staff

def delete_staff(db: Session, staff_id: uuid.UUID) -> bool:
    db_staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if db_staff:
        db.delete(db_staff)
        db.commit()
        return True
    return False
