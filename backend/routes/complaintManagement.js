const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

const router = express.Router();

// @route   PUT /api/complaints/:id/status
// @desc    Update complaint status (Admin only)
// @access  Private (Admin only)
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote, priority } = req.body;

    // Find the complaint
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'resolved', 'closed', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
      });
    }

    // Store old status for history
    const oldStatus = complaint.status;
    const oldPriority = complaint.priority;

    // Update complaint
    if (status) complaint.status = status;
    if (adminNote) complaint.adminNote = adminNote;
    if (priority) complaint.priority = priority;

    // Add status change to history
    complaint.statusHistory.push({
      status: status || oldStatus,
      changedBy: req.user._id,
      changedAt: new Date(),
      note: adminNote || `Status updated from ${oldStatus} to ${status || oldStatus}`
    });

    // If status is resolved, set resolvedAt
    if (status === 'resolved' && oldStatus !== 'resolved') {
      complaint.resolvedAt = new Date();
    }

    // If status is being reopened, clear resolvedAt
    if (status !== 'resolved' && oldStatus === 'resolved') {
      complaint.resolvedAt = null;
    }

    await complaint.save();

    // Populate user information for response
    await complaint.populate('user', 'name email');

    // Create notification for user (you can implement this later)
    // await createNotification(complaint.userId, {
    //   type: 'status_update',
    //   complaintId: complaint._id,
    //   message: `Your complaint status has been updated to ${status}`
    // });

    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      complaint: {
        ...complaint.toObject(),
        oldStatus,
        newStatus: complaint.status
      }
    });

  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating complaint status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/complaints/management/all
// @desc    Get all complaints with detailed info for management
// @access  Private (Admin only)
router.get('/management/all', protect, adminOnly, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get complaints with pagination
    const complaints = await Complaint.find(filter)
      .populate('user', 'name email phone')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await Complaint.countDocuments(filter);

    // Get statistics
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      success: true,
      complaints,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      stats: statusStats
    });

  } catch (error) {
    console.error('Error fetching management complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/complaints/:id/history
// @desc    Get detailed complaint history
// @access  Private (Admin only)
router.get('/:id/history', protect, adminOnly, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('statusHistory.changedBy', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      complaint: {
        ...complaint.toObject(),
        statusHistory: complaint.statusHistory.reverse() // Most recent first
      }
    });

  } catch (error) {
    console.error('Error fetching complaint history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/complaints/:id/assign
// @desc    Assign complaint to staff member
// @access  Private (Admin only)
router.post('/:id/assign', protect, adminOnly, async (req, res) => {
  try {
    const { assignedTo, department } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Update assignment
    complaint.assignedTo = assignedTo;
    complaint.department = department;
    complaint.status = 'in-progress';

    // Add to history
    complaint.statusHistory.push({
      status: 'in-progress',
      changedBy: req.user._id,
      changedAt: new Date(),
      note: `Assigned to ${department || 'staff member'}`
    });

    await complaint.save();

    res.json({
      success: true,
      message: 'Complaint assigned successfully',
      complaint
    });

  } catch (error) {
    console.error('Error assigning complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/complaints/bulk-update
// @desc    Bulk update multiple complaints
// @access  Private (Admin only)
router.post('/bulk-update', protect, adminOnly, async (req, res) => {
  try {
    const { complaintIds, updates } = req.body;

    if (!complaintIds || !Array.isArray(complaintIds) || complaintIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Complaint IDs are required'
      });
    }

    const { status, priority, department } = updates;

    // Update all complaints
    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (department) updateData.department = department;

    // Add status change to history for each complaint
    const bulkOps = complaintIds.map(id => ({
      updateOne: {
        filter: { _id: id },
        update: {
          $set: updateData,
          $push: {
            statusHistory: {
              status: status || 'updated',
              changedBy: req.user._id,
              changedAt: new Date(),
              note: `Bulk update: ${Object.keys(updates).join(', ')}`
            }
          }
        }
      }
    }));

    const result = await Complaint.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} complaints successfully`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing bulk update',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
