#!/usr/bin/env python3

import requests
import json
from datetime import datetime, timedelta

print("=== CREATING TEST AVAILABILITY ===")

# Service ID from the debug output
hospital_service_id = "9f06f5d7-7964-4d1d-b341-6e0206d6888a"

# Create availability for the next 7 days
base_date = datetime(2026, 3, 6)  # Starting from today

print(f"Creating availability for service: {hospital_service_id}")
print("Dates to create:")

for i in range(7):
    current_date = base_date + timedelta(days=i)
    date_str = current_date.strftime('%Y-%m-%d')
    
    print(f"  - {date_str}")
    
    # Create availability with different slot counts
    total_slots = 20 if i < 5 else 15  # Weekdays have more slots
    
    availability_data = {
        "hospital_service_id": hospital_service_id,
        "date": date_str,
        "total_slots": total_slots
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/appointments/availability",
            json=availability_data
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"    ✅ Created: {data.get('id')}")
        elif response.status_code == 401:
            print(f"    ❌ Authentication required - skipping")
            break
        else:
            print(f"    ❌ Failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"    ❌ Error: {e}")

print("\n=== TESTING BOOKING AFTER AVAILABILITY ===")

# Test booking with the created availability
test_date = (base_date).strftime('%Y-%m-%d')

try:
    booking_response = requests.post(
        "http://localhost:8000/appointments/book",
        params={
            "hospital_service_id": hospital_service_id,
            "appointment_date": test_date,
            "patient_name": "Test Patient",
            "patient_phone": "1234567890"
        }
    )
    
    if booking_response.status_code == 200:
        booking_data = booking_response.json()
        print("✅ Booking successful!")
        print(f"Appointment ID: {booking_data.get('appointment_id')}")
        print(f"Token Number: {booking_data.get('token_number')}")
        print(f"Remaining Slots: {booking_data.get('remaining_slots')}")
    else:
        print(f"❌ Booking failed: {booking_response.status_code}")
        print(f"Response: {booking_response.text}")
        
except Exception as e:
    print(f"❌ Error: {e}")

print("\n=== INSTRUCTIONS ===")
print("1. If authentication was required, you need to:")
print("   - Login as staff to the staff dashboard")
print("   - Create availability for services manually")
print("   - Or use the staff dashboard to set up availability")
print("")
print("2. The PatientBooking component will now:")
print("   - Check availability before booking")
print("   - Show proper error messages if no availability exists")
print("   - Only allow booking when slots are available")
