from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.service import Service
from app.schemas.service import ServiceResponse

router = APIRouter(prefix="/services", tags=["services"])

@router.get("/", response_model=List[ServiceResponse])
def get_all_services(db: Session = Depends(get_db)):
    """Get all available medical services (read-only)"""
    services = db.query(Service).order_by(Service.name).all()
    return services

@router.get("/{service_id}", response_model=ServiceResponse)
def get_service(service_id: UUID, db: Session = Depends(get_db)):
    """Get a specific service by ID (read-only)"""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

# NOTE: Service creation is disabled
# Services are system-defined master data and can only be created via seed scripts
# This ensures data integrity and prevents hospitals from creating arbitrary services
