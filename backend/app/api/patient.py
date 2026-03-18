from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.hospital import Hospital
from app.schemas.hospital import HospitalResponse

router = APIRouter(prefix="/patient", tags=["patient"])


@router.get("/hospitals", response_model=List[HospitalResponse])
def get_visible_hospitals(db: Session = Depends(get_db)):
    """
    Get all registered and active hospitals for patients.
    """
    try:
        return db.query(Hospital).filter(
            Hospital.is_registered == True,
            Hospital.is_active == True
        ).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
