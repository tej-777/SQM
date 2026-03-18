from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from sqlalchemy.exc import IntegrityError
from app.models.appointment import Appointment, AppointmentStatus
from app.models.service_availability import ServiceAvailability
from app.models.hospital_service import HospitalService
from app.schemas.appointment import AppointmentCreate, ServiceAvailabilityCreate
from app.websocket.manager import manager
from typing import Optional
from datetime import date, datetime
import uuid

def create_appointment(db: Session, appointment_data: AppointmentCreate) -> Appointment:
    """
    Create an appointment with automatic token generation.
    """
    try:
        # 1️⃣ Validate HospitalService exists
        hospital_service = db.query(HospitalService).filter(
            HospitalService.id == appointment_data.hospital_service_id
        ).first()
        
        if not hospital_service:
            raise ValueError("Hospital service not found")
        
        # 2️⃣ Fetch ServiceAvailability for that hospital_service_id + date
        availability = db.query(ServiceAvailability).filter(
            and_(
                ServiceAvailability.hospital_service_id == appointment_data.hospital_service_id,
                ServiceAvailability.date == appointment_data.appointment_date
            )
        ).first()
        
        if not availability:
            raise ValueError("Service not available for selected date")
        
        if availability.is_available == False:
            raise ValueError("Service unavailable on selected date")
        
        # 3️⃣ Determine max_tokens
        if availability.max_tokens_override:
            max_tokens = availability.max_tokens_override
        else:
            max_tokens = hospital_service.default_max_tokens_per_day
        
        # 4️⃣ Count existing appointments for capacity check
        existing_count = db.query(Appointment).filter(
            and_(
                Appointment.hospital_service_id == appointment_data.hospital_service_id,
                Appointment.appointment_date == appointment_data.appointment_date
            )
        ).count()
        
        # 5️⃣ If existing_count >= max_tokens
        if existing_count >= max_tokens:
            raise ValueError("Max tokens reached for this date")
        
        # 6️⃣ Intelligent duplicate booking protection
        # Only block if ALL conditions match: hospital_service_id, appointment_date, patient_name, patient_phone, status = WAITING
        existing = db.query(Appointment).filter(
            and_(
                Appointment.hospital_service_id == appointment_data.hospital_service_id,
                Appointment.appointment_date == appointment_data.appointment_date,
                Appointment.patient_name == appointment_data.patient_name,
                Appointment.patient_phone == appointment_data.patient_phone,
                Appointment.status == AppointmentStatus.WAITING
            )
        ).first()
        
        if existing:
            raise ValueError("Duplicate booking detected for same patient on same date.")
        
        # 7️⃣ Concurrency-safe token generation with retry logic
        max_retries = 2
        for attempt in range(max_retries):
            try:
                # Get last appointment with ordered row locking for concurrency safety
                last_appointment = (
                    db.query(Appointment)
                    .filter(
                        Appointment.hospital_service_id == appointment_data.hospital_service_id,
                        Appointment.appointment_date == appointment_data.appointment_date
                    )
                    .order_by(Appointment.token_number.desc())
                    .with_for_update()
                    .first()
                )
                
                # Generate next token
                if last_appointment:
                    next_token = last_appointment.token_number + 1
                else:
                    next_token = 1
                
                # 8️⃣ Create Appointment
                db_appointment = Appointment(
                    hospital_service_id=appointment_data.hospital_service_id,
                    appointment_date=appointment_data.appointment_date,
                    patient_name=appointment_data.patient_name,
                    patient_phone=appointment_data.patient_phone,
                    token_number=next_token,
                    status=AppointmentStatus.WAITING,
                    created_at=datetime.utcnow()
                )
                
                # 9️⃣ Commit and return (entire operation in same transaction)
                db.add(db_appointment)
                db.commit()
                db.refresh(db_appointment)
                
                # Broadcast queue update asynchronously
                import asyncio
                asyncio.create_task(manager.broadcast(
                    f"{appointment_data.hospital_service_id}:{appointment_data.appointment_date}",
                    {
                        "type": "QUEUE_UPDATE",
                        "hospital_service_id": str(appointment_data.hospital_service_id),
                        "appointment_date": appointment_data.appointment_date.isoformat(),
                        "update_type": "APPOINTMENT_CREATED",
                        "timestamp": datetime.utcnow().isoformat()
                    }
                ))
                
                return db_appointment
                
            except IntegrityError as e:
                db.rollback()
                # Integrity error means unique constraint violation - retry once
                if attempt < max_retries - 1:
                    continue  # Retry once
                else:
                    raise Exception(f"Database integrity error: {str(e)}")
            except Exception as e:
                db.rollback()
                raise Exception(f"Database error: {str(e)}")
        
    except ValueError:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise Exception(f"Database error: {str(e)}")

