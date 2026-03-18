from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.models.appointment import Appointment, AppointmentStatus
from app.models.hospital_service import HospitalService
from app.schemas.queue import QueueStatusResponse, CallNextTokenRequest
from app.services.queue_service import get_patient_queue_status
from typing import Optional
from datetime import date
import uuid

# Import WebSocket manager for real-time updates
from app.websocket.manager import manager
from datetime import datetime

async def broadcast_queue_update(hospital_service_id: uuid.UUID, appointment_date: date, update_type: str):
    """Broadcast queue update to all connected clients."""
    room_key = f"{hospital_service_id}:{appointment_date}"
    message = {
        "type": "QUEUE_UPDATE",
        "hospital_service_id": str(hospital_service_id),
        "appointment_date": appointment_date.isoformat(),
        "update_type": update_type,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Broadcast to all clients in the room
    await manager.broadcast(room_key, message)


def get_queue_status(db: Session, hospital_service_id: uuid.UUID, appointment_date: date) -> QueueStatusResponse:
    """
    Get comprehensive queue status for a specific hospital service and date.
    """
    # Get current token (latest CALLED)
    current_token_query = db.query(Appointment.token_number).filter(
        and_(
            Appointment.hospital_service_id == hospital_service_id,
            Appointment.appointment_date == appointment_date,
            Appointment.status == AppointmentStatus.CALLED
        )
    ).order_by(Appointment.token_number.desc()).first()
    
    current_token = current_token_query[0] if current_token_query else None
    
    # Get next token (smallest WAITING)
    next_token_query = db.query(Appointment.token_number).filter(
        and_(
            Appointment.hospital_service_id == hospital_service_id,
            Appointment.appointment_date == appointment_date,
            Appointment.status == AppointmentStatus.WAITING
        )
    ).order_by(Appointment.token_number.asc()).first()
    
    next_token = next_token_query[0] if next_token_query else None
    
    # Count by status
    status_counts = db.query(
        Appointment.status,
        func.count(Appointment.id).label('count')
    ).filter(
        and_(
            Appointment.hospital_service_id == hospital_service_id,
            Appointment.appointment_date == appointment_date
        )
    ).group_by(Appointment.status).all()
    
    # Initialize counts
    waiting_count = 0
    served_count = 0
    skipped_count = 0
    
    # Extract counts from query result
    for status, count in status_counts:
        if status == AppointmentStatus.WAITING:
            waiting_count = count
        elif status == AppointmentStatus.SERVED:
            served_count = count
        elif status == AppointmentStatus.SKIPPED:
            skipped_count = count
    
    return QueueStatusResponse(
        hospital_service_id=hospital_service_id,
        appointment_date=appointment_date,
        current_token=current_token,
        next_token=next_token,
        waiting_count=waiting_count,
        served_count=served_count,
        skipped_count=skipped_count
    )


def call_next_token(db: Session, hospital_service_id: uuid.UUID, appointment_date: date) -> Appointment:
    """
    Implement proper queue lifecycle:
    1. Find appointment with status = "CALLED" and update to "SERVED"
    2. Find next patient with status = "WAITING" and update to "CALLED"
    """
    print(f"DEBUG: call_next_token called with service_id={hospital_service_id}, date={appointment_date}")
    
    # Step 1: Find appointment with status = "CALLED" and update to "SERVED"
    current_called = db.query(Appointment).filter(
        and_(
            Appointment.hospital_service_id == hospital_service_id,
            Appointment.appointment_date == appointment_date,
            Appointment.status == AppointmentStatus.CALLED
        )
    ).first()
    
    if current_called:
        current_called.status = AppointmentStatus.SERVED
        db.commit()
        print(f"DEBUG: Updated appointment {current_called.id} (T-{current_called.token_number}) from CALLED to SERVED")
    else:
        print("DEBUG: No currently called patient found")
    
    # Step 2: Find next patient with status = "WAITING"
    next_appointment = db.query(Appointment).filter(
        and_(
            Appointment.hospital_service_id == hospital_service_id,
            Appointment.appointment_date == appointment_date,
            Appointment.status == AppointmentStatus.WAITING
        )
    ).order_by(Appointment.token_number.asc()).first()
    
    if not next_appointment:
        # No more waiting patients, but we still successfully served the current patient
        if current_called:
            print("DEBUG: No more waiting patients, returning served patient")
            return current_called
        print("DEBUG: No waiting patients and no current called patient")
        raise ValueError("No waiting tokens")
    
    # Step 3: Update next patient to "CALLED"
    next_appointment.status = AppointmentStatus.CALLED
    db.commit()
    db.refresh(next_appointment)
    
    print(f"DEBUG: Updated appointment {next_appointment.id} (T-{next_appointment.token_number}) from WAITING to CALLED")
    
    # Broadcast queue update asynchronously
    import asyncio
    asyncio.create_task(broadcast_queue_update(
        hospital_service_id, 
        appointment_date, 
        "TOKEN_CALLED"
    ))
    
    return next_appointment


def skip_token(db: Session, hospital_service_id: uuid.UUID, appointment_date: date) -> Appointment:
    """
    Skip the currently called patient by updating their status to SKIPPED
    and calling the next waiting patient.
    """
    print(f"DEBUG: skip_token called with service_id={hospital_service_id}, date={appointment_date}")
    
    # Step 1: Find appointment with status = "CALLED" and update to "SKIPPED"
    current_called = db.query(Appointment).filter(
        and_(
            Appointment.hospital_service_id == hospital_service_id,
            Appointment.appointment_date == appointment_date,
            Appointment.status == AppointmentStatus.CALLED
        )
    ).first()
    
    if not current_called:
        print("DEBUG: No currently called patient to skip")
        raise ValueError("No currently called patient to skip")
    
    current_called.status = AppointmentStatus.SKIPPED
    db.commit()
    print(f"DEBUG: Updated appointment {current_called.id} (T-{current_called.token_number}) from CALLED to SKIPPED")
    
    # Step 2: Find next patient with status = "WAITING"
    next_appointment = db.query(Appointment).filter(
        and_(
            Appointment.hospital_service_id == hospital_service_id,
            Appointment.appointment_date == appointment_date,
            Appointment.status == AppointmentStatus.WAITING
        )
    ).order_by(Appointment.token_number.asc()).first()
    
    if not next_appointment:
        print("DEBUG: No more waiting patients after skip")
        return current_called
    
    # Step 3: Update next patient to "CALLED"
    next_appointment.status = AppointmentStatus.CALLED
    db.commit()
    db.refresh(next_appointment)
    
    print(f"DEBUG: Updated appointment {next_appointment.id} (T-{next_appointment.token_number}) from WAITING to CALLED")
    
    # Broadcast queue update asynchronously
    import asyncio
    asyncio.create_task(broadcast_queue_update(
        hospital_service_id, 
        appointment_date, 
        "TOKEN_SKIPPED"
    ))
    
    return next_appointment


def update_token_status(db: Session, appointment_id: uuid.UUID, new_status: AppointmentStatus) -> Appointment:
    """
    Update the status of a specific appointment with strict transition validation.
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    
    if not appointment:
        raise ValueError("Appointment not found")
    
    # Define allowed transitions
    allowed_transitions = {
        AppointmentStatus.WAITING: [AppointmentStatus.CALLED, AppointmentStatus.CANCELLED],
        AppointmentStatus.CALLED: [AppointmentStatus.SERVED, AppointmentStatus.CANCELLED],
        AppointmentStatus.SERVED: [],  # No transitions allowed from SERVED
        AppointmentStatus.SKIPPED: [],  # No transitions allowed from SKIPPED
        AppointmentStatus.CANCELLED: [],  # No transitions allowed from CANCELLED
        AppointmentStatus.NO_SHOW: [],  # No transitions allowed from NO_SHOW
    }
    
    # Validate transition
    current_status = appointment.status
    if new_status not in allowed_transitions.get(current_status, []):
        raise ValueError(f"Invalid status transition from {current_status.value} to {new_status.value}")
    
    appointment.status = new_status
    db.commit()
    db.refresh(appointment)
    
    # Broadcast queue update asynchronously
    import asyncio
    asyncio.create_task(broadcast_queue_update(
        appointment.hospital_service_id,
        appointment.appointment_date,
        f"TOKEN_{new_status.value.upper()}"
    ))
    
    return appointment
