const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Complaint = require('../models/Complaint');
const { protect, complaintRateLimit, ownerOrAdmin } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/complaints';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: fileFilter
});

// @route   POST /api/complaints
// @desc    Create a new complaint
// @access  Private
router.post('/', [
  protect,
  complaintRateLimit,
  upload.array('images', 5), // Max 5 images
  [
    body('title')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('category')
      .isIn(['Infrastructure', 'Sanitation', 'Water Supply', 'Electricity', 'Roads', 'Public Safety', 'Noise Pollution', 'Other'])
      .withMessage('Invalid category'),
    body('location.address').custom((value, { req }) => {
      const address = value || req.body['location[address]'] || req.body.location;
      if (!address || typeof address !== 'string') throw new Error('Location address is required');
      return true;
    }),
    body('location.latitude').custom((value, { req }) => {
      const lat = value || req.body['location[latitude]'] || req.body.latitude;
      if (lat === undefined || lat === '') throw new Error('Latitude is required');
      const fLat = parseFloat(lat);
      if (isNaN(fLat) || fLat < -90 || fLat > 90) throw new Error('Invalid latitude');
      return true;
    }),
    body('location.longitude').custom((value, { req }) => {
      const lng = value || req.body['location[longitude]'] || req.body.longitude;
      if (lng === undefined || lng === '') throw new Error('Longitude is required');
      const fLng = parseFloat(lng);
      if (isNaN(fLng) || fLng < -180 || fLng > 180) throw new Error('Invalid longitude');
      return true;
    }),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority level')
  ]
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          mimeType: file.mimetype
        });
      });
    }

    // Handle location parsing from FormData (multer puts nested keys as "location[address]")
    let finalLocation = {
      address: req.body.location?.address || req.body['location[address]'] || (typeof req.body.location === 'string' ? req.body.location : ''),
      coordinates: {
        latitude: parseFloat(req.body.location?.latitude || req.body['location[latitude]'] || req.body.latitude || 0),
        longitude: parseFloat(req.body.location?.longitude || req.body['location[longitude]'] || req.body.longitude || 0)
      },
      landmark: req.body.location?.landmark || req.body['location[landmark]'] || req.body.landmark || ''
    };

    // Create complaint
    const complaint = new Complaint({
      user: req.user._id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority || 'medium',
      location: finalLocation,
      images
    });

    await complaint.save();

    // Add complaint to user's complaints array
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      $push: { complaints: complaint._id }
    });

    // Call ML service for predictions
    try {
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
        description: req.body.description,
        category: req.body.category,
        location: {
          latitude: finalLocation.coordinates.latitude,
          longitude: finalLocation.coordinates.longitude
        }
      }, { timeout: 3000 }); // Fast timeout for responsiveness

      const now = new Date();
      if (mlResponse.data && (mlResponse.data.category || mlResponse.data.predicted_category)) {
        complaint.mlPredictions = {
          category: mlResponse.data.category ? {
            ...mlResponse.data.category,
            processedAt: mlResponse.data.category.processedAt || now
          } : {
            predicted: mlResponse.data.predicted_category || req.body.category,
            confidence: mlResponse.data.confidence || 0.85,
            processedAt: now
          },
          severity: mlResponse.data.severity ? {
            ...mlResponse.data.severity,
            processedAt: mlResponse.data.severity.processedAt || now
          } : undefined,
          cluster: mlResponse.data.cluster ? {
            ...mlResponse.data.cluster,
            processedAt: mlResponse.data.cluster.processedAt || now
          } : undefined,
          nlpInsights: mlResponse.data.nlpInsights,
          suggestedResolution: mlResponse.data.suggestedResolution
        };
      } else {
        // ML service returned empty data (likely models not trained)
        console.warn('ML service returned empty results, using fallback markers');
        complaint.mlPredictions = {
          category: {
            predicted: req.body.category || 'Analyzed',
            confidence: 0,
            processedAt: now,
            isFallback: true
          }
        };
      }
      await complaint.save();
    } catch (mlError) {
      console.warn('ML service unavailable during complaint creation, using fallback markers');
      // Set a timestamp so it appears in "Recent Analysis" even if actual ML failed
      complaint.mlPredictions = {
        category: {
          predicted: req.body.category || 'Analyzed',
          confidence: 0,
          processedAt: new Date(),
          isFallback: true
        }
      };
      await complaint.save();
    }

    // Populate user data for response
    await complaint.populate('user', 'name email');

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);

    // Clean up uploaded files if there was an error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      });
    }

    res.status(500).json({
      message: 'Server error creating complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/complaints
// @desc    Get user's complaints
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;

    const options = {
      status,
      category,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const complaints = await Complaint.getByUser(req.user._id, options);

    const total = await Complaint.countDocuments({
      user: req.user._id,
      isActive: true,
      ...(status && { status }),
      ...(category && { category })
    });

    res.json({
      complaints,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total
      }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      message: 'Server error fetching complaints',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/complaints/test
// @desc    Test route without authentication
// @access  Public
router.get('/test', async (req, res) => {
  try {
    console.log('=== TEST ROUTE ===');
    const complaints = await Complaint.find({}).limit(5);
    console.log('Found complaints (test):', complaints.length);
    res.json({
      success: true,
      message: 'Test route working',
      count: complaints.length,
      complaints: complaints.map(c => ({
        id: c._id,
        title: c.title,
        status: c.status,
        user: c.user
      }))
    });
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({
      success: false,
      message: 'Test route failed',
      error: error.message
    });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;

    // Build query for the authenticated user
    const query = {
      user: req.user._id,
      isActive: true
    };

    if (status) query.status = status;
    if (category) query.category = category;

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('user', 'name email');

    const total = await Complaint.countDocuments(query);

    res.json({
      success: true,
      complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching complaints',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/complaints/:id
// @desc    Get single complaint
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email')
      .populate('followUps.by', 'name');

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found'
      });
    }

    // Check if user owns the complaint or is admin
    if (complaint.user._id.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    // Increment views
    await complaint.incrementViews();

    res.json({
      complaint
    });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({
      message: 'Server error fetching complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/complaints/:id
// @desc    Update complaint
// @access  Private (owner or admin)
router.put('/:id', [
  protect,
  ownerOrAdmin(),
  [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority level')
  ]
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found'
      });
    }

    // Update fields
    const { title, description, priority } = req.body;
    if (title) complaint.title = title;
    if (description) complaint.description = description;
    if (priority) complaint.priority = priority;

    await complaint.save();

    res.json({
      message: 'Complaint updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({
      message: 'Server error updating complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/complaints/:id/followup
// @desc    Add follow-up to complaint
// @access  Private
router.post('/:id/followup', [
  protect,
  [
    body('message')
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage('Message must be between 5 and 500 characters')
  ]
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found'
      });
    }

    // Check if user owns the complaint or is admin
    if (complaint.user.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    const { message } = req.body;
    await complaint.addFollowUp(message, req.user._id);

    await complaint.populate('followUps.by', 'name');

    res.json({
      message: 'Follow-up added successfully',
      complaint
    });
  } catch (error) {
    console.error('Add follow-up error:', error);
    res.status(500).json({
      message: 'Server error adding follow-up',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/complaints/:id/upvote
// @desc    Upvote a complaint
// @access  Private
router.post('/:id/upvote', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found'
      });
    }

    await complaint.upvote();

    res.json({
      message: 'Complaint upvoted successfully',
      upvotes: complaint.upvotes
    });
  } catch (error) {
    console.error('Upvote complaint error:', error);
    res.status(500).json({
      message: 'Server error upvoting complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/complaints/:id
// @desc    Delete complaint (soft delete)
// @access  Private (owner or admin)
router.delete('/:id', [protect, ownerOrAdmin()], async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found'
      });
    }

    complaint.isActive = false;
    await complaint.save();

    res.json({
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({
      message: 'Server error deleting complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
