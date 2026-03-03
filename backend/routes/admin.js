const express = require('express');
const { body, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(protect);
router.use(adminOnly);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Admin
router.get('/dashboard', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get basic statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalComplaints = await Complaint.countDocuments({ isActive: true });
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending', isActive: true });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'in-progress', isActive: true });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved', isActive: true });
    const criticalIssues = await Complaint.countDocuments({ priority: 'critical', isActive: true });

    // Get complaints by category
    const complaintsByCategory = await Complaint.aggregate([
      { $match: { isActive: true, createdAt: { $gte: startDate } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get complaints by status
    const complaintsByStatus = await Complaint.aggregate([
      { $match: { isActive: true, createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get severity distribution
    const severityDistribution = await Complaint.aggregate([
      { $match: { isActive: true, createdAt: { $gte: startDate } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Get daily trends
    const dailyTrends = await Complaint.aggregate([
      { $match: { isActive: true, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          received: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get hotspot areas
    const hotspots = await Complaint.aggregate([
      {
        $match: {
          isActive: true,
          'location.coordinates': { $exists: true },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            latitude: '$location.coordinates.latitude',
            longitude: '$location.coordinates.longitude',
            address: '$location.address'
          },
          count: { $sum: 1 },
          categories: { $addToSet: '$category' },
          avgSeverity: { $avg: { $cond: [{ $eq: ['$priority', 'critical'] }, 4, { $cond: [{ $eq: ['$priority', 'high'] }, 3, { $cond: [{ $eq: ['$priority', 'medium'] }, 2, 1] }] } ] } }
        }
      },
      { $match: { count: { $gte: 3 } } },
      { $sort: { count: -1, avgSeverity: -1 } },
      { $limit: 10 }
    ]);

    // Get recent activity
    const recentActivity = await Complaint.find({ isActive: true })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title status priority user createdAt location.address');

    res.json({
      stats: {
        totalUsers,
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints,
        criticalIssues
      },
      analytics: {
        complaintsByCategory,
        complaintsByStatus,
        severityDistribution,
        dailyTrends,
        hotspots,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      message: 'Server error fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/admin/complaints
// @desc    Get all complaints (admin view)
// @access  Admin
router.get('/complaints', async (req, res) => {
  try {
    const { 
      status, 
      category, 
      priority, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = { isActive: true };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const complaints = await Complaint.find(filter)
      .populate('user', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(filter);

    res.json({
      complaints,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total
      }
    });
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({
      message: 'Server error fetching complaints',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/admin/complaints/:id/status
// @desc    Update complaint status
// @access  Admin
router.put('/complaints/:id/status', [
  [
    body('status')
      .isIn(['pending', 'in-progress', 'resolved', 'rejected'])
      .withMessage('Invalid status'),
    body('resolution.description')
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage('Resolution description must be at least 10 characters'),
    body('assignedTo.department')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Department name is required'),
    body('assignedTo.officer')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Officer name is required')
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

    const { status, resolution, assignedTo, estimatedResolution } = req.body;

    // Update status
    complaint.status = status;

    // Update assignment if provided
    if (assignedTo) {
      complaint.assignedTo = {
        ...assignedTo,
        assignedAt: new Date()
      };
    }

    // Update estimated resolution if provided
    if (estimatedResolution) {
      complaint.estimatedResolution = new Date(estimatedResolution);
    }

    // Update resolution if status is resolved
    if (status === 'resolved' && resolution) {
      complaint.resolution = {
        ...resolution,
        resolvedBy: req.user._id,
        resolvedAt: new Date()
      };
    }

    await complaint.save();
    await complaint.populate('user', 'name email');

    res.json({
      message: 'Complaint status updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({
      message: 'Server error updating complaint status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const { userType, page = 1, limit = 20, search } = req.query;

    // Build filter
    const filter = { isActive: true };
    if (userType) filter.userType = userType;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Server error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Activate/deactivate user
// @access  Admin
router.put('/users/:id/status', [
  [
    body('isActive')
      .isBoolean()
      .withMessage('isActive must be a boolean')
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

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot deactivate your own account'
      });
    }

    user.isActive = req.body.isActive;
    await user.save();

    res.json({
      message: `User ${req.body.isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.getProfile()
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      message: 'Server error updating user status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/admin/analytics/export
// @desc    Export analytics data
// @access  Admin
router.get('/analytics/export', async (req, res) => {
  try {
    const { format = 'json', timeRange = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get comprehensive data
    const complaints = await Complaint.find({ 
      isActive: true, 
      createdAt: { $gte: startDate } 
    })
      .populate('user', 'name email')
      .lean();

    const users = await User.find({ 
      isActive: true,
      createdAt: { $gte: startDate }
    })
      .select('-password')
      .lean();

    const exportData = {
      exportDate: new Date(),
      timeRange,
      summary: {
        totalComplaints: complaints.length,
        totalUsers: users.length,
        dateRange: {
          start: startDate,
          end: now
        }
      },
      complaints,
      users
    };

    if (format === 'csv') {
      // Convert to CSV (simplified version)
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=urban-insights-export-${Date.now()}.csv`);
      
      const csvHeader = 'ID,Title,Category,Status,Priority,User,Email,Created At\n';
      const csvData = complaints.map(c => 
        `${c.complaintId},"${c.title}",${c.category},${c.status},${c.priority},"${c.user.name}",${c.user.email},${c.createdAt}`
      ).join('\n');
      
      res.send(csvHeader + csvData);
    } else {
      res.json(exportData);
    }
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      message: 'Server error exporting analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
