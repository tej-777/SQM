#!/usr/bin/env python3

# Check hospital status for the hospitals that HAVE availability
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.hospital import Hospital
from app.models.hospital_service import HospitalService
from app.models.service import Service

# Create database session
db = SessionLocal()

print("=== CHECKING HOSPITAL STATUS ===")

# These are the hospitals that should have availability for March 5th
target_hospital_service_ids = [
    "e2521d7d-3899-4e59-923c-0a80afc07362",  # Has 7 slots on March 5th
]

for hs_id in target_hospital_service_ids:
    # Get the hospital service
    hs = db.query(HospitalService).filter(HospitalService.id == hs_id).first()
    if hs:
        # Get the hospital
        hospital = db.query(Hospital).filter(Hospital.id == hs.hospital_id).first()
        if hospital:
            print(f"\nHospital Service ID: {hs.id}")
            print(f"Hospital ID: {hospital.id}")
            print(f"Hospital Name: {hospital.name}")
            print(f"Is Active: {hospital.is_active}")
            print(f"Is Verified: {hospital.is_verified}")
            print(f"Service ID: {hs.service_id}")
            
            # Check if service exists
            service = db.query(Service).filter(Service.id == hs.service_id).first()
            if service:
                print(f"Service Name: {service.name}")
            else:
                print("Service NOT FOUND!")
        else:
            print(f"Hospital NOT FOUND for HS ID: {hs.id}")
    else:
        print(f"Hospital Service NOT FOUND: {hs.id}")

db.close()

print("\n=== CHECKING ALL HOSPITALS ===")
# Check all hospitals to see which ones are active/verified
hospitals = db.query(Hospital).all()
print(f"Total hospitals: {len(hospitals)}")
for hospital in hospitals:
    status = f"Active: {hospital.is_active}, Verified: {hospital.is_verified}"
    print(f"  {hospital.name}: {status}")
