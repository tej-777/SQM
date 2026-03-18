from sqlalchemy import Column, Integer, UUID, ForeignKey, Date, Boolean, UniqueConstraint, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid
from datetime import datetime

class ServiceAvailability(Base):
    __tablename__ = "service_availabilities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    hospital_service_id = Column(UUID(as_uuid=True), ForeignKey("hospital_services.id"), nullable=False)
    date = Column(Date, nullable=False)
    total_slots = Column(Integer, nullable=False, default=0)
    booked_slots = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default=func.now(), onupdate=datetime.utcnow)

    # Relationships - using string references to avoid circular imports
    hospital_service = relationship("HospitalService", back_populates="service_availabilities")

    # Unique constraint to prevent duplicate dates for same hospital service
    __table_args__ = (
        UniqueConstraint('hospital_service_id', 'date', name='_hospital_service_date_uc'),
    )

    def __repr__(self):
        return f"<ServiceAvailability(id={self.id}, hospital_service_id={self.hospital_service_id}, date={self.date}, slots={self.booked_slots}/{self.total_slots})>"
