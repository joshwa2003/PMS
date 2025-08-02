const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
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
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  
  // Role-based Information
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['admin', 'placement_director', 'placement_staff', 'department_hod', 'other_staff', 'student', 'alumni'],
      message: 'Invalid role specified'
    }
  },
  
  // Contact Information
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  
  // Academic/Professional Information
  department: {
    type: String,
    trim: true,
    enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'ADMIN', 'HR', 'OTHER']
  },
  
  // Student-specific fields
  studentId: {
    type: String,
    trim: true,
    sparse: true // Allows multiple null values
  },
  batch: {
    type: String,
    trim: true
  },
  cgpa: {
    type: Number,
    min: [0, 'CGPA cannot be negative'],
    max: [10, 'CGPA cannot exceed 10']
  },
  
  // Alumni-specific fields
  graduationYear: {
    type: Number,
    min: [1990, 'Invalid graduation year']
  },
  currentCompany: {
    type: String,
    trim: true
  },
  currentPosition: {
    type: String,
    trim: true
  },
  
  
  // Staff-specific fields
  employeeId: {
    type: String,
    trim: true,
    sparse: true
  },
  designation: {
    type: String,
    trim: true
  },
  
  // Profile Information
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  
  // Status and Permissions
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete', 'admin', 'manage_users', 'manage_jobs', 'view_reports']
  }],
  
  // Timestamps
  lastLogin: {
    type: Date,
    default: null
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ employeeId: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Static method to get role-based permissions
userSchema.statics.getRolePermissions = function(role) {
  const rolePermissions = {
    admin: ['read', 'write', 'delete', 'admin', 'manage_users', 'manage_jobs', 'view_reports'],
    placement_director: ['read', 'write', 'manage_jobs', 'view_reports'],
    placement_staff: ['read', 'write', 'manage_jobs'],
    department_hod: ['read', 'view_reports'],
    other_staff: ['read'],
    student: ['read'],
    alumni: ['read', 'write']
  };
  
  return rolePermissions[role] || ['read'];
};

module.exports = mongoose.model('User', userSchema);
