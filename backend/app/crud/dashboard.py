from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.models.appointment import Appointment, AppointmentStatus
from app.models.hospital_service import HospitalService
from typing import List, Dict, Any
from datetime import date
import uuid


def get_dashboard_summary(db: Session, hospital_service_id: uuid.UUID, target_date: date) -> Dict[str, Any]:
    """
    Get dashboard summary for a specific hospital service and date.
    """
    # Verify hospital service exists
    hospital_service = db.query(HospitalService).filter(HospitalService.id == hospital_service_id).first()
    if not hospital_service:
        raise ValueError("Hospital service not found")
    
    # Count appointments by status
    status_counts = db.query(
        Appointment.status,
        func.count(Appointment.id).label('count')
    ).filter(
        and_(
            Appointment.hospital_service_id == hospital_service_id,
            Appointment.appointment_date == target_date
        )
    ).group_by(Appointment.status).all()
    
    # Initialize counts
    total_tokens_today = 0
    waiting = 0
    called = 0
    served = 0
    cancelled = 0
    
    # Extract counts from query result
    for status, count in status_counts:
        total_tokens_today += count
        if status == AppointmentStatus.WAITING:
            waiting = count
        elif status == AppointmentStatus.CALLED:
            called = count
        elif status == AppointmentStatus.SERVED:
            served = count
        elif status == AppointmentStatus.CANCELLED:
            cancelled = count
    
    # Currently serving is same as called
    currently_serving = called
    
    return {
        "total_tokens_today": total_tokens_today,
        "waiting": waiting,
        "called": called,
        "served": served,
        "cancelled": cancelled,
        "currently_serving": currently_serving
    }


def get_dashboard_queue(db: Session, hospital_service_id: uuid.UUID, target_date: date) -> List[Dict[str, Any]]:
    """
    Get dashboard queue list for a specific hospital service and date.
    """
    # Verify hospital service exists
    hospital_service = db.query(HospitalService).filter(HospitalService.id == hospital_service_id).first()
    if not hospital_service:
        raise ValueError("Hospital service not found")
    
    # Get appointments ordered by token number
    appointments = db.query(Appointment).filter(
        and_(
            Appointment.hospital_service_id == hospital_service_id,
            Appointment.appointment_date == target_date
        )
    ).order_by(Appointment.token_number.asc()).all()
    
    # Format response
    queue_list = []
    for appointment in appointments:
        queue_list.append({
            "id": appointment.id,
            "token_number": appointment.token_number,
            "patient_name": appointment.patient_name,
            "status": appointment.status.value
        })
    
    return queue_list
