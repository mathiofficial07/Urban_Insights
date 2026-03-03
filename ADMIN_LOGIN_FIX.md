# � Admin Login - Single Admin System

## System Overview

**🔒 Single Admin Account**: The system now has only ONE admin account for security.

**👥 Citizen Registration**: Public registration creates citizen accounts only.

**📧 Admin Credentials**: `mathiyazhagan907@gmail.com` / `123456`

## 🚀 Quick Setup

### Step 1: Create the Single Admin Account
```bash
cd backend
node scripts/createAdmin.js
```

### Step 2: Start Services
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

### Step 3: Login
- **Admin**: Use `mathiyazhagan907@gmail.com` / `123456`
- **Citizens**: Register through the signup form

## 🛡️ Security Features

### ✅ What's Fixed:
1. **Single Admin**: Only one admin account can exist
2. **No Admin Registration**: Public signup creates citizens only
3. **Auto-Cleanup**: Admin script removes all existing admins first
4. **Clear Separation**: Login page handles both, registration is citizens-only

### 🔐 Admin Management:
- Admin accounts cannot be created through public registration
- Only the designated admin email/password works
- Running the admin script resets the single admin account
- Citizens register separately and cannot become admins

## 📱 User Experience

### Login Page:
- Clean form with email/password only
- Automatic routing based on user type
- No account type selection needed

### Registration Page:
- Citizen badge displayed prominently
- Clear messaging about admin access
- Creates citizen accounts only

### Admin Dashboard:
- Only accessible with admin credentials
- Citizens redirected to their dashboard
- Secure admin-only features

## 🧪 Testing

### Test Admin Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"mathiyazhagan907@gmail.com\",\"password\":\"123456\"}"
```

### Test Citizen Registration:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@test.com\",\"password\":\"password123\"}"
```

## � Available Scripts

| Script | Purpose | Command |
|--------|---------|---------|
| Create Admin | Creates single admin account | `npm run setup-admin` |
| Fix Admin | Resets admin account | `npm run fix-admin` |
| Test Admin | Test admin credentials | `npm run test-admin` |

## ⚠️ Important Notes

1. **Single Admin**: The system maintains exactly one admin account
2. **No Public Admin Registration**: Admin accounts cannot be created through signup
3. **Admin Reset**: Running the admin script removes ALL existing admins
4. **Security**: Keep admin credentials secure and change password in production

## � Success Indicators

- [ ] Only one admin account exists in database
- [ ] Public registration creates citizen accounts only
- [ ] Admin login redirects to `/admin`
- [ ] Citizen login redirects to `/dashboard`
- [ ] Registration form shows "Citizen Account" badge
- [ ] Login page has no account type selection

---

**🔐 Your system now has a secure single-admin architecture!**
