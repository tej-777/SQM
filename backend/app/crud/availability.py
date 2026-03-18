from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.service_availability import ServiceAvailability
from app.models.hospital_service import HospitalService
from app.models.appointment import Appointment
from app.schemas.service_availability import ServiceAvailabilityCreate, ServiceAvailabilityUpdate
from typing import List, Optional
from uuid import UUID
from datetime import date

def create_service_availability(db: Session, availability: ServiceAvailabilityCreate) -> ServiceAvailability:
    """Create service availability with validation"""
    # Check hospital service exists
    hospital_service = db.query(HospitalService).filter(
        HospitalService.id == availability.hospital_service_id
    ).first()
    
    if not hospital_service:
        raise ValueError("Hospital service not found")
    
    # Check for duplicate date
    existing = db.query(ServiceAvailability).filter(
        and_(
            ServiceAvailability.hospital_service_id == availability.hospital_service_id,
            ServiceAvailability.date == availability.date
        )
    ).first()
    
    if existing:
        raise ValueError("Availability already exists for this service and date")
    
    # Validate total_slots > 0
    if availability.total_slots <= 0:
        raise ValueError("Total slots must be greater than 0")
    
    # Create availability
    db_availability = ServiceAvailability(
        hospital_service_id=availability.hospital_service_id,
        date=availability.date,
        total_slots=availability.total_slots,
        is_active=availability.is_active
    )
    
    db.add(db_availability)
    db.commit()
    db.refresh(db_availability)
    
    return db_availability

def get_available_dates(db: Session, hospital_service_id: UUID) -> List[date]:
    """Get available dates for a hospital service"""
    today = date.today()
    
    availabilities = db.query(ServiceAvailability).filter(
        and_(
            ServiceAvailability.hospital_service_id == hospital_service_id,
            ServiceAvailability.date >= today,
            ServiceAvailability.is_active == True,
            ServiceAvailability.booked_slots < ServiceAvailability.total_slots
        )
    ).order_by(ServiceAvailability.date).all()
    
    return [avail.date for avail in availabilities]

def check_and_book_slot(db: Session, hospital_service_id: UUID, target_date: date) -> ServiceAvailability:
    """Atomically check availability and book a slot"""
    # Get availability with row lock
    availability = db.query(ServiceAvailability).filter(
        and_(
            ServiceAvailability.hospital_service_id == hospital_service_id,
            ServiceAvailability.date == target_date,
            ServiceAvailability.is_active == True
        )
    ).with_for_update().first()
    
    if not availability:
        raise ValueError("Availability not found for this service and date")
    
    if availability.booked_slots >= availability.total_slots:
        raise ValueError("No available slots for this date")
    
    # Atomically increment booked slots
    availability.booked_slots += 1
    db.commit()
    db.refresh(availability)
    
    return availability

def update_service_availability(
    db: Session, 
    availability_id: UUID, 
    update_data: ServiceAvailabilityUpdate
) -> ServiceAvailability:
    """Update service availability"""
    availability = db.query(ServiceAvailability).filter(
        ServiceAvailability.id == availability_id
    ).first()
    
    if not availability:
        raise ValueError("Availability not found")
    
    # Update fields
    if update_data.total_slots is not None:
        # Ensure new total_slots is not less than booked_slots
        if update_data.total_slots < availability.booked_slots:
            raise ValueError("Cannot reduce total slots below booked slots")
        availability.total_slots = update_data.total_slots
    
    if update_data.is_active is not None:
        availability.is_active = update_data.is_active
    
    db.commit()
    db.refresh(availability)
    
    return availability
