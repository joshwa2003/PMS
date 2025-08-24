const mongoose = require('mongoose');

const jobViewSchema = new mongoose.Schema({
  // References
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job reference is required']
  },
  
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student reference is required']
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  
  // View Details
  viewType: {
    type: String,
    enum: {
      values: ['List View', 'Detail View', 'Quick Preview'],
      message: 'Invalid view type'
    },
    default: 'Detail View'
  },
  
  // Session Information
  sessionId: {
    type: String,
    trim: true
  },
  
  ipAddress: {
    type: String,
    trim: true
  },
  
  userAgent: {
    type: String,
    trim: true
  },
  
  // Device Information
  device: {
    type: {
      type: String,
      enum: ['Desktop', 'Mobile', 'Tablet', 'Unknown'],
      default: 'Unknown'
    },
    browser: {
      type: String,
      trim: true
    },
    os: {
      type: String,
      trim: true
    }
  },
  
  // View Duration (in seconds)
  duration: {
    type: Number,
    min: [0, 'Duration cannot be negative'],
    default: 0
  },
  
  // Interaction Details
  interactions: {
    scrolledToBottom: {
      type: Boolean,
      default: false
    },
    clickedApplyButton: {
      type: Boolean,
      default: false
    },
    clickedCompanyLink: {
      type: Boolean,
      default: false
    },
    downloadedDocuments: [{
      documentName: String,
      downloadedAt: Date
    }],
    timeSpentOnSections: {
      description: { type: Number, default: 0 },
      requirements: { type: Number, default: 0 },
      compensation: { type: Number, default: 0 },
      company: { type: Number, default: 0 }
    }
  },
  
  // Referrer Information
  referrer: {
    source: {
      type: String,
      enum: ['Direct', 'Job List', 'Search', 'Notification', 'Email', 'Other'],
      default: 'Direct'
    },
    url: {
      type: String,
      trim: true
    }
  },
  
  // Geographic Information
  location: {
    country: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    timezone: {
      type: String,
      trim: true
    }
  },
  
  // Metadata
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    default: null
  },
  
  // View Context
  context: {
    fromNotification: {
      type: Boolean,
      default: false
    },
    fromSearch: {
      type: Boolean,
      default: false
    },
    searchQuery: {
      type: String,
      trim: true
    },
    filterApplied: {
      type: Boolean,
      default: false
    },
    filters: {
      location: String,
      jobType: String,
      salaryRange: String,
      company: String
    }
  },
  
  // Timestamps
  viewedAt: {
    type: Date,
    default: Date.now
  },
  
  lastInteractionAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
jobViewSchema.index({ job: 1, student: 1 });
jobViewSchema.index({ job: 1 });
jobViewSchema.index({ student: 1 });
jobViewSchema.index({ user: 1 });
jobViewSchema.index({ department: 1 });
jobViewSchema.index({ viewedAt: -1 });
jobViewSchema.index({ sessionId: 1 });

// Compound indexes
jobViewSchema.index({ job: 1, viewedAt: -1 });
jobViewSchema.index({ student: 1, viewedAt: -1 });
jobViewSchema.index({ department: 1, viewedAt: -1 });
jobViewSchema.index({ job: 1, department: 1 });

// Virtual for engagement score (based on duration and interactions)
jobViewSchema.virtual('engagementScore').get(function() {
  let score = 0;
  
  // Base score from duration (max 40 points)
  score += Math.min(this.duration / 60, 40); // 1 point per minute, max 40
  
  // Interaction bonuses
  if (this.interactions.scrolledToBottom) score += 10;
  if (this.interactions.clickedApplyButton) score += 20;
  if (this.interactions.clickedCompanyLink) score += 5;
  if (this.interactions.downloadedDocuments.length > 0) score += 10;
  
  // Time spent on sections bonus
  const sectionTime = Object.values(this.interactions.timeSpentOnSections).reduce((a, b) => a + b, 0);
  score += Math.min(sectionTime / 30, 15); // 1 point per 30 seconds, max 15
  
  return Math.round(score);
});

