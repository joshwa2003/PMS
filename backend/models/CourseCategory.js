const mongoose = require('mongoose');

const courseCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course category name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Course category name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
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
courseCategorySchema.index({ name: 1 });
courseCategorySchema.index({ isActive: 1 });
courseCategorySchema.index({ createdAt: -1 });

// Virtual for formatted creation date
courseCategorySchema.virtual('formattedCreatedAt').get(function() {
  if (!this.createdAt) {
    return 'N/A';
  }
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

module.exports = mongoose.model('CourseCategory', courseCategorySchema);
