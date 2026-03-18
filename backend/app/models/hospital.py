from sqlalchemy import Column, String, Boolean, DateTime, UUID, Integer, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from datetime import datetime
import uuid

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(200), nullable=False, index=True)
    registration_number = Column(String(100), unique=True, index=True)
    hospital_type = Column(String(50), nullable=False, default="private")  # private/government/trust
    established_year = Column(Integer, nullable=True)
    address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    pincode = Column(String(10), nullable=False)
    phone_number = Column(String(20), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        server_default=func.now()
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        server_default=func.now(),
        onupdate=datetime.utcnow
    )

    # Relationships
    services = relationship("HospitalService", back_populates="hospital")
    staff = relationship("Staff", back_populates="hospital")

    def __repr__(self):
        return f"<Hospital(id={self.id}, name='{self.name}', city='{self.city}')>"
