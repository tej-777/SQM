import requests
import json
import uuid

def test_service_refactoring():
    """Test the refactored Service and HospitalService models."""
    print("🚀 Testing Service Model Refactoring...")
    print("=" * 50)
    
    base_url = "http://127.0.0.1:8000"
    
    # Test 1: Create Service (should work without average_time_per_patient)
    print("🧪 Test 1: Create Service (clean model)")
    import time
    import random
    service_data = {
        "name": f"Refactored Service {int(time.time())} {random.randint(1000, 9999)}"
    }
    
    try:
        response = requests.post(
            f"{base_url}/services/",
            json=service_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            service = response.json()
            print(f"✅ Service created successfully!")
            print(f"   ID: {service['id']}")
            print(f"   Name: {service['name']}")
            print(f"   Created at: {service['created_at']}")
            
            # Verify no average_time_per_patient field
            if 'average_time_per_patient' not in service:
                print("✅ average_time_per_patient field correctly removed")
            else:
                print("❌ average_time_per_patient field still present")
                
            service_id = service['id']
        else:
            print(f"❌ Service creation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return
    
    # Test 2: Create Hospital Service with avg_consultation_time_minutes
    print(f"\n🧪 Test 2: Create Hospital Service (with avg_consultation_time_minutes)")
    
    # Get existing hospital
    try:
        hospitals_response = requests.get(f"{base_url}/hospitals/")
        if hospitals_response.status_code == 200:
            hospitals = hospitals_response.json()
            if hospitals:
                hospital_id = hospitals[0]['id']
                print(f"✅ Using hospital: {hospitals[0]['name']}")
            else:
                print("❌ No hospitals found")
                return
    except:
        print("❌ Error getting hospitals")
        return
    
    hospital_service_data = {
        "hospital_id": hospital_id,
        "service_id": service_id,
        "default_max_tokens_per_day": 50,
        "avg_consultation_time_minutes": 20,
        "active_counters": 2
    }
    
    try:
        response = requests.post(
            f"{base_url}/hospital-services/",
            json=hospital_service_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            hospital_service = response.json()
            print(f"✅ Hospital service created successfully!")
            print(f"   ID: {hospital_service['id']}")
            print(f"   Hospital ID: {hospital_service['hospital_id']}")
            print(f"   Service ID: {hospital_service['service_id']}")
            print(f"   Avg consultation time: {hospital_service['avg_consultation_time_minutes']} minutes")
            print(f"   Created at: {hospital_service['created_at']}")
            
            # Verify created_at field exists
            if 'created_at' in hospital_service:
                print("✅ created_at field correctly added to HospitalService")
            else:
                print("❌ created_at field missing from HospitalService")
                
            hospital_service_id = hospital_service['id']
        else:
            print(f"❌ Hospital service creation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return
    
    # Test 3: Update Service (should work without average_time_per_patient)
    print(f"\n🧪 Test 3: Update Service (clean model)")
    update_data = {
        "name": "Updated Test Service"
    }
    
    try:
        response = requests.put(
            f"{base_url}/services/{service_id}",
            json=update_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            updated_service = response.json()
            print(f"✅ Service updated successfully!")
            print(f"   Name: {updated_service['name']}")
        else:
            print(f"❌ Service update failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test 4: List Services (should not include average_time_per_patient)
    print(f"\n🧪 Test 4: List Services (verify clean model)")
    try:
        response = requests.get(f"{base_url}/services/")
        if response.status_code == 200:
            services = response.json()
            print(f"✅ Retrieved {len(services)} services")
            
            # Check first service for average_time_per_patient
            if services:
                first_service = services[0]
                if 'average_time_per_patient' not in first_service:
                    print("✅ average_time_per_patient correctly removed from all services")
                else:
                    print("❌ average_time_per_patient still present in service list")
                    
                if 'name' in first_service and 'id' in first_service and 'created_at' in first_service:
                    print("✅ Service has correct fields: id, name, created_at")
                else:
                    print("❌ Service missing required fields")
        else:
            print(f"❌ Failed to get services: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test 5: List Hospital Services (should include avg_consultation_time_minutes)
    print(f"\n🧪 Test 5: List Hospital Services (verify avg_consultation_time_minutes)")
    try:
        response = requests.get(f"{base_url}/hospital-services/")
        if response.status_code == 200:
            hospital_services = response.json()
            print(f"✅ Retrieved {len(hospital_services)} hospital services")
            
            # Check first hospital service for required fields
            if hospital_services:
                first_hs = hospital_services[0]
                required_fields = ['hospital_id', 'service_id', 'default_max_tokens_per_day', 
                                 'avg_consultation_time_minutes', 'active_counters', 'created_at']
                
                missing_fields = [field for field in required_fields if field not in first_hs]
                
                if not missing_fields:
                    print("✅ HospitalService has all required fields")
                    print(f"   avg_consultation_time_minutes: {first_hs.get('avg_consultation_time_minutes')}")
                else:
                    print(f"❌ HospitalService missing fields: {missing_fields}")
        else:
            print(f"❌ Failed to get hospital services: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Cleanup
    print(f"\n🧪 Cleanup: Deleting test data")
    try:
        # Delete hospital service
        response = requests.delete(f"{base_url}/hospital-services/{hospital_service_id}")
        if response.status_code == 200:
            print("✅ Hospital service deleted")
        
        # Delete service
        response = requests.delete(f"{base_url}/services/{service_id}")
        if response.status_code == 200:
            print("✅ Service deleted")
            
    except Exception as e:
        print(f"❌ Cleanup failed: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Service Model Refactoring Tests Completed!")

if __name__ == "__main__":
    test_service_refactoring()
