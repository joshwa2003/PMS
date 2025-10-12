const { validationResult } = require('express-validator');
const User = require('../models/User');
const Department = require('../models/Department');
const emailService = require('../services/emailService');

// @desc    Create placement director (Admin only)
// @route   POST /api/v1/placement-directors
// @access  Private (Admin only)
exports.createPlacementDirector = async (req, res) => {
  try {
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
      employeeId,
      phone,
      adminNotes
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if employeeId already exists
    if (employeeId) {
      const existingEmployee = await User.findOne({ employeeId });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }

    // Set default password to "Director@123" for placement directors
    const defaultPassword = "Director@123";

    // Create placement director user
    const directorData = {
      firstName,
      lastName,
      email,
      password: defaultPassword,
      role: 'placement_director',
      employeeId,
      phone,
      adminNotes,
      permissions: User.getRolePermissions('placement_director'),
      isActive: true,
      isVerified: false, // Director needs to verify their account
      isFirstLogin: true, // Mark as first login to force password change
      createdBy: req.user._id,
      roleAssignedAt: new Date(),
      roleAssignedBy: req.user._id
    };

    const director = await User.create(directorData);

    // Remove password from response
    director.password = undefined;

    // Send welcome email to the placement director
    try {
      const emailData = {
        firstName: director.firstName,
        lastName: director.lastName,
        email: director.email,
        employeeId: director.employeeId
      };

      const emailResult = await emailService.sendPlacementDirectorWelcomeEmail(emailData, defaultPassword);
      
      if (emailResult.success) {
        console.log(`Welcome email sent successfully to ${director.email}`);
        
        // Update email sent status
        await User.findByIdAndUpdate(director._id, {
          emailSent: true,
          emailSentAt: new Date()
        });
      } else {
        console.error(`Failed to send welcome email to ${director.email}:`, emailResult.error);
      }
    } catch (emailError) {
      console.error(`Error sending welcome email to ${director.email}:`, emailError);
      // Don't fail the director creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Placement Director created successfully',
      director: {
        id: director._id,
        firstName: director.firstName,
        lastName: director.lastName,
        fullName: director.fullName,
        email: director.email,
        role: director.role,
        employeeId: director.employeeId,
        phone: director.phone,
        isActive: director.isActive,
        isVerified: director.isVerified,
        createdAt: director.createdAt,
        adminNotes: director.adminNotes,
        roleAssignedAt: director.roleAssignedAt,
        roleAssignedBy: director.roleAssignedBy,
        emailSent: director.emailSent,
        emailSentAt: director.emailSentAt
      },
      defaultPassword // Include in response for admin reference
    });
  } catch (error) {
    console.error('Create placement director error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating placement director',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all placement directors
// @route   GET /api/v1/placement-directors
// @access  Private (Admin only)
exports.getAllPlacementDirectors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter object
    const filter = { role: 'placement_director' };
    if (req.query.department) filter.departmentCode = req.query.department;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.isVerified !== undefined) filter.isVerified = req.query.isVerified === 'true';

    // Get placement directors with pagination
    const directors = await User.find(filter)
      .select('-password')
      .populate('department', 'name code')
      .populate('createdBy', 'firstName lastName email')
      .populate('roleAssignedBy', 'firstName lastName email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalDirectors = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalDirectors / limit);

    res.status(200).json({
      success: true,
      count: directors.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalDirectors,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      directors: directors.map(director => ({
        id: director._id,
        firstName: director.firstName,
        lastName: director.lastName,
        fullName: director.fullName,
        email: director.email,
        role: director.role,
        department: director.department,
        departmentCode: director.departmentCode,
        designation: director.designation,
        employeeId: director.employeeId,
        phone: director.phone,
        isActive: director.isActive,
        isVerified: director.isVerified,
        lastLogin: director.lastLogin,
        createdAt: director.createdAt,
        updatedAt: director.updatedAt,
        adminNotes: director.adminNotes,
        roleAssignedAt: director.roleAssignedAt,
        roleAssignedBy: director.roleAssignedBy,
        createdBy: director.createdBy,
        emailSent: director.emailSent,
        emailSentAt: director.emailSentAt
      }))
    });
  } catch (error) {
    console.error('Get all placement directors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching placement directors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get placement director by ID
// @route   GET /api/v1/placement-directors/:id
// @access  Private (Admin only)
exports.getPlacementDirectorById = async (req, res) => {
  try {
    const director = await User.findOne({ 
      _id: req.params.id, 
      role: 'placement_director' 
    })
      .select('-password')
      .populate('department', 'name code')
      .populate('createdBy', 'firstName lastName email')
      .populate('roleAssignedBy', 'firstName lastName email');

    if (!director) {
      return res.status(404).json({
        success: false,
        message: 'Placement Director not found'
      });
    }

    res.status(200).json({
      success: true,
      director: {
        id: director._id,
        firstName: director.firstName,
        lastName: director.lastName,
        fullName: director.fullName,
        email: director.email,
        role: director.role,
        department: director.department,
        departmentCode: director.departmentCode,
        designation: director.designation,
        employeeId: director.employeeId,
        phone: director.phone,
        isActive: director.isActive,
        isVerified: director.isVerified,
        profilePicture: director.profilePicture,
        bio: director.bio,
        lastLogin: director.lastLogin,
        createdAt: director.createdAt,
        updatedAt: director.updatedAt,
        adminNotes: director.adminNotes,
        roleAssignedAt: director.roleAssignedAt,
        roleAssignedBy: director.roleAssignedBy,
        createdBy: director.createdBy,
        emailSent: director.emailSent,
        emailSentAt: director.emailSentAt
      }
    });
  } catch (error) {
    console.error('Get placement director by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching placement director',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update placement director
// @route   PUT /api/v1/placement-directors/:id
// @access  Private (Admin only)
exports.updatePlacementDirector = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const director = await User.findOne({ 
      _id: req.params.id, 
      role: 'placement_director' 
    });

    if (!director) {
      return res.status(404).json({
        success: false,
        message: 'Placement Director not found'
      });
    }

    // Define fields that can be updated
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'designation', 'employeeId',
      'department', 'isActive', 'isVerified', 'adminNotes'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // If department is being updated, find the department ObjectId
    if (updates.department) {
      const departmentObj = await Department.findOne({ 
        code: updates.department, 
        isActive: true 
      });
      if (!departmentObj) {
        return res.status(400).json({
          success: false,
          message: `Department with code '${updates.department}' not found or inactive`
        });
      }
      updates.departmentCode = updates.department;
      updates.department = departmentObj._id;
    }

    // Check if employeeId already exists (if being updated)
    if (updates.employeeId && updates.employeeId !== director.employeeId) {
      const existingEmployee = await User.findOne({ 
        employeeId: updates.employeeId,
        _id: { $ne: director._id }
      });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }

    const updatedDirector = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('department', 'name code')
      .populate('createdBy', 'firstName lastName email')
      .populate('roleAssignedBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Placement Director updated successfully',
      director: {
        id: updatedDirector._id,
        firstName: updatedDirector.firstName,
        lastName: updatedDirector.lastName,
        fullName: updatedDirector.fullName,
        email: updatedDirector.email,
        role: updatedDirector.role,
        department: updatedDirector.department,
        departmentCode: updatedDirector.departmentCode,
        designation: updatedDirector.designation,
        employeeId: updatedDirector.employeeId,
        phone: updatedDirector.phone,
        isActive: updatedDirector.isActive,
        isVerified: updatedDirector.isVerified,
        updatedAt: updatedDirector.updatedAt,
        adminNotes: updatedDirector.adminNotes,
        roleAssignedAt: updatedDirector.roleAssignedAt,
        roleAssignedBy: updatedDirector.roleAssignedBy,
        createdBy: updatedDirector.createdBy,
        emailSent: updatedDirector.emailSent,
        emailSentAt: updatedDirector.emailSentAt
      }
    });
  } catch (error) {
    console.error('Update placement director error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating placement director',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete placement director
// @route   DELETE /api/v1/placement-directors/:id
// @access  Private (Admin only)
exports.deletePlacementDirector = async (req, res) => {
  try {
    const director = await User.findOne({ 
      _id: req.params.id, 
      role: 'placement_director' 
    });

    if (!director) {
      return res.status(404).json({
        success: false,
        message: 'Placement Director not found'
      });
    }

    // Prevent admin from deleting themselves if they are also a placement director
    if (director._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Placement Director deleted successfully'
    });
  } catch (error) {
    console.error('Delete placement director error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting placement director',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Resend welcome email to placement director
// @route   POST /api/v1/placement-directors/:id/resend-email
// @access  Private (Admin only)
exports.resendWelcomeEmail = async (req, res) => {
  try {
    const director = await User.findOne({ 
      _id: req.params.id, 
      role: 'placement_director' 
    });

    if (!director) {
      return res.status(404).json({
        success: false,
        message: 'Placement Director not found'
      });
    }

    // Send welcome email to the placement director
    try {
      const emailData = {
        firstName: director.firstName,
        lastName: director.lastName,
        email: director.email,
        department: director.departmentCode,
        designation: director.designation,
        employeeId: director.employeeId
      };

      const defaultPassword = "Director@123"; // Use same default password
      const emailResult = await emailService.sendPlacementDirectorWelcomeEmail(emailData, defaultPassword);
      
      if (emailResult.success) {
        console.log(`Welcome email resent successfully to ${director.email}`);
        
        // Update email sent status
        await User.findByIdAndUpdate(director._id, {
          emailSent: true,
          emailSentAt: new Date()
        });

        res.status(200).json({
          success: true,
          message: 'Welcome email sent successfully',
          emailResult: {
            messageId: emailResult.messageId,
            email: emailResult.email
          }
        });
      } else {
        console.error(`Failed to resend welcome email to ${director.email}:`, emailResult.error);
        res.status(500).json({
          success: false,
          message: 'Failed to send welcome email',
          error: emailResult.error
        });
      }
    } catch (emailError) {
      console.error(`Error resending welcome email to ${director.email}:`, emailError);
      res.status(500).json({
        success: false,
        message: 'Error sending welcome email',
        error: emailError.message
      });
    }
  } catch (error) {
    console.error('Resend welcome email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending welcome email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get placement directors statistics
// @route   GET /api/v1/placement-directors/stats
// @access  Private (Admin only)
exports.getPlacementDirectorStats = async (req, res) => {
  try {
    const totalDirectors = await User.countDocuments({ role: 'placement_director' });
    const activeDirectors = await User.countDocuments({ 
      role: 'placement_director', 
      isActive: true 
    });
    const verifiedDirectors = await User.countDocuments({ 
      role: 'placement_director', 
      isVerified: true 
    });
    const recentDirectors = await User.countDocuments({
      role: 'placement_director',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    // Get directors by department
    const directorsByDepartment = await User.aggregate([
      { $match: { role: 'placement_director' } },
      { $group: { _id: '$departmentCode', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total: totalDirectors,
        active: activeDirectors,
        verified: verifiedDirectors,
        recent: recentDirectors,
        inactive: totalDirectors - activeDirectors,
        unverified: totalDirectors - verifiedDirectors,
        byDepartment: directorsByDepartment
      }
    });
  } catch (error) {
    console.error('Get placement director stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching placement director statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
