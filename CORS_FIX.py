# CORS FIX FOR FASTAPI BACKEND
# Add this to your FastAPI main.py file

from fastapi.middleware.cors import CORSMiddleware

# Add CORS middleware BEFORE your routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",           # Local development
        "https://your-vercel-app.vercel.app",  # Your Vercel URL - REPLACE THIS
        "https://sqm-8vrc.onrender.com"    # Your own domain if needed
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# IMPORTANT: Replace "your-vercel-app.vercel.app" with your actual Vercel URL
