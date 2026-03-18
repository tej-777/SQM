from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.appointment import Appointment, AppointmentStatus
from app.models.hospital_service import HospitalService
from app.models.hospital import Hospital
from app.models.service import Service
import uuid


def get_patient_queue_status(db: Session, appointment_id: uuid.UUID):
    """
    Get patient queue status with ETA calculation using avg_consultation_time_minutes.
    """
    print(f"DEBUG: get_patient_queue_status called with appointment_id: {appointment_id}, type: {type(appointment_id)}")
    
    # 1. Fetch the appointment by ID with joins
    print(f"DEBUG: About to query database...")
    try:
        appointment = db.query(Appointment).join(HospitalService).join(Hospital).join(Service).filter(
            Appointment.id == appointment_id
        ).first()
        print(f"DEBUG: Query completed, appointment: {appointment}")
    except Exception as e:
        print(f"DEBUG: Query failed with error: {e}")
        raise

    if not appointment:
        print(f"DEBUG: Appointment not found")
        raise ValueError("Appointment not found")

    print(f"DEBUG: Found appointment, status: {appointment.status}, type: {type(appointment.status)}")
    
    # 2. Edge cases for served/skipped/cancelled status
    try:
        status_list = [AppointmentStatus.SERVED, AppointmentStatus.SKIPPED, AppointmentStatus.CANCELLED]
        print(f"DEBUG: Status list: {status_list}")
        print(f"DEBUG: Checking if {appointment.status} in {status_list}")
        
        if appointment.status in status_list:
            print(f"DEBUG: Appointment is in terminal status, returning early")
            return {
                "appointment_id": str(appointment.id),  # Convert UUID to string
                "token_number": appointment.token_number,
                "people_ahead": 0,
                "estimated_wait_time": 0,
                "status": appointment.status.value,
                "hospital_name": appointment.hospital_service.hospital.name,
                "service_name": appointment.hospital_service.service.name,
                "patient_name": appointment.patient_name,
                "patient_phone": appointment.patient_phone
            }
    except Exception as e:
        print(f"DEBUG: Error in status check: {e}")
        raise

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
    print("ETA DEBUG - SERVICE FUNCTION")
    print("people_ahead:", patients_ahead)
    print("avg_minutes:", avg_minutes)
    print("counters:", counters)
    print("ETA:", estimated_wait_time_minutes)

    return {
        "appointment_id": str(appointment.id),  # Convert UUID to string
        "token_number": appointment.token_number,
        "people_ahead": patients_ahead,
        "estimated_wait_time": estimated_wait_time_minutes,
        "status": appointment.status.value,
        "hospital_name": appointment.hospital_service.hospital.name,
        "service_name": appointment.hospital_service.service.name,
        "patient_name": appointment.patient_name,
        "patient_phone": appointment.patient_phone
    }
