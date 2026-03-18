from sqlalchemy import Column, Integer, UUID, ForeignKey, UniqueConstraint, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
from datetime import datetime

class HospitalService(Base):
    __tablename__ = "hospital_services"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id"), nullable=False)
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id"), nullable=False)
    default_max_tokens_per_day = Column(Integer, nullable=False)
    avg_consultation_time_minutes = Column(Integer, nullable=False)
    active_counters = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships - using string references to avoid circular imports
    hospital = relationship("Hospital", back_populates="services")
    service = relationship("Service", back_populates="hospital_services")
    service_availabilities = relationship("ServiceAvailability", back_populates="hospital_service")
    appointments = relationship("Appointment", back_populates="hospital_service", cascade="all, delete")

    # Unique constraint
    __table_args__ = (UniqueConstraint('hospital_id', 'service_id', name='_hospital_service_uc'),)

    def __repr__(self):
        return f"<HospitalService(id={self.id}, hospital_id={self.hospital_id}, service_id={self.service_id})>"
