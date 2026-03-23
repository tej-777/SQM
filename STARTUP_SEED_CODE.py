# ADD TO YOUR BACKEND main.py FILE
# Paste this code to automatically seed the database on startup

# Add this import at the top of main.py
from app.seed import seed

# Add this event handler after your FastAPI app is created
@app.on_event("startup")
async def startup_event():
    try:
        seed()  # This will create the dev user if it doesn't exist
        print("✅ Database seeded successfully")
        print("👤 Login credentials: dev / 1234")
    except Exception as e:
        print(f"❌ Seeding failed: {e}")

# Example of where to place it in main.py:
#
# from fastapi import FastAPI
# from app.seed import seed  # <-- ADD THIS IMPORT
#
# app = FastAPI()
#
# @app.on_event("startup")  # <-- ADD THIS EVENT HANDLER
# async def startup_event():
#     try:
#         seed()
#         print("✅ Database seeded successfully")
#         print("👤 Login credentials: dev / 1234")
#     except Exception as e:
#         print(f"❌ Seeding failed: {e}")
#
# # Your existing routes...
# @app.get("/")
# async def root():
#     return {"message": "Hello World"}
