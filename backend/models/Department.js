const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [10, 'Department code cannot exceed 10 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  courseCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseCategory',
    required: [true, 'Course category is required']
  },
  placementStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
departmentSchema.index({ name: 1 });
departmentSchema.index({ code: 1 });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ courseCategory: 1 });
departmentSchema.index({ placementStaff: 1 });
departmentSchema.index({ createdAt: -1 });

// Virtual for formatted creation date
departmentSchema.virtual('formattedCreatedAt').get(function() {
  if (!this.createdAt) {
    return 'Unknown';
  }
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for display name with code
departmentSchema.virtual('displayName').get(function() {
  return `${this.name} (${this.code})`;
});

module.exports = mongoose.model('Department', departmentSchema);
