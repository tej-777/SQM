# ADD TO YOUR backend/app/main.py FILE
# Add this startup event to automatically seed services on deployment

# Add these imports at the top of main.py
from app.seed import seed  # For staff user
from app.seed_services import seed_services  # For medical services

# Add this startup event after your FastAPI app is created
@app.on_event("startup")
async def startup_event():
    """Seed database on startup if needed"""
    try:
        print("🚀 Starting database seeding...")
        
        # Seed staff user (dev/1234)
        seed()
        print("✅ Staff user seeded")
        
        # Seed medical services
        seed_services()
        print("✅ Medical services seeded")
        
        print("🎉 Database seeding completed successfully!")
        print("👤 Staff login: dev / 1234")
        print("📋 Services: Cardiology, Orthopedics, Dermatology, Pediatr...")
        
    except Exception as e:
        print(f"❌ Database seeding failed: {e}")
        # Don't raise exception - let the app start anyway

# EXAMPLE PLACEMENT IN main.py:
#
# from fastapi import FastAPI
# from app.seed import seed  # <-- ADD THIS
# from app.seed_services import seed_services  # <-- ADD THIS
#
# app = FastAPI()
#
# @app.on_event("startup")  # <-- ADD THIS EVENT
# async def startup_event():  # <-- ADD THIS FUNCTION
#     try:
#         seed()
#         seed_services()
#         print("✅ Database seeded successfully")
#     except Exception as e:
#         print(f"❌ Seeding failed: {e}")
#
# # Your existing routes continue here...
# @app.get("/")
# async def root():
#     return {"message": "Hello World"}
