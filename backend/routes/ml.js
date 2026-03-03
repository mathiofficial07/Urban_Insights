const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const axios = require('axios');
const Complaint = require('../models/Complaint');

const router = express.Router();

// @route   POST /api/ml/predict
// @desc    Get ML predictions for a complaint
// @access  Private
router.post('/predict', protect, async (req, res) => {
  try {
    const { text, category, location } = req.body;

    if (!text || !category || !location) {
      return res.status(400).json({
        message: 'Text, category, and location are required'
      });
    }

    try {
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
        text,
        category,
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      });

      res.json({
        success: true,
        predictions: mlResponse.data
      });
    } catch (mlError) {
      console.error('ML service error:', mlError);
      res.status(503).json({
        message: 'ML service is currently unavailable',
        error: mlError.message
      });
    }
  } catch (error) {
    console.error('ML predict error:', error);
    res.status(500).json({
      message: 'Server error processing ML prediction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/ml/cluster
// @desc    Get hotspot clusters
// @access  Private
router.post('/cluster', protect, async (req, res) => {
  try {
    const { radius = 1000, minComplaints = 3 } = req.body;

    try {
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/cluster`, {
        radius,
        minComplaints
      });

      res.json({
        success: true,
        clusters: mlResponse.data
      });
    } catch (mlError) {
      console.error('ML cluster error:', mlError);
      
      // Fallback to basic clustering using MongoDB
      const hotspots = await Complaint.aggregate([
        {
          $match: {
            isActive: true,
            'location.coordinates': { $exists: true }
          }
        },
        {
          $group: {
            _id: {
              // Group by approximate coordinates (rounding to create clusters)
              lat: { $round: ['$location.coordinates.latitude', 3] },
              lng: { $round: ['$location.coordinates.longitude', 3] }
            },
            count: { $sum: 1 },
            complaints: {
              $push: {
                id: '$complaintId',
                title: '$title',
                category: '$category',
                priority: '$priority',
                address: '$location.address'
              }
            },
            avgSeverity: { $avg: { $cond: [{ $eq: ['$priority', 'critical'] }, 4, { $cond: [{ $eq: ['$priority', 'high'] }, 3, { $cond: [{ $eq: ['$priority', 'medium'] }, 2, 1] }] } ] } },
            center: {
              $avg: {
                $map: {
                  input: ['$location.coordinates.latitude', '$location.coordinates.longitude'],
                  as: 'coord',
                  in: '$$coord'
                }
              }
            }
          }
        },
        { $match: { count: { $gte: minComplaints } } },
        { $sort: { count: -1, avgSeverity: -1 } },
        { $limit: 20 }
      ]);

      res.json({
        success: true,
        clusters: hotspots.map((hotspot, index) => ({
          clusterId: index + 1,
          center: {
            latitude: hotspot._id.lat,
            longitude: hotspot._id.lng
          },
          count: hotspot.count,
          avgSeverity: hotspot.avgSeverity,
          complaints: hotspot.complaints,
          hotspotScore: hotspot.count * hotspot.avgSeverity
        }))
      });
    }
  } catch (error) {
    console.error('ML cluster error:', error);
    res.status(500).json({
      message: 'Server error processing cluster analysis',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/ml/train
// @desc    Train ML models with existing data
// @access  Admin
router.post('/train', [protect, adminOnly], async (req, res) => {
  try {
    const { modelType = 'all' } = req.body;

    // Get training data from database
    const complaints = await Complaint.find({ 
      isActive: true,
      status: { $in: ['resolved', 'rejected'] }
    })
      .select('title description category priority mlPredictions location.coordinates')
      .lean();

    if (complaints.length < 100) {
      return res.status(400).json({
        message: 'Insufficient data for training. Need at least 100 resolved complaints.'
      });
    }

    // Prepare training data
    const trainingData = complaints.map(complaint => ({
      text: `${complaint.title} ${complaint.description}`,
      category: complaint.category,
      priority: complaint.priority,
      location: complaint.location.coordinates,
      actualCategory: complaint.category,
      actualPriority: complaint.priority
    }));

    try {
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/train`, {
        data: trainingData,
        modelType
      });

      res.json({
        success: true,
        message: 'Models trained successfully',
        results: mlResponse.data,
        dataPoints: trainingData.length
      });
    } catch (mlError) {
      console.error('ML training error:', mlError);
      res.status(503).json({
        message: 'ML service training failed',
        error: mlError.message
      });
    }
  } catch (error) {
    console.error('Train models error:', error);
    res.status(500).json({
      message: 'Server error training models',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/ml/models/status
// @desc    Get ML models status
// @access  Admin
router.get('/models/status', [protect, adminOnly], async (req, res) => {
  try {
    try {
      const mlResponse = await axios.get(`${process.env.ML_SERVICE_URL}/models/status`);
      
      res.json({
        success: true,
        models: mlResponse.data
      });
    } catch (mlError) {
      console.error('ML status check error:', mlError);
      res.status(503).json({
        message: 'ML service is currently unavailable',
        error: mlError.message
      });
    }
  } catch (error) {
    console.error('Models status error:', error);
    res.status(500).json({
      message: 'Server error checking models status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/ml/batch-predict
// @desc    Batch predict for existing complaints
// @access  Admin
router.post('/batch-predict', [protect, adminOnly], async (req, res) => {
  try {
    const { complaintIds, forceUpdate = false } = req.body;

    let complaints;
    if (complaintIds && complaintIds.length > 0) {
      complaints = await Complaint.find({ 
        _id: { $in: complaintIds },
        isActive: true 
      });
    } else {
      // Get complaints without ML predictions or with old predictions
      const dateThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      complaints = await Complaint.find({
        isActive: true,
        $or: [
          { 'mlPredictions.category.processedAt': { $lt: dateThreshold } },
          { 'mlPredictions.category.processedAt': { $exists: false } }
        ]
      });
    }

    if (complaints.length === 0) {
      return res.json({
        message: 'No complaints found for batch prediction',
        processed: 0
      });
    }

    let processed = 0;
    let errors = 0;

    for (const complaint of complaints) {
      try {
        const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
          text: `${complaint.title} ${complaint.description}`,
          category: complaint.category,
          location: complaint.location.coordinates
        });

        if (mlResponse.data) {
          complaint.mlPredictions = {
            category: mlResponse.data.category,
            severity: mlResponse.data.severity,
            cluster: mlResponse.data.cluster
          };
          await complaint.save();
          processed++;
        }
      } catch (error) {
        console.error(`Error processing complaint ${complaint.complaintId}:`, error);
        errors++;
      }
    }

    res.json({
      message: 'Batch prediction completed',
      processed,
      errors,
      total: complaints.length
    });
  } catch (error) {
    console.error('Batch predict error:', error);
    res.status(500).json({
      message: 'Server error during batch prediction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/ml/analytics/patterns
// @desc    Get complaint patterns and insights
// @access  Admin
router.get('/analytics/patterns', [protect, adminOnly], async (req, res) => {
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

    try {
      const mlResponse = await axios.get(`${process.env.ML_SERVICE_URL}/analytics/patterns`, {
        params: { startDate: startDate.toISOString(), endDate: now.toISOString() }
      });

      res.json({
        success: true,
        patterns: mlResponse.data
      });
    } catch (mlError) {
      console.error('ML patterns error:', mlError);
      
      // Fallback to basic pattern analysis
      const patterns = await Complaint.aggregate([
        { $match: { isActive: true, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              category: '$category',
              hour: { $hour: '$createdAt' },
              dayOfWeek: { $dayOfWeek: '$createdAt' }
            },
            count: { $sum: 1 },
            avgResolutionTime: {
              $avg: {
                $cond: [
                  { $eq: ['$status', 'resolved'] },
                  '$resolution.timeToResolve',
                  null
                ]
              }
            }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 50 }
      ]);

      res.json({
        success: true,
        patterns: {
          timePatterns: patterns,
          summary: {
            totalPatterns: patterns.length,
            dateRange: { start: startDate, end: now }
          }
        }
      });
    }
  } catch (error) {
    console.error('Analytics patterns error:', error);
    res.status(500).json({
      message: 'Server error analyzing patterns',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
