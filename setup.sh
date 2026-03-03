#!/bin/bash

# Urban Insights Setup Script
echo "🚀 Setting up Urban Insights Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python v3.8+ first."
    exit 1
fi

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed or not in PATH. Please install MongoDB."
fi

echo "✅ Prerequisites check passed"

# Setup Frontend
echo "📦 Setting up Frontend..."
cd frontend
npm install

# Create frontend .env file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Frontend .env file created"
fi

cd ..

# Setup Backend
echo "📦 Setting up Backend..."
cd backend
npm install

# Create backend .env file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Backend .env file created"
fi

# Create uploads directory
mkdir -p uploads/complaints
mkdir -p logs

cd ..

# Setup ML Service
echo "📦 Setting up ML Service..."
cd ml-service

# Check if pip is available
if ! command -v pip &> /dev/null && ! command -v pip3 &> /dev/null; then
    echo "❌ pip is not installed. Please install pip first."
    exit 1
fi

# Install Python dependencies
if command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
else
    pip install -r requirements.txt
fi

# Create ML service .env file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ ML Service .env file created"
fi

# Create necessary directories
mkdir -p models data logs

# Generate synthetic data
echo "📊 Generating synthetic training data..."
if command -v pip3 &> /dev/null; then
    pip3 install pandas numpy
    python3 generate_data.py
else
    pip install pandas numpy
    python generate_data.py
fi

cd ..

echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Start MongoDB service"
echo "2. Run 'npm start' in the frontend directory"
echo "3. Run 'npm run dev' in the backend directory"
echo "4. Run 'python app.py' in the ml-service directory"
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For detailed instructions, check README.md"
