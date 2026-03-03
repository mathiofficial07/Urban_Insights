const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('+password');
      
      if (!user) {
        return res.status(401).json({ 
          message: 'Token is valid but user not found.' 
        });
      }

      if (!user.isActive) {
        return res.status(401).json({ 
          message: 'Account has been deactivated.' 
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json({ 
        message: 'Token is not valid.' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error in authentication.' 
    });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied. Admin privileges required.' 
    });
  }
};

// Citizen only middleware
const citizenOnly = (req, res, next) => {
  if (req.user && req.user.userType === 'citizen') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied. Citizen privileges required.' 
    });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (jwtError) {
        // Token is invalid but we continue without user
        console.log('Invalid token in optional auth:', jwtError.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// Check if user owns the resource or is admin
const ownerOrAdmin = (resourceField = 'user') => {
  return (req, res, next) => {
    if (req.user.userType === 'admin') {
      return next();
    }

    // For complaints, check if user owns the complaint
    if (req.resource && req.resource[resourceField].toString() === req.user._id.toString()) {
      return next();
    }

    res.status(403).json({ 
      message: 'Access denied. You can only access your own resources.' 
    });
  };
};

// Rate limiting for sensitive endpoints
const createRateLimit = (windowMs, max, message) => {
  const rateLimit = require('express-rate-limit');
  
  return rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Specific rate limiters
const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts, please try again later.'
);

const complaintRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // 10 complaints per hour
  'Too many complaints submitted, please try again later.'
);

module.exports = {
  protect,
  adminOnly,
  citizenOnly,
  optionalAuth,
  ownerOrAdmin,
  authRateLimit,
  complaintRateLimit
};
