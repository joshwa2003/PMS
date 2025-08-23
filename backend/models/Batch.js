const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  // Batch identification
  batchCode: {
    type: String,
    required: [true, 'Batch code is required'],
    unique: true,
    trim: true,
    // Format: "2024-2026", "2024-2028"
    match: [/^\d{4}-\d{4}$/, 'Batch code must be in format YYYY-YYYY']
  },
  
  // Academic years
  startYear: {
    type: Number,
    required: [true, 'Start year is required'],
    min: [2020, 'Start year must be 2020 or later'],
    max: [2050, 'Start year must be 2050 or earlier']
  },
  
  endYear: {
    type: Number,
    required: [true, 'End year is required'],
    min: [2022, 'End year must be 2022 or later'],
    max: [2055, 'End year must be 2055 or earlier']
  },
  
  // Course information
  courseType: {
    type: String,
    required: [true, 'Course type is required'],
    enum: {
      values: ['UG', 'PG', 'Diploma', 'Certificate'],
      message: 'Course type must be UG, PG, Diploma, or Certificate'
    }
  },
  
  courseDuration: {
    type: Number,
    required: [true, 'Course duration is required'],
    min: [1, 'Course duration must be at least 1 year'],
    max: [6, 'Course duration cannot exceed 6 years']
  },
  
  // Department reference
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  
  // Status tracking
  isActive: {
    type: Boolean,
    default: true
  },
  
  isGraduated: {
    type: Boolean,
    default: false
  },
  
  // Academic calendar (April to March)
  academicYearStart: {
    type: Date,
    required: true
  },
  
  academicYearEnd: {
    type: Date,
    required: true
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Statistics (will be calculated)
  totalStudents: {
    type: Number,
    default: 0
  },
  
  placedStudents: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
batchSchema.index({ batchCode: 1 });
batchSchema.index({ department: 1 });
batchSchema.index({ startYear: 1, endYear: 1 });
batchSchema.index({ courseType: 1 });
batchSchema.index({ isActive: 1 });
batchSchema.index({ isGraduated: 1 });

// Validation: End year should be greater than start year
batchSchema.pre('validate', function(next) {
  if (this.endYear <= this.startYear) {
    next(new Error('End year must be greater than start year'));
  }
  
  // Validate course duration matches the year difference
  const expectedDuration = this.endYear - this.startYear;
  if (this.courseDuration !== expectedDuration) {
    next(new Error(`Course duration (${this.courseDuration}) must match year difference (${expectedDuration})`));
  }
  
  next();
});

// Pre-save middleware to set academic year dates
batchSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('startYear') || this.isModified('endYear')) {
    // Academic year starts in April
    this.academicYearStart = new Date(this.startYear, 3, 1); // April 1st
    this.academicYearEnd = new Date(this.endYear, 2, 31); // March 31st
  }
  next();
});

// Virtual for current academic year
batchSchema.virtual('currentAcademicYear').get(function() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  
  // Determine current academic year (April to March cycle)
  const academicYearStart = currentMonth >= 4 ? currentYear : currentYear - 1;
  
  // Calculate which year of the course this is
  const yearInCourse = academicYearStart - this.startYear + 1;
  
  // Ensure it's within the course duration
  return Math.min(Math.max(yearInCourse, 1), this.courseDuration);
});

// Virtual for academic status
batchSchema.virtual('academicStatus').get(function() {
  const currentYear = this.currentAcademicYear;
  
  if (this.isGraduated) {
    return 'Alumni';
  }
  
  if (currentYear > this.courseDuration) {
    return 'Alumni';
  }
  
  // Convert to ordinal numbers
  const ordinals = ['', '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year'];
  return ordinals[currentYear] || `${currentYear}th Year`;
});

// Virtual for batch display name
batchSchema.virtual('displayName').get(function() {
  return `${this.batchCode} ${this.courseType}`;
});

// Virtual for full display name with status
batchSchema.virtual('fullDisplayName').get(function() {
  return `${this.batchCode} ${this.courseType} (${this.academicStatus})`;
});

// Virtual for placement rate
batchSchema.virtual('placementRate').get(function() {
  if (this.totalStudents === 0) return 0;
  return Math.round((this.placedStudents / this.totalStudents) * 100);
});

// Static method to find or create batch
batchSchema.statics.findOrCreateBatch = async function(batchData) {
  try {
    // Try to find existing batch
    let batch = await this.findOne({ 
      batchCode: batchData.batchCode,
      department: batchData.department 
    });
    
    if (!batch) {
      // Create new batch
      batch = new this(batchData);
      await batch.save();
    }
    
    return batch;
  } catch (error) {
    throw new Error(`Error finding or creating batch: ${error.message}`);
  }
};

// Static method to get active batches for a department
batchSchema.statics.getActiveBatches = function(departmentId) {
  return this.find({ 
    department: departmentId, 
    isActive: true,
    isGraduated: false 
  }).sort({ startYear: -1 });
};

// Static method to get alumni batches for a department
batchSchema.statics.getAlumniBatches = function(departmentId) {
  return this.find({ 
    department: departmentId, 
    isGraduated: true 
  }).sort({ endYear: -1 });
};

// Instance method to check if batch should be moved to alumni
batchSchema.methods.shouldBeAlumni = function() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  // If current date is after March 31st of the end year, it's alumni
  if (currentYear > this.endYear) {
    return true;
  }
  
  if (currentYear === this.endYear && currentMonth > 3) {
    return true;
  }
  
  return false;
};

// Instance method to update student statistics
batchSchema.methods.updateStatistics = async function() {
  const Student = mongoose.model('Student');
  
  // Count total students in this batch
  const totalStudents = await Student.countDocuments({ batchId: this._id });
  
  // Count placed students
  const placedStudents = await Student.countDocuments({ 
    batchId: this._id,
    'placement.placementStatus': { $in: ['Placed', 'Multiple Offers'] }
  });
  
  // Update the batch
  this.totalStudents = totalStudents;
  this.placedStudents = placedStudents;
  
  await this.save();
  
  return {
    totalStudents,
    placedStudents,
    placementRate: this.placementRate
  };
};

// Static method to generate batch code
batchSchema.statics.generateBatchCode = function(startYear, courseType) {
  const courseDurations = {
    'UG': 4,
    'PG': 2,
    'Diploma': 3,
    'Certificate': 1
  };
  
  const duration = courseDurations[courseType] || 4;
  const endYear = startYear + duration;
  
  return `${startYear}-${endYear}`;
};

// Static method to auto-graduate completed batches
batchSchema.statics.autoGraduateCompletedBatches = async function() {
  const completedBatches = await this.find({
    isActive: true,
    isGraduated: false
  });
  
  const graduatedBatches = [];
  
  for (const batch of completedBatches) {
    if (batch.shouldBeAlumni()) {
      batch.isGraduated = true;
      batch.isActive = false;
      await batch.save();
      graduatedBatches.push(batch);
    }
  }
  
  return graduatedBatches;
};

module.exports = mongoose.model('Batch', batchSchema);
