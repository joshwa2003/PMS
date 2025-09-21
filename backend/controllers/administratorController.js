const Administrator = require('../models/Administrator');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const googleDriveService = require('../services/googleDriveService');

// @desc    Get current administrator's profile
// @route   GET /api/administrators/profile
// @access  Private (Administrator only)
const getAdministratorProfile = async (req, res) => {
  try {
    const administrator = await Administrator.findByUserId(req.user.id);
    
    if (!administrator) {
      return res.status(404).json({
        success: false,
        message: 'Administrator profile not found'
      });
    }

    res.status(200).json({
      success: true,
      administrator
    });
  } catch (error) {
    console.error('Get administrator profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching administrator profile'
    });
  }
};

// @desc    Create or update administrator profile
// @route   PUT /api/administrators/profile
// @access  Private (Administrator only)
const updateAdministratorProfile = async (req, res) => {
  try {
    console.log('Update administrator profile request:', {
      userId: req.user.id,
      bodyKeys: Object.keys(req.body),
      body: req.body
    });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    let administrator = await Administrator.findOne({ userId });

    // Clean the request body to remove empty strings and null values
    const cleanedBody = {};
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && req.body[key] !== null) {
        if (typeof req.body[key] === 'object' && !Array.isArray(req.body[key])) {
          // Handle nested objects
          const cleanedNestedObj = {};
          Object.keys(req.body[key]).forEach(nestedKey => {
            if (req.body[key][nestedKey] !== undefined && req.body[key][nestedKey] !== null) {
              cleanedNestedObj[nestedKey] = req.body[key][nestedKey];
            }
          });
          if (Object.keys(cleanedNestedObj).length > 0) {
            cleanedBody[key] = cleanedNestedObj;
          }
        } else {
          cleanedBody[key] = req.body[key];
        }
      }
    });

    console.log('Cleaned body:', cleanedBody);

    if (administrator) {
      // Update existing profile
      Object.keys(cleanedBody).forEach(key => {
        if (typeof cleanedBody[key] === 'object' && !Array.isArray(cleanedBody[key])) {
          // Handle nested objects - merge with existing data
          administrator[key] = { ...administrator[key], ...cleanedBody[key] };
        } else {
          administrator[key] = cleanedBody[key];
        }
      });

      administrator = await administrator.save();
      console.log('Administrator profile updated successfully');
    } else {
      // Create new profile - ensure required fields are present
      if (!cleanedBody.employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is required for new profile creation'
        });
      }

      if (!cleanedBody.name || !cleanedBody.name.firstName || !cleanedBody.name.lastName) {
        return res.status(400).json({
          success: false,
          message: 'First name and last name are required for new profile creation'
        });
      }

      if (!cleanedBody.email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required for new profile creation'
        });
      }

      if (!cleanedBody.mobileNumber) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number is required for new profile creation'
        });
      }

      if (!cleanedBody.role) {
        return res.status(400).json({
          success: false,
          message: 'Role is required for new profile creation'
        });
      }

      if (!cleanedBody.designation) {
        return res.status(400).json({
          success: false,
          message: 'Designation is required for new profile creation'
        });
      }

      if (!cleanedBody.accessLevel) {
        return res.status(400).json({
          success: false,
          message: 'Access level is required for new profile creation'
        });
      }

      if (!cleanedBody.officeLocation) {
        return res.status(400).json({
          success: false,
          message: 'Office location is required for new profile creation'
        });
      }

      if (!cleanedBody.dateOfJoining) {
        return res.status(400).json({
          success: false,
          message: 'Date of joining is required for new profile creation'
        });
      }

      // Set createdBy to current user if not provided
      if (!cleanedBody.createdBy) {
        cleanedBody.createdBy = userId;
      }

      administrator = new Administrator({
        ...cleanedBody,
        userId
      });
      await administrator.save();
      console.log('New administrator profile created successfully');
    }

    // Populate user data
    await administrator.populate('userId', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Administrator profile updated successfully',
      administrator
    });
  } catch (error) {
    console.error('Update administrator profile error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      console.log('MongoDB validation errors:', validationErrors);
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      console.log('Duplicate key error:', duplicateField);
      
      return res.status(400).json({
        success: false,
        message: `${duplicateField} already exists. Please use a different value.`
      });
    }

    if (error.name === 'CastError') {
      console.log('Cast error:', error.message);
      return res.status(400).json({
        success: false,
        message: `Invalid data type for field: ${error.path}`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating administrator profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all administrators (Super Admin only)
// @route   GET /api/administrators
// @access  Private (Super Admin only)
const getAllAdministrators = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      role,
      status,
      accessLevel,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (department) {
      filter.department = department;
    }
    
    if (role) {
      filter.role = role;
    }
    
    if (status) {
      filter.status = status;
    }

    if (accessLevel) {
      filter.accessLevel = accessLevel;
    }

    // Build search query
    let query = Administrator.find(filter);

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = query.find({
        $or: [
          { employeeId: searchRegex },
          { 'name.firstName': searchRegex },
          { 'name.lastName': searchRegex },
          { email: searchRegex },
          { designation: searchRegex },
          { department: searchRegex }
        ]
      });
    }

    // Apply sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    query = query.sort(sortOptions);

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    query = query.skip(skip).limit(parseInt(limit));

    // Populate user data
    query = query.populate('userId', 'firstName lastName email isActive')
                 .populate('createdBy', 'firstName lastName email');

    const administrators = await query;
    const total = await Administrator.countDocuments(filter);

    res.status(200).json({
      success: true,
      administrators,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all administrators error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching administrators'
    });
  }
};

// @desc    Get administrator by ID (Super Admin only)
// @route   GET /api/administrators/:id
// @access  Private (Super Admin only)
const getAdministratorById = async (req, res) => {
  try {
    const administrator = await Administrator.findById(req.params.id)
      .populate('userId', 'firstName lastName email isActive')
      .populate('createdBy', 'firstName lastName email');

    if (!administrator) {
      return res.status(404).json({
        success: false,
        message: 'Administrator not found'
      });
    }

    res.status(200).json({
      success: true,
      administrator
    });
  } catch (error) {
    console.error('Get administrator by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching administrator'
    });
  }
};

