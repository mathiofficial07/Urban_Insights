const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ensurePermanentAdmin } = require('./scripts/permanentAdmin');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const googleAuthRoutes = require('./routes/googleAuth');
const complaintRoutes = require('./routes/complaints');
const adminRoutes = require('./routes/admin');
const mlRoutes = require('./routes/ml');
const permanentAuthRoutes = require('./routes/permanentAuth');
const mlPredictionRoutes = require('./routes/mlPrediction');
const complaintManagementRoutes = require('./routes/complaintManagement');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB and ensure permanent admin
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urban-insights', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('MongoDB connected successfully');

    // Ensure permanent admin account exists
    try {
      await ensurePermanentAdmin();
      console.log('Permanent admin account ensured');
    } catch (error) {
      console.error('Error ensuring permanent admin:', error.message);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', googleAuthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintManagementRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/permanent-auth', permanentAuthRoutes);
app.use('/api/ml/prediction', mlPredictionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Urban Insights API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
