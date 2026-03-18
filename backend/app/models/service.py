from sqlalchemy import Column, String, UUID, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
from datetime import datetime

class Service(Base):
    __tablename__ = "services"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships - using string references to avoid circular imports
    hospital_services = relationship("HospitalService", back_populates="service")

    def __repr__(self):
        return f"<Service(id={self.id}, name='{self.name}')>"
