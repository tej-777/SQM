from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.hospital import HospitalCreate, HospitalUpdate, HospitalResponse, HospitalRegistrationResponse
from app.crud.hospital import get_hospital, get_hospitals, get_hospitals_by_city, get_hospitals_by_district, create_hospital, create_hospital_with_admin, update_hospital, delete_hospital
from app.core.security import ACCESS_TOKEN_EXPIRE_MINUTES
import uuid

router = APIRouter(prefix="/hospitals", tags=["hospitals"])

@router.get("/", response_model=List[HospitalResponse])
async def read_hospitals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    hospitals = get_hospitals(db, skip=skip, limit=limit)
    return hospitals

@router.get("/{hospital_id}", response_model=HospitalResponse)
async def read_hospital(hospital_id: uuid.UUID, db: Session = Depends(get_db)):
    db_hospital = get_hospital(db, hospital_id=hospital_id)
    if db_hospital is None:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return db_hospital

@router.get("/city/{city}", response_model=List[HospitalResponse])
async def read_hospitals_by_city(city: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    hospitals = get_hospitals_by_city(db, city=city, skip=skip, limit=limit)
    return hospitals

@router.get("/district/{district}", response_model=List[HospitalResponse])
async def read_hospitals_by_district(district: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    hospitals = get_hospitals_by_district(db, district=district, skip=skip, limit=limit)
    return hospitals

@router.post("/", response_model=HospitalRegistrationResponse)
async def register_hospital_with_admin(hospital: HospitalCreate, db: Session = Depends(get_db)):
    """
    Register a new hospital and create admin staff account.
    Returns JWT token for immediate login.
    """
    try:
        result = create_hospital_with_admin(db=db, hospital=hospital)
        
        return HospitalRegistrationResponse(
            hospital=result["hospital"],
            access_token=result["access_token"],
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        
    except ValueError as e:
        # Handle specific validation errors
        if "Email already exists" in str(e):
            raise HTTPException(status_code=400, detail="Email already exists")
        elif "Registration number already exists" in str(e):
            raise HTTPException(status_code=400, detail="Registration number already exists")
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{hospital_id}", response_model=HospitalResponse)
async def update_hospital_endpoint(hospital_id: uuid.UUID, hospital: HospitalUpdate, db: Session = Depends(get_db)):
    db_hospital = update_hospital(db, hospital_id=hospital_id, hospital=hospital)
    if db_hospital is None:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return db_hospital

@router.delete("/{hospital_id}")
async def delete_hospital_endpoint(hospital_id: uuid.UUID, db: Session = Depends(get_db)):
    success = delete_hospital(db, hospital_id=hospital_id)
    if not success:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return {"message": "Hospital deleted successfully"}
