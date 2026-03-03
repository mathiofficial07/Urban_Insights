@echo off
echo 🚀 Setting up Urban Insights Platform...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v16+ first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python v3.8+ first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Setup Frontend
echo 📦 Setting up Frontend...
cd frontend
call npm install

REM Create frontend .env file
if not exist .env (
    copy .env.example .env
    echo ✅ Frontend .env file created
)

cd ..

REM Setup Backend
echo 📦 Setting up Backend...
cd backend
call npm install

REM Create backend .env file
if not exist .env (
    copy .env.example .env
    echo ✅ Backend .env file created
)

REM Create uploads directory
if not exist uploads mkdir uploads
if not exist uploads\complaints mkdir uploads\complaints
if not exist logs mkdir logs

cd ..

REM Setup ML Service
echo 📦 Setting up ML Service...
cd ml-service

REM Install Python dependencies
pip install -r requirements.txt

REM Create ML service .env file
if not exist .env (
    copy .env.example .env
    echo ✅ ML Service .env file created
)

REM Create necessary directories
if not exist models mkdir models
if not exist data mkdir data
if not exist logs mkdir logs

REM Generate synthetic data
echo 📊 Generating synthetic training data...
python generate_data.py

cd ..

echo 🎉 Setup completed successfully!
echo.
echo 📋 Next Steps:
echo 1. Start MongoDB service
echo 2. Run 'npm start' in the frontend directory
echo 3. Run 'npm run dev' in the backend directory  
echo 4. Run 'python app.py' in the ml-service directory
echo 5. Open http://localhost:3000 in your browser
echo.
echo 📚 For detailed instructions, check README.md
pause
