#!/usr/bin/env python3

import requests
import json

# Test the API with debug logs
service_id = "3a25e4bd-bd34-44fd-afda-2659bf523e79"
target_date = "2026-03-05"

url = f"http://localhost:8000/public/hospitals/hospitals-by-service?service_id={service_id}&target_date={target_date}"

print("=== TESTING API CALL ===")
print(f"URL: {url}")

try:
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        hospitals = response.json()
        print(f"Number of hospitals returned: {len(hospitals)}")
        
        print("\n=== HOSPITAL RESPONSE ===")
        for i, hospital in enumerate(hospitals, 1):
            print(f"{i}. {hospital['hospital_name']}")
            print(f"   Hospital ID: {hospital['hospital_id']}")
            print(f"   Total Slots: {hospital['total_slots']}")
            print(f"   Booked Slots: {hospital['booked_slots']}")
            print(f"   Available Slots: {hospital['available_slots']}")
            print(f"   Is Available: {hospital['is_available']}")
            print()
    else:
        print(f"Error: {response.status_code}")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"Exception: {e}")

print("\n=== CHECKING IF ANY SERVICE AVAILABILITY EXISTS ===")
# Test a simple query to see if any availability records exist
try:
    test_url = "http://localhost:8000/public/hospitals"
    response = requests.get(test_url)
    if response.status_code == 200:
        hospitals = response.json()
        print(f"Total hospitals in database: {len(hospitals)}")
        for hospital in hospitals[:3]:  # Show first 3
            print(f"  - {hospital['name']} (ID: {hospital['id']})")
except Exception as e:
    print(f"Error checking hospitals: {e}")
