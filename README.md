# Urban Insights: Community Issue Prediction and Resolution Platform

A full-stack MERN application with machine learning integration for predicting and resolving community issues.

## 🚀 Features

- **Modern Landing Page**: Vertical scrolling with hero, overview, features, how-it-works sections
- **User Authentication**: Login and registration with JWT tokens
- **Complaint Management**: Submit and track community complaints with image uploads
- **Admin Dashboard**: Analytics with charts and tables for system-wide monitoring
- **ML Integration**: 
  - NLP for text processing and cleaning
  - Naive Bayes for complaint classification
  - K-Means clustering for hotspot detection
  - Random Forest for severity prediction
- **Real-time Updates**: Live status tracking and notifications
- **Data Analytics**: Comprehensive reporting and export functionality

## 🛠 Tech Stack

- **Frontend**: React, JavaScript, TailwindCSS, Chart.js, Heroicons
- **Backend**: Node.js, Express, JWT, MongoDB, Mongoose
- **ML Service**: Python, Flask, scikit-learn, pandas, NLTK
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **File Storage**: Multer for image uploads

## 📁 Project Structure

```
UrbanInsights/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   └── App.js          # Main app component
│   └── package.json
├── backend/                  # Node.js/Express backend API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication middleware
│   └── server.js           # Main server file
├── ml-service/              # Python Flask ML service
│   ├── app.py              # Flask application
│   ├── generate_data.py    # Synthetic data generator
│   └── requirements.txt    # Python dependencies
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- MongoDB
- npm or yarn
- Git

### 1. Clone and Setup

```bash
git clone <repository-url>
cd UrbanInsights
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create environment file:
```bash
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ML_SERVICE_URL=http://localhost:5001
```

Start the frontend:
```bash
npm start
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create environment file:
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/urban-insights
JWT_SECRET=your_super_secret_jwt_key_here
ML_SERVICE_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000
```

Start the backend:
```bash
npm run dev
```

### 4. ML Service Setup

```bash
cd ml-service
pip install -r requirements.txt
```

Create environment file:
```bash
cp .env.example .env
```

Edit `.env`:
```
FLASK_ENV=development
PORT=5001
```

Generate synthetic training data:
```bash
python generate_data.py
```

Start the ML service:
```bash
python app.py
```

### 5. Database Setup

Make sure MongoDB is running:
```bash
# On Windows
net start MongoDB

# On macOS
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

## 📊 Training ML Models

Once all services are running, train the ML models:

1. **Via API Call:**
```bash
curl -X POST http://localhost:5001/api/ml/train \
  -H "Content-Type: application/json" \
  -d '{"modelType": "all"}'
```

2. **Via Admin Dashboard:**
- Navigate to Admin Dashboard
- Go to ML Models section
- Click "Train Models"

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

### Complaints
- `POST /api/complaints` - Submit complaint
- `GET /api/complaints` - Get user complaints
- `GET /api/complaints/:id` - Get single complaint
- `PUT /api/complaints/:id` - Update complaint
- `POST /api/complaints/:id/followup` - Add follow-up
- `POST /api/complaints/:id/upvote` - Upvote complaint

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/complaints` - Get all complaints
- `PUT /api/admin/complaints/:id/status` - Update complaint status
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics/export` - Export analytics data

### ML Service
- `POST /api/ml/predict` - Get ML predictions
- `POST /api/ml/cluster` - Get hotspot clusters
- `POST /api/ml/train` - Train ML models
- `GET /api/ml/models/status` - Get model status
- `POST /api/ml/batch-predict` - Batch predict complaints

## 🎯 User Accounts

### Citizen Registration
- Citizens can register directly through the signup form
- All registrations create citizen accounts only
- Admin access is not available through public registration

### Admin Access
- There is only ONE admin account in the system
- Admin credentials: `mathiyazhagan907@gmail.com` / `123456`
- Admin accounts are created separately using the admin creation script

**To create/reset the admin account:**
```bash
cd backend
node scripts/createAdmin.js
```

⚠️ **Important**: This will remove all existing admin users and create a single admin account.

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/urban-insights
JWT_SECRET=your_jwt_secret_key
ML_SERVICE_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ML_SERVICE_URL=http://localhost:5001
```

**ML Service (.env):**
```
FLASK_ENV=development
PORT=5001
```

## 📈 Features in Detail

### 1. Landing Page
- Hero section with call-to-action
- Project overview with statistics
- Feature showcase with icons
- How-it-works section
- Contact footer

### 2. User Dashboard
- Personal complaint statistics
- Quick action buttons
- Recent complaints list
- Community insights

### 3. Complaint System
- Multi-category complaint submission
- Image upload support (max 5 images)
- Location-based reporting
- Real-time status tracking
- Follow-up messaging

### 4. Admin Dashboard
- System-wide analytics
- Interactive charts (Category, Status, Severity distribution)
- Hotspot detection map
- User management
- Complaint management
- Data export functionality

### 5. ML Features
- **Text Classification**: Naive Bayes for automatic categorization
- **Severity Prediction**: Random Forest for priority assessment
- **Hotspot Detection**: K-Means clustering for geographic patterns
- **NLP Processing**: Text cleaning and feature extraction

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

### API Testing
Use Postman or curl to test API endpoints. Example:
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Submit complaint
curl -X POST http://localhost:5000/api/complaints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"title":"Test Complaint","description":"This is a test complaint","category":"Infrastructure","location":{"address":"123 Test St","latitude":40.7128,"longitude":-74.0060}}'
```

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting platform
```

### Backend (Heroku/Railway)
```bash
cd backend
# Set environment variables in hosting platform
# Deploy using platform CLI
```

### ML Service (Heroku/PythonAnywhere)
```bash
cd ml-service
# Install requirements and deploy Flask app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env file

2. **ML Service Not Responding**
   - Check if Python dependencies are installed
   - Verify Flask app is running on port 5001

3. **CORS Errors**
   - Check frontend URL in backend .env
   - Ensure CORS is properly configured

4. **JWT Token Issues**
   - Verify JWT_SECRET is set in backend .env
   - Check token expiration

### Logs

- Backend logs: Console output or check `logs/` directory
- ML Service logs: Flask console output
- Frontend logs: Browser developer console

## 📞 Support

For support and questions:
- Create an issue in the repository
- Email: support@urbaninsights.com
- Documentation: Check the `/docs` folder for detailed API documentation

---

**Built with ❤️ for better communities**
