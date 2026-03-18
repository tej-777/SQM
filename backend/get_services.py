#!/usr/bin/env python3

import requests

response = requests.get("http://localhost:8000/services")
services = response.json()

print("Available Services:")
for service in services:
    print(f"  {service['name']}: {service['id']}")

print("\nService Mapping for medical problems:")
print("Need to map medical problems to service IDs")
