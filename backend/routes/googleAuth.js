const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const googleConfig = require('../config/google');
const router = express.Router();
const client = new OAuth2Client(googleConfig.clientId);

// @route   POST /api/auth/google
// @desc    Authenticate with Google
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required'
      });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleConfig.clientId
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists, check if they registered with Google
      if (!user.googleId) {
        // Link Google account to existing user
        user.googleId = sub;
        user.googlePicture = picture;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        name,
        email,
        googleId: sub,
        googlePicture: picture,
        userType: 'citizen', // Default to citizen for Google signups
        isVerified: true, // Google accounts are pre-verified
        password: 'google-auth-' + Math.random().toString(36).slice(-8) // Random password for Google users
      });

      await user.save();
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        userType: user.userType
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Authentication successful',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        phone: user.phone,
        address: user.address,
        googlePicture: user.googlePicture,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
});

// @route   POST /api/auth/google/link
// @desc    Link Google account to existing user
// @access  Private
router.post('/google/link', async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user?.id; // This would come from auth middleware

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required'
      });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleConfig.clientId
    });

    const payload = ticket.getPayload();
    const { email, picture, sub } = payload;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if Google account is already linked to another user
    const existingGoogleUser = await User.findOne({ googleId: sub });
    if (existingGoogleUser && existingGoogleUser._id.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: 'Google account is already linked to another user'
      });
    }

    // Link Google account
    user.googleId = sub;
    user.googlePicture = picture;
    await user.save();

    res.json({
      success: true,
      message: 'Google account linked successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        googlePicture: user.googlePicture
      }
    });

  } catch (error) {
    console.error('Google link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link Google account',
      error: error.message
    });
  }
});

module.exports = router;
