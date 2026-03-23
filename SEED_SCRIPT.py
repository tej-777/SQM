# SEED SCRIPT FOR BACKEND DATABASE
# Save this as: backend/app/seed.py

from app.database import SessionLocal
from app.models import Staff
from app.auth.utils import get_password_hash

def seed():
    db = SessionLocal()

    # Check if dev user already exists
    existing = db.query(Staff).filter(Staff.staff_id == "dev").first()
    if existing:
        print("User already exists")
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

    print("Seed user created: dev / 1234")

if __name__ == "__main__":
    seed()
