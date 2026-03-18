#!/usr/bin/env python3

import requests
import json

# Test the current API with debug logs
service_id = "3a25e4bd-bd34-44fd-afda-2659bf523e79"
target_date = "2026-03-05"

url = f"http://localhost:8000/public/hospitals/hospitals-by-service?service_id={service_id}&target_date={target_date}"

try:
    response = requests.get(url)
    hospitals = response.json()
    
    print(f"Status Code: {response.status_code}")
    print(f"Number of hospitals returned: {len(hospitals)}")
    
    for hospital in hospitals:
        print(f"Hospital: {hospital['hospital_name']}")
        print(f"  Total slots: {hospital['total_slots']}")
        print(f"  Booked slots: {hospital['booked_slots']}")
        print(f"  Available slots: {hospital['available_slots']}")
        print(f"  Is available: {hospital['is_available']}")
        print()
        
    # Check if any hospital has availability
    available_hospitals = [h for h in hospitals if h['is_available']]
    print(f"Hospitals with availability: {len(available_hospitals)}")
    
    if available_hospitals:
        print("Available hospitals:")
        for h in available_hospitals:
            print(f"  - {h['hospital_name']}: {h['available_slots']} slots")
    else:
        print("No hospitals have availability for this date.")
        print("This suggests no service availability records exist in the database.")
        
except Exception as e:
    print(f"Error: {e}")
