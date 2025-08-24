const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
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
  
  // Application Status
  status: {
    type: String,
    enum: {
      values: ['Applied', 'Not Applied', 'Pending Response'],
      message: 'Invalid application status'
    },
    default: 'Pending Response'
  },
  
  // Application Details
  appliedAt: {
    type: Date,
    default: null
  },
  
  responseAt: {
    type: Date,
    default: null
  },
  
  // Student Response (after visiting external link)
  studentResponse: {
    applied: {
      type: Boolean,
      default: null // null means no response yet
    },
    responseDate: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  
  // Application Journey Tracking
  journey: [{
    action: {
      type: String,
      enum: ['Viewed', 'Clicked Apply', 'Visited External Link', 'Responded', 'Updated'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
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
    }
  }],
  
  // External Application Tracking
  externalApplication: {
    linkClicked: {
      type: Boolean,
      default: false
    },
    linkClickedAt: {
      type: Date,
      default: null
    },
    clickCount: {
      type: Number,
      default: 0
    },
    lastClickedAt: {
      type: Date,
      default: null
    }
  },
  
  // Eligibility Check Results
  eligibilityCheck: {
    isEligible: {
      type: Boolean,
      required: true
    },
    checkedAt: {
      type: Date,
      default: Date.now
    },
    reasons: [{
      type: String,
      trim: true
    }],
    criteria: {
      cgpa: {
        required: Number,
        student: Number,
        passed: Boolean
      },
      backlogs: {
        maxAllowed: Number,
        student: Number,
        passed: Boolean
      },
      department: {
        required: [String],
        student: String,
        passed: Boolean
      }
    }
  },
  
  // Notification Tracking
  notifications: {
    jobPosted: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date,
        default: null
      }
    },
    deadlineReminder: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date,
        default: null
      }
    },
    responseReminder: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date,
        default: null
      }
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
  
  // System Fields
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
jobApplicationSchema.index({ job: 1, student: 1 }, { unique: true }); // Prevent duplicate applications
jobApplicationSchema.index({ job: 1 });
jobApplicationSchema.index({ student: 1 });
jobApplicationSchema.index({ user: 1 });
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ department: 1 });
jobApplicationSchema.index({ appliedAt: -1 });
jobApplicationSchema.index({ responseAt: -1 });
jobApplicationSchema.index({ createdAt: -1 });

// Compound indexes
jobApplicationSchema.index({ job: 1, status: 1 });
jobApplicationSchema.index({ job: 1, department: 1 });
jobApplicationSchema.index({ student: 1, status: 1 });
jobApplicationSchema.index({ department: 1, status: 1 });

// Virtual for response time (how long it took student to respond)
jobApplicationSchema.virtual('responseTime').get(function() {
  if (!this.responseAt || !this.createdAt) return null;
  return this.responseAt - this.createdAt; // milliseconds
});

// Virtual for formatted response time
jobApplicationSchema.virtual('formattedResponseTime').get(function() {
  const responseTime = this.responseTime;
  if (!responseTime) return 'No response';
  
  const hours = Math.floor(responseTime / (1000 * 60 * 60));
  const minutes = Math.floor((responseTime % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
});

// Virtual for checking if response is pending
jobApplicationSchema.virtual('isResponsePending').get(function() {
  return this.status === 'Pending Response' && this.studentResponse.applied === null;
});

// Virtual for checking if student clicked apply link
jobApplicationSchema.virtual('hasClickedApplyLink').get(function() {
  return this.externalApplication.linkClicked;
});

// Pre-save middleware to update timestamps
jobApplicationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set responseAt when student responds
  if (this.isModified('studentResponse.applied') && this.studentResponse.applied !== null) {
    this.responseAt = new Date();
    this.studentResponse.responseDate = new Date();
    
    // Update status based on response
    this.status = this.studentResponse.applied ? 'Applied' : 'Not Applied';
  }
  
  // Set appliedAt when status changes to Applied
  if (this.isModified('status') && this.status === 'Applied' && !this.appliedAt) {
    this.appliedAt = new Date();
  }
  
  next();
});

