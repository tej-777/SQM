from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.models.appointment import Appointment, AppointmentStatus
from app.models.hospital_service import HospitalService
from app.schemas.patient_queue import PatientQueueView
from datetime import datetime, timezone, timedelta
import uuid


def get_patient_queue_view(db: Session, appointment_id: uuid.UUID) -> PatientQueueView:
    """
    Get patient queue view with ETA calculation.
    """
    # 1. Fetch appointment
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    
    if not appointment:
        raise ValueError("Appointment not found")
    
    # 2. Check if appointment is already served, skipped, or cancelled
    if appointment.status in [AppointmentStatus.SERVED, AppointmentStatus.SKIPPED, AppointmentStatus.CANCELLED]:
        return PatientQueueView(
            appointment_id=appointment.id,
            token_number=appointment.token_number,
            status=appointment.status.value,
            people_ahead=0,
            estimated_wait_minutes=0,
            estimated_call_time=datetime.now(timezone.utc)
        )
    
    # 3. Count people ahead (WAITING tokens with lower numbers)
    people_ahead = db.query(func.count(Appointment.id)).filter(
        and_(
            Appointment.hospital_service_id == appointment.hospital_service_id,
            Appointment.appointment_date == appointment.appointment_date,
            Appointment.status == AppointmentStatus.WAITING,
            Appointment.token_number < appointment.token_number
        )
    ).scalar() or 0
    
    # 4. Fetch hospital_service for appointment duration
    hospital_service = db.query(HospitalService).filter(
        HospitalService.id == appointment.hospital_service_id
    ).first()
    
    if not hospital_service:
        raise ValueError("Hospital service not found")
    
    # 5. Calculate estimated wait time with multi-counter support and edge case handling
    appointment_duration = hospital_service.avg_consultation_time_minutes or 10
    counters = hospital_service.active_counters or 1
    
    # Edge case: ensure counters is at least 1
    if counters <= 0:
        counters = 1
    
    # Edge case: ensure no negative ETA
    if people_ahead <= 0:
        estimated_wait_minutes = 0
    else:
        estimated_wait_minutes = (people_ahead * appointment_duration) // counters
    
    # ETA DEBUG LOGS
    print("ETA DEBUG - PATIENT QUEUE CRUD")
    print("people_ahead:", people_ahead)
    print("appointment_duration:", appointment_duration)
    print("counters:", counters)
    print("ETA:", estimated_wait_minutes)
    
    # 6. Calculate estimated call time
    current_time = datetime.now(timezone.utc)
    estimated_call_time = current_time + timedelta(minutes=estimated_wait_minutes)
    
    return PatientQueueView(
        appointment_id=appointment.id,
        token_number=appointment.token_number,
        status=appointment.status.value,
        people_ahead=people_ahead,
        estimated_wait_minutes=estimated_wait_minutes,
        estimated_call_time=estimated_call_time
    )
