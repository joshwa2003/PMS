const mongoose = require('mongoose');

const otherStaffProfileSchema = new mongoose.Schema({
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
    trim: true,
    maxlength: [20, 'Employee ID cannot exceed 20 characters']
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
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  profilePhotoUrl: {
    type: String,
    default: ''
  },
  
  // Professional Information
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['admin', 'placement_director', 'placement_staff', 'department_hod', 'other_staff', 'student', 'company'],
    default: 'other_staff'
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
    maxlength: [100, 'Designation cannot exceed 100 characters'],
    default: 'Other Staff'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
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
    enum: ['local', 'google', 'microsoft', 'other'],
    default: 'local'
  },
  
  // Staff Specific Information
  staffCategory: {
    type: String,
    required: [true, 'Staff category is required'],
    enum: ['Administrative', 'Technical', 'Support', 'Maintenance', 'Security', 'Other']
  },
  officeLocation: {
    type: String,
    trim: true,
    maxlength: [100, 'Office location cannot exceed 100 characters']
  },
  workShift: {
    type: String,
    enum: ['Morning', 'Evening', 'Night', 'Flexible'],
    default: 'Morning'
  },
  yearsOfExperience: {
    type: Number,
    min: [0, 'Years of experience cannot be negative'],
    max: [50, 'Years of experience cannot exceed 50'],
    default: 0
  },
  
  // Skills and Qualifications
  qualifications: {
    type: String,
    trim: true,
    maxlength: [500, 'Qualifications cannot exceed 500 characters']
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each skill cannot exceed 50 characters']
  }],
  certifications: [{
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Certification name cannot exceed 100 characters']
    },
    issuingOrganization: {
      type: String,
      trim: true,
      maxlength: [100, 'Issuing organization cannot exceed 100 characters']
    },
    issueDate: {
      type: Date
    },
    expiryDate: {
      type: Date
    }
  }],
  
  // Work Information
  responsibilities: {
    type: String,
    trim: true,
    maxlength: [1000, 'Responsibilities cannot exceed 1000 characters']
  },
  reportingManager: {
    type: String,
    trim: true,
    maxlength: [100, 'Reporting manager cannot exceed 100 characters']
  },
  workingHours: {
    startTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
    },
    endTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
    }
  },
  
  // Contact Information
  contact: {
    alternatePhone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit alternate phone number']
    },
    emergencyContact: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit emergency contact number']
    },
    address: {
      street: {
        type: String,
        trim: true,
        maxlength: [200, 'Street address cannot exceed 200 characters']
      },
      city: {
        type: String,
        trim: true,
        maxlength: [50, 'City cannot exceed 50 characters']
      },
      state: {
        type: String,
        trim: true,
        maxlength: [50, 'State cannot exceed 50 characters']
      },
      pincode: {
        type: String,
        match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
      },
      country: {
        type: String,
        trim: true,
        maxlength: [50, 'Country cannot exceed 50 characters'],
        default: 'India'
      }
    }
  },
  
  // System Information
  profileCompletion: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Admin Notes
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Administrative notes cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
otherStaffProfileSchema.virtual('fullName').get(function() {
  return `${this.name.firstName} ${this.name.lastName}`;
});

// Virtual for complete address
otherStaffProfileSchema.virtual('fullAddress').get(function() {
  const address = this.contact?.address;
  if (!address) return '';
  
  const parts = [
    address.street,
    address.city,
    address.state,
    address.pincode,
    address.country
  ].filter(part => part && part.trim());
  
  return parts.join(', ');
});

// Virtual for staff category display name
otherStaffProfileSchema.virtual('staffCategoryDisplayName').get(function() {
  const categoryNames = {
    Administrative: 'Administrative Staff',
    Technical: 'Technical Staff',
    Support: 'Support Staff',
    Maintenance: 'Maintenance Staff',
    Security: 'Security Staff',
    Other: 'Other Staff'
  };
  return categoryNames[this.staffCategory] || this.staffCategory;
});

// Index for better query performance
otherStaffProfileSchema.index({ userId: 1 });
otherStaffProfileSchema.index({ employeeId: 1 });
otherStaffProfileSchema.index({ email: 1 });
otherStaffProfileSchema.index({ department: 1 });
otherStaffProfileSchema.index({ staffCategory: 1 });
otherStaffProfileSchema.index({ role: 1 });

// Pre-save middleware to calculate profile completion
otherStaffProfileSchema.pre('save', function(next) {
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
    'staffCategory',
    'yearsOfExperience'
  ];
  
  const optionalFields = [
    'profilePhotoUrl',
    'officeLocation',
    'qualifications',
    'responsibilities',
    'contact.alternatePhone',
    'contact.emergencyContact',
    'contact.address.street',
    'contact.address.city',
    'contact.address.state',
    'contact.address.pincode'
  ];
  
  let completedRequired = 0;
  let completedOptional = 0;
  
  // Check required fields
  requiredFields.forEach(field => {
    const fieldValue = field.split('.').reduce((obj, key) => obj && obj[key], this);
    if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
      completedRequired++;
    }
  });
  
  // Check optional fields
  optionalFields.forEach(field => {
    const fieldValue = field.split('.').reduce((obj, key) => obj && obj[key], this);
    if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
      completedOptional++;
    }
  });
  
  // Calculate completion percentage (70% weight for required, 30% for optional)
  const requiredPercentage = (completedRequired / requiredFields.length) * 70;
  const optionalPercentage = (completedOptional / optionalFields.length) * 30;
  
  this.profileCompletion = Math.round(requiredPercentage + optionalPercentage);
  
  next();
});

// Static method to get profile by user ID
otherStaffProfileSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId }).populate('userId', 'email role isActive isVerified lastLogin');
};

// Static method to get profile by employee ID
otherStaffProfileSchema.statics.findByEmployeeId = function(employeeId) {
  return this.findOne({ employeeId }).populate('userId', 'email role isActive isVerified lastLogin');
};

// Instance method to update profile completion
otherStaffProfileSchema.methods.updateProfileCompletion = function() {
  return this.save();
};

module.exports = mongoose.model('OtherStaffProfile', otherStaffProfileSchema);
