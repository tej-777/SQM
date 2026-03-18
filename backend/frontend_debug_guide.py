#!/usr/bin/env python3

# Test to verify the complete pipeline works
import requests
import json

# Test the API directly first
service_id = "3a25e4bd-bd34-44fd-afda-2659bf523e79"
target_date = "2026-03-05"

url = f"http://localhost:8000/public/hospitals/hospitals-by-service?service_id={service_id}&target_date={target_date}"

print("=== TESTING API DIRECTLY ===")
try:
    response = requests.get(url)
    if response.status_code == 200:
        hospitals = response.json()
        available_hospitals = [h for h in hospitals if h['is_available']]
        print(f"✅ API Working: {len(hospitals)} hospitals, {len(available_hospitals)} available")
        for h in available_hospitals:
            print(f"  - {h['hospital_name']}: {h['available_slots']} slots")
    else:
        print(f"❌ API Error: {response.status_code}")
except Exception as e:
    print(f"❌ API Exception: {e}")

print("\n=== FRONTEND DEBUG CHECKLIST ===")
print("To debug the frontend:")
print("1. Open browser dev tools (F12)")
print("2. Go to Console tab")
print("3. Navigate to patient dashboard")
print("4. Look for these debug messages:")
print("   - 'DEBUG: Service detection triggered with:'")
print("   - 'DEBUG: Extracted service name:'")
print("   - 'DEBUG: Matched service:'")
print("   - 'DEBUG: Set selectedServiceId to:'")
print("   - 'DEBUG: Date clicked:'")
print("   - 'DEBUG: useEffect triggered with:'")
print("   - 'DEBUG: Selected Service:'")
print("   - 'DEBUG: Selected Date:'")
print("   - 'DEBUG: Calling API:'")
print("   - 'DEBUG: Hospitals response:'")

print("\n=== EXPECTED FLOW ===")
print("1. Medical problem comes from navigation state")
print("2. Service detection extracts 'Cardiologist' from 'Visit Cardiologist - Heart'")
print("3. Service matching finds 'Cardiology' service")
print("4. User clicks a date (e.g., March 5, 2026)")
print("5. useEffect triggers fetchHospitalAvailability")
print("6. API call returns hospitals with availability")
print("7. 'Dev' hospital appears with 7 available slots")

print("\n=== COMMON ISSUES ===")
print("1. medicalProblem is null/undefined")
print("2. Service name extraction fails")
print("3. Service matching fails")
print("4. Date selection not working")
print("5. useEffect not triggering")
print("6. API call failing")
print("7. Response not being processed correctly")
