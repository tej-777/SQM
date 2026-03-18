#!/usr/bin/env python3

import requests

print("=== DEBUGGING AVAILABILITY ISSUE ===")

hospital_service_id = "9f06f5d7-7964-4d1d-b341-6e0206d6888a"
appointment_date = "2026-03-06"

print(f"\n1. Testing GET /appointments/availability/{hospital_service_id}...")
try:
    response = requests.get(f"http://localhost:8000/appointments/availability/{hospital_service_id}")
    if response.status_code == 200:
        availabilities = response.json()
        print(f"✅ Found {len(availabilities)} availability records")
        if availabilities:
            print("Available dates:")
            for avail in availabilities:
                print(f"  - {avail.get('date')}: {avail.get('available_slots')}/{avail.get('total_slots')} slots")
        else:
            print("❌ No availability records found")
            print("This is the issue! You need to create availability first.")
    else:
        print(f"❌ Availability API failed: {response.status_code}")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"❌ Connection Error: {e}")

print(f"\n2. Creating availability for {appointment_date}...")
try:
    create_response = requests.post(
        "http://localhost:8000/appointments/availability",
        json={
            "hospital_service_id": hospital_service_id,
            "date": appointment_date,
            "total_slots": 20
        }
    )
    
    if create_response.status_code == 200:
        print("✅ Availability created successfully!")
        avail_data = create_response.json()
        print(f"Created availability ID: {avail_data.get('id')}")
        
        print(f"\n3. Testing booking again...")
        booking_response = requests.post(
            "http://localhost:8000/appointments/book",
            params={
                "hospital_service_id": hospital_service_id,
                "appointment_date": appointment_date,
                "patient_name": "Test Patient",
                "patient_phone": "1234567890"
            }
        )
        
        if booking_response.status_code == 200:
            booking_data = booking_response.json()
            print("✅ Booking successful!")
            print(f"Appointment ID: {booking_data.get('appointment_id')}")
            print(f"Token Number: {booking_data.get('token_number')}")
        else:
            print(f"❌ Booking still failed: {booking_response.status_code}")
            print(f"Response: {booking_response.text}")
    else:
        print(f"❌ Failed to create availability: {create_response.status_code}")
        print(f"Response: {create_response.text}")
        
except Exception as e:
    print(f"❌ Error: {e}")

print("\n=== SOLUTION ===")
print("The issue is that there's no availability record for the selected service and date.")
print("The PatientBooking component should only show dates that have availability.")
print("OR the staff needs to create availability records for the services.")
