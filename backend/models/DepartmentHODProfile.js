const mongoose = require('mongoose');

const departmentHODProfileSchema = new mongoose.Schema({
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
    enum: ['admin', 'director', 'staff', 'hod', 'other', 'student', 'alumni', 'company'],
    default: 'hod'
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
    default: 'Head of Department'
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
  
  // HOD Specific Information
  departmentHeadOf: {
    type: String,
    required: [true, 'Department head of is required'],
    enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'],
    trim: true
  },
  officeRoomNo: {
    type: String,
    required: [true, 'Office room number is required'],
    trim: true,
    maxlength: [20, 'Office room number cannot exceed 20 characters']
  },
  yearsAsHOD: {
    type: Number,
    required: [true, 'Years as HOD is required'],
    min: [0, 'Years as HOD cannot be negative'],
    max: [50, 'Years as HOD cannot exceed 50']
  },
  academicBackground: {
    type: String,
    required: [true, 'Academic background is required'],
    trim: true,
    maxlength: [500, 'Academic background cannot exceed 500 characters']
  },
  numberOfFacultyManaged: {
    type: Number,
    required: [true, 'Number of faculty managed is required'],
    min: [0, 'Number of faculty managed cannot be negative'],
    max: [200, 'Number of faculty managed cannot exceed 200']
  },
  subjectsTaught: [{
    type: String,
    trim: true,
    maxlength: [100, 'Subject name cannot exceed 100 characters']
  }],
  responsibilities: {
    type: String,
    required: [true, 'Responsibilities are required'],
    trim: true,
    maxlength: [1000, 'Responsibilities cannot exceed 1000 characters']
  },
  meetingSlots: [{
    type: String,
    trim: true,
    maxlength: [50, 'Meeting slot cannot exceed 50 characters']
  }],
  calendarLink: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL for calendar link']
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
departmentHODProfileSchema.virtual('fullName').get(function() {
  return `${this.name.firstName} ${this.name.lastName}`;
});

// Virtual for complete address
departmentHODProfileSchema.virtual('fullAddress').get(function() {
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

// Virtual for department display name
departmentHODProfileSchema.virtual('departmentDisplayName').get(function() {
  const departmentNames = {
    CSE: 'Computer Science & Engineering',
    ECE: 'Electronics & Communication Engineering',
    EEE: 'Electrical & Electronics Engineering',
    MECH: 'Mechanical Engineering',
    CIVIL: 'Civil Engineering',
    IT: 'Information Technology'
  };
  return departmentNames[this.departmentHeadOf] || this.departmentHeadOf;
});

// Index for better query performance
departmentHODProfileSchema.index({ userId: 1 });
departmentHODProfileSchema.index({ employeeId: 1 });
departmentHODProfileSchema.index({ email: 1 });
departmentHODProfileSchema.index({ department: 1 });
departmentHODProfileSchema.index({ departmentHeadOf: 1 });
departmentHODProfileSchema.index({ role: 1 });

// Pre-save middleware to calculate profile completion
departmentHODProfileSchema.pre('save', function(next) {
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
    'departmentHeadOf',
    'officeRoomNo',
    'yearsAsHOD',
    'academicBackground',
    'numberOfFacultyManaged',
    'responsibilities'
  ];
  
  const optionalFields = [
    'profilePhotoUrl',
    'subjectsTaught',
    'meetingSlots',
    'calendarLink',
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
    if (value !== undefined && value !== null && value !== '' && 
        (!Array.isArray(value) || value.length > 0)) {
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
departmentHODProfileSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId }).populate('userId', 'email role isActive isVerified lastLogin');
};

// Static method to get profile by employee ID
departmentHODProfileSchema.statics.findByEmployeeId = function(employeeId) {
  return this.findOne({ employeeId }).populate('userId', 'email role isActive isVerified lastLogin');
};

// Instance method to update profile completion
departmentHODProfileSchema.methods.updateProfileCompletion = function() {
  return this.save();
};

module.exports = mongoose.model('DepartmentHODProfile', departmentHODProfileSchema);
