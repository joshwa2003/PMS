const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Constants
const STAFF_ROLES = ['placement_staff', 'department_hod', 'other_staff'];

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: user.isActive,
      isVerified: user.isVerified,
      permissions: User.getRolePermissions(user.role),
      profilePicture: user.profilePicture,
      lastLogin: user.lastLogin
    }
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      department,
      studentId,
      batch,
      employeeId,
      designation,
      graduationYear,
      currentCompany,
      currentPosition
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user object
    const userData = {
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      department,
      permissions: User.getRolePermissions(role)
    };

    // Add role-specific fields
    if (role === 'student') {
      userData.studentId = studentId;
      userData.batch = batch;
    } else if (role === 'alumni') {
      userData.graduationYear = graduationYear;
      userData.currentCompany = currentCompany;
      userData.currentPosition = currentPosition;
    } else if (['placement_staff', 'department_hod', 'other_staff', 'admin'].includes(role)) {
      userData.employeeId = employeeId;
      userData.designation = designation;
    }

    // Create user
    const user = await User.create(userData);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Check if staff user needs first login setup
    const needsFirstLogin = STAFF_ROLES.includes(user.role) && user.isFirstLogin;
    const needsDepartmentSelection = STAFF_ROLES.includes(user.role) && (!user.department || user.department === null);

    // Send token response with first login status
    const token = generateToken(user._id);
    
    // Remove password from output
    user.password = undefined;
    
    res.status(200).json({
      success: true,
      token,
      needsFirstLogin,
      needsDepartmentSelection,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
        isVerified: user.isVerified,
        isFirstLogin: user.isFirstLogin,
        permissions: User.getRolePermissions(user.role),
        profilePicture: user.profilePicture,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        isActive: user.isActive,
        isVerified: user.isVerified,
        permissions: User.getRolePermissions(user.role),
        profilePicture: user.profilePicture,
        bio: user.bio,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        // Role-specific fields
        ...(user.role === 'student' && {
          studentId: user.studentId,
          batch: user.batch,
          cgpa: user.cgpa
        }),
        ...(user.role === 'alumni' && {
          graduationYear: user.graduationYear,
          currentCompany: user.currentCompany,
          currentPosition: user.currentPosition
        }),
        ...(['placement_staff', 'department_hod', 'other_staff', 'admin'].includes(user.role) && {
          employeeId: user.employeeId,
          designation: user.designation
        })
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const allowedFields = [
      'firstName', 'lastName', 'phone', 'bio', 'profilePicture',
      'cgpa', 'currentCompany', 'currentPosition'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        bio: user.bio,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just send a success response
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Check if user needs first login setup
// @route   GET /api/v1/auth/first-login-check
// @access  Private
exports.checkFirstLogin = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is staff and needs first login setup
    const needsFirstLogin = STAFF_ROLES.includes(user.role) && user.isFirstLogin;
    const needsDepartmentSelection = STAFF_ROLES.includes(user.role) && (!user.department || user.department === null);

    res.status(200).json({
      success: true,
      needsFirstLogin,
      needsDepartmentSelection,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        isFirstLogin: user.isFirstLogin
      }
    });
  } catch (error) {
    console.error('Check first login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during first login check',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Set initial password for first login
// @route   PUT /api/v1/auth/set-initial-password
// @access  Private
exports.setInitialPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { newPassword, confirmPassword } = req.body;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is staff and needs first login setup
    if (!STAFF_ROLES.includes(user.role) || !user.isFirstLogin) {
      return res.status(400).json({
        success: false,
        message: 'First login setup not required for this user'
      });
    }

    // Update password and mark first login as complete
    user.password = newPassword;
    user.isFirstLogin = false;
    user.passwordChangedAt = new Date();
    await user.save();

    // For staff roles, always require department selection after password reset
    const needsDepartmentSelection = STAFF_ROLES.includes(user.role) && (!user.department || user.department === null);

    res.status(200).json({
      success: true,
      message: 'Password set successfully',
      needsDepartmentSelection: needsDepartmentSelection
    });
  } catch (error) {
    console.error('Set initial password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password setup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Select department for staff
// @route   PUT /api/v1/auth/select-department
// @access  Private
exports.selectDepartment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { department } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is staff
    if (!STAFF_ROLES.includes(user.role)) {
      return res.status(400).json({
        success: false,
        message: 'Department selection not required for this user role'
      });
    }

    // Validate department
    const validDepartments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'ADMIN', 'HR', 'OTHER'];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department selected'
      });
    }

    // Update user department
    user.department = department;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Department selected successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        isFirstLogin: user.isFirstLogin
      }
    });
  } catch (error) {
    console.error('Select department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during department selection',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
