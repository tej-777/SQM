#!/usr/bin/env python3

import requests

print("=== DEBUGGING HOSPITAL SERVICES API ===")

# Test the hospital services endpoint
print("\n1. Testing GET /public/hospitals...")
try:
    response = requests.get("http://localhost:8000/public/hospitals")
    if response.status_code == 200:
        hospitals = response.json()
        print(f"✅ Found {len(hospitals)} hospitals")
        if hospitals:
            first_hospital = hospitals[0]
            print(f"First hospital ID: {first_hospital.get('id')}")
            print(f"First hospital name: {first_hospital.get('name')}")
            
            # Test hospital services for this hospital
            hospital_id = first_hospital.get('id')
            print(f"\n2. Testing GET /hospital-services/{hospital_id}...")
            
            services_response = requests.get(f"http://localhost:8000/hospital-services/{hospital_id}")
            if services_response.status_code == 200:
                services = services_response.json()
                print(f"✅ Found {len(services)} services")
                if services:
                    first_service = services[0]
                    print(f"First service structure:")
                    for key, value in first_service.items():
                        print(f"  {key}: {value} ({type(value).__name__})")
                    
                    # Test booking with this service
                    service_id = first_service.get('id')
                    print(f"\n3. Testing POST /appointments/book with service_id: {service_id}")
                    
                    booking_response = requests.post(
                        "http://localhost:8000/appointments/book",
                        params={
                            "hospital_service_id": service_id,
                            "appointment_date": "2026-03-06",
                            "patient_name": "Test Patient",
                            "patient_phone": "1234567890"
                        }
                    )
                    
                    if booking_response.status_code == 200:
                        booking_data = booking_response.json()
                        print("✅ Booking successful!")
                        print(f"Appointment ID: {booking_data.get('appointment_id')}")
                    else:
                        print(f"❌ Booking failed: {booking_response.status_code}")
                        print(f"Response: {booking_response.text}")
                else:
                    print("❌ No services found for this hospital")
            else:
                print(f"❌ Hospital services API failed: {services_response.status_code}")
                print(f"Response: {services_response.text}")
        else:
            print("❌ No hospitals found")
    else:
        print(f"❌ Hospitals API failed: {response.status_code}")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"❌ Connection Error: {e}")

print("\n=== EXPECTED SERVICE STRUCTURE ===")
print("The service object should have:")
print("- id: (UUID) - This should be the hospital_service_id")
print("- service_name: (String) - Display name")
print("- hospital_id: (UUID) - Reference to hospital")
print("- service_id: (UUID) - Reference to service")
print("- default_max_tokens_per_day: (Integer)")
print("- avg_consultation_time_minutes: (Integer)")

print("\n=== DEBUGGING COMPLETE ===")
print("Check the browser console for the frontend debug logs to compare.")
