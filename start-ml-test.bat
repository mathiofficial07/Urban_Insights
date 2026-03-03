@echo off
echo ========================================
echo ML Models Test and Setup
echo ========================================
echo.

echo Step 1: Checking if ML Service is running...
curl -s http://localhost:5001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ ML Service is already running
    goto :test_ml
) else (
    echo ❌ ML Service is not running
    echo.
    echo Step 2: Starting ML Service...
    cd ml-service
    echo Installing Python dependencies...
    pip install -r requirements.txt
    echo.
    echo Starting ML Service...
    start "ML Service" python app.py
    echo Waiting for ML Service to start...
    timeout /t 5 /nobreak >nul
    cd ..
)

:test_ml
echo.
echo Step 3: Testing ML Service...
curl -s http://localhost:5001/health
if %errorlevel% equ 0 (
    echo ✅ ML Service is working!
) else (
    echo ❌ ML Service failed to start
)

echo.
echo Step 4: Testing Backend...
curl -s http://localhost:5000/api/health
if %errorlevel% equ 0 (
    echo ✅ Backend is running!
) else (
    echo ❌ Backend is not running
    echo Start it with: cd backend && npm run dev
)

echo.
echo ========================================
echo ML Test Complete
echo ========================================
echo.
echo If ML Service is running, you can:
echo 1. Test ML predictions in the admin dashboard
echo 2. Use ML features in the complaint system
echo 3. Check ML model status at http://localhost:5001/models/status
echo.
pause