// Static method to get applications for a job
jobApplicationSchema.statics.getApplicationsForJob = function(jobId, options = {}) {
  const query = this.find({ job: jobId });
  
  if (options.status) {
    query.where({ status: options.status });
  }
  
  if (options.department) {
    query.where({ department: options.department });
  }
  
  return query
    .populate('student', 'personalInfo.fullName studentId academic.cgpa academic.backlogs')
    .populate('user', 'firstName lastName email')
    .populate('department', 'name code')
    .sort({ createdAt: -1 });
};

// Static method to get applications for a student
jobApplicationSchema.statics.getApplicationsForStudent = function(studentId, options = {}) {
  const query = this.find({ student: studentId });
  
  if (options.status) {
    query.where({ status: options.status });
  }
  
  return query
    .populate('job', 'title company.name deadline status')
    .populate('department', 'name code')
    .sort({ createdAt: -1 });
};

// Static method to get department-wise statistics for a job
jobApplicationSchema.statics.getDepartmentStatsForJob = function(jobId) {
  return this.aggregate([
    { $match: { job: new mongoose.Types.ObjectId(jobId) } },
    {
      $group: {
        _id: '$department',
        totalStudents: { $sum: 1 },
        appliedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'Applied'] }, 1, 0] }
        },
        notAppliedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'Not Applied'] }, 1, 0] }
        },
        pendingCount: {
          $sum: { $cond: [{ $eq: ['$status', 'Pending Response'] }, 1, 0] }
        },
        avgResponseTime: { $avg: '$responseTime' }
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
        totalStudents: 1,
        appliedCount: 1,
        notAppliedCount: 1,
        pendingCount: 1,
        applicationRate: {
          $multiply: [
            { $divide: ['$appliedCount', '$totalStudents'] },
            100
          ]
        },
        avgResponseTimeHours: {
          $divide: ['$avgResponseTime', 3600000] // Convert ms to hours
        }
      }
    },
    { $sort: { departmentName: 1 } }
  ]);
};

// Instance method to add journey entry
jobApplicationSchema.methods.addJourneyEntry = function(action, details = '', metadata = {}) {
  this.journey.push({
    action,
    details,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
    timestamp: new Date()
  });
  
  return this.save();
};

// Instance method to record external link click
jobApplicationSchema.methods.recordLinkClick = function(metadata = {}) {
  this.externalApplication.linkClicked = true;
  this.externalApplication.clickCount += 1;
  this.externalApplication.lastClickedAt = new Date();
  
  if (!this.externalApplication.linkClickedAt) {
    this.externalApplication.linkClickedAt = new Date();
  }
  
  // Add journey entry
  this.addJourneyEntry('Visited External Link', 'Student clicked on application link', metadata);
  
  return this.save();
};

// Instance method to record student response
jobApplicationSchema.methods.recordStudentResponse = function(applied, notes = '', metadata = {}) {
  this.studentResponse.applied = applied;
  this.studentResponse.notes = notes;
  this.studentResponse.responseDate = new Date();
  
  // Add journey entry
  const action = applied ? 'Applied' : 'Not Applied';
  this.addJourneyEntry('Responded', `Student responded: ${action}`, metadata);
  
  return this.save();
};

// Instance method to check if student can still respond
jobApplicationSchema.methods.canStudentRespond = function() {
  // Check if job is still active and not expired
  if (!this.job || this.job.status !== 'Active' || this.job.deadline < new Date()) {
    return { canRespond: false, reason: 'Job is no longer active or has expired' };
  }
  
  // Check if student has already responded
  if (this.studentResponse.applied !== null) {
    return { canRespond: false, reason: 'Student has already responded' };
  }
  
  return { canRespond: true, reason: null };
};

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
