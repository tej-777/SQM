from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from app.database import engine, Base
from app.seed_staff import seed  # For staff user
from app.seed_services import seed_services  # For medical services
import os


# Import all models to register them with SQLAlchemy
from app.models import hospital, service, hospital_service, service_availability, appointment

# Import API routers
from app.api import hospital, appointment, queue, patient_queue, dashboard, public_hospital, patient, auth, websocket, services, hospital_services, availability, booking

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI application
app = FastAPI(
    title="SmartQueue API",
    description="Hospital Queue Management System",
    version="1.0.0",
    security=[{"Bearer": []}]
)

# Add startup event for database seeding
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
        print("📋 Services: Cardiology, Orthopedics, Dermatology, Pediatrics...")
        
    except Exception as e:
        print(f"❌ Database seeding failed: {e}")
        # Don't raise exception - let app start anyway

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(hospital.router)
app.include_router(appointment.router)
app.include_router(queue.router)
app.include_router(patient_queue.router)
app.include_router(dashboard.router)
app.include_router(public_hospital.router)
app.include_router(patient.router)
app.include_router(auth.router)
app.include_router(services.router)
app.include_router(hospital_services.router)
app.include_router(availability.router)
app.include_router(booking.router)
app.include_router(websocket.router, prefix="/ws")

@app.get("/")
async def root():
    return {"message": "SmartQueue API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
