from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.hospital_service import HospitalService
from app.models.service import Service
from app.schemas.hospital_service import HospitalServiceCreate, HospitalServiceResponse, HospitalServiceUpdate

router = APIRouter(prefix="/hospital-services", tags=["hospital-services"])

@router.get("/{hospital_id}", response_model=List[HospitalServiceResponse])
def get_hospital_services(hospital_id: UUID, db: Session = Depends(get_db)):
    """Get all services for a hospital"""
    services = db.query(HospitalService, Service.name).join(
        Service, HospitalService.service_id == Service.id
    ).filter(HospitalService.hospital_id == hospital_id).all()
    
    result = []
    for hospital_service, service_name in services:
        service_data = {
            "id": hospital_service.id,
            "hospital_id": hospital_service.hospital_id,
            "service_id": hospital_service.service_id,
            "default_max_tokens_per_day": hospital_service.default_max_tokens_per_day,
            "avg_consultation_time_minutes": hospital_service.avg_consultation_time_minutes,
            "active_counters": hospital_service.active_counters,
            "created_at": hospital_service.created_at,
            "service_name": service_name
        }
        result.append(HospitalServiceResponse(**service_data))
    
    return result

@router.post("/", response_model=HospitalServiceResponse)
def create_hospital_service(service_data: HospitalServiceCreate, db: Session = Depends(get_db)):
    """Add a new service to a hospital"""
    try:
        # Validate service exists
        service = db.query(Service).filter(Service.id == service_data.service_id).first()
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        
        # Check if service already exists for hospital
        existing = db.query(HospitalService).filter(
            HospitalService.hospital_id == service_data.hospital_id,
            HospitalService.service_id == service_data.service_id
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Service already exists for this hospital")
        
        hospital_service = HospitalService(**service_data.dict())
        db.add(hospital_service)
        db.commit()
        db.refresh(hospital_service)
        
        return hospital_service
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{service_id}", response_model=HospitalServiceResponse)
def update_hospital_service(service_id: UUID, service_update: HospitalServiceUpdate, db: Session = Depends(get_db)):
    """Update a hospital service"""
    try:
        hospital_service = db.query(HospitalService).filter(HospitalService.id == service_id).first()
        if not hospital_service:
            raise HTTPException(status_code=404, detail="Hospital service not found")
        
        update_data = service_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(hospital_service, field, value)
        
        db.commit()
        db.refresh(hospital_service)
        
        return hospital_service
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{service_id}")
def delete_hospital_service(service_id: UUID, db: Session = Depends(get_db)):
    """Remove a service from a hospital"""
    try:
        hospital_service = db.query(HospitalService).filter(HospitalService.id == service_id).first()
        if not hospital_service:
            raise HTTPException(status_code=404, detail="Hospital service not found")
        
        db.delete(hospital_service)
        db.commit()
        
        return {"message": "Service removed successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
