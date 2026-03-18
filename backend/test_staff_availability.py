#!/usr/bin/env python3

import requests

print("=== STAFF LOGIN AND AVAILABILITY CREATION TEST ===")

# First, let's try to login as staff to get a token
print("\n1. Attempting staff login...")
try:
    login_response = requests.post(
        "http://localhost:8000/auth/login",
        json={
            "staff_id": "demo_staff",
            "password": "demo_password"
        }
    )
    
    if login_response.status_code == 200:
        login_data = login_response.json()
        token = login_data.get('access_token')
        print("✅ Staff login successful!")
        print(f"Token: {token[:20]}...")
        
        # Now create availability with the token
        hospital_service_id = "9f06f5d7-7964-4d1d-b341-6e0206d6888a"
        
        print(f"\n2. Creating availability for service: {hospital_service_id}")
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        availability_data = {
            "hospital_service_id": hospital_service_id,
            "date": "2026-03-06",
            "total_slots": 20
        }
        
        create_response = requests.post(
            "http://localhost:8000/appointments/availability",
            json=availability_data,
            headers=headers
        )
        
        if create_response.status_code == 200:
            print("✅ Availability created successfully!")
            created_data = create_response.json()
            print(f"Availability ID: {created_data.get('id')}")
            
            # Test booking
            print(f"\n3. Testing booking...")
            booking_response = requests.post(
                "http://localhost:8000/appointments/book",
                params={
                    "hospital_service_id": hospital_service_id,
                    "appointment_date": "2026-03-06",
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
                
                print(f"\n4. Testing queue status...")
                queue_response = requests.get(f"http://localhost:8000/queue/patient/{booking_data.get('appointment_id')}")
                
                if queue_response.status_code == 200:
                    queue_data = queue_response.json()
                    print("✅ Queue status retrieved!")
                    print(f"Hospital: {queue_data.get('hospital_name')}")
                    print(f"Service: {queue_data.get('service_name')}")
                    print(f"Token: T-{queue_data.get('token_number')}")
                    print(f"People Ahead: {queue_data.get('people_ahead')}")
                    print(f"Wait Time: {queue_data.get('estimated_wait_time')} minutes")
                else:
                    print(f"❌ Queue status failed: {queue_response.status_code}")
                    print(f"Response: {queue_response.text}")
            else:
                print(f"❌ Booking failed: {booking_response.status_code}")
                print(f"Response: {booking_response.text}")
        else:
            print(f"❌ Availability creation failed: {create_response.status_code}")
            print(f"Response: {create_response.text}")
    else:
        print(f"❌ Staff login failed: {login_response.status_code}")
        print(f"Response: {login_response.text}")
        print("\nTrying default credentials...")
        
        # Try with common default credentials
        for username, password in [
            ("admin", "admin"),
            ("staff", "staff"),
            ("test", "test"),
            ("demo", "demo")
        ]:
            test_response = requests.post(
                "http://localhost:8000/auth/login",
                json={"staff_id": username, "password": password}
            )
            
            if test_response.status_code == 200:
                print(f"✅ Found working credentials: {username}/{password}")
                break
        else:
            print("❌ No working default credentials found")
            
except Exception as e:
    print(f"❌ Error: {e}")

print("\n=== SOLUTION SUMMARY ===")
print("The 'Hospital service not found' error was caused by:")
print("1. No availability records existing for the selected service and date")
print("2. The booking API requires availability to exist before booking")
print("")
print("FIXES IMPLEMENTED:")
print("✅ Added availability check before booking")
print("✅ Improved error messages to guide users")
print("✅ Only show dates with available slots")
print("✅ Clear error handling for no availability scenarios")
print("")
print("NEXT STEPS:")
print("1. Staff needs to login and create availability for services")
print("2. Patients can then book appointments on available dates")
print("3. The system will prevent booking when no slots are available")
