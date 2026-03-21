# PRODUCTION DEPLOYMENT CHECKLIST
# SmartQueue - Frontend (Vercel) + Backend (Render)

## ✅ FRONTEND FIXES (COMPLETED)
- [x] All localhost:8000 URLs replaced with API_BASE_URL
- [x] Config.js uses environment variables
- [x] Enhanced API debugging added
- [x] Environment detection fixed

## 🔄 BACKEND FIXES (NEED YOUR ACTION)
- [ ] Add CORS middleware (see CORS_FIX.py)
- [ ] Ensure Render service is public
- [ ] Check DATABASE_URL is set in Render
- [ ] Verify startup command: uvicorn app.main:app --host 0.0.0.0 --port 10000

## 🚀 DEPLOYMENT STEPS

### BACKEND (Render)
1. Add CORS middleware to main.py
2. Set DATABASE_URL environment variable
3. Deploy to Render
4. Test: https://sqm-8vrc.onrender.com/docs

### FRONTEND (Vercel)
1. Set environment variables in Vercel:
   - VITE_API_BASE_URL=https://sqm-8vrc.onrender.com
   - VITE_APP_TITLE=TREFIX - Smart Queue System
2. Deploy to Vercel
3. Test booking flow

## 🔍 DEBUGGING CHECKLIST

### In Browser Console:
- [x] API request URLs logged
- [x] Response status logged
- [x] Error details logged
- [ ] Check for CORS errors
- [ ] Check network tab for failed requests

### Common Issues:
- **CORS**: Add Vercel URL to allow_origins
- **404**: Wrong endpoint paths
- **500**: Backend errors - check Render logs
- **401**: Authentication issues

## 📊 EXPECTED CONSOLE OUTPUT
```
🔗 Environment: production
🌐 API Base URL: https://sqm-8vrc.onrender.com
🔍 Environment Variable: https://sqm-8vrc.onrender.com
🚀 API Request: {method: "POST", url: "https://sqm-8vrc.onrender.com/auth/login", ...}
📡 API Response: {status: 200, statusText: "OK", ...}
✅ API Success: {access_token: "...", user: {...}}
```