def cancel_appointment(db: Session, appointment_id: uuid.UUID) -> Appointment:
    """
    Cancel an appointment by updating its status to CANCELLED.
    Only allows cancellation of WAITING appointments.
    """
    try:
        # Fetch appointment by id
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        
        if not appointment:
            raise ValueError("Appointment not found")
        
        # If status != WAITING → return 400
        if appointment.status != AppointmentStatus.WAITING:
            raise ValueError("Only waiting appointments can be cancelled")
        
        # Update status to CANCELLED
        appointment.status = AppointmentStatus.CANCELLED
        db.commit()
        db.refresh(appointment)
        
        # Broadcast queue update asynchronously
        import asyncio
        asyncio.create_task(manager.broadcast(
            f"{appointment.hospital_service_id}:{appointment.appointment_date}",
            {
                "type": "QUEUE_UPDATE",
                "hospital_service_id": str(appointment.hospital_service_id),
                "appointment_date": appointment.appointment_date.isoformat(),
                "update_type": "APPOINTMENT_CANCELLED",
                "timestamp": datetime.utcnow().isoformat()
            }
        ))
        
        return appointment
        
    except ValueError:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise Exception(f"Database error: {str(e)}")

def get_appointment(db: Session, appointment_id: uuid.UUID) -> Optional[Appointment]:
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()

def get_appointments(db: Session, skip: int = 0, limit: int = 100) -> list[Appointment]:
    return db.query(Appointment).offset(skip).limit(limit).all()

def get_appointments_by_hospital(db: Session, hospital_id: uuid.UUID, appointment_date: date) -> list[Appointment]:
    return db.query(Appointment).filter(
        and_(
            Appointment.hospital_id == hospital_id,
            Appointment.appointment_date == appointment_date
        )
    ).all()

def get_appointments_by_service(db: Session, service_id: uuid.UUID, appointment_date: date) -> list[Appointment]:
    return db.query(Appointment).filter(
        and_(
            Appointment.service_id == service_id,
            Appointment.appointment_date == appointment_date
        )
    ).all()

def get_service_availability(db: Session, hospital_service_id: uuid.UUID, availability_date: date) -> Optional[ServiceAvailability]:
    return db.query(ServiceAvailability).filter(
        and_(
            ServiceAvailability.hospital_service_id == hospital_service_id,
            ServiceAvailability.date == availability_date
        )
    ).first()

def create_service_availability(
    db: Session,
    availability: ServiceAvailabilityCreate
) -> ServiceAvailability:
    """
    Create service availability with validation and duplicate protection.
    """
    from app.models.hospital_service import HospitalService

    # Check hospital_service exists
    hospital_service = db.query(HospitalService).filter(
        HospitalService.id == availability.hospital_service_id
    ).first()

    if not hospital_service:
        raise ValueError("Hospital service not found")

    # Check duplicate for same date
    existing = db.query(ServiceAvailability).filter(
        ServiceAvailability.hospital_service_id == availability.hospital_service_id,
        ServiceAvailability.date == availability.date
    ).first()

    if existing:
        raise ValueError("Availability already exists for this date")

    db_availability = ServiceAvailability(
        **availability.model_dump()
    )

    db.add(db_availability)
    db.commit()
    db.refresh(db_availability)

    return db_availability
