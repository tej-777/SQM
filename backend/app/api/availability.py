from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List
from datetime import date, datetime, timezone
from uuid import UUID

from app.database import get_db
from app.models.service_availability import ServiceAvailability
from app.models.hospital_service import HospitalService
from app.schemas.service_availability import (
    ServiceAvailabilityCreate, 
    ServiceAvailabilityUpdate, 
    ServiceAvailabilityResponse,
    AvailableDateResponse
)
from app.models.service import Service

router = APIRouter(prefix="/appointments/availability", tags=["availability"])

@router.post("/", response_model=ServiceAvailabilityResponse)
def create_availability(
    availability: ServiceAvailabilityCreate, 
    db: Session = Depends(get_db)
):
    """Create service availability for a specific date"""
    try:
        # Validate hospital_service exists
        hospital_service = db.query(HospitalService).filter(
            HospitalService.id == availability.hospital_service_id
        ).first()
        
        if not hospital_service:
            raise HTTPException(
                status_code=404, 
                detail="Hospital service not found"
            )
        
        # Check for duplicate date
        existing = db.query(ServiceAvailability).filter(
            and_(
                ServiceAvailability.hospital_service_id == availability.hospital_service_id,
                ServiceAvailability.date == availability.date
            )
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=400, 
                detail="Availability already exists for this service and date"
            )
        
        # Validate total_slots > 0
        if availability.total_slots <= 0:
            raise HTTPException(
                status_code=400, 
                detail="Total slots must be greater than 0"
            )
        
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
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Error creating availability: {str(e)}"
        )

@router.get("/{hospital_service_id}", response_model=List[AvailableDateResponse])
def get_available_dates(
    hospital_service_id: UUID,
    db: Session = Depends(get_db)
):
    """Get available dates for a hospital service"""
    try:
        # Validate hospital_service exists
        hospital_service = db.query(HospitalService).filter(
            HospitalService.id == hospital_service_id
        ).first()
        
        if not hospital_service:
            raise HTTPException(
                status_code=404, 
                detail="Hospital service not found"
            )
        
        # Get available dates (booked < total, active, today or future)
        today = date.today()
        availabilities = db.query(ServiceAvailability).filter(
            and_(
                ServiceAvailability.hospital_service_id == hospital_service_id,
                ServiceAvailability.date >= today,
                ServiceAvailability.is_active == True,
                ServiceAvailability.booked_slots < ServiceAvailability.total_slots
            )
        ).order_by(ServiceAvailability.date).all()
        
        # Format response
        available_dates = []
        for avail in availabilities:
            available_dates.append(AvailableDateResponse(
                date=avail.date,
                available_slots=avail.total_slots - avail.booked_slots,
                total_slots=avail.total_slots
            ))
        
        return available_dates
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error fetching available dates: {str(e)}"
        )

@router.get("/{hospital_service_id}/date/{target_date}", response_model=ServiceAvailabilityResponse)
def get_availability_by_date(
    hospital_service_id: UUID,
    target_date: date,
    db: Session = Depends(get_db)
):
    """Get availability for a specific hospital service and date"""
    try:
        availability = db.query(ServiceAvailability).filter(
            and_(
                ServiceAvailability.hospital_service_id == hospital_service_id,
                ServiceAvailability.date == target_date
            )
        ).first()
        
        if not availability:
            raise HTTPException(
                status_code=404, 
                detail="Availability not found for this service and date"
            )
        
        return availability
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error fetching availability: {str(e)}"
        )

@router.put("/{availability_id}", response_model=ServiceAvailabilityResponse)
def update_availability(
    availability_id: UUID,
    update_data: ServiceAvailabilityUpdate,
    db: Session = Depends(get_db)
):
    """Update service availability"""
    try:
        availability = db.query(ServiceAvailability).filter(
            ServiceAvailability.id == availability_id
        ).first()
        
        if not availability:
            raise HTTPException(
                status_code=404, 
                detail="Availability not found"
            )
        
        # Update fields
        if update_data.total_slots is not None:
            # Ensure new total_slots is not less than booked_slots
            if update_data.total_slots < availability.booked_slots:
                raise HTTPException(
                    status_code=400, 
                    detail="Cannot reduce total slots below booked slots"
                )
            availability.total_slots = update_data.total_slots
        
        if update_data.is_active is not None:
            availability.is_active = update_data.is_active
        
        availability.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(availability)
        
        return availability
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Error updating availability: {str(e)}"
        )

@router.get("/hospital/{hospital_id}", response_model=List[dict])
def get_hospital_availabilities(
    hospital_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all availabilities for a hospital"""
    try:
        # Get all hospital services for this hospital
        hospital_services = db.query(HospitalService).filter(
            HospitalService.hospital_id == hospital_id
        ).all()
        
        if not hospital_services:
            return []
        
        # Get all availabilities for these services
        service_ids = [hs.id for hs in hospital_services]
        
        availabilities = db.query(ServiceAvailability).filter(
            ServiceAvailability.hospital_service_id.in_(service_ids)
        ).order_by(ServiceAvailability.date.desc()).all()
        
        # Format response with service names
        result = []
        for availability in availabilities:
            # Find service name
            service = db.query(Service).join(HospitalService).filter(
                HospitalService.id == availability.hospital_service_id
            ).first()
            
            result.append({
                "id": str(availability.id),
                "hospital_service_id": str(availability.hospital_service_id),
                "date": availability.date.isoformat(),
                "total_slots": availability.total_slots,
                "booked_slots": availability.booked_slots,
                "is_active": availability.is_active,
                "service_name": service.name if service else "Unknown Service",
                "created_at": availability.created_at.isoformat() if availability.created_at else None,
                "updated_at": availability.updated_at.isoformat() if availability.updated_at else None
            })
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching hospital availabilities: {str(e)}"
        )


@router.delete("/{availability_id}")
def delete_availability(
    availability_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Delete a service availability.
    """
    try:
        # Find the availability
        availability = db.query(ServiceAvailability).filter(
            ServiceAvailability.id == availability_id
        ).first()
        
        if not availability:
            raise HTTPException(
                status_code=404,
                detail="Availability not found"
            )
        
        # Check if there are any booked appointments for this availability
        from app.models.appointment import Appointment
        booked_appointments = db.query(Appointment).filter(
            Appointment.hospital_service_id == availability.hospital_service_id,
            Appointment.appointment_date == availability.date
        ).count()
        
        if booked_appointments > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete availability with {booked_appointments} booked appointments"
            )
        
        # Delete the availability
        db.delete(availability)
        db.commit()
        
        return {"message": "Availability deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting availability: {str(e)}"
        )
