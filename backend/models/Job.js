const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // Basic Job Information
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Job title cannot exceed 200 characters']
  },
  
  // Company Information
  company: {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    logo: {
      type: String, // URL to company logo (Supabase storage)
      default: null
    },
    website: {
      type: String,
      trim: true
    },
    about: {
      type: String,
      trim: true,
      maxlength: [2000, 'Company description cannot exceed 2000 characters']
    },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [100, 'Industry cannot exceed 100 characters']
    },
    founded: {
      type: Number,
      min: [1800, 'Invalid founding year']
    }
  },

  // Job Details
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    maxlength: [10000, 'Job description cannot exceed 10000 characters']
  },
  
  // Key Responsibilities
  keyResponsibilities: [{
    type: String,
    trim: true,
    maxlength: [500, 'Each responsibility cannot exceed 500 characters']
  }],
  
  // Requirements
  requirements: [{
    type: String,
    trim: true,
    maxlength: [500, 'Each requirement cannot exceed 500 characters']
  }],
  
  // Skills Required
  skillsRequired: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each skill cannot exceed 50 characters']
  }],
  
  // Other Requirements
  otherRequirements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each other requirement cannot exceed 200 characters']
  }],
  
  location: {
    type: String,
    required: [true, 'Job location is required'],
    trim: true,
    maxlength: [200, 'Job location cannot exceed 200 characters']
  },
  
  workMode: {
    type: String,
    enum: {
      values: ['Work from office', 'Work from home', 'Hybrid'],
      message: 'Invalid work mode'
    },
    default: 'Work from office'
  },
  
  jobType: {
    type: String,
    enum: {
      values: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'],
      message: 'Invalid job type'
    },
    default: 'Full-time'
  },
  
  // Start Date
  startDate: {
    type: String,
    enum: {
      values: ['Immediately', 'Within 1 month', 'Within 2 months', 'Within 3 months', 'Flexible'],
      message: 'Invalid start date option'
    },
    default: 'Immediately'
  },
  
  // Application Information
  applicationLink: {
    type: String,
    required: [true, 'Application link is required'],
    trim: true
  },
  
  deadline: {
    type: Date,
    required: [true, 'Application deadline is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  
  // Compensation
  salary: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    period: {
      type: String,
      default: 'Annual',
      enum: ['Annual', 'Monthly', 'Hourly']
    }
  },
  
  stipend: {
    amount: {
      type: Number,
      min: [0, 'Stipend amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    period: {
      type: String,
      default: 'Monthly',
      enum: ['Monthly', 'Weekly', 'Daily']
    }
  },
  
  // Probation Details (for internships/jobs)
  probation: {
    hasProbation: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number, // in months
      min: [1, 'Probation duration must be at least 1 month'],
      max: [12, 'Probation duration cannot exceed 12 months']
    },
    salary: {
      min: {
        type: Number,
        min: [0, 'Probation salary cannot be negative']
      },
      max: {
        type: Number,
        min: [0, 'Probation salary cannot be negative']
      },
      currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR', 'GBP']
      },
      period: {
        type: String,
        default: 'Monthly',
        enum: ['Monthly', 'Weekly', 'Daily']
      }
    }
  },
  
  // Number of Openings
  numberOfOpenings: {
    type: Number,
    required: [true, 'Number of openings is required'],
    min: [1, 'Number of openings must be at least 1'],
    default: 1
  },
  
  // Work Environment Requirements
  workEnvironmentRequirements: [{
    type: String,
    trim: true,
    maxlength: [300, 'Each work environment requirement cannot exceed 300 characters']
  }],
  
  // Benefits/Perks
  benefits: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each benefit cannot exceed 200 characters']
  }],
  
  // Education Qualifications
  educationQualifications: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each education qualification cannot exceed 200 characters']
  }],
  
  // Eligibility Criteria
  eligibility: {
    departments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    }],
    minCGPA: {
      type: Number,
      min: [0, 'Minimum CGPA cannot be negative'],
      max: [10, 'Maximum CGPA cannot exceed 10']
    },
    maxBacklogs: {
      type: Number,
      min: [0, 'Maximum backlogs cannot be negative'],
      default: 0
    },
    graduationYears: [{
      type: Number,
      min: [2020, 'Invalid graduation year']
    }],
    skills: [{
      type: String,
      trim: true
    }],
    experience: {
      min: {
        type: Number,
        min: [0, 'Minimum experience cannot be negative'],
        default: 0
      },
      max: {
        type: Number,
        min: [0, 'Maximum experience cannot be negative']
      }
    }
  },
  
  // Job Status
  status: {
    type: String,
    enum: {
      values: ['Draft', 'Active', 'Closed', 'Expired'],
      message: 'Invalid job status'
    },
    default: 'Draft'
  },
  
  // Posting Configuration
  postingType: {
    type: String,
    enum: {
      values: ['All Departments', 'Selected Departments', 'Single Department'],
      message: 'Invalid posting type'
    },
    required: [true, 'Posting type is required']
  },
  
  targetDepartments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  
  // Additional Documents
  documents: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Job Statistics (for analytics)
  stats: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalApplications: {
      type: Number,
      default: 0
    },
    departmentWiseStats: [{
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
      },
      views: {
        type: Number,
        default: 0
      },
      applications: {
        type: Number,
        default: 0
      }
    }]
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  publishedAt: {
    type: Date,
    default: null
  },
  
  closedAt: {
    type: Date,
    default: null
  },
  
  // Notification Settings
  notifications: {
    emailSent: {
      type: Boolean,
      default: false
    },
    emailSentAt: {
      type: Date,
      default: null
    },
    reminderSent: {
      type: Boolean,
      default: false
    },
    reminderSentAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
jobSchema.index({ status: 1 });
jobSchema.index({ deadline: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ publishedAt: -1 });
jobSchema.index({ 'company.name': 1 });
jobSchema.index({ title: 1 });
jobSchema.index({ targetDepartments: 1 });
jobSchema.index({ createdBy: 1 });
jobSchema.index({ 'eligibility.departments': 1 });

// Compound indexes
jobSchema.index({ status: 1, deadline: 1 });
jobSchema.index({ status: 1, createdAt: -1 });

// Virtual for checking if job is expired
jobSchema.virtual('isExpired').get(function() {
  return this.deadline < new Date();
});

// Virtual for checking if job is active and not expired
jobSchema.virtual('isActiveAndValid').get(function() {
  return this.status === 'Active' && !this.isExpired;
});

// Virtual for days remaining until deadline
jobSchema.virtual('daysUntilDeadline').get(function() {
  if (this.isExpired) return 0;
  const diffTime = this.deadline - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for formatted salary range
jobSchema.virtual('formattedSalary').get(function() {
  if (!this.salary.min && !this.salary.max) return 'Not specified';
  
  const formatAmount = (amount) => {
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toString();
  };
  
  if (this.salary.min && this.salary.max) {
    return `${formatAmount(this.salary.min)} - ${formatAmount(this.salary.max)} ${this.salary.currency}`;
  } else if (this.salary.min) {
    return `${formatAmount(this.salary.min)}+ ${this.salary.currency}`;
  } else if (this.salary.max) {
    return `Up to ${formatAmount(this.salary.max)} ${this.salary.currency}`;
  }
  
  return 'Not specified';
});

// Pre-save middleware to auto-expire jobs
jobSchema.pre('save', function(next) {
  if (this.deadline < new Date() && this.status === 'Active') {
    this.status = 'Expired';
    this.closedAt = new Date();
  }
  next();
});

// Pre-save middleware to set publishedAt when status changes to Active
jobSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'Active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Static method to get active jobs for a department
jobSchema.statics.getActiveJobsForDepartment = function(departmentId) {
  return this.find({
    status: 'Active',
    deadline: { $gt: new Date() },
    $or: [
      { postingType: 'All Departments' },
      { targetDepartments: departmentId },
      { 'eligibility.departments': departmentId }
    ]
  }).populate('targetDepartments', 'name code')
    .populate('eligibility.departments', 'name code')
    .populate('createdBy', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Static method to get jobs created by a user
jobSchema.statics.getJobsByCreator = function(userId) {
  return this.find({ createdBy: userId })
    .populate('targetDepartments', 'name code')
    .populate('eligibility.departments', 'name code')
    .sort({ createdAt: -1 });
};

// Instance method to increment view count
jobSchema.methods.incrementViewCount = function(departmentId = null) {
  this.stats.totalViews += 1;
  
  if (departmentId) {
    const deptStat = this.stats.departmentWiseStats.find(
      stat => stat.department.toString() === departmentId.toString()
    );
    
    if (deptStat) {
      deptStat.views += 1;
    } else {
      this.stats.departmentWiseStats.push({
        department: departmentId,
        views: 1,
        applications: 0
      });
    }
  }
  
  return this.save();
};

// Instance method to increment application count
jobSchema.methods.incrementApplicationCount = function(departmentId = null) {
  this.stats.totalApplications += 1;
  
  if (departmentId) {
    const deptStat = this.stats.departmentWiseStats.find(
      stat => stat.department.toString() === departmentId.toString()
    );
    
    if (deptStat) {
      deptStat.applications += 1;
    } else {
      this.stats.departmentWiseStats.push({
        department: departmentId,
        views: 0,
        applications: 1
      });
    }
  }
  
  return this.save();
};

// Instance method to check if student is eligible
jobSchema.methods.isStudentEligible = function(student) {
  const eligibility = this.eligibility;
  
  // Check department eligibility
  if (eligibility.departments && eligibility.departments.length > 0) {
    const studentDeptId = student.userId?.department || student.academic?.department;
    if (!eligibility.departments.some(dept => dept.toString() === studentDeptId?.toString())) {
      return { eligible: false, reason: 'Department not eligible' };
    }
  }
  
  // Check CGPA requirement
  if (eligibility.minCGPA && student.academic?.cgpa < eligibility.minCGPA) {
    return { eligible: false, reason: `Minimum CGPA required: ${eligibility.minCGPA}` };
  }
  
  // Check backlogs
  if (eligibility.maxBacklogs !== undefined && student.academic?.backlogs > eligibility.maxBacklogs) {
    return { eligible: false, reason: `Maximum ${eligibility.maxBacklogs} backlogs allowed` };
  }
  
  return { eligible: true, reason: null };
};

module.exports = mongoose.model('Job', jobSchema);
