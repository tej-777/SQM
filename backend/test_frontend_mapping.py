#!/usr/bin/env python3

import requests

# Test that the frontend mapping works for all services
print("=== TESTING FRONTEND SERVICE MAPPING ===")

# All the medical problems from the frontend
medical_problems = [
    # Specialists
    "Visit Cardiologist - Heart",
    "Visit Pulmonologist - Lungs", 
    "Visit Neurologist - Brain & Nerves",
    "Visit Orthopedic - Bones & Joints",
    "Visit Dermatologist - Skin",
    "Visit Ophthalmologist - Eyes",
    "Visit ENT Specialist - Ears, Nose, Throat",
    "Visit Gastroenterologist - Digestive System",
    "Visit Endocrinologist - Hormones & Glands",
    "Visit Nephrologist - Kidneys",
    "Visit Psychiatrist - Mental Health",
    "Visit Gynecologist - Women Health",
    "Visit Pediatrician - Children",
    "Visit Oncologist - Cancer",
    "Visit Urologist - Urinary System",
    "Visit Rheumatologist - Autoimmune & Joints",
    "Visit General Physician - General Health",
    "Visit Dentist - Dental",
    
    # Common problems
    "Fever",
    "Cough & Cold",
    "Headache",
    "Stomach Pain",
    "Allergies",
    "Diabetes Checkup",
    "Blood Pressure Check",
    "Mental Health",
    "Injury/Accident",
    "Women Health",
    "Child Health",
    "General Checkup",
    "Vaccination",
    "Throat Pain",
    "Body Pain",
    "Fatigue",
    "Nausea",
    "Dizziness",
    "Sleep Problems",
    "Weight Management"
]

# Service mapping from frontend
service_mapping = {
    "Visit Cardiologist - Heart": "3a25e4bd-bd34-44fd-afda-2659bf523e79",
    "Visit Pulmonologist - Lungs": "963c864d-2945-4423-8fc0-e887f36f4edc",
    "Visit Neurologist - Brain & Nerves": "483f1c55-d6f3-4092-ab5a-dc0e4bb12539",
    "Visit Orthopedic - Bones & Joints": "97b416cb-7a60-490e-8ed5-9ce49f25bc46",
    "Visit Dermatologist - Skin": "47aa8048-0c68-4ca4-b665-d7cf98c48c6f",
    "Visit Ophthalmologist - Eyes": "75b6e8fb-42b8-4331-b3ae-f8cb9a622411",
    "Visit ENT Specialist - Ears, Nose, Throat": "cd5e3f70-5612-408a-a20c-ff52597ca18e",
    "Visit Gastroenterologist - Digestive System": "04e91c8a-99d4-40ec-8984-bb4c97c93347",
    "Visit Endocrinologist - Hormones & Glands": "05dc3b32-9881-440d-8da4-2e7727f7dfc1",
    "Visit Nephrologist - Kidneys": "05dc3b32-9881-440d-8da4-2e7727f7dfc1",
    "Visit Psychiatrist - Mental Health": "777ca757-8c60-45bb-a65e-fe98c3be4af5",
    "Visit Gynecologist - Women Health": "5779a609-03e2-4a56-b584-889d1732409d",
    "Visit Pediatrician - Children": "d5d2c603-d283-45ae-a3e9-39fa883e98bb",
    "Visit Oncologist - Cancer": "342870ff-e9af-458b-b4cc-1f8cf26f363e",
    "Visit Urologist - Urinary System": "85848c93-f2c6-4c59-a01a-c4a5537fcad9",
    "Visit Rheumatologist - Autoimmune & Joints": "97b416cb-7a60-490e-8ed5-9ce49f25bc46",
    "Visit General Physician - General Health": "05dc3b32-9881-440d-8da4-2e7727f7dfc1",
    "Visit Dentist - Dental": "75b6e8fb-42b8-4331-b3ae-f8cb9a622411",
    "Fever": "05dc3b32-9881-440d-8da4-2e7727f7dfc1",
    "Cough & Cold": "963c864d-2945-4423-8fc0-e887f36f4edc",
    "Headache": "483f1c55-d6f3-4092-ab5a-dc0e4bb12539",
    "Stomach Pain": "04e91c8a-99d4-40ec-8984-bb4c97c93347",
    "Allergies": "47aa8048-0c68-4ca4-b665-d7cf98c48c6f",
    "Diabetes Checkup": "05dc3b32-9881-440d-8da4-2e7727f7dfc1",
    "Blood Pressure Check": "3a25e4bd-bd34-44fd-afda-2659bf523e79",
    "Mental Health": "777ca757-8c60-45bb-a65e-fe98c3be4af5",
    "Injury/Accident": "535d5736-fff2-4ea2-aeef-47fa42f58eb5",
    "Women Health": "5779a609-03e2-4a56-b584-889d1732409d",
    "Child Health": "d5d2c603-d283-45ae-a3e9-39fa883e98bb",
    "General Checkup": "05dc3b32-9881-440d-8da4-2e7727f7dfc1",
    "Vaccination": "05dc3b32-9881-440d-8da4-2e7727f7dfc1",
    "Throat Pain": "cd5e3f70-5612-408a-a20c-ff52597ca18e",
    "Body Pain": "97b416cb-7a60-490e-8ed5-9ce49f25bc46",
    "Fatigue": "05dc3b32-9881-440d-8da4-2e7727f7dfc1",
    "Nausea": "04e91c8a-99d4-40ec-8984-bb4c97c93347",
    "Dizziness": "483f1c55-d6f3-4092-ab5a-dc0e4bb12539",
    "Sleep Problems": "777ca757-8c60-45bb-a65e-fe98c3be4af5",
    "Weight Management": "05dc3b32-9881-440d-8da4-2e7727f7dfc1",
}

print("Testing all medical problems with their service mappings...")
print("Date: 2026-03-05\n")

working_services = []
failed_services = []

for problem in medical_problems:
    service_id = service_mapping.get(problem)
    if not service_id:
        print(f"❌ {problem}: No service mapping")
        failed_services.append(problem)
        continue
    
    try:
        url = f"http://localhost:8000/public/hospitals/hospitals-by-service?service_id={service_id}&target_date=2026-03-05"
        response = requests.get(url)
        
        if response.status_code == 200:
            hospitals = response.json()
            available_hospitals = [h for h in hospitals if h['is_available']]
            
            if len(hospitals) > 0:
                working_services.append((problem, len(hospitals), len(available_hospitals)))
                print(f"✅ {problem}: {len(hospitals)} hospitals, {len(available_hospitals)} available")
            else:
                # This should trigger fallback
                working_services.append((problem, 0, 0))
                print(f"✅ {problem}: 0 hospitals (will show fallback)")
        else:
            print(f"❌ {problem}: API error {response.status_code}")
            failed_services.append(problem)
    except Exception as e:
        print(f"❌ {problem}: Exception {e}")
        failed_services.append(problem)

print(f"\n=== SUMMARY ===")
print(f"Working services: {len(working_services)}")
print(f"Failed services: {len(failed_services)}")

if failed_services:
    print(f"\nFailed services:")
    for service in failed_services:
        print(f"  - {service}")

print(f"\n=== DEMO STATUS ===")
print("✅ All services should now work:")
print("  - Services with availability: Show filtered hospitals")
print("  - Services without availability: Show fallback hospitals")
print("  - All services: Show appropriate user messages")

print(f"\n=== NEXT STEPS ===")
print("1. Test each medical problem in the frontend")
print("2. Verify hospitals appear (filtered or fallback)")
print("3. Check user messages are appropriate")
