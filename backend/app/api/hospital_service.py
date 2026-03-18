from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.crud.hospital_service import (
    create_hospital_service,
    get_hospital_service,
    get_hospital_services,
    get_hospital_services_by_hospital,
    get_hospital_services_by_service,
    update_hospital_service,
    delete_hospital_service
)
from app.schemas.hospital_service import HospitalServiceCreate, HospitalServiceUpdate, HospitalServiceResponse
from app.database import get_db
from typing import List
import uuid

router = APIRouter(
    prefix="/hospital-services",
    tags=["hospital-services"]
)

@router.post("/", response_model=HospitalServiceResponse)
async def create_hospital_service_endpoint(hospital_service: HospitalServiceCreate, db: Session = Depends(get_db)):
    """Create a new hospital service."""
    try:
        return create_hospital_service(db=db, hospital_service_data=hospital_service)
    except ValueError as e:
        # Handle specific validation errors
        if "not found" in str(e).lower():
            raise HTTPException(status_code=400, detail=str(e))
        elif "already exists" in str(e).lower():
            raise HTTPException(status_code=400, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/", response_model=List[HospitalServiceResponse])
async def list_hospital_services_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get a list of hospital services with pagination."""
    try:
        return get_hospital_services(db=db, skip=skip, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/hospital/{hospital_id}", response_model=List[HospitalServiceResponse])
async def get_hospital_services_by_hospital_endpoint(
    hospital_id: uuid.UUID, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """Get hospital services by hospital ID."""
    try:
        return get_hospital_services_by_hospital(db=db, hospital_id=hospital_id, skip=skip, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/service/{service_id}", response_model=List[HospitalServiceResponse])
async def get_hospital_services_by_service_endpoint(
    service_id: uuid.UUID, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """Get hospital services by service ID."""
    try:
        return get_hospital_services_by_service(db=db, service_id=service_id, skip=skip, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{hospital_service_id}", response_model=HospitalServiceResponse)
async def get_hospital_service_endpoint(hospital_service_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get a single hospital service by ID."""
    try:
        hospital_service = get_hospital_service(db=db, hospital_service_id=hospital_service_id)
        if not hospital_service:
            raise HTTPException(status_code=404, detail="Hospital service not found")
        return hospital_service
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{hospital_service_id}", response_model=HospitalServiceResponse)
async def update_hospital_service_endpoint(
    hospital_service_id: uuid.UUID, 
    hospital_service: HospitalServiceUpdate, 
    db: Session = Depends(get_db)
):
    """Update an existing hospital service."""
    try:
        db_hospital_service = update_hospital_service(
            db=db, 
            hospital_service_id=hospital_service_id, 
            hospital_service_data=hospital_service
        )
        if not db_hospital_service:
            raise HTTPException(status_code=404, detail="Hospital service not found")
        return db_hospital_service
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{hospital_service_id}")
async def delete_hospital_service_endpoint(hospital_service_id: uuid.UUID, db: Session = Depends(get_db)):
    """Delete a hospital service by ID."""
    try:
        success = delete_hospital_service(db=db, hospital_service_id=hospital_service_id)
        if not success:
            raise HTTPException(status_code=404, detail="Hospital service not found")
        return {"message": "Hospital service deleted successfully"}
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
