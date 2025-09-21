const { validationResult } = require('express-validator');
const PlacementDirectorProfile = require('../models/PlacementDirectorProfile');
const User = require('../models/User');
const googleDriveService = require('../services/googleDriveService');

// @desc    Get placement director profile by user ID
// @route   GET /api/v1/placement-director-profiles/profile
// @access  Private (Own profile only)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    let profile = await PlacementDirectorProfile.findByUserId(userId);
    
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
      profile = new PlacementDirectorProfile({
        userId: user._id,
        employeeId: user.employeeId || '',
        name: {
          firstName: user.firstName || '',
          lastName: user.lastName || ''
        },
        email: user.email,
        mobileNumber: user.mobileNumber || user.phone || '',
        gender: user.gender || 'Other',
        profilePhotoUrl: user.profilePhotoUrl || user.profilePicture || '',
        role: 'placement_director',
        department: 'Placement Cell',
        designation: user.designation || 'Director',
        dateOfJoining: user.dateOfJoining || new Date(),
        officeRoomNo: user.officeRoomNo || '',
        officialEmail: user.officialEmail || user.email,
        alternateMobile: user.alternateMobile || '',
        reportingTo: user.reportingTo || null,
        yearsOfExperience: user.yearsOfExperience || 0,
        resumeUrl: user.resumeUrl || '',
        responsibilitiesText: user.responsibilitiesText || '',
        communicationPreferences: user.communicationPreferences || ['email', 'portal'],
        contact: user.contact || {
          address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
          }
        },
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
        status: profile.status,
        dateOfJoining: profile.dateOfJoining,
        registrationDate: profile.registrationDate,
        lastLoginAt: profile.lastLoginAt,
        authProvider: profile.authProvider,
        officeRoomNo: profile.officeRoomNo,
        officialEmail: profile.officialEmail,
        alternateMobile: profile.alternateMobile,
        reportingTo: profile.reportingTo,
        yearsOfExperience: profile.yearsOfExperience,
        resumeUrl: profile.resumeUrl,
        responsibilitiesText: profile.responsibilitiesText,
        communicationPreferences: profile.communicationPreferences,
        contact: profile.contact,
        profileCompletion: profile.profileCompletion,
        isProfileComplete: profile.isProfileComplete,
        fullName: profile.fullName,
        fullAddress: profile.fullAddress,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }
    });
  } catch (error) {
    console.error('Get placement director profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching placement director profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update placement director profile
// @route   PUT /api/v1/placement-director-profiles/profile
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
    let profile = await PlacementDirectorProfile.findByUserId(userId);
    
    if (!profile) {
      // Create new profile
      profile = new PlacementDirectorProfile({
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
      officeRoomNo: updatedProfile.officeRoomNo,
      officialEmail: updatedProfile.officialEmail,
      alternateMobile: updatedProfile.alternateMobile,
      reportingTo: updatedProfile.reportingTo,
      yearsOfExperience: updatedProfile.yearsOfExperience,
      resumeUrl: updatedProfile.resumeUrl,
      responsibilitiesText: updatedProfile.responsibilitiesText,
      communicationPreferences: updatedProfile.communicationPreferences,
      contact: updatedProfile.contact
    });

    res.status(200).json({
      success: true,
      message: 'Placement director profile updated successfully',
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
        status: updatedProfile.status,
        dateOfJoining: updatedProfile.dateOfJoining,
        registrationDate: updatedProfile.registrationDate,
        lastLoginAt: updatedProfile.lastLoginAt,
        authProvider: updatedProfile.authProvider,
        officeRoomNo: updatedProfile.officeRoomNo,
        officialEmail: updatedProfile.officialEmail,
        alternateMobile: updatedProfile.alternateMobile,
        reportingTo: updatedProfile.reportingTo,
        yearsOfExperience: updatedProfile.yearsOfExperience,
        resumeUrl: updatedProfile.resumeUrl,
        responsibilitiesText: updatedProfile.responsibilitiesText,
        communicationPreferences: updatedProfile.communicationPreferences,
        contact: updatedProfile.contact,
        profileCompletion: updatedProfile.profileCompletion,
        isProfileComplete: updatedProfile.isProfileComplete,
        fullName: updatedProfile.fullName,
        fullAddress: updatedProfile.fullAddress,
        createdAt: updatedProfile.createdAt,
        updatedAt: updatedProfile.updatedAt
      }
    });
  } catch (error) {
    console.error('Update placement director profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating placement director profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get placement director profile by ID (Admin only)
// @route   GET /api/v1/placement-director-profiles/:id
// @access  Private (Admin only)
exports.getProfileById = async (req, res) => {
  try {
    const profile = await PlacementDirectorProfile.findById(req.params.id)
      .populate('userId', 'email role isActive isVerified lastLogin')
      .populate('reportingTo', 'firstName lastName email');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Placement director profile not found'
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
        status: profile.status,
        dateOfJoining: profile.dateOfJoining,
        registrationDate: profile.registrationDate,
        lastLoginAt: profile.lastLoginAt,
        authProvider: profile.authProvider,
        officeRoomNo: profile.officeRoomNo,
        officialEmail: profile.officialEmail,
        alternateMobile: profile.alternateMobile,
        reportingTo: profile.reportingTo,
        yearsOfExperience: profile.yearsOfExperience,
        resumeUrl: profile.resumeUrl,
        responsibilitiesText: profile.responsibilitiesText,
        communicationPreferences: profile.communicationPreferences,
        contact: profile.contact,
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
    console.error('Get placement director profile by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching placement director profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all placement director profiles (Admin only)
// @route   GET /api/v1/placement-director-profiles
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
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = req.query.department;

    const profiles = await PlacementDirectorProfile.find(filter)
      .populate('userId', 'email role isActive isVerified lastLogin')
      .populate('reportingTo', 'firstName lastName email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const totalProfiles = await PlacementDirectorProfile.countDocuments(filter);
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
    console.error('Get all placement director profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching placement director profiles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete placement director profile (Admin only)
// @route   DELETE /api/v1/placement-director-profiles/:id
// @access  Private (Admin only)
exports.deleteProfile = async (req, res) => {
  try {
    const profile = await PlacementDirectorProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Placement director profile not found'
      });
    }

    // Prevent admin from deleting their own profile
    if (profile.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own profile'
      });
    }

    await PlacementDirectorProfile.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Placement director profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete placement director profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting placement director profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get placement director profile statistics (Admin only)
// @route   GET /api/v1/placement-director-profiles/stats
// @access  Private (Admin only)
exports.getProfileStats = async (req, res) => {
  try {
    // Get total profiles count
    const totalProfiles = await PlacementDirectorProfile.countDocuments();

    // Get profiles by status
    const profilesByStatus = await PlacementDirectorProfile.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get complete vs incomplete profiles
    const completeProfiles = await PlacementDirectorProfile.countDocuments({ isProfileComplete: true });
    const incompleteProfiles = await PlacementDirectorProfile.countDocuments({ isProfileComplete: false });

    // Get average profile completion
    const avgCompletion = await PlacementDirectorProfile.aggregate([
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
    const recentProfiles = await PlacementDirectorProfile.countDocuments({
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
        profilesByStatus: profilesByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get placement director profile stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching placement director profile statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update placement director profile image with Google Drive link
// @route   POST /api/v1/placement-director-profiles/update-profile-image
// @access  Private (Own profile only)
exports.updateProfileImage = async (req, res) => {
  try {
    const { googleDriveUrl } = req.body;

    if (!googleDriveUrl) {
      return res.status(400).json({
        success: false,
        message: 'Google Drive URL is required'
      });
    }

    const userId = req.user._id;
    
    // Process and validate Google Drive URL
    const processResult = await googleDriveService.processProfileImageUrl(
      googleDriveUrl,
      userId
    );

    if (!processResult.success) {
      return res.status(400).json({
        success: false,
        message: processResult.error || 'Invalid Google Drive URL'
      });
    }

    const profilePhotoUrl = processResult.url;

    // Update placement director profile with new image URL
    let profile = await PlacementDirectorProfile.findOne({ userId });
    
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
      message: 'Profile image updated successfully',
      profilePhotoUrl: profilePhotoUrl,
      thumbnailUrl: processResult.thumbnailUrl
    });
  } catch (error) {
    console.error('Update profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update placement director resume with Google Drive link
// @route   POST /api/v1/placement-director-profiles/update-resume
// @access  Private (Own profile only)
exports.updateResume = async (req, res) => {
  try {
    const { googleDriveUrl } = req.body;

    if (!googleDriveUrl) {
      return res.status(400).json({
        success: false,
        message: 'Google Drive URL is required'
      });
    }

    const userId = req.user._id;
    
    // Process and validate Google Drive URL
    const processResult = await googleDriveService.processResumeUrl(
      googleDriveUrl,
      userId
    );

    if (!processResult.success) {
      return res.status(400).json({
        success: false,
        message: processResult.error || 'Invalid Google Drive URL'
      });
    }

    const resumeUrl = processResult.url;

    // Update placement director profile with new resume URL
    let profile = await PlacementDirectorProfile.findOne({ userId });
    
    if (profile) {
      profile.resumeUrl = resumeUrl;
      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      resumeUrl: resumeUrl,
      embedUrl: googleDriveService.getEmbedUrl(resumeUrl)
    });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating resume',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