// Virtual for formatted duration
jobViewSchema.virtual('formattedDuration').get(function() {
  if (this.duration < 60) {
    return `${this.duration} seconds`;
  } else if (this.duration < 3600) {
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}m ${seconds}s`;
  } else {
    const hours = Math.floor(this.duration / 3600);
    const minutes = Math.floor((this.duration % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
});

// Virtual for checking if view is recent (within last 24 hours)
jobViewSchema.virtual('isRecentView').get(function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.viewedAt > oneDayAgo;
});

// Pre-save middleware to update lastInteractionAt
jobViewSchema.pre('save', function(next) {
  if (this.isModified('interactions') || this.isModified('duration')) {
    this.lastInteractionAt = new Date();
  }
  next();
});

// Static method to get views for a job
jobViewSchema.statics.getViewsForJob = function(jobId, options = {}) {
  const query = this.find({ job: jobId });
  
  if (options.department) {
    query.where({ department: options.department });
  }
  
  if (options.dateRange) {
    query.where({
      viewedAt: {
        $gte: options.dateRange.start,
        $lte: options.dateRange.end
      }
    });
  }
  
  return query
    .populate('student', 'personalInfo.fullName studentId')
    .populate('user', 'firstName lastName email')
    .populate('department', 'name code')
    .sort({ viewedAt: -1 });
};

// Static method to get views for a student
jobViewSchema.statics.getViewsForStudent = function(studentId, options = {}) {
  const query = this.find({ student: studentId });
  
  if (options.dateRange) {
    query.where({
      viewedAt: {
        $gte: options.dateRange.start,
        $lte: options.dateRange.end
      }
    });
  }
  
  return query
    .populate('job', 'title company.name deadline status')
    .sort({ viewedAt: -1 });
};

// Static method to get job view analytics
jobViewSchema.statics.getJobViewAnalytics = function(jobId) {
  return this.aggregate([
    { $match: { job: new mongoose.Types.ObjectId(jobId) } },
    {
      $group: {
        _id: null,
        totalViews: { $sum: 1 },
        uniqueStudents: { $addToSet: '$student' },
        avgDuration: { $avg: '$duration' },
        avgEngagementScore: { $avg: '$engagementScore' },
        totalScrolledToBottom: {
          $sum: { $cond: ['$interactions.scrolledToBottom', 1, 0] }
        },
        totalClickedApply: {
          $sum: { $cond: ['$interactions.clickedApplyButton', 1, 0] }
        },
        totalClickedCompany: {
          $sum: { $cond: ['$interactions.clickedCompanyLink', 1, 0] }
        },
        viewsByDevice: {
          $push: '$device.type'
        },
        viewsByHour: {
          $push: { $hour: '$viewedAt' }
        }
      }
    },
    {
      $project: {
        totalViews: 1,
        uniqueStudentCount: { $size: '$uniqueStudents' },
        avgDuration: { $round: ['$avgDuration', 2] },
        avgEngagementScore: { $round: ['$avgEngagementScore', 2] },
        scrollCompletionRate: {
          $multiply: [
            { $divide: ['$totalScrolledToBottom', '$totalViews'] },
            100
          ]
        },
        applyClickRate: {
          $multiply: [
            { $divide: ['$totalClickedApply', '$totalViews'] },
            100
          ]
        },
        companyClickRate: {
          $multiply: [
            { $divide: ['$totalClickedCompany', '$totalViews'] },
            100
          ]
        },
        deviceDistribution: '$viewsByDevice',
        hourlyDistribution: '$viewsByHour'
      }
    }
  ]);
};

// Static method to get department-wise view statistics
jobViewSchema.statics.getDepartmentViewStats = function(jobId) {
  return this.aggregate([
    { $match: { job: new mongoose.Types.ObjectId(jobId) } },
    {
      $group: {
        _id: '$department',
        totalViews: { $sum: 1 },
        uniqueStudents: { $addToSet: '$student' },
        avgDuration: { $avg: '$duration' },
        avgEngagementScore: { $avg: '$engagementScore' },
        recentViews: {
          $sum: {
            $cond: [
              { $gte: ['$viewedAt', new Date(Date.now() - 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'department'
      }
    },
    { $unwind: '$department' },
    {
      $project: {
        departmentName: '$department.name',
        departmentCode: '$department.code',
        totalViews: 1,
        uniqueStudentCount: { $size: '$uniqueStudents' },
        avgDuration: { $round: ['$avgDuration', 2] },
        avgEngagementScore: { $round: ['$avgEngagementScore', 2] },
        recentViews: 1,
        viewsPerStudent: {
          $round: [
            { $divide: ['$totalViews', { $size: '$uniqueStudents' }] },
            2
          ]
        }
      }
    },
    { $sort: { totalViews: -1 } }
  ]);
};

// Instance method to update interaction
jobViewSchema.methods.updateInteraction = function(interactionType, data = {}) {
  switch (interactionType) {
    case 'scrolledToBottom':
      this.interactions.scrolledToBottom = true;
      break;
    case 'clickedApplyButton':
      this.interactions.clickedApplyButton = true;
      break;
    case 'clickedCompanyLink':
      this.interactions.clickedCompanyLink = true;
      break;
    case 'downloadedDocument':
      this.interactions.downloadedDocuments.push({
        documentName: data.documentName,
        downloadedAt: new Date()
      });
      break;
    case 'sectionTime':
      if (data.section && data.time) {
        this.interactions.timeSpentOnSections[data.section] = data.time;
      }
      break;
  }
  
  this.lastInteractionAt = new Date();
  return this.save();
};

// Instance method to update duration
jobViewSchema.methods.updateDuration = function(newDuration) {
  this.duration = Math.max(this.duration, newDuration);
  this.lastInteractionAt = new Date();
  return this.save();
};

module.exports = mongoose.model('JobView', jobViewSchema);
