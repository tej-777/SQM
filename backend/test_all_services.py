#!/usr/bin/env python3

import requests

# Test all services to see which ones have hospital availability
services = [
    ("Cardiology", "3a25e4bd-bd34-44fd-afda-2659bf523e79"),
    ("Dermatology", "47aa8048-0c68-4ca4-b665-d7cf98c48c6f"),
    ("Emergency Medicine", "535d5736-fff2-4ea2-aeef-47fa42f58eb5"),
    ("ENT", "cd5e3f70-5612-408a-a20c-ff52597ca18e"),
    ("Gastroenterology", "04e91c8a-99d4-40ec-8984-bb4c97c93347"),
    ("General Medicine", "05dc3b32-9881-440d-8da4-2e7727f7dfc1"),
    ("Gynecology", "5779a609-03e2-4a56-b584-889d1732409d"),
    ("Neurology", "483f1c55-d6f3-4092-ab5a-dc0e4bb12539"),
    ("Oncology", "342870ff-e9af-458b-b4cc-1f8cf26f363e"),
    ("Orthopedics", "97b416cb-7a60-490e-8ed5-9ce49f25bc46"),
    ("Pediatrics", "d5d2c603-d283-45ae-a3e9-39fa883e98bb"),
    ("Psychiatry", "777ca757-8c60-45bb-a65e-fe98c3be4af5"),
    ("Pulmonology", "963c864d-2945-4423-8fc0-e887f36f4edc"),
    ("Radiology", "75b6e8fb-42b8-4331-b3ae-f8cb9a622411"),
    ("Urology", "85848c93-f2c6-4c59-a01a-c4a5537fcad9")
]

print("=== TESTING ALL SERVICES FOR HOSPITAL AVAILABILITY ===")
print("Testing date: 2026-03-05")

available_services = []
empty_services = []

for service_name, service_id in services:
    try:
        url = f"http://localhost:8000/public/hospitals/hospitals-by-service?service_id={service_id}&target_date=2026-03-05"
        response = requests.get(url)
        
        if response.status_code == 200:
            hospitals = response.json()
            available_hospitals = [h for h in hospitals if h['is_available']]
            
            if len(hospitals) > 0:
                available_services.append((service_name, len(hospitals), len(available_hospitals)))
                print(f"✅ {service_name}: {len(hospitals)} hospitals, {len(available_hospitals)} available")
                for h in available_hospitals[:2]:  # Show first 2 available
                    print(f"   - {h['hospital_name']}: {h['available_slots']} slots")
            else:
                empty_services.append(service_name)
                print(f"❌ {service_name}: No hospitals found")
        else:
            print(f"❌ {service_name}: API error {response.status_code}")
    except Exception as e:
        print(f"❌ {service_name}: Exception {e}")

print(f"\n=== SUMMARY ===")
print(f"Services with hospitals: {len(available_services)}")
print(f"Services without hospitals: {len(empty_services)}")

if available_services:
    print(f"\nServices that work:")
    for service_name, total, available in available_services:
        print(f"  - {service_name}: {total} hospitals, {available} available")

if empty_services:
    print(f"\nServices that need hospital setup:")
    for service_name in empty_services:
        print(f"  - {service_name}")

print(f"\n=== RECOMMENDATION ===")
print("For demo purposes, all services should have at least one hospital with availability.")
print("Currently, only services with hospital-service links and availability records will show hospitals.")
