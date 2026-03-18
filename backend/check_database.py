#!/usr/bin/env python3

# Direct database test to check if service availability records exist
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine
from app.models.service_availability import ServiceAvailability
from app.models.hospital_service import HospitalService
from app.models.service import Service
from sqlalchemy import text

# Create database session
db = SessionLocal()

print("=== DIRECT DATABASE INVESTIGATION ===")

# Check if service availability table has any records
try:
    availability_count = db.query(ServiceAvailability).count()
    print(f"Total service availability records in database: {availability_count}")
    
    if availability_count > 0:
        # Show first few records
        availabilities = db.query(ServiceAvailability).limit(5).all()
        print("\nFirst 5 availability records:")
        for av in availabilities:
            print(f"  ID: {av.id}")
            print(f"  Hospital Service ID: {av.hospital_service_id}")
            print(f"  Date: {av.date}")
            print(f"  Total Slots: {av.total_slots}")
            print(f"  Booked Slots: {av.booked_slots}")
            print(f"  Is Active: {av.is_active}")
            print()
    else:
        print("NO SERVICE AVAILABILITY RECORDS FOUND IN DATABASE!")
        print("This explains why all hospitals show 0 slots.")
    
    # Check hospital services for cardiology
    cardiology_service_id = "3a25e4bd-bd34-44fd-afda-2659bf523e79"
    hospital_services = db.query(HospitalService).filter(
        HospitalService.service_id == cardiology_service_id
    ).all()
    
    print(f"\nHospital services for Cardiology: {len(hospital_services)}")
    for hs in hospital_services:
        print(f"  Hospital Service ID: {hs.id}")
        print(f"  Hospital ID: {hs.hospital_id}")
        print(f"  Service ID: {hs.service_id}")
        print()
    
    # Check if there are any availability records for these hospital services
    if hospital_services:
        hs_ids = [hs.id for hs in hospital_services]
        availabilities_for_cardiology = db.query(ServiceAvailability).filter(
            ServiceAvailability.hospital_service_id.in_(hs_ids)
        ).all()
        
        print(f"Availability records for Cardiology hospital services: {len(availabilities_for_cardiology)}")
        for av in availabilities_for_cardiology:
            print(f"  Date: {av.date}, Total: {av.total_slots}, Booked: {av.booked_slots}")
    
except Exception as e:
    print(f"Database error: {e}")
finally:
    db.close()

print("\n=== CONCLUSION ===")
print("If availability_count is 0, then the issue is:")
print("1. No service availability data exists in database")
print("2. User needs to create availability records through staff dashboard")
print("3. The API is working correctly - there's just no data to return")
