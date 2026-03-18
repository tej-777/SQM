#!/usr/bin/env python3

# Test the exact JOIN logic to find the bug
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.service_availability import ServiceAvailability
from app.models.hospital_service import HospitalService
from app.models.hospital import Hospital
from app.models.service import Service
from sqlalchemy import text
from datetime import date

# Create database session
db = SessionLocal()

print("=== TESTING JOIN LOGIC ===")

cardiology_service_id = "3a25e4bd-bd34-44fd-afda-2659bf523e79"
target_date = date(2026, 3, 5)

print(f"Looking for Cardiology service: {cardiology_service_id}")
print(f"Looking for date: {target_date}")

# Step 1: Get hospital services for cardiology
hospital_services = db.query(HospitalService).filter(
    HospitalService.service_id == cardiology_service_id
).all()

print(f"\nFound {len(hospital_services)} hospital services for cardiology:")
for hs in hospital_services:
    print(f"  HS ID: {hs.id}, Hospital ID: {hs.hospital_id}")

# Step 2: Check availability for each hospital service
print(f"\nChecking availability for {target_date}:")
for hs in hospital_services:
    availability = db.query(ServiceAvailability).filter(
        ServiceAvailability.hospital_service_id == hs.id,
        ServiceAvailability.date == target_date
    ).first()
    
    if availability:
        print(f"  HS ID {hs.id}: Found availability - Total: {availability.total_slots}, Booked: {availability.booked_slots}")
    else:
        print(f"  HS ID {hs.id}: No availability found")

# Step 3: Test the exact JOIN query from the API
print(f"\n=== TESTING API JOIN QUERY ===")
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
    (ServiceAvailability.date == target_date)
).filter(
    Hospital.is_active == True,
    Hospital.is_verified == True,
    Service.id == cardiology_service_id
)

results = query.all()
print(f"JOIN query returned {len(results)} results:")
for result in results:
    print(f"  Hospital: {result.hospital_name}")
    print(f"  Total Slots: {result.total_slots}")
    print(f"  Booked Slots: {result.booked_slots}")

db.close()

print("\n=== ANALYSIS ===")
print("If manual check shows availability but JOIN doesn't, then:")
print("1. JOIN condition might be wrong")
print("2. Date comparison might be wrong")
print("3. Hospital service ID mismatch")
