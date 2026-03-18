from sqlalchemy import Column, Integer, UUID, ForeignKey, String, Date, DateTime, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
import enum

class AppointmentStatus(str, enum.Enum):
    WAITING = "WAITING"
    CALLED = "CALLED"
    SERVED = "SERVED"
    SKIPPED = "SKIPPED"
    NO_SHOW = "NO_SHOW"
    CANCELLED = "CANCELLED"

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    hospital_service_id = Column(UUID(as_uuid=True), ForeignKey("hospital_services.id"), nullable=False)
    appointment_date = Column(Date, nullable=False)
    token_number = Column(Integer, nullable=False)
    patient_name = Column(String(200), nullable=False)
    patient_phone = Column(String(20), nullable=False)
    status = Column(
        Enum(AppointmentStatus, name="appointmentstatus"),
        default=AppointmentStatus.WAITING,
        nullable=False
    )
    created_at = Column(DateTime, nullable=False)

    # Relationships - using string references to avoid circular imports
    hospital_service = relationship("HospitalService", back_populates="appointments")

    # Unique constraint
    __table_args__ = (
        UniqueConstraint(
            "hospital_service_id",
            "appointment_date", 
            "token_number",
            name="uq_token_per_day"
        ),
    )

    def __repr__(self):
        return f"<Appointment(id={self.id}, token_number={self.token_number}, status='{self.status.value}')>"
