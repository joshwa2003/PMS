const mongoose = require('mongoose');

const administratorProfileSchema = new mongoose.Schema({
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
    enum: ['admin', 'director', 'staff', 'hod', 'other']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'ADMIN', 'HR', 'OTHER']
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true,
    maxlength: [100, 'Designation cannot exceed 100 characters']
  },
  dateOfJoining: {
    type: Date,
    required: [true, 'Date of joining is required']
  },
  accessLevel: {
    type: String,
    required: [true, 'Access level is required'],
    enum: ['super_admin', 'admin', 'limited', 'read_only'],
    default: 'limited'
  },
  officeLocation: {
    type: String,
    required: [true, 'Office location is required'],
    trim: true,
    maxlength: [100, 'Office location cannot exceed 100 characters']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'microsoft', 'other'],
    default: 'local'
  },
  
  // Contact Information
  contact: {
    alternatePhone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit alternate phone number']
    },
    emergencyContact: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit emergency contact number']
    },
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
  
  // Administrative Information
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Administrative notes cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // System Information
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date
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
administratorProfileSchema.virtual('fullName').get(function() {
  return `${this.name.firstName} ${this.name.lastName}`;
});

// Virtual for complete address
administratorProfileSchema.virtual('fullAddress').get(function() {
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
administratorProfileSchema.index({ userId: 1 });
administratorProfileSchema.index({ employeeId: 1 });
administratorProfileSchema.index({ email: 1 });
administratorProfileSchema.index({ department: 1 });
administratorProfileSchema.index({ role: 1 });

// Pre-save middleware to calculate profile completion
administratorProfileSchema.pre('save', function(next) {
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
    'dateOfJoining',
    'accessLevel',
    'officeLocation'
  ];
  
  const optionalFields = [
    'profilePhotoUrl',
    'contact.alternatePhone',
    'contact.emergencyContact',
    'contact.address.street',
    'contact.address.city',
    'contact.address.state',
    'contact.address.pincode',
    'adminNotes'
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
administratorProfileSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId }).populate('userId', 'email role isActive isVerified lastLogin');
};

// Static method to get profile by employee ID
administratorProfileSchema.statics.findByEmployeeId = function(employeeId) {
  return this.findOne({ employeeId }).populate('userId', 'email role isActive isVerified lastLogin');
};

// Instance method to update profile completion
administratorProfileSchema.methods.updateProfileCompletion = function() {
  return this.save();
};

module.exports = mongoose.model('AdministratorProfile', administratorProfileSchema);
