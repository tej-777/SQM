"""
Cleanup script to remove junk/test services from database
Run this script to clean up any non-medical services
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.service import Service
from app.models.hospital_service import HospitalService

# Junk services to remove (based on common test entries)
JUNK_SERVICES = [
    "snake", "string", "legs", "naveen", "test", "demo", "sample",
    "service1", "service2", "service3", "abc", "xyz", "temp",
    "testing", "example", "dummy", "placeholder"
]

def cleanup_junk_services():
    """Remove junk services and ensure no orphaned hospital_service records"""
    db = SessionLocal()
    try:
        print("Starting junk services cleanup...")
        
        # Get all current services
        all_services = db.query(Service).all()
        print(f"Found {len(all_services)} total services")
        
        # Find junk services (case-insensitive)
        junk_to_remove = []
        for service in all_services:
            if service.name.lower() in [junk.lower() for junk in JUNK_SERVICES]:
                junk_to_remove.append(service)
        
        print(f"Found {len(junk_to_remove)} junk services to remove")
        
        if not junk_to_remove:
            print("✅ No junk services found - database is clean")
            return
        
        # Check for hospital_service references before deletion
        for junk_service in junk_to_remove:
            hospital_services = db.query(HospitalService).filter(
                HospitalService.service_id == junk_service.id
            ).all()
            
            if hospital_services:
                print(f"⚠️  Service '{junk_service.name}' has {len(hospital_services)} hospital references")
                print("   Deleting these hospital_service records first...")
                
                for hs in hospital_services:
                    db.delete(hs)
                
                print(f"   Deleted {len(hospital_services)} hospital_service records")
        
        # Delete junk services
        deleted_count = 0
        for junk_service in junk_to_remove:
            print(f"Deleting junk service: {junk_service.name}")
            db.delete(junk_service)
            deleted_count += 1
        
        # Commit changes
        db.commit()
        print(f"✅ Successfully deleted {deleted_count} junk services")
        
        # Show final services
        final_services = db.query(Service).order_by(Service.name).all()
        print(f"\nFinal services list ({len(final_services)} total):")
        for service in final_services:
            print(f"  - {service.name}")
            
    except Exception as e:
        print(f"❌ Error cleaning up services: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_junk_services()
