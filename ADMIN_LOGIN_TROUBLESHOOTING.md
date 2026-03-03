# 🚨 Admin Login Server Error - Complete Troubleshooting Guide

## 🔍 Quick Diagnosis

### Step 1: Run Quick Fix
```bash
cd backend
npm run quick-fix
```
This will:
- Create/reset admin user
- Start the backend server
- Test server health
- Provide login instructions

### Step 2: If Quick Fix Fails, Debug Manually

#### A. Check Backend Server
```bash
cd backend
npm run test-server
```

#### B. Debug Admin Login
```bash
cd backend
npm run debug-login
```

#### C. Test Admin Credentials
```bash
cd backend
npm run test-admin
```

## 🔧 Common Server Errors & Solutions

### Error 1: "Server Not Running"
**Symptoms**: Network error in browser, connection refused
**Causes**: Backend server not started
**Solution**:
```bash
cd backend
npm run dev
```

### Error 2: "MongoDB Connection Failed"
**Symptoms**: Database connection error in backend console
**Causes**: MongoDB not running, wrong connection string
**Solution**:
1. Check MongoDB is running
2. Verify `.env` file MONGODB_URI
3. Test connection: `npm run debug-login`

### Error 3: "Admin User Not Found"
**Symptoms**: "Invalid email or password" error
**Causes**: Admin user not created in database
**Solution**:
```bash
cd backend
npm run setup-admin
```

### Error 4: "Password Validation Failed"
**Symptoms**: Correct credentials but login fails
**Causes**: Password hashing issue, corrupted user data
**Solution**:
```bash
cd backend
npm run fix-admin
```

### Error 5: "JWT Token Error"
**Symptoms**: Token generation or validation fails
**Causes**: Missing JWT_SECRET, token format issues
**Solution**:
1. Check `.env` file has JWT_SECRET
2. Run debug script: `npm run debug-login`

### Error 6: "CORS Error"
**Symptoms**: Cross-origin request blocked
**Causes**: Frontend URL not whitelisted
**Solution**:
1. Check `FRONTEND_URL` in backend `.env`
2. Should be: `http://localhost:3000`

### Error 7: "Port Already in Use"
**Symptoms**: Server won't start, port 5000 occupied
**Solution**:
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or use different port
PORT=5001 npm run dev
```

## 🧪 Testing Steps

### 1. Test Server Health
```bash
curl http://localhost:5000/api/health
```
Expected: `{"status":"OK","message":"Urban Insights API is running"}`

### 2. Test Admin Login API
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"mathiyazhagan907@gmail.com\",\"password\":\"123456\"}"
```

Expected:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "System Administrator",
    "email": "mathiyazhagan907@gmail.com",
    "userType": "admin"
  }
}
```

### 3. Test Frontend Connection
1. Start frontend: `cd frontend && npm start`
2. Open browser: http://localhost:3000/login
3. Select "Admin" account type
4. Enter credentials: mathiyazhagan907@gmail.com / 123456

## 🔍 Debug Scripts Available

| Script | Purpose | Command |
|--------|---------|---------|
| Quick Fix | All-in-one fix and start | `npm run quick-fix` |
| Debug Login | Comprehensive login debug | `npm run debug-login` |
| Test Server | Check server connectivity | `npm run test-server` |
| Test Admin | Test admin credentials | `npm run test-admin` |
| Setup Admin | Create admin user | `npm run setup-admin` |
| Fix Admin | Fix login issues | `npm run fix-admin` |

## 📋 Complete Fix Sequence

### Option 1: Automated Fix
```bash
cd backend
npm run quick-fix
```

### Option 2: Step-by-Step
```bash
# 1. Setup admin user
cd backend
npm run setup-admin

# 2. Start backend server
npm run dev

# 3. Test server (new terminal)
npm run test-server

# 4. Test frontend (new terminal)
cd ../frontend
npm start

# 5. Test login in browser
```

## 🌐 Browser Debugging

### Check Browser Console (F12)
1. Open Developer Tools
2. Go to Console tab
3. Try login
4. Look for JavaScript errors

### Check Network Tab
1. Go to Network tab
2. Try login
3. Check the login request
4. Look at response status and error messages

### Common Browser Errors
- **CORS Error**: Backend CORS configuration issue
- **404 Not Found**: Wrong API endpoint
- **500 Internal Server Error**: Backend code error
- **Network Error**: Server not running

## 📞 Still Having Issues?

### Collect This Information:
1. Backend console output when starting server
2. Backend console output when trying to login
3. Browser console errors (F12)
4. Network tab request/response details
5. Results of `npm run debug-login`

### Final Steps:
1. Run all debug scripts above
2. Check all environment variables
3. Verify MongoDB is running
4. Ensure both frontend and backend are running
5. Clear browser cache and try again

---

**🔑 Admin Credentials**: mathiyazhagan907@gmail.com / 123456  
**🌐 Backend URL**: http://localhost:5000  
**🌐 Frontend URL**: http://localhost:3000
