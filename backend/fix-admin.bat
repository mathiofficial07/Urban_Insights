@echo off
echo ========================================
echo Urban Insights Admin Login Fix
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Creating admin user...
call node scripts/createAdmin.js
if %errorlevel% neq 0 (
    echo ERROR: Failed to create admin user
    pause
    exit /b 1
)

echo.
echo Step 3: Testing admin credentials...
call node scripts/simpleTest.js
if %errorlevel% neq 0 (
    echo ERROR: Admin credentials test failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Admin login is now fixed!
echo ========================================
echo.
echo Login Credentials:
echo   Email: mathiyazhagan907@gmail.com
echo   Password: 123456
echo   User Type: admin
echo.
echo Next Steps:
echo 1. Start backend: npm run dev
echo 2. Start frontend: cd ../frontend && npm start
echo 3. Login with credentials above
echo.
pause