// @desc    Update administrator status (Super Admin only)
// @route   PUT /api/administrators/:id/status
// @access  Private (Super Admin only)
const updateAdministratorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const administrator = await Administrator.findById(req.params.id);
    
    if (!administrator) {
      return res.status(404).json({
        success: false,
        message: 'Administrator not found'
      });
    }

    await administrator.updateStatus(status);

    res.status(200).json({
      success: true,
      message: 'Administrator status updated successfully',
      administrator
    });
  } catch (error) {
    console.error('Update administrator status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating administrator status'
    });
  }
};

// @desc    Get administrator statistics (Super Admin only)
// @route   GET /api/administrators/stats
// @access  Private (Super Admin only)
const getAdministratorStats = async (req, res) => {
  try {
    const totalAdministrators = await Administrator.countDocuments();
    
    const statusStats = await Administrator.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const roleStats = await Administrator.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const departmentStats = await Administrator.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    const accessLevelStats = await Administrator.aggregate([
      {
        $group: {
          _id: '$accessLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total: totalAdministrators,
        status: statusStats,
        roles: roleStats,
        departments: departmentStats,
        accessLevels: accessLevelStats
      }
    });
  } catch (error) {
    console.error('Get administrator stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

// @desc    Delete administrator profile (Super Admin only)
// @route   DELETE /api/administrators/:id
// @access  Private (Super Admin only)
const deleteAdministrator = async (req, res) => {
  try {
    const administrator = await Administrator.findById(req.params.id);
    
    if (!administrator) {
      return res.status(404).json({
        success: false,
        message: 'Administrator not found'
      });
    }

    // Note: Google Drive files are managed externally, no deletion needed
    await Administrator.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Administrator profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete administrator error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting administrator'
    });
  }
};

// @desc    Update profile image with Google Drive link (Administrator only)
// @route   POST /api/administrators/profile-image
// @access  Private (Administrator only)
const updateProfileImage = async (req, res) => {
  try {
    const { googleDriveUrl } = req.body;

    if (!googleDriveUrl) {
      return res.status(400).json({
        success: false,
        message: 'Google Drive URL is required'
      });
    }

    // Process and validate Google Drive URL first
    const processResult = await googleDriveService.processProfileImageUrl(
      googleDriveUrl,
      req.user.id
    );

    if (!processResult.success) {
      return res.status(400).json({
        success: false,
        message: processResult.error || 'Invalid Google Drive URL'
      });
    }

    let administrator = await Administrator.findOne({ userId: req.user.id });
    
    if (!administrator) {
      // Create a basic administrator profile if it doesn't exist
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      administrator = new Administrator({
        userId: req.user.id,
        employeeId: `ADMIN${Date.now()}`, // Generate a temporary employee ID
        name: {
          firstName: user.firstName || 'System',
          lastName: user.lastName || 'Administrator'
        },
        email: user.email,
        mobileNumber: user.phone || '',
        gender: 'Other',
        profilePhotoUrl: processResult.url,
        role: user.role || 'admin',
        department: 'ADMIN',
        designation: 'System Administrator',
        status: 'active',
        dateOfJoining: new Date(),
        registrationDate: new Date(),
        authProvider: 'local',
        accessLevel: 'admin',
        officeLocation: 'Main Office',
        createdBy: req.user.id
      });
      
      await administrator.save();
      console.log('New administrator profile created with profile image');
    } else {
      // Update existing administrator profile with new image URL
      administrator.profilePhotoUrl = processResult.url;
      await administrator.save();
      console.log('Administrator profile image updated successfully');
    }

    // Also update the User model's profilePicture field for consistency
    await User.findByIdAndUpdate(req.user.id, {
      profilePicture: processResult.url
    });

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      profilePhotoUrl: processResult.url,
      thumbnailUrl: processResult.thumbnailUrl
    });
  } catch (error) {
    console.error('Update profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile image'
    });
  }
};

module.exports = {
  getAdministratorProfile,
  updateAdministratorProfile,
  getAllAdministrators,
  getAdministratorById,
  updateAdministratorStatus,
  getAdministratorStats,
  deleteAdministrator,
  updateProfileImage
};
