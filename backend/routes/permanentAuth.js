const express = require('express');
const jwt = require('jsonwebtoken');
const { PERMANENT_ADMIN } = require('../scripts/permanentAdmin');
const User = require('../models/User');

const router = express.Router();

// Special permanent admin login - always works
router.post('/permanent-admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if it's the permanent admin credentials
    if (email === PERMANENT_ADMIN.email && password === PERMANENT_ADMIN.password) {
      // Find or create the admin user
      let admin = await User.findOne({ email: PERMANENT_ADMIN.email });
      
      if (!admin) {
        admin = new User(PERMANENT_ADMIN);
        await admin.save();
      } else {
        // Ensure admin is active and has correct properties
        admin.isActive = true;
        admin.userType = 'admin';
        admin.name = PERMANENT_ADMIN.name;
        await admin.save();
      }

      // Generate token
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
      });

      res.json({
        message: 'Permanent admin login successful',
        token,
        user: admin.getProfile()
      });
    } else {
      res.status(401).json({
        message: 'Invalid permanent admin credentials'
      });
    }
  } catch (error) {
    console.error('Permanent admin login error:', error);
    res.status(500).json({
      message: 'Server error during permanent admin login'
    });
  }
});

module.exports = router;
