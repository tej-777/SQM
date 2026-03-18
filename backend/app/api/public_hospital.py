from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.hospital import HospitalResponse
from app.crud.hospital import get_hospital, get_hospitals
from app.models.hospital import Hospital
from app.models.hospital_service import HospitalService
from app.models.service_availability import ServiceAvailability
from app.models.service import Service
from typing import List
import uuid
from datetime import date, datetime

router = APIRouter(prefix="/public/hospitals", tags=["public-hospitals"])


@router.get("/", response_model=List[HospitalResponse])
async def read_public_hospitals(db: Session = Depends(get_db)):
    """
    Get all registered hospitals (public API).
    """
    try:
        # Only return hospitals that are active and verified
        hospitals = db.query(Hospital).filter(
            Hospital.is_active == True,
            Hospital.is_verified == True
        ).all()
        return hospitals
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/hospitals-by-service", response_model=List[dict])
async def get_hospitals_by_service(
    service_id: uuid.UUID = Query(..., description="Service ID to filter hospitals"),
    target_date: str = Query(..., description="Date to check availability (YYYY-MM-DD or M/D/YYYY)"),
    db: Session = Depends(get_db)
):
    """
    Get hospitals offering a specific service with availability information for a given date.
    
    This endpoint uses SQL joins to avoid N+1 query problems and returns:
    - Hospital information
    - Total slots for the given date
    - Booked slots for the given date  
    - Available slots (calculated)
    - Availability status
    """
    try:
        # DEBUG: Log received parameters
        print(f"STEP 3 - Service ID received: {service_id}")
        print(f"STEP 3 - Date received: {target_date} (type: {type(target_date)})")
        
        # STEP 4 - Validate Database Records
        services = db.query(HospitalService).filter(
            HospitalService.service_id == service_id
        ).all()
        print(f"STEP 4 - Hospital services found: {len(services)}")
        for hs in services:
            print(f"  Hospital Service ID: {hs.id}, Hospital ID: {hs.hospital_id}")
        
        # Ensure target_date is a proper date object
        if isinstance(target_date, str):
            try:
                # Try YYYY-MM-DD format first (frontend format)
                selected_date = datetime.strptime(target_date, "%Y-%m-%d").date()
                print(f"STEP 6 - Converted YYYY-MM-DD string date to: {selected_date}")
            except ValueError:
                try:
                    # Try M/D/YYYY format (staff dashboard format)
                    selected_date = datetime.strptime(target_date, "%m/%d/%Y").date()
                    print(f"STEP 6 - Converted M/D/YYYY string date to: {selected_date}")
                except ValueError:
                    raise HTTPException(status_code=400, detail=f"Invalid date format: {target_date}. Use YYYY-MM-DD or M/D/YYYY format.")
        else:
            selected_date = target_date
            print(f"STEP 6 - Using date object directly: {selected_date}")
        
        print(f"STEP 6 - Final date for query: {selected_date} (type: {type(selected_date)})")
        
        # STEP 5 - Debug Availability Query
        print("STEP 5 - Checking availability for each hospital service:")
        
        # Main query using LEFT JOIN to get hospitals and their availability
        # This avoids N+1 query problem by fetching all data in a single query
        query = db.query(
            Hospital.id.label("hospital_id"),
            Hospital.name.label("hospital_name"),
            ServiceAvailability.total_slots,
            ServiceAvailability.booked_slots,
            ServiceAvailability.is_active.label("availability_active")
        ).select_from(
            Hospital
        ).join(
            HospitalService, Hospital.id == HospitalService.hospital_id
        ).join(
            Service, HospitalService.service_id == Service.id
        ).outerjoin(
            ServiceAvailability, 
            (HospitalService.id == ServiceAvailability.hospital_service_id) & 
            (ServiceAvailability.date == selected_date)
        ).filter(
            Hospital.is_active == True,
            # Hospital.is_verified == True,  # Temporarily removed to show hospitals with availability
            Service.id == service_id
        )
        
        results = query.all()
        
        # DEBUG: Log query results
        print(f"STEP 7 - Number of hospital_service records found: {len(results)}")
        print(f"STEP 7 - Number of availability rows found: {sum(1 for r in results if r.total_slots is not None)}")
        
        # Process results and calculate available slots
        hospitals_data = []
        for result in results:
            # STEP 5 - Debug each availability check
            print(f"STEP 5 - Hospital: {result.hospital_name}, Total Slots: {result.total_slots}, Booked Slots: {result.booked_slots}")
            
            # Calculate available slots
            total_slots = result.total_slots or 0
            booked_slots = result.booked_slots or 0
            available_slots = total_slots - booked_slots
            is_available = available_slots > 0 and (result.availability_active or False)
            
            # If no availability record exists, set defaults
            if result.total_slots is None:
                total_slots = 0
                booked_slots = 0
                available_slots = 0
                is_available = False
                print(f"STEP 5 - No availability record found for {result.hospital_name}")
            
            hospitals_data.append({
                "hospital_id": str(result.hospital_id),
                "hospital_name": result.hospital_name,
                "total_slots": total_slots,
                "booked_slots": booked_slots,
                "available_slots": available_slots,
                "is_available": is_available
            })
        
        # STEP 8 - Final Response Debug
        print(f"STEP 8 - Final hospitals returned: {len(hospitals_data)}")
        for hospital in hospitals_data:
            print(f"STEP 8 - Hospital {hospital['hospital_name']}: slots={hospital['available_slots']}, available={hospital['is_available']}")
        
        return hospitals_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{hospital_id}", response_model=HospitalResponse)
async def read_public_hospital(hospital_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Get a specific registered hospital by ID (public API).
    """
    try:
        # Only return hospital if it is registered
        hospital = db.query(Hospital).filter(
            Hospital.id == hospital_id,
            Hospital.is_registered == True
        ).first()
        
        if not hospital:
            raise HTTPException(status_code=404, detail="Hospital not found")
        
        return hospital
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
