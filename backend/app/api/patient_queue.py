from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.queue import PatientQueueStatusResponse
from app.services.queue_service import get_patient_queue_status
import uuid

router = APIRouter(prefix="/patient", tags=["Patient Queue"])


@router.get("/queue/{appointment_id}", response_model=PatientQueueStatusResponse)
async def get_patient_queue_endpoint(
    appointment_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Get patient queue status with ETA calculation using avg_consultation_time_minutes.
    """
    try:
        return get_patient_queue_status(db, appointment_id)
    except ValueError as e:
        if "Appointment not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        elif "Hospital service not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
