# SIMPLE SEED SCRIPT FOR STAFF USER
# This creates the dev/1234 user for login

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.staff import Staff
from app.core.security import get_password_hash

def seed():
    """Seed staff user for login"""
    db = SessionLocal()
    
    try:
        # Check if dev user already exists
        existing = db.query(Staff).filter(Staff.staff_id == "dev").first()
        if existing:
            print("✅ Staff user 'dev' already exists")
            return

        # Create test staff user
        user = Staff(
            staff_id="dev",
            password=get_password_hash("1234"),
            hospital_name="Dev Hospital"
        )

        db.add(user)
        db.commit()
        db.close()

        print("✅ Staff user created: dev / 1234")
        
    except Exception as e:
        print(f"❌ Error creating staff user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
