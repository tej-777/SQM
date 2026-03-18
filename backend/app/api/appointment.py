from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.appointment import AppointmentCreate, AppointmentResponse, ServiceAvailabilityCreate, ServiceAvailabilityResponse
from app.crud.appointment import create_appointment, get_appointment, get_appointments, get_appointments_by_hospital, get_appointments_by_service, get_service_availability, create_service_availability, cancel_appointment
from app.dependencies.auth import get_current_staff
from app.models.staff import Staff
from datetime import date
import uuid

router = APIRouter(prefix="/appointments", tags=["appointments"])

@router.post("/", response_model=AppointmentResponse)
async def create_appointment_endpoint(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    """
    Create a new appointment with automatic token generation.
    """
    try:
        db_appointment = create_appointment(db=db, appointment_data=appointment)
        return db_appointment
    except ValueError as e:
        if "not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        elif "Max tokens reached" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/", response_model=List[AppointmentResponse])
async def read_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    appointments = get_appointments(db, skip=skip, limit=limit)
    return appointments

@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def read_appointment(appointment_id: uuid.UUID, db: Session = Depends(get_db)):
    db_appointment = get_appointment(db, appointment_id=appointment_id)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return db_appointment

@router.get("/hospital/{hospital_id}/date/{appointment_date}", response_model=List[AppointmentResponse])
async def read_appointments_by_hospital(hospital_id: uuid.UUID, appointment_date: date, db: Session = Depends(get_db)):
    appointments = get_appointments_by_hospital(db, hospital_id=hospital_id, appointment_date=appointment_date)
    return appointments

@router.get("/service/{service_id}/date/{appointment_date}", response_model=List[AppointmentResponse])
async def read_appointments_by_service(service_id: uuid.UUID, appointment_date: date, db: Session = Depends(get_db)):
    appointments = get_appointments_by_service(db, service_id=service_id, appointment_date=appointment_date)
    return appointments

@router.get("/availability/{hospital_service_id}/date/{availability_date}", response_model=ServiceAvailabilityResponse)
async def read_service_availability(hospital_service_id: uuid.UUID, availability_date: date, db: Session = Depends(get_db)):
    availability = get_service_availability(db, hospital_service_id=hospital_service_id, availability_date=availability_date)
    if availability is None:
        raise HTTPException(status_code=404, detail="Service availability not found")
    return availability

@router.post("/availability", response_model=ServiceAvailabilityResponse)
async def create_service_availability_endpoint(
    availability: ServiceAvailabilityCreate, 
    current_staff: Staff = Depends(get_current_staff),
    db: Session = Depends(get_db)
):
    """
    Create service availability with proper error handling.
    """
    try:
        return create_service_availability(db=db, availability=availability)
    except ValueError as e:
        if "not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        elif "already exists" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.put("/{appointment_id}/cancel", response_model=AppointmentResponse)
async def cancel_appointment_endpoint(appointment_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Cancel an appointment by updating its status to CANCELLED.
    """
    try:
        return cancel_appointment(db, appointment_id)
    except ValueError as e:
        if "Appointment not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        elif "Only waiting appointments can be cancelled" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
