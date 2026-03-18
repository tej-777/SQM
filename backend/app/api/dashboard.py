from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.dashboard import DashboardSummaryResponse, DashboardQueueItem
from app.crud.dashboard import get_dashboard_summary, get_dashboard_queue
from datetime import date
import uuid

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary/{hospital_service_id}", response_model=DashboardSummaryResponse)
async def get_dashboard_summary_endpoint(
    hospital_service_id: uuid.UUID,
    date: date = Query(..., description="Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    """
    Get dashboard summary for a specific hospital service and date.
    """
    try:
        return get_dashboard_summary(db, hospital_service_id, date)
    except ValueError as e:
        if "Hospital service not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/queue/{hospital_service_id}", response_model=list[DashboardQueueItem])
async def get_dashboard_queue_endpoint(
    hospital_service_id: uuid.UUID,
    date: date = Query(..., description="Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    """
    Get dashboard queue list for a specific hospital service and date.
    """
    try:
        return get_dashboard_queue(db, hospital_service_id, date)
    except ValueError as e:
        if "Hospital service not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
