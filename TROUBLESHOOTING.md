# Admin Login Troubleshooting Guide

## 🔍 Issue: Cannot login with admin credentials

### Step 1: Verify Backend Server is Running
```bash
cd backend
npm run dev
```
You should see:
```
Server is running on port 5000
MongoDB connected successfully
```

### Step 2: Create/Verify Admin User
```bash
cd backend
node scripts/createAdmin.js
```

Expected output:
```
Connected to MongoDB
✅ Admin user created successfully!
📧 Email: mathiyazhagan907@gmail.com
🔑 Password: [HIDDEN FOR SECURITY]
👤 User Type: admin
```

### Step 3: Test Database Connection
```bash
cd backend
node scripts/testConnection.js
```

### Step 4: Test Login API Directly
Using curl or Postman:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mathiyazhagan907@gmail.com","password":"123456"}'
```

Expected response:
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

## 🛠️ Common Issues & Solutions

### Issue 1: Backend Server Not Running
**Symptoms**: Login page shows "Network error"
**Solution**: Start the backend server
```bash
cd backend
npm run dev
```

### Issue 2: MongoDB Connection Failed
**Symptoms**: "MongoDB connection error" in backend console
**Solutions**:
1. Check MongoDB is running
2. Verify connection string in `.env` file
3. Check network connectivity

### Issue 3: Admin User Not Created
**Symptoms**: "Invalid email or password" error
**Solutions**:
1. Run admin creation script again
2. Check if user exists in database
3. Verify email and password are correct

### Issue 4: CORS Error
**Symptoms**: "CORS policy error" in browser console
**Solution**: Verify `FRONTEND_URL` in backend `.env` matches frontend URL

### Issue 5: JWT Token Issues
**Symptoms**: "Token is not valid" error
**Solutions**:
1. Check `JWT_SECRET` in backend `.env`
2. Clear browser localStorage
3. Try logging in again

## 🧪 Quick Test Script

Create a test file `test-admin-login.js` in backend directory:

```javascript
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testAdminLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    const admin = await User.findOne({ email: 'mathiyazhagan907@gmail.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', admin.email);
    console.log('🔐 User type:', admin.userType);
    
    const isValid = await admin.comparePassword('123456');
    console.log('🔑 Password valid:', isValid);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testAdminLogin();
```

Run with: `node test-admin-login.js`

## 📞 If Issues Persist

1. Check browser console for JavaScript errors
2. Check backend console for server errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB is accessible from your network

## 🔐 Default Admin Credentials (for testing only)
- **Email**: mathiyazhagan907@gmail.com
- **Password**: 123456
- **User Type**: admin

⚠️ **Remember**: Change these credentials in production!
