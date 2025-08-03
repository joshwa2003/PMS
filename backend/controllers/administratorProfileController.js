const { validationResult } = require('express-validator');
const AdministratorProfile = require('../models/AdministratorProfile');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const supabaseStorage = require('../services/supabaseStorage');

// @desc    Get administrator profile by user ID
// @route   GET /api/v1/administrator-profiles/profile
// @access  Private (Own profile only)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    let profile = await AdministratorProfile.findByUserId(userId);
    
    // If profile doesn't exist, create one from user data
    if (!profile) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Create initial profile from user data
      profile = new AdministratorProfile({
        userId: user._id,
        employeeId: user.employeeId || '',
        name: {
          firstName: user.firstName || '',
          lastName: user.lastName || ''
        },
        email: user.email,
        mobileNumber: user.mobileNumber || user.phone || '',
        gender: user.gender || '',
        profilePhotoUrl: user.profilePhotoUrl || user.profilePicture || '',
        role: user.role === 'admin' ? 'admin' : 'staff',
        department: user.department || 'OTHER',
        designation: user.designation || '',
        dateOfJoining: user.dateOfJoining || new Date(),
        accessLevel: user.role === 'admin' ? 'admin' : 'limited',
        officeLocation: user.officeLocation || '',
        contact: user.contact || {
          alternatePhone: '',
          emergencyContact: '',
          address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
          }
        },
        adminNotes: user.adminNotes || '',
        createdBy: user._id,
        lastLoginAt: user.lastLogin
      });
      
      await profile.save();
    }

    res.status(200).json({
      success: true,
      profile: {
        id: profile._id,
        userId: profile.userId,
        employeeId: profile.employeeId,
        name: profile.name,
        email: profile.email,
        mobileNumber: profile.mobileNumber,
        gender: profile.gender,
        profilePhotoUrl: profile.profilePhotoUrl,
        role: profile.role,
        department: profile.department,
        designation: profile.designation,
        dateOfJoining: profile.dateOfJoining,
        accessLevel: profile.accessLevel,
        officeLocation: profile.officeLocation,
        status: profile.status,
        authProvider: profile.authProvider,
        contact: profile.contact,
        adminNotes: profile.adminNotes,
        profileCompletion: profile.profileCompletion,
        isProfileComplete: profile.isProfileComplete,
        fullName: profile.fullName,
        fullAddress: profile.fullAddress,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }
    });
  } catch (error) {
    console.error('Get administrator profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching administrator profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update administrator profile
// @route   PUT /api/v1/administrator-profiles/profile
// @access  Private (Own profile only)
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

    const userId = req.user._id;
    
    // Find existing profile or create new one
    let profile = await AdministratorProfile.findByUserId(userId);
    
    if (!profile) {
      // Create new profile
      profile = new AdministratorProfile({
        userId,
        ...req.body
      });
    } else {
      // Update existing profile
      Object.keys(req.body).forEach(key => {
        if (key === 'name' && typeof req.body[key] === 'object') {
          profile.name = { ...profile.name, ...req.body[key] };
        } else if (key === 'contact' && typeof req.body[key] === 'object') {
          profile.contact = { ...profile.contact, ...req.body[key] };
          if (req.body[key].address && typeof req.body[key].address === 'object') {
            profile.contact.address = { ...profile.contact.address, ...req.body[key].address };
          }
        } else {
          profile[key] = req.body[key];
        }
      });
    }

    const updatedProfile = await profile.save();

    // Also update the User model with basic information
    await User.findByIdAndUpdate(userId, {
      firstName: updatedProfile.name.firstName,
      lastName: updatedProfile.name.lastName,
      mobileNumber: updatedProfile.mobileNumber,
      gender: updatedProfile.gender,
      profilePhotoUrl: updatedProfile.profilePhotoUrl,
      department: updatedProfile.department,
      employeeId: updatedProfile.employeeId,
      designation: updatedProfile.designation,
      dateOfJoining: updatedProfile.dateOfJoining,
      officeLocation: updatedProfile.officeLocation,
      contact: updatedProfile.contact,
      adminNotes: updatedProfile.adminNotes
    });

    res.status(200).json({
      success: true,
      message: 'Administrator profile updated successfully',
      profile: {
        id: updatedProfile._id,
        userId: updatedProfile.userId,
        employeeId: updatedProfile.employeeId,
        name: updatedProfile.name,
        email: updatedProfile.email,
        mobileNumber: updatedProfile.mobileNumber,
        gender: updatedProfile.gender,
        profilePhotoUrl: updatedProfile.profilePhotoUrl,
        role: updatedProfile.role,
        department: updatedProfile.department,
        designation: updatedProfile.designation,
        dateOfJoining: updatedProfile.dateOfJoining,
        accessLevel: updatedProfile.accessLevel,
        officeLocation: updatedProfile.officeLocation,
        status: updatedProfile.status,
        authProvider: updatedProfile.authProvider,
        contact: updatedProfile.contact,
        adminNotes: updatedProfile.adminNotes,
        profileCompletion: updatedProfile.profileCompletion,
        isProfileComplete: updatedProfile.isProfileComplete,
        fullName: updatedProfile.fullName,
        fullAddress: updatedProfile.fullAddress,
        createdAt: updatedProfile.createdAt,
        updatedAt: updatedProfile.updatedAt
      }
    });
  } catch (error) {
    console.error('Update administrator profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating administrator profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get administrator profile by ID (Admin only)
// @route   GET /api/v1/administrator-profiles/:id
// @access  Private (Admin only)
exports.getProfileById = async (req, res) => {
  try {
    const profile = await AdministratorProfile.findById(req.params.id)
      .populate('userId', 'email role isActive isVerified lastLogin');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Administrator profile not found'
      });
    }

    res.status(200).json({
      success: true,
      profile: {
        id: profile._id,
        userId: profile.userId,
        employeeId: profile.employeeId,
        name: profile.name,
        email: profile.email,
        mobileNumber: profile.mobileNumber,
        gender: profile.gender,
        profilePhotoUrl: profile.profilePhotoUrl,
        role: profile.role,
        department: profile.department,
        designation: profile.designation,
        dateOfJoining: profile.dateOfJoining,
        accessLevel: profile.accessLevel,
        officeLocation: profile.officeLocation,
        status: profile.status,
        authProvider: profile.authProvider,
        contact: profile.contact,
        adminNotes: profile.adminNotes,
        profileCompletion: profile.profileCompletion,
        isProfileComplete: profile.isProfileComplete,
        fullName: profile.fullName,
        fullAddress: profile.fullAddress,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        user: profile.userId
      }
    });
  } catch (error) {
    console.error('Get administrator profile by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching administrator profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all administrator profiles (Admin only)
// @route   GET /api/v1/administrator-profiles
// @access  Private (Admin only)
exports.getAllProfiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter object
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.accessLevel) filter.accessLevel = req.query.accessLevel;

    const profiles = await AdministratorProfile.find(filter)
      .populate('userId', 'email role isActive isVerified lastLogin')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const totalProfiles = await AdministratorProfile.countDocuments(filter);
    const totalPages = Math.ceil(totalProfiles / limit);

    res.status(200).json({
      success: true,
      count: profiles.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalProfiles,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      profiles: profiles.map(profile => ({
        id: profile._id,
        employeeId: profile.employeeId,
        fullName: profile.fullName,
        email: profile.email,
        role: profile.role,
        department: profile.department,
        designation: profile.designation,
        status: profile.status,
        profileCompletion: profile.profileCompletion,
        isProfileComplete: profile.isProfileComplete,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get all administrator profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching administrator profiles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete administrator profile (Admin only)
// @route   DELETE /api/v1/administrator-profiles/:id
// @access  Private (Admin only)
exports.deleteProfile = async (req, res) => {
  try {
    const profile = await AdministratorProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Administrator profile not found'
      });
    }

    // Prevent admin from deleting their own profile
    if (profile.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own profile'
      });
    }

    await AdministratorProfile.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Administrator profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete administrator profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting administrator profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get administrator profile statistics (Admin only)
// @route   GET /api/v1/administrator-profiles/stats
// @access  Private (Admin only)
exports.getProfileStats = async (req, res) => {
  try {
    // Get total profiles count
    const totalProfiles = await AdministratorProfile.countDocuments();

    // Get profiles by role
    const profilesByRole = await AdministratorProfile.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get profiles by department
    const profilesByDepartment = await AdministratorProfile.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get profiles by status
    const profilesByStatus = await AdministratorProfile.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get complete vs incomplete profiles
    const completeProfiles = await AdministratorProfile.countDocuments({ isProfileComplete: true });
    const incompleteProfiles = await AdministratorProfile.countDocuments({ isProfileComplete: false });

    // Get average profile completion
    const avgCompletion = await AdministratorProfile.aggregate([
      {
        $group: {
          _id: null,
          avgCompletion: { $avg: '$profileCompletion' }
        }
      }
    ]);

    // Get recent profiles (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentProfiles = await AdministratorProfile.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalProfiles,
        completeProfiles,
        incompleteProfiles,
        recentProfiles,
        averageCompletion: avgCompletion[0]?.avgCompletion || 0,
        profilesByRole: profilesByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        profilesByDepartment: profilesByDepartment.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        profilesByStatus: profilesByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get administrator profile stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching administrator profile statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
    }
  }
});

// @desc    Upload administrator profile image
// @route   POST /api/v1/administrator-profiles/upload-profile-image
// @access  Private (Own profile only)
exports.uploadProfileImage = [
  upload.single('profileImage'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      const userId = req.user._id;
      
      // Upload to Supabase using the uploadProfileImage method
      const uploadResult = await supabaseStorage.uploadProfileImage(
        req.file.buffer, 
        req.file.originalname, 
        userId
      );

      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: uploadResult.error || 'Failed to upload image to storage'
        });
      }

      const profilePhotoUrl = uploadResult.url;

      // Update administrator profile with new image URL
      let profile = await AdministratorProfile.findOne({ userId });
      
      if (profile) {
        profile.profilePhotoUrl = profilePhotoUrl;
        await profile.save();
      }

      // Also update User model
      await User.findByIdAndUpdate(userId, {
        profilePhotoUrl: profilePhotoUrl
      });

      res.status(200).json({
        success: true,
        message: 'Profile image uploaded successfully',
        profilePhotoUrl: profilePhotoUrl
      });
    } catch (error) {
      console.error('Upload profile image error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while uploading profile image',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
];
