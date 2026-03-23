# PRODUCTION LOGIN FIX - DATABASE SEEDING
# Issue: 401 Invalid credentials in production
# Cause: Empty production database

## 🔧 STEP 1: Create Seed Script
Copy the content from SEED_SCRIPT.py to your backend:
`backend/app/seed.py`

## 🔧 STEP 2: Run Seed on Render
1. Go to Render Dashboard → Your Backend Service
2. Click "Shell" or "Console"
3. Run: `python -m app.seed`

## 🔧 STEP 3: Test Login
Use these credentials:
- Staff ID: `dev`
- Password: `1234`

## 🔧 STEP 4: Expected Flow
1. Login succeeds ✅
2. Token returned ✅
3. Redirect to dashboard ✅
4. Queue API calls work ✅

## 📋 Verification Checklist
- [ ] Seed script created in backend
- [ ] Seed script run on Render
- [ ] Login works with dev/1234
- [ ] Dashboard loads
- [ ] Queue data fetches

## 🚨 Important Notes
- This is a DATABASE issue only
- Frontend code is correct
- API endpoints are correct
- Just needs seed data in production

## 🔍 Debug Commands
```bash
# Check if user exists
python -c "
from app.database import SessionLocal
from app.models import Staff
db = SessionLocal()
user = db.query(Staff).filter(Staff.staff_id == 'dev').first()
print('User exists:', user is not None)
db.close()
"
```
