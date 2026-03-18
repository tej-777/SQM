from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.hospital import Hospital
from app.models.staff import Staff
from app.schemas.hospital import HospitalRegisterRequest, HospitalResponse, StaffResponse
from app.crud.hospital import create_hospital_with_admin
from app.core.security import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.dependencies.auth import get_current_staff
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["authentication"])

class LoginRequest(BaseModel):
    staff_id: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class HospitalRegistrationResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    hospital: HospitalResponse
    admin: StaffResponse

@router.get("/me", response_model=dict)
async def get_current_staff_profile(current_staff: Staff = Depends(get_current_staff), db: Session = Depends(get_db)):
    """Get current logged-in staff profile."""
    # Get hospital name
    from app.models.hospital import Hospital
    hospital = db.query(Hospital).filter(Hospital.id == current_staff.hospital_id).first()
    
    return {
        "id": str(current_staff.id),
        "hospital_id": str(current_staff.hospital_id),
        "hospital_name": hospital.name if hospital else "Unknown Hospital",
        "name": current_staff.name,
        "email": current_staff.email,
        "role": current_staff.role,
        "staff_id": current_staff.staff_id,
        "is_active": current_staff.is_active,
        "created_at": current_staff.created_at.isoformat() if current_staff.created_at else None,
        "updated_at": current_staff.updated_at.isoformat() if current_staff.updated_at else None
    }

@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate staff and return JWT token."""
    # Find staff by staff_id
    staff = db.query(Staff).filter(Staff.staff_id == login_data.staff_id).first()
    
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password using staff_password field
    if not verify_password(login_data.password, staff.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": str(staff.id), "role": staff.role}, 
        expires_delta=access_token_expires
    )
    
    return TokenResponse(access_token=access_token, token_type="bearer")

@router.post("/register-hospital", response_model=HospitalRegistrationResponse)
def register_hospital(payload: HospitalRegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new hospital and create admin staff account.
    Returns JWT token for immediate login.
    """
    try:
        # Extract hospital and admin data using Pydantic object access
        hospital_data = payload.hospital.model_dump()
        admin_data = payload.admin.model_dump()
        services_data = [service.model_dump() for service in payload.services]
        
        # Check for existing hospital email
        existing_hospital = db.query(Hospital).filter(Hospital.email == hospital_data["email"]).first()
        if existing_hospital:
            raise HTTPException(status_code=400, detail="Hospital with this email already registered")
        
        # Check for existing registration number
        if hospital_data.get("registration_number"):
            existing_reg = db.query(Hospital).filter(Hospital.registration_number == hospital_data["registration_number"]).first()
            if existing_reg:
                raise HTTPException(status_code=400, detail="Registration number already exists")
        
        # Check for existing admin email
        existing_admin = db.query(Staff).filter(Staff.email == admin_data["email"]).first()
        if existing_admin:
            raise HTTPException(status_code=400, detail="Admin email already registered")
        
        # Check for existing staff ID
        existing_staff_id = db.query(Staff).filter(Staff.staff_id == admin_data["staff_id"]).first()
        if existing_staff_id:
            raise HTTPException(status_code=400, detail="Staff ID already exists")
        
        # Prepare nested structure for create_hospital_with_admin
        registration_data = {
            "hospital": hospital_data,
            "admin": admin_data,
            "services": services_data
        }
        
        # Create hospital, admin, and services
        result = create_hospital_with_admin(db=db, hospital=registration_data)
        
        return HospitalRegistrationResponse(
            access_token=result["access_token"],
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            hospital=result["hospital"],
            admin=result["admin"]
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
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
