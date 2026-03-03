const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true,
    default: function () {
      return 'CMP' + Date.now().toString(36).toUpperCase();
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Infrastructure',
      'Sanitation',
      'Water Supply',
      'Electricity',
      'Roads',
      'Public Safety',
      'Noise Pollution',
      'Other'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'rejected', 'closed'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved', 'rejected', 'closed'],
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      maxlength: 500
    }
  }],
  adminNote: {
    type: String,
    maxlength: 1000
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: {
    type: String,
    enum: ['water', 'electricity', 'roads', 'sanitation', 'general'],
    default: 'general'
  },
  location: {
    address: {
      type: String,
      required: [true, 'Location address is required']
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      }
    },
    landmark: String
  },
  images: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  mlPredictions: {
    category: {
      predicted: String,
      confidence: Number,
      processedAt: Date
    },
    severity: {
      predicted: String,
      confidence: Number,
      riskScore: Number,
      processedAt: Date
    },
    cluster: {
      clusterId: Number,
      hotspotScore: Number,
      processedAt: Date
    },
    nlpInsights: {
      keywords: [String],
      sentiment: String,
      sentimentScore: Number
    },
    suggestedResolution: {
      action: String,
      confidence: Number
    }
  },
  assignedAt: Date,
  resolution: {
    description: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    timeToResolve: Number // in hours
  },
  estimatedResolution: Date,
  followUps: [{
    message: String,
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    at: {
      type: Date,
      default: Date.now
    }
  }],
  upvotes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
complaintSchema.index({ user: 1, status: 1 });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ 'location.coordinates': '2dsphere' });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ priority: 1, status: 1 });

// Generate complaint ID before saving
complaintSchema.pre('save', function (next) {
  if (this.isNew && !this.complaintId) {
    this.complaintId = 'CMP' + Date.now().toString(36).toUpperCase();
  }
  next();
});

// Calculate resolution time when resolved
complaintSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolution.timeToResolve) {
    if (this.createdAt) {
      const diffInMs = new Date() - this.createdAt;
      this.resolution.timeToResolve = Math.ceil(diffInMs / (1000 * 60 * 60)); // Convert to hours
    }
  }
  next();
});

// Static methods
complaintSchema.statics.getByUser = function (userId, options = {}) {
  const query = { user: userId, isActive: true };

  if (options.status) {
    query.status = options.status;
  }

  if (options.category) {
    query.category = options.category;
  }

  return this.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

complaintSchema.statics.getHotspots = function (radius = 1000) {
  return this.aggregate([
    {
      $match: {
        isActive: true,
        'location.coordinates': { $exists: true }
      }
    },
    {
      $group: {
        _id: {
          $geoNear: {
            near: { type: "Point", coordinates: [0, 0] },
            distanceField: "distance",
            maxDistance: radius,
            spherical: true
          }
        },
        count: { $sum: 1 },
        avgSeverity: { $avg: "$mlPredictions.severity.riskScore" },
        categories: { $addToSet: "$category" }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
};

// Instance methods
complaintSchema.methods.addFollowUp = function (message, userId) {
  this.followUps.push({
    message,
    by: userId,
    at: new Date()
  });
  return this.save();
};

complaintSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

complaintSchema.methods.upvote = function () {
  this.upvotes += 1;
  return this.save();
};

module.exports = mongoose.model('Complaint', complaintSchema);
