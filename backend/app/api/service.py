import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.crud.service import (
    create_service,
    delete_service,
    get_service,
    get_services,
    update_service,
)
from app.database import get_db
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceUpdate


router = APIRouter(
    prefix="/services",
    tags=["services"],
)


@router.post("/", response_model=ServiceResponse)
async def create_service_endpoint(service: ServiceCreate, db: Session = Depends(get_db)):
    try:
        return create_service(db=db, service_data=service)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/", response_model=List[ServiceResponse])
async def read_services(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        return get_services(db=db, skip=skip, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{service_id}", response_model=ServiceResponse)
async def read_service(service_id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        db_service = get_service(db=db, service_id=service_id)
        if db_service is None:
            raise HTTPException(status_code=404, detail="Service not found")
        return db_service
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service_endpoint(
    service_id: uuid.UUID,
    service: ServiceUpdate,
    db: Session = Depends(get_db),
):
    try:
        return update_service(db=db, service_id=service_id, service_data=service)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{service_id}")
async def delete_service_endpoint(service_id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        delete_service(db=db, service_id=service_id)
        return {"message": "Service deleted successfully"}
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
