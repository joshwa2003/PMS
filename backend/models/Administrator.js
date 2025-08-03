const mongoose = require('mongoose');

const administratorSchema = new mongoose.Schema({
  // Basic Information
  name: {
    firstName: { 
      type: String, 
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters long']
    },
    lastName: { 
      type: String, 
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters long']
    }
  },

  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },

  mobileNumber: { 
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits']
  },

  gender: { 
    type: String, 
    enum: {
      values: ['Male', 'Female', 'Other'],
      message: 'Gender must be Male, Female, or Other'
    },
    required: [true, 'Gender is required']
  },

  profilePhotoUrl: { 
    type: String,
    default: null
  },

  // Professional Information
  role: { 
    type: String, 
    enum: {
      values: ['admin', 'director', 'staff', 'hod', 'other', 'student', 'alumni', 'company'],
      message: 'Invalid role specified'
    },
    required: [true, 'Role is required']
  },

  department: { 
    type: String,
    trim: true,
    required: function() {
      return ['director', 'staff', 'hod'].includes(this.role);
    }
  },

  designation: { 
    type: String, 
    required: [true, 'Designation/Title is required'],
    trim: true
  },

  status: { 
    type: String, 
    enum: {
      values: ['active', 'inactive', 'deleted'],
      message: 'Status must be active, inactive, or deleted'
    },
    default: 'active'
  },

  dateOfJoining: { 
    type: Date,
    required: [true, 'Date of joining is required']
  },

  registrationDate: { 
    type: Date,
    default: Date.now
  },

  lastLoginAt: { 
    type: Date,
    default: null
  },

  authProvider: { 
    type: String, 
    enum: {
      values: ['local', 'google', 'microsoft', 'other'],
      message: 'Invalid auth provider'
    },
    default: 'local'
  },

  employeeId: { 
    type: String, 
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },

  accessLevel: { 
    type: String, 
    enum: {
      values: ['superAdmin', 'admin', 'limited'],
      message: 'Access level must be superAdmin, admin, or limited'
    },
    required: [true, 'Access level is required']
  },

  officeLocation: { 
    type: String,
    trim: true,
    required: [true, 'Office location is required']
  },

  // Administrative Information
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'Created by field is required']
  },

  adminNotes: { 
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },

  // Contact Information
  contact: {
    alternatePhone: { type: String, trim: true },
    emergencyContact: { type: String, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { 
        type: String, 
        trim: true,
        match: [/^[0-9]{6}$/, 'Pincode must be exactly 6 digits']
      },
      country: { type: String, trim: true, default: 'India' }
    }
  },

  // System Information
  profileLastUpdated: { type: Date, default: Date.now },
  
  // Reference to User model
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
administratorSchema.index({ employeeId: 1 });
administratorSchema.index({ userId: 1 });
administratorSchema.index({ email: 1 });
administratorSchema.index({ department: 1 });
administratorSchema.index({ role: 1 });
administratorSchema.index({ status: 1 });
administratorSchema.index({ accessLevel: 1 });

// Pre-save middleware to update profileLastUpdated
administratorSchema.pre('save', function(next) {
  this.profileLastUpdated = new Date();
  next();
});

// Virtual for full name
administratorSchema.virtual('fullName').get(function() {
  return `${this.name.firstName} ${this.name.lastName}`;
});

// Virtual for profile completion percentage
administratorSchema.virtual('profileCompletionPercentage').get(function() {
  let completedFields = 0;
  let totalFields = 0;

  // Check basic info completion
  const basicFields = ['name.firstName', 'name.lastName', 'email', 'mobileNumber', 'gender'];
  basicFields.forEach(field => {
    totalFields++;
    const value = this.getNestedValue(field);
    if (value) completedFields++;
  });

  // Check professional info completion
  const professionalFields = ['role', 'designation', 'dateOfJoining', 'employeeId', 'accessLevel', 'officeLocation'];
  professionalFields.forEach(field => {
    totalFields++;
    if (this[field]) completedFields++;
  });

  // Check contact info completion
  const contactFields = ['contact.address.street', 'contact.address.city', 'contact.address.state', 'contact.address.pincode'];
  contactFields.forEach(field => {
    totalFields++;
    const value = this.getNestedValue(field);
    if (value) completedFields++;
  });

  // Check other important fields
  totalFields += 2;
  if (this.profilePhotoUrl) completedFields++;
  if (this.department && ['director', 'staff', 'hod'].includes(this.role)) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
});

// Helper method to get nested values
administratorSchema.methods.getNestedValue = function(path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, this);
};

// Static method to get administrator by user ID
administratorSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId }).populate('userId', 'firstName lastName email');
};

// Static method to get administrator by employee ID
administratorSchema.statics.findByEmployeeId = function(employeeId) {
  return this.findOne({ employeeId: employeeId.toUpperCase() });
};

// Instance method to update last login
administratorSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

// Instance method to update status
administratorSchema.methods.updateStatus = function(status) {
  this.status = status;
  return this.save();
};

module.exports = mongoose.model('Administrator', administratorSchema);
