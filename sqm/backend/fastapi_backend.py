"""
FastAPI Backend - Hospital Queue Management System
Modern Python API with automatic documentation and type safety
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import os
import re

# Create FastAPI application
app = FastAPI(
    title="SmartQueue Hospital API",
    description="Hospital Queue Management and Verification System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class HospitalBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    address: str = Field(min_length=1, max_length=500)
    city: str = Field(min_length=1, max_length=100)
    state: str = "Andhra Pradesh"
    district: str = Field(min_length=1, max_length=100)
    mandal: str = Field(min_length=1, max_length=100)
    pincode: str = Field(pattern=r"^\d{6}$")
    phone: str = Field(pattern=r"^\d{10}$")
    beds: int = Field(ge=1, le=10000)
    emergencyServices: bool = True
    ambulanceServices: bool = False

class HospitalRegistration(HospitalBase):
    adminName: str = Field(min_length=1, max_length=100)
    adminEmail: str = Field(pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    adminPhone: str = Field(pattern=r"^\d{10}$")
    adminPosition: str = Field(min_length=1, max_length=100)
    specialities: List[str] = Field(min_items=1)
    mitraContactNo: str = Field(pattern=r"^\d{10}$")
    staffId: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=100)

class HospitalResponse(HospitalBase):
    id: str
    specialities: List[str]
    verified: bool = False
    verificationBadge: Optional[str] = None
    createdAt: datetime
    source: str

class VerificationRequest(BaseModel):
    hospital_name: str = Field(min_length=1, max_length=200)
    state: str = Field(min_length=1, max_length=100)
    district: str = Field(min_length=1, max_length=100)
    mandal: str = Field(min_length=1, max_length=100)
    mitra_contact_no: str = Field(pattern=r"^\d{10}$")
    pincode: str = Field(pattern=r"^\d{6}$")
    staff_id: Optional[str] = None
    password: Optional[str] = None

class StaffLogin(BaseModel):
    staff_id: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1, max_length=100)

class StaffLoginResponse(BaseModel):
    success: bool
    message: str
    hospital: Optional[Dict[str, Any]] = None

# Data Loading Functions
def load_hospital_data():
    """Load hospital data from JSON file"""
    try:
        with open('data/hospitals_clean.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Info: hospitals_clean.json not found, loading from verification databases...")
        # Load from existing verification databases
        kakinada_hospitals = load_kakinada_hospital_data()
        east_hospitals = load_east_godavari_hospital_data()
        
        # Convert verification data to hospital format
        all_hospitals = []
        
        # Process Kakinada hospitals
        for hospital in kakinada_hospitals:
            converted = {
                "id": f"kakinada_{len(all_hospitals) + 1}",
                "name": hospital.get("Name of Hospital", ""),
                "address": hospital.get("Address", ""),
                "city": hospital.get("Mandal", ""),
                "state": hospital.get("State", "Andhra Pradesh"),
                "district": hospital.get("District", ""),
                "mandal": hospital.get("Mandal", ""),
                "pincode": hospital.get("Pincode", ""),
                "phone": hospital.get("Mitra Contact No", ""),
                "beds": 50,
                "emergencyServices": True,
                "ambulanceServices": False,
                "specialities": [s.strip() for s in hospital.get("Specialities", "").split(",") if s.strip()],
                "verified": False,
                "verificationBadge": None,
                "createdAt": datetime.now().isoformat(),
                "source": "KAKINADA_DATABASE"
            }
            all_hospitals.append(converted)
        
        # Process East Godavari hospitals
        for hospital in east_hospitals:
            converted = {
                "id": f"east_{len(all_hospitals) + 1}",
                "name": hospital.get("Name of Hospital", ""),
                "address": hospital.get("Address", ""),
                "city": hospital.get("Mandal", ""),
                "state": hospital.get("State", "Andhra Pradesh"),
                "district": hospital.get("District", ""),
                "mandal": hospital.get("Mandal", ""),
                "pincode": hospital.get("Pincode", ""),
                "phone": hospital.get("Mitra Contact No", ""),
                "beds": 50,
                "emergencyServices": True,
                "ambulanceServices": False,
                "specialities": [s.strip() for s in hospital.get("Specialities", "").split(",") if s.strip()],
                "verified": False,
                "verificationBadge": None,
                "createdAt": datetime.now().isoformat(),
                "source": "EAST_GODAVARI_DATABASE"
            }
            all_hospitals.append(converted)
        
        print(f"Loaded {len(all_hospitals)} hospitals from verification databases")
        return all_hospitals
    except Exception as e:
        print(f"Error loading hospital data: {e}")
        return []

def load_east_godavari_hospital_data():
    """Load East Godavari hospital data from JSON file"""
    try:
        with open('data/east_godavari_all_mandals.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Warning: east_godavari_all_mandals.json not found")
        return []
    except Exception as e:
        print(f"Error loading East Godavari hospital data: {e}")
        return []

def load_kakinada_hospital_data():
    """Load Kakinada hospital data from JSON file"""
    try:
        with open('data/kakinada_all_mandals.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Warning: kakinada_all_mandals.json not found")
        return []
    except Exception as e:
        print(f"Error loading Kakinada hospital data: {e}")
        return []

def load_verified_hospitals():
    """Load verified hospitals data"""
    try:
        with open('data/verified_hospitals.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        # Create empty verified hospitals file if it doesn't exist
        with open('data/verified_hospitals.json', 'w', encoding='utf-8') as f:
            json.dump([], f, indent=2)
        return []
    except Exception as e:
        print(f"Error loading verified hospitals data: {e}")
        return []

def save_verified_hospitals(verified_hospitals):
    """Save verified hospitals data"""
    try:
        with open('data/verified_hospitals.json', 'w', encoding='utf-8') as f:
            json.dump(verified_hospitals, f, indent=2, default=str)
        return True
    except Exception as e:
        print(f"Error saving verified hospitals data: {e}")
        return False

def verify_hospital(hospital_name: str, state: str, district: str, mandal: str, mitra_contact_no: str, pincode: str):
    """Verify hospital against database records"""
    # Check Kakinada database
    kakinada_hospitals = load_kakinada_hospital_data()
    
    for hospital in kakinada_hospitals:
        if (hospital.get("Name of Hospital", "").lower() == hospital_name.lower() and
            hospital.get("State", "").lower() == state.lower() and
            hospital.get("District", "").lower() == district.lower() and
            hospital.get("Mandal", "").lower() == mandal.lower() and
            hospital.get("Mitra Contact No", "") == mitra_contact_no and
            hospital.get("Pincode", "") == pincode):
            return True, hospital, "KAKINADA_DATABASE"
    
    # Check East Godavari database
    east_hospitals = load_east_godavari_hospital_data()
    
    for hospital in east_hospitals:
        if (hospital.get("Name of Hospital", "").lower() == hospital_name.lower() and
            hospital.get("State", "").lower() == state.lower() and
            hospital.get("District", "").lower() == district.lower() and
            hospital.get("Mandal", "").lower() == mandal.lower() and
            hospital.get("Mitra Contact No", "") == mitra_contact_no and
            hospital.get("Pincode", "") == pincode):
            return True, hospital, "EAST_GODAVARI_DATABASE"
    
    return False, None, None

# Load initial data
GOVERNMENT_HOSPITALS = load_hospital_data()
print(f"Loaded {len(GOVERNMENT_HOSPITALS)} government hospitals from database")

# Mock private hospitals data
PRIVATE_HOSPITALS = [
    {
        "id": "private_1",
        "name": "Apollo Hospitals, Hyderabad",
        "address": "Jubilee Hills, Hyderabad",
        "city": "Hyderabad",
        "state": "Telangana",
        "district": "Hyderabad",
        "mandal": "Jubilee Hills",
        "pincode": "500033",
        "phone": "+914040232323",
        "type": "Private",
        "beds": 500,
        "emergencyServices": True,
        "ambulanceServices": True,
        "specialities": ["Cardiology", "Neurology", "Orthopedics"],
        "verified": True,
        "verificationBadge": "⭐⭐⭐⭐⭐",
        "createdAt": datetime.now().isoformat(),
        "source": "private"
    }
]

ALL_HOSPITALS = GOVERNMENT_HOSPITALS + PRIVATE_HOSPITALS

# API Endpoints
@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "SmartQueue Hospital API is running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "total_hospitals": len(ALL_HOSPITALS)
    }

@app.get("/hospitals", response_model=List[HospitalResponse], tags=["Hospitals"])
async def get_hospitals(
    skip: int = 0,
    limit: int = 100,
    city: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    hospital_type: Optional[str] = None,
    verified: Optional[bool] = None
):
    """Get all hospitals with filtering and pagination"""
    filtered_hospitals = ALL_HOSPITALS.copy()
    
    # Apply filters
    if city:
        filtered_hospitals = [h for h in filtered_hospitals if h.get("city", "").lower() == city.lower()]
    if state:
        filtered_hospitals = [h for h in filtered_hospitals if h.get("state", "").lower() == state.lower()]
    if district:
        filtered_hospitals = [h for h in filtered_hospitals if h.get("district", "").lower() == district.lower()]
    if hospital_type:
        filtered_hospitals = [h for h in filtered_hospitals if h.get("type", "").lower() == hospital_type.lower()]
    if verified is not None:
        filtered_hospitals = [h for h in filtered_hospitals if h.get("verified") == verified]
    
    # Apply pagination
    total = len(filtered_hospitals)
    hospitals = filtered_hospitals[skip:skip + limit]
    
    return hospitals

@app.post("/hospital/register", tags=["Hospitals"])
async def register_hospital(hospital: HospitalRegistration):
    """Register a new hospital"""
    try:
        print(f"Received registration request: {hospital}")
        
        # Generate hospital ID
        hospital_id = f"hosp_{len(ALL_HOSPITALS) + 1}"
        print(f"Generated hospital ID: {hospital_id}")
        
        # Create hospital record
        new_hospital = {
            "id": hospital_id,
            "name": hospital.name,
            "address": hospital.address,
            "city": hospital.city,
            "state": hospital.state,
            "district": hospital.district,
            "mandal": hospital.mandal,
            "pincode": hospital.pincode,
            "phone": hospital.phone,
            "beds": hospital.beds,
            "emergencyServices": hospital.emergencyServices,
            "ambulanceServices": hospital.ambulanceServices,
            "specialities": hospital.specialities,
            "verified": False,
            "verificationBadge": None,
            "createdAt": datetime.now().isoformat(),
            "source": "registration",
            "adminName": hospital.adminName,
            "adminEmail": hospital.adminEmail,
            "adminPhone": hospital.adminPhone,
            "adminPosition": hospital.adminPosition,
            "mitraContactNo": hospital.mitraContactNo,
            "staffId": hospital.staffId,
            "password": hospital.password
        }
        
        print(f"Created hospital record: {new_hospital}")
        
        # Add to hospitals list (in production, save to database)
        ALL_HOSPITALS.append(new_hospital)
        print(f"Added to ALL_HOSPITALS. Total hospitals: {len(ALL_HOSPITALS)}")
        
        return {
            "success": True,
            "message": "Hospital registered successfully",
            "hospital_id": hospital_id,
            "hospital": new_hospital
        }
    
    except Exception as e:
        print(f"Error in registration: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@app.post("/hospital/verify", tags=["Verification"])
async def verify_hospital_endpoint(verification_data: VerificationRequest):
    """Verify hospital based on provided details"""
    try:
        # Verify hospital
        is_verified, hospital_data, database_source = verify_hospital(
            verification_data.hospital_name,
            verification_data.state,
            verification_data.district,
            verification_data.mandal,
            verification_data.mitra_contact_no,
            verification_data.pincode
        )
        
        if is_verified:
            # Load existing verified hospitals
            verified_hospitals = load_verified_hospitals()
            
            # Check if already verified
            for vh in verified_hospitals:
                if vh.get("mitra_contact_no") == verification_data.mitra_contact_no:
                    return {
                        "success": True,
                        "verified": True,
                        "message": "Hospital already verified",
                        "hospital_id": vh.get("id"),
                        "staff_id": vh.get("staff_id"),
                        "verification_badge": vh.get("verification_badge", "⭐⭐⭐⭐⭐")
                    }
            
            # Add to verified hospitals with staff login credentials
            new_verified_hospital = {
                "id": f"verified_{len(verified_hospitals) + 1}",
                "hospital_name": hospital_data.get("Name of Hospital"),
                "state": hospital_data.get("State"),
                "district": hospital_data.get("District"),
                "mandal": hospital_data.get("Mandal"),
                "address": hospital_data.get("Address"),
                "specialities": [s.strip() for s in hospital_data.get("Specialities", "").split(",") if s.strip()],
                "mitra_contact_no": hospital_data.get("Mitra Contact No"),
                "pincode": hospital_data.get("Pincode"),
                "staff_id": verification_data.staff_id or f"STAFF_{len(verified_hospitals) + 1}",
                "password": verification_data.password or f"PASS_{len(verified_hospitals) + 1}",
                "verified": True,
                "verification_badge": "⭐⭐⭐⭐⭐",
                "verified_at": datetime.now().isoformat(),
                "source": database_source
            }
            
            verified_hospitals.append(new_verified_hospital)
            save_verified_hospitals(verified_hospitals)
            
            return {
                "success": True,
                "verified": True,
                "message": "Hospital verified successfully",
                "hospital_id": new_verified_hospital["id"],
                "staff_id": new_verified_hospital["staff_id"],
                "verification_badge": new_verified_hospital["verification_badge"]
            }
        else:
            return {
                "success": False,
                "verified": False,
                "message": "Hospital verification failed. Please check the provided details."
            }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Verification failed: {str(e)}"
        )

@app.post("/staff/login", response_model=StaffLoginResponse, tags=["Authentication"])
async def staff_login(login_data: StaffLogin):
    """Staff login endpoint"""
    try:
        # Load verified hospitals
        verified_hospitals = load_verified_hospitals()
        
        # Find staff member
        for hospital in verified_hospitals:
            if hospital.get("staff_id") == login_data.staff_id and hospital.get("password") == login_data.password:
                return {
                    "success": True,
                    "message": "Login successful",
                    "hospital": {
                        "id": hospital.get("id"),
                        "hospital_name": hospital.get("hospital_name"),
                        "staff_id": hospital.get("staff_id"),
                        "district": hospital.get("district"),
                        "mandal": hospital.get("mandal"),
                        "verification_badge": hospital.get("verification_badge"),
                        "verified_at": hospital.get("verified_at")
                    }
                }
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid staff ID or password"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@app.get("/verified/hospitals", tags=["Verification"])
async def get_verified_hospitals():
    """Get all verified hospitals"""
    try:
        verified_hospitals = load_verified_hospitals()
        
        return {
            "success": True,
            "count": len(verified_hospitals),
            "hospitals": verified_hospitals
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load verified hospitals: {str(e)}"
        )

@app.get("/stats", tags=["Statistics"])
async def get_statistics():
    """Get system statistics"""
    verified_hospitals = load_verified_hospitals()
    
    return {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "statistics": {
            "total_database_hospitals": len(GOVERNMENT_HOSPITALS),
            "total_system_hospitals": len(ALL_HOSPITALS),
            "verified_hospitals": len(verified_hospitals),
            "databases": ["NTR_VAIDYA_SEVA", "private", "KAKINADA_DATABASE"],
            "states_covered": list(set(h.get("state", "") for h in ALL_HOSPITALS)),
            "districts_covered": list(set(h.get("district", "") for h in ALL_HOSPITALS if h.get("district")))
        }
    }

@app.get("/districts", tags=["Data"])
async def get_districts():
    """Get available districts"""
    districts = list(set(h.get("district", "") for h in ALL_HOSPITALS if h.get("district")))
    return {
        "success": True,
        "districts": sorted(districts)
    }

@app.get("/specialities", tags=["Data"])
async def get_specialities():
    """Get available specialities"""
    all_specialities = set()
    for hospital in ALL_HOSPITALS:
        if "specialities" in hospital and isinstance(hospital["specialities"], list):
            all_specialities.update(hospital["specialities"])
    
    return {
        "success": True,
        "specialities": sorted(list(all_specialities))
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
