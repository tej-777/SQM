#!/usr/bin/env python3

import requests
import json

# Test the API endpoint
service_id = "3a25e4bd-bd34-44fd-afda-2659bf523e79"
target_date = "2026-03-05"

url = f"http://localhost:8000/public/hospitals/hospitals-by-service?service_id={service_id}&target_date={target_date}"

try:
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Also test all services
    services_url = "http://localhost:8000/services"
    services_response = requests.get(services_url)
    services = services_response.json()
    
    print("\nAll Services:")
    for service in services:
        if "Cardiology" in service['name']:
            print(f"Service: {service['name']}, ID: {service['id']}")
            
            # Test each service
            test_url = f"http://localhost:8000/public/hospitals/hospitals-by-service?service_id={service['id']}&target_date={target_date}"
            test_response = requests.get(test_url)
            print(f"  Results: {len(test_response.json())} hospitals")
            
except Exception as e:
    print(f"Error: {e}")
