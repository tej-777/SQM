#!/usr/bin/env python3

import requests
import json

# Test different dates to see if any availability exists
service_id = "3a25e4bd-bd34-44fd-afda-2659bf523e79"
dates = ["2026-03-04", "2026-03-05", "2026-03-06", "2026-03-07"]

print("Testing different dates for Cardiology service:")
for target_date in dates:
    url = f"http://localhost:8000/public/hospitals/hospitals-by-service?service_id={service_id}&target_date={target_date}"
    
    try:
        response = requests.get(url)
        hospitals = response.json()
        
        available_hospitals = [h for h in hospitals if h['is_available']]
        total_slots = sum(h['available_slots'] for h in hospitals)
        
        print(f"Date {target_date}: {len(hospitals)} hospitals, {len(available_hospitals)} available, {total_slots} total slots")
        
        if available_hospitals:
            print(f"  Available hospitals: {[h['hospital_name'] for h in available_hospitals]}")
            
    except Exception as e:
        print(f"Error for {target_date}: {e}")

print("\nTesting different services for March 5th:")
# Test a few different services
service_ids = [
    ("3a25e4bd-bd34-44fd-afda-2659bf523e79", "Cardiology"),
    ("05dc3b32-9881-440d-8da4-2e7727f7dfc1", "General Medicine"),
    ("47aa8048-0c68-4ca4-b665-d7cf98c48c6f", "Dermatology")
]

for service_id, service_name in service_ids:
    url = f"http://localhost:8000/public/hospitals/hospitals-by-service?service_id={service_id}&target_date=2026-03-05"
    
    try:
        response = requests.get(url)
        hospitals = response.json()
        
        available_hospitals = [h for h in hospitals if h['is_available']]
        total_slots = sum(h['available_slots'] for h in hospitals)
        
        print(f"{service_name}: {len(hospitals)} hospitals, {len(available_hospitals)} available, {total_slots} total slots")
        
    except Exception as e:
        print(f"Error for {service_name}: {e}")
