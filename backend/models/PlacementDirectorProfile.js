const mongoose = require('mongoose');

const placementDirectorProfileSchema = new mongoose.Schema({
  // Reference to User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Basic Information
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  name: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  profilePhotoUrl: {
    type: String,
    trim: true,
    default: null
  },
  
  // Professional Information
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['admin', 'placement_director', 'staff', 'hod', 'other', 'student', 'alumni', 'company'],
    default: 'placement_director'
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    default: 'Placement Cell'
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true,
    maxlength: [100, 'Designation cannot exceed 100 characters'],
    default: 'Director'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted'],
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
    type: Date
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'microsoft', 'other'],
    default: 'local'
  },
  
  // Placement Director Specific Fields
  officeRoomNo: {
    type: String,
    trim: true,
    maxlength: [20, 'Office room number cannot exceed 20 characters']
  },
  officialEmail: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid official email']
  },
  alternateMobile: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit alternate mobile number']
  },
  reportingTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  yearsOfExperience: {
    type: Number,
    min: [0, 'Years of experience cannot be negative'],
    max: [50, 'Years of experience cannot exceed 50']
  },
  resumeUrl: {
    type: String,
    trim: true
  },
  responsibilitiesText: {
    type: String,
    trim: true,
    maxlength: [2000, 'Responsibilities text cannot exceed 2000 characters']
  },
  communicationPreferences: {
    type: [String],
    enum: ['email', 'SMS', 'portal'],
    default: ['email', 'portal']
  },
  
  // Contact Information
  contact: {
    address: {
      street: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        trim: true
      },
      state: {
        type: String,
        trim: true
      },
      pincode: {
        type: String,
        trim: true,
        match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
      },
      country: {
        type: String,
        trim: true,
        default: 'India'
      }
    }
  },
  
  // System Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Profile Completion
  profileCompletion: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Metadata
  isProfileComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
placementDirectorProfileSchema.virtual('fullName').get(function() {
  return `${this.name.firstName} ${this.name.lastName}`;
});

// Virtual for complete address
placementDirectorProfileSchema.virtual('fullAddress').get(function() {
  const address = this.contact?.address;
  if (!address) return '';
  
  const parts = [
    address.street,
    address.city,
    address.state,
    address.pincode,
    address.country
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Index for better query performance
placementDirectorProfileSchema.index({ userId: 1 });
placementDirectorProfileSchema.index({ employeeId: 1 });
placementDirectorProfileSchema.index({ email: 1 });
placementDirectorProfileSchema.index({ department: 1 });
placementDirectorProfileSchema.index({ role: 1 });

// Pre-save middleware to calculate profile completion
placementDirectorProfileSchema.pre('save', function(next) {
  const requiredFields = [
    'employeeId',
    'name.firstName',
    'name.lastName',
    'email',
    'mobileNumber',
    'gender',
    'role',
    'department',
    'designation',
    'dateOfJoining'
  ];
  
  const optionalFields = [
    'profilePhotoUrl',
    'officeRoomNo',
    'officialEmail',
    'alternateMobile',
    'yearsOfExperience',
    'resumeUrl',
    'responsibilitiesText',
    'contact.address.street',
    'contact.address.city',
    'contact.address.state',
    'contact.address.pincode'
  ];
  
  let completedRequired = 0;
  let completedOptional = 0;
  
  // Check required fields
  requiredFields.forEach(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    if (value !== undefined && value !== null && value !== '') {
      completedRequired++;
    }
  });
  
  // Check optional fields
  optionalFields.forEach(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    if (value !== undefined && value !== null && value !== '') {
      completedOptional++;
    }
  });
  
  // Calculate completion percentage (70% for required, 30% for optional)
  const requiredPercentage = (completedRequired / requiredFields.length) * 70;
  const optionalPercentage = (completedOptional / optionalFields.length) * 30;
  
  this.profileCompletion = Math.round(requiredPercentage + optionalPercentage);
  this.isProfileComplete = this.profileCompletion >= 90;
  
  next();
});

// Static method to get profile by user ID
placementDirectorProfileSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId }).populate('userId', 'email role isActive isVerified lastLogin');
};

// Static method to get profile by employee ID
placementDirectorProfileSchema.statics.findByEmployeeId = function(employeeId) {
  return this.findOne({ employeeId }).populate('userId', 'email role isActive isVerified lastLogin');
};

// Instance method to update profile completion
placementDirectorProfileSchema.methods.updateProfileCompletion = function() {
  return this.save();
};

module.exports = mongoose.model('PlacementDirectorProfile', placementDirectorProfileSchema);
