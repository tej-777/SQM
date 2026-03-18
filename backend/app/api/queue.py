from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.schemas.queue import QueueStatusResponse, CallNextTokenRequest, PatientQueueStatusResponse
from app.crud.queue import get_queue_status, call_next_token, update_token_status, skip_token
from app.services.queue_service import get_patient_queue_status
from app.schemas.appointment import AppointmentResponse
from app.models.appointment import Appointment, AppointmentStatus
from app.models.hospital_service import HospitalService
from app.models.hospital import Hospital
from app.models.service import Service
from app.dependencies.auth import get_current_staff
from app.models.staff import Staff
from datetime import date
import uuid
from uuid import UUID

router = APIRouter(prefix="/queue", tags=["Queue"])


@router.get("/patient/{appointment_id}")
def get_patient_queue_status_endpoint(
    appointment_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get queue status for a specific patient appointment.
    Returns current position and estimated wait time.
    """
    try:
        # Convert to string UUID for database query
        appointment_uuid = uuid.UUID(str(appointment_id))
        
        # 1. Fetch the appointment by ID with joins
        appointment = db.query(Appointment).join(HospitalService).join(Hospital).join(Service).filter(
            Appointment.id == appointment_uuid
        ).first()

        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")

        # 2. Edge cases for served/skipped/cancelled status
        if appointment.status in [AppointmentStatus.SERVED, AppointmentStatus.SKIPPED, AppointmentStatus.CANCELLED]:
            return {
                "appointment_id": str(appointment.id),
                "token_number": appointment.token_number,
                "people_ahead": 0,
                "estimated_wait_minutes": 0,
                "status": appointment.status.value,
                "hospital_name": appointment.hospital_service.hospital.name,
                "service_name": appointment.hospital_service.service.name,
                "patient_name": appointment.patient_name,
                "patient_phone": appointment.patient_phone
            }

        # 3. Get avg_consultation_time_minutes with default to 10 minutes
        avg_minutes = appointment.hospital_service.avg_consultation_time_minutes or 10

        # 4. Count number of appointments ahead
        patients_ahead = db.query(func.count(Appointment.id)).filter(
            Appointment.hospital_service_id == appointment.hospital_service_id,
            Appointment.appointment_date == appointment.appointment_date,
            Appointment.status == AppointmentStatus.WAITING,
            Appointment.token_number < appointment.token_number
        ).scalar() or 0

        # 5. ETA calculation with multi-counter support and edge case handling
        counters = appointment.hospital_service.active_counters or 1
        avg_minutes = appointment.hospital_service.avg_consultation_time_minutes or 10
        
        # Edge case: ensure counters is at least 1
        if counters <= 0:
            counters = 1
        
        # Edge case: ensure no negative ETA
        if patients_ahead <= 0:
            estimated_wait_time_minutes = 0
        else:
            estimated_wait_time_minutes = (patients_ahead * avg_minutes) // counters
        
        # ETA DEBUG LOGS
        print("ETA DEBUG - PATIENT QUEUE")
        print("people_ahead:", patients_ahead)
        print("avg_minutes:", avg_minutes)
        print("counters:", counters)
        print("ETA:", estimated_wait_time_minutes)

        return {
            "appointment_id": str(appointment.id),
            "token_number": appointment.token_number,
            "people_ahead": patients_ahead,
            "estimated_wait_minutes": estimated_wait_time_minutes,
            "status": appointment.status.value,
            "hospital_name": appointment.hospital_service.hospital.name,
            "service_name": appointment.hospital_service.service.name,
            "patient_name": appointment.patient_name,
            "patient_phone": appointment.patient_phone
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Error in get_patient_queue_status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching patient queue status: {str(e)}"
        )

@router.get("/status/{hospital_service_id}/{appointment_date}")
def get_queue_status(hospital_service_id: str, appointment_date: date, db: Session = Depends(get_db)):
    """
    Get queue status for a specific hospital service and date.
    Returns all appointments with their current status for proper frontend filtering.
    """
    # STEP 2: Debug logs for queue API
    print("QUEUE DEBUG")
    print("hospital_service_id:", hospital_service_id)
    print("date received:", appointment_date)
    print("date type:", type(appointment_date))
    
    # STEP 1: Verify what exists in database
    print("\n=== DATABASE VERIFICATION ===")
    
    # Check all appointments in database (recent)
    all_appointments = db.query(Appointment).order_by(Appointment.appointment_date.desc()).limit(10).all()
    print(f"Total appointments in database (last 10): {len(all_appointments)}")
    for a in all_appointments:
        print(f"  ID: {a.id}")
        print(f"  hospital_service_id: {a.hospital_service_id}")
        print(f"  appointment_date: {a.appointment_date}")
        print(f"  token_number: {a.token_number}")
        print(f"  patient_name: {a.patient_name}")
        print(f"  patient_phone: {a.patient_phone}")
        print(f"  status: {a.status}")
        print("  ---")
    
    # CRITICAL: Check if the requested service_id actually exists
    print(f"\n=== SERVICE ID VERIFICATION ===")
    print(f"Requested hospital_service_id: {hospital_service_id}")
    
    # Check if this service_id exists in any appointments
    service_exists = db.query(Appointment).filter(
        Appointment.hospital_service_id == hospital_service_id
    ).first()
    
    if service_exists:
        print(f"✅ Service ID {hospital_service_id} EXISTS in database")
        service_appointments = db.query(Appointment).filter(
            Appointment.hospital_service_id == hospital_service_id
        ).all()
        print(f"   Found {len(service_appointments)} appointments for this service")
        for a in service_appointments:
            print(f"   - Date: {a.appointment_date}, Status: {a.status}, Name: {a.patient_name}")
    else:
        print(f"❌ Service ID {hospital_service_id} DOES NOT EXIST in database")
        
        # Show what service_ids DO exist
        existing_services = db.query(Appointment.hospital_service_id).distinct().all()
        print(f"   Existing service_ids in database:")
        for service in existing_services:
            print(f"   - {service[0]}")
    
    # Check appointments for this specific date
    date_appointments = db.query(Appointment).filter(
        Appointment.appointment_date == appointment_date
    ).all()
    print(f"\nAppointments for date {appointment_date}: {len(date_appointments)}")
    for a in date_appointments:
        print(f"  - Service: {a.hospital_service_id}, Status: {a.status}, Name: {a.patient_name}")
    
    # STEP 4: Fix date format mismatch if needed
    if isinstance(appointment_date, str):
        try:
            from datetime import datetime
            appointment_date = datetime.strptime(appointment_date, "%Y-%m-%d").date()
            print(f"Converted date string to: {appointment_date}")
        except ValueError as e:
            print(f"Date conversion error: {e}")
    
    # STEP 5: Get ALL appointments for this service and date (for proper frontend filtering)
    appointments = db.query(Appointment).filter(
        Appointment.hospital_service_id == hospital_service_id,
        Appointment.appointment_date == appointment_date
    ).order_by(Appointment.token_number).all()
    
    # If no appointments for specific date, try all dates for this service
    if len(appointments) == 0:
        print(f"\nNo appointments for {appointment_date}, checking all dates for service {hospital_service_id}")
        appointments = db.query(Appointment).filter(
            Appointment.hospital_service_id == hospital_service_id
        ).order_by(Appointment.token_number).all()
        print(f"Found {len(appointments)} appointments for service {hospital_service_id} (all dates)")
    
    # STEP 2: Debug after query
    print(f"\nappointments returned: {len(appointments)}")
    for a in appointments:
        print(f"  - ID: {a.id}, Token: {a.token_number}, Name: {a.patient_name}, Status: {a.status}, Date: {a.appointment_date}")
    
    # STEP 6: Ensure API response includes ID and service/hospital names
    result = []
    for a in appointments:
        # Get service and hospital names
        service_name = "Unknown Service"
        hospital_name = "Unknown Hospital"
        
        print(f"DEBUG: Looking up names for appointment {a.id}, hospital_service_id: {a.hospital_service_id}")
        
        try:
            # Get service name
            from app.models.hospital_service import HospitalService
            from app.models.service import Service
            from app.models.hospital import Hospital
            
            hospital_service = db.query(HospitalService).filter(
                HospitalService.id == a.hospital_service_id
            ).first()
            
            print(f"DEBUG: HospitalService found: {hospital_service is not None}")
            
            if hospital_service:
                print(f"DEBUG: HospitalService details - service_id: {hospital_service.service_id}, hospital_id: {hospital_service.hospital_id}")
                
                service = db.query(Service).filter(
                    Service.id == hospital_service.service_id
                ).first()
                if service:
                    service_name = service.name
                    print(f"DEBUG: Service name found: {service_name}")
                else:
                    print(f"DEBUG: Service not found for service_id: {hospital_service.service_id}")
                
                hospital = db.query(Hospital).filter(
                    Hospital.id == hospital_service.hospital_id
                ).first()
                if hospital:
                    hospital_name = hospital.name
                    print(f"DEBUG: Hospital name found: {hospital_name}")
                else:
                    print(f"DEBUG: Hospital not found for hospital_id: {hospital_service.hospital_id}")
            else:
                print(f"DEBUG: HospitalService not found for id: {a.hospital_service_id}")
        except Exception as e:
            print(f"Error fetching service/hospital names: {e}")
        
        result.append({
            "id": str(a.id),  # Convert UUID to string for JSON serialization
            "token_number": a.token_number,
            "patient_name": a.patient_name,
            "patient_phone": a.patient_phone,
            "status": a.status,
            "appointment_date": a.appointment_date.isoformat(),  # Add appointment date
            "service_name": service_name,
            "hospital_name": hospital_name
        })
        
        print(f"DEBUG: Final result for appointment {a.id}: service_name='{service_name}', hospital_name='{hospital_name}'")
    
    return result


@router.post("/call-next", response_model=AppointmentResponse)
async def call_next_token_endpoint(
    request: CallNextTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Call next waiting token.
    """
    try:
        appointment = call_next_token(db, request.hospital_service_id, request.appointment_date)
        return appointment
    except ValueError as e:
        if "No waiting tokens" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/skip", response_model=AppointmentResponse)
async def skip_token_endpoint(
    request: CallNextTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Skip currently called token and call next waiting token.
    """
    try:
        appointment = skip_token(db, request.hospital_service_id, request.appointment_date)
        return appointment
    except ValueError as e:
        if "No currently called patient" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.put("/{appointment_id}/serve", response_model=AppointmentResponse)
async def serve_token_endpoint(
    appointment_id: UUID,
    current_staff: Staff = Depends(get_current_staff),
    db: Session = Depends(get_db)
):
    """
    Mark a token as served.
    """
    try:
        appointment = update_token_status(db, appointment_id, AppointmentStatus.SERVED)
        return appointment
    except ValueError as e:
        if "Appointment not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.put("/{appointment_id}/skip", response_model=AppointmentResponse)
async def skip_token_endpoint(
    appointment_id: uuid.UUID,
    current_staff: Staff = Depends(get_current_staff),
    db: Session = Depends(get_db)
):
    """
    Skip a token.
    """
    try:
        appointment = update_token_status(db, appointment_id, AppointmentStatus.SKIPPED)
        return appointment
    except ValueError as e:
        if "Appointment not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/patient/{appointment_id}")
def get_patient_queue_status(appointment_id: str, db: Session = Depends(get_db)):
    """
    Get patient queue status and ETA.
    """
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    hospital_service = db.query(HospitalService).filter(
        HospitalService.id == appointment.hospital_service_id
    ).first()

    hospital = db.query(Hospital).filter(
        Hospital.id == hospital_service.hospital_id
    ).first()

    service = db.query(Service).filter(
        Service.id == hospital_service.service_id
    ).first()

    # Debug: Get all appointments for this service and date to understand the data
    all_appointments = db.query(Appointment).filter(
        Appointment.hospital_service_id == appointment.hospital_service_id,
        Appointment.appointment_date == appointment.appointment_date
    ).order_by(Appointment.token_number).all()
    
    print(f"DEBUG: All appointments for this service:")
    for a in all_appointments:
        print(f"  Token: {a.token_number}, Status: {a.status}, Name: {a.patient_name}")
    
    people_ahead = db.query(Appointment).filter(
        Appointment.hospital_service_id == appointment.hospital_service_id,
        Appointment.appointment_date == appointment.appointment_date,
        Appointment.token_number < appointment.token_number,
        Appointment.status == "WAITING"
    ).count()

    # Calculate estimated wait time with correct formula
    counters = hospital_service.active_counters or 1
    avg_time = hospital_service.avg_consultation_time_minutes or 10
    estimated_wait_time = (people_ahead * avg_time) // counters
    
    # ETA DEBUG LOGS
    print("ETA DEBUG - QUEUE STATUS")
    print("people_ahead:", people_ahead)
    print("avg_time:", avg_time)
    print("counters:", counters)
    print("ETA:", estimated_wait_time)

    return {
        "hospital_name": hospital.name,
        "service_name": service.name,
        "patient_name": appointment.patient_name,
        "patient_phone": appointment.patient_phone,
        "token_number": appointment.token_number,
        "people_ahead": people_ahead,
        "estimated_wait_time": estimated_wait_time,
        "status": appointment.status
    }
