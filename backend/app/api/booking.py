from fastapi import APIRouter, Depends, HTTPException, status, Body, Request
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from datetime import date, datetime, timezone
from uuid import UUID
from pydantic import BaseModel

from app.database import get_db
from app.models.service_availability import ServiceAvailability
from app.models.hospital_service import HospitalService
from app.models.appointment import Appointment, AppointmentStatus
from app.schemas.service_availability import (
    ServiceAvailabilityCreate, 
    ServiceAvailabilityUpdate, 
    ServiceAvailabilityResponse,
    AvailableDateResponse
)

router = APIRouter(prefix="/appointments", tags=["appointments"])

class BookingRequest(BaseModel):
    hospital_id: UUID
    service_id: UUID
    appointment_date: date
    patient_name: str
    patient_phone: str

@router.post("/book")
def book_appointment(
    booking_data: BookingRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Book an appointment with atomic slot management"""
    try:
        # Add requested debug prints
        print("----- BOOKING DEBUG -----")
        print("REQUEST:", booking_data.dict())
        
        hospital_service = (
            db.query(HospitalService)
            .filter(
                HospitalService.hospital_id == booking_data.hospital_id,
                HospitalService.service_id == booking_data.service_id
            )
            .first()
        )
        
        if not hospital_service:
            raise HTTPException(status_code=404, detail="Hospital service not found")
        
        print("FOUND SERVICE:", hospital_service)
        print("-------------------------")
        
        # Original debug logging
        print("BOOKING REQUEST:")
        print(f"  hospital_id: {booking_data.hospital_id}")
        print(f"  service_id: {booking_data.service_id}")
        print(f"  appointment_date: {booking_data.appointment_date}")
        print(f"  patient_name: {booking_data.patient_name}")
        print(f"  patient_phone: {booking_data.patient_phone}")
        print(f"  hospital_id type: {type(booking_data.hospital_id)}")
        print(f"  service_id type: {type(booking_data.service_id)}")
        
        print(f"Hospital service found: {hospital_service is not None}")
        if hospital_service:
            print(f"Hospital service details: ID={hospital_service.id}, Hospital={hospital_service.hospital.name if hospital_service.hospital else 'Unknown'}, Service={hospital_service.service.name if hospital_service.service else 'Unknown'}")
        else:
            print(f"No hospital service found with hospital_id={booking_data.hospital_id} and service_id={booking_data.service_id}")
            raise HTTPException(
                status_code=404, 
                detail="Hospital service not found"
            )
        
        # Start transaction
        # Get availability with row lock to prevent race conditions
        availability = db.query(ServiceAvailability).filter(
            and_(
                ServiceAvailability.hospital_service_id == hospital_service.id,
                ServiceAvailability.date == booking_data.appointment_date,
                ServiceAvailability.is_active == True
            )
        ).with_for_update().first()
        
        if not availability:
            raise HTTPException(
                status_code=404, 
                detail="Availability not found for this service and date"
            )
        
        # Check if slots are available
        if availability.booked_slots >= availability.total_slots:
            raise HTTPException(
                status_code=400, 
                detail="No available slots for this date"
            )
        
        # Atomically increment booked slots
        availability.booked_slots += 1
        availability.updated_at = datetime.now(timezone.utc)
        
        # Create appointment
        # Get next token number for this service and date
        max_token = db.query(Appointment).filter(
            and_(
                Appointment.hospital_service_id == hospital_service.id,
                Appointment.appointment_date == booking_data.appointment_date
            )
        ).order_by(Appointment.token_number.desc()).first()
        
        next_token = (max_token.token_number + 1) if max_token else 1
        
        appointment = Appointment(
            hospital_service_id=hospital_service.id,
            appointment_date=booking_data.appointment_date,
            token_number=next_token,
            patient_name=booking_data.patient_name,
            patient_phone=booking_data.patient_phone,
            status=AppointmentStatus.WAITING,
            created_at=datetime.now(timezone.utc)
        )
        
        db.add(appointment)
        db.commit()
        db.refresh(availability)
        db.refresh(appointment)
        
        # DEBUG: Log appointment creation details
        print("DEBUG: Appointment created")
        print("hospital_service_id:", appointment.hospital_service_id)
        print("appointment_date:", appointment.appointment_date)
        print("token_number:", appointment.token_number)
        print("status:", appointment.status)
        print("patient_name:", appointment.patient_name)
        print("patient_phone:", appointment.patient_phone)
        
        # Calculate queue information for ETA
        people_ahead = db.query(Appointment).filter(
            and_(
                Appointment.hospital_service_id == hospital_service.id,
                Appointment.appointment_date == booking_data.appointment_date,
                Appointment.token_number < next_token,
                Appointment.status.in_([AppointmentStatus.WAITING, AppointmentStatus.CALLED])
            )
        ).count()
        
        # Calculate estimated wait time with correct formula
        counters = hospital_service.active_counters or 1
        avg_time = hospital_service.avg_consultation_time_minutes or 10
        estimated_wait_minutes = (people_ahead * avg_time) // counters
        
        # ETA DEBUG LOGS
        print("ETA DEBUG - BOOKING")
        print("people_ahead:", people_ahead)
        print("avg_time:", avg_time)
        print("counters:", counters)
        print("ETA:", estimated_wait_minutes)
        
        return {
            "appointment_id": appointment.id,
            "hospital_service_id": appointment.hospital_service_id,
            "appointment_date": appointment.appointment_date,
            "patient_name": appointment.patient_name,
            "patient_phone": appointment.patient_phone,
            "token_number": appointment.token_number,
            "status": appointment.status,
            "hospital_name": hospital_service.hospital.name,
            "service_name": hospital_service.service.name,
            "people_ahead": people_ahead,
            "estimated_wait_minutes": estimated_wait_minutes
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Error booking appointment: {str(e)}"
        )
