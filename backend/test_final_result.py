#!/usr/bin/env python3

import requests
import json

service_id = "3a25e4bd-bd34-44fd-afda-2659bf523e79"
target_date = "2026-03-05"

url = f"http://localhost:8000/public/hospitals/hospitals-by-service?service_id={service_id}&target_date={target_date}"

try:
    response = requests.get(url)
    hospitals = response.json()
    
    print(f"Status Code: {response.status_code}")
    print(f"Number of hospitals returned: {len(hospitals)}")
    
    print("\n=== HOSPITAL RESPONSE AFTER FIX ===")
    for i, hospital in enumerate(hospitals, 1):
        print(f"{i}. {hospital['hospital_name']}")
        print(f"   Hospital ID: {hospital['hospital_id']}")
        print(f"   Total Slots: {hospital['total_slots']}")
        print(f"   Booked Slots: {hospital['booked_slots']}")
        print(f"   Available Slots: {hospital['available_slots']}")
        print(f"   Is Available: {hospital['is_available']}")
        
        if hospital['is_available']:
            print(f"   *** THIS HOSPITAL IS AVAILABLE FOR BOOKING! ***")
        print()
        
    # Count available hospitals
    available_hospitals = [h for h in hospitals if h['is_available']]
    print(f"\n=== SUMMARY ===")
    print(f"Total hospitals: {len(hospitals)}")
    print(f"Available hospitals: {len(available_hospitals)}")
    print(f"Hospitals with availability: {[h['hospital_name'] for h in available_hospitals]}")
        
except Exception as e:
    print(f"Exception: {e}")
