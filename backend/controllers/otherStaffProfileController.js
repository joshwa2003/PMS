const { validationResult } = require('express-validator');
const OtherStaffProfile = require('../models/OtherStaffProfile');
const User = require('../models/User');

// @desc    Get other staff profile
// @route   GET /api/v1/other-staff-profiles/profile
// @access  Private (Own profile only)
exports.getProfile = async (req, res) => {
  try {
    console.log('🔍 Other Staff Profile - Get Profile Request');
    console.log('User ID:', req.user._id);
    console.log('User Role:', req.user.role);
    console.log('User Department:', req.user.department);

    const userId = req.user._id;
    
    // Find existing profile
    let profile = await OtherStaffProfile.findByUserId(userId);
    console.log('🔍 Existing profile found:', !!profile);
    
    if (!profile) {
      console.log('🔍 Creating new profile for user:', userId);
      
      // Create new profile with user data
      profile = new OtherStaffProfile({
        userId,
        employeeId: req.user.employeeId || `OS${Date.now().toString().slice(-6)}`,
        name: {
          firstName: req.user.firstName || 'Other',
          lastName: req.user.lastName || 'Staff'
        },
        email: req.user.email,
        mobileNumber: req.user.mobileNumber || '0000000000', // Temporary placeholder
        gender: req.user.gender || 'Other', // Default gender
        profilePhotoUrl: req.user.profilePhotoUrl || '',
        role: 'other_staff',
        department: req.user.departmentCode || 'OTHER',
        designation: req.user.designation || 'Other Staff',
        status: 'active',
        dateOfJoining: req.user.dateOfJoining || new Date(),
        registrationDate: new Date(),
        lastLoginAt: req.user.lastLogin || null,
        authProvider: 'local',
        staffCategory: 'Other',
        officeLocation: '',
        workShift: 'Morning',
        yearsOfExperience: 0,
        qualifications: '',
        skills: [],
        certifications: [],
        responsibilities: '',
        reportingManager: '',
        workingHours: {
          startTime: '09:00',
          endTime: '17:00'
        },
        contact: {
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
        adminNotes: ''
      });
      
      await profile.save();
      console.log('✅ New profile created successfully');
    }

    res.status(200).json({
      success: true,
      message: 'Other staff profile retrieved successfully',
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
        staffCategory: profile.staffCategory,
        officeLocation: profile.officeLocation,
        workShift: profile.workShift,
        yearsOfExperience: profile.yearsOfExperience,
        qualifications: profile.qualifications,
        skills: profile.skills,
        certifications: profile.certifications,
        responsibilities: profile.responsibilities,
        reportingManager: profile.reportingManager,
        workingHours: profile.workingHours,
        contact: profile.contact,
        profileCompletion: profile.profileCompletion,
        adminNotes: profile.adminNotes,
        fullName: profile.fullName,
        fullAddress: profile.fullAddress,
        staffCategoryDisplayName: profile.staffCategoryDisplayName,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving other staff profile',
      error: error.message
    });
  }
};

// @desc    Update other staff profile
// @route   PUT /api/v1/other-staff-profiles/profile
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
    let profile = await OtherStaffProfile.findByUserId(userId);
    
    if (!profile) {
      // Create new profile
      profile = new OtherStaffProfile({
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
        } else if (key === 'workingHours' && typeof req.body[key] === 'object') {
          profile.workingHours = { ...profile.workingHours, ...req.body[key] };
        } else if (key === 'skills' && Array.isArray(req.body[key])) {
          profile.skills = req.body[key];
        } else if (key === 'certifications' && Array.isArray(req.body[key])) {
          profile.certifications = req.body[key];
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
      departmentCode: updatedProfile.department,
      employeeId: updatedProfile.employeeId,
      designation: updatedProfile.designation,
      dateOfJoining: updatedProfile.dateOfJoining
    });

    res.status(200).json({
      success: true,
      message: 'Other staff profile updated successfully',
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
        staffCategory: updatedProfile.staffCategory,
        officeLocation: updatedProfile.officeLocation,
        workShift: updatedProfile.workShift,
        yearsOfExperience: updatedProfile.yearsOfExperience,
        qualifications: updatedProfile.qualifications,
        skills: updatedProfile.skills,
        certifications: updatedProfile.certifications,
        responsibilities: updatedProfile.responsibilities,
        reportingManager: updatedProfile.reportingManager,
        workingHours: updatedProfile.workingHours,
        contact: updatedProfile.contact,
        profileCompletion: updatedProfile.profileCompletion,
        adminNotes: updatedProfile.adminNotes,
        fullName: updatedProfile.fullName,
        fullAddress: updatedProfile.fullAddress,
        staffCategoryDisplayName: updatedProfile.staffCategoryDisplayName,
        createdAt: updatedProfile.createdAt,
        updatedAt: updatedProfile.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating other staff profile',
      error: error.message
    });
  }
};

// @desc    Delete other staff profile
// @route   DELETE /api/v1/other-staff-profiles/profile
// @access  Private (Own profile only)
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const profile = await OtherStaffProfile.findByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Other staff profile not found'
      });
    }

    await OtherStaffProfile.findByIdAndDelete(profile._id);

    res.status(200).json({
      success: true,
      message: 'Other staff profile deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting other staff profile',
      error: error.message
    });
  }
};

// @desc    Get other staff profile by employee ID (Admin only)
// @route   GET /api/v1/other-staff-profiles/employee/:employeeId
// @access  Private (Admin only)
exports.getProfileByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const profile = await OtherStaffProfile.findByEmployeeId(employeeId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Other staff profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Other staff profile retrieved successfully',
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
        staffCategory: profile.staffCategory,
        officeLocation: profile.officeLocation,
        workShift: profile.workShift,
        yearsOfExperience: profile.yearsOfExperience,
        qualifications: profile.qualifications,
        skills: profile.skills,
        certifications: profile.certifications,
        responsibilities: profile.responsibilities,
        reportingManager: profile.reportingManager,
        workingHours: profile.workingHours,
        contact: profile.contact,
        profileCompletion: profile.profileCompletion,
        adminNotes: profile.adminNotes,
        fullName: profile.fullName,
        fullAddress: profile.fullAddress,
        staffCategoryDisplayName: profile.staffCategoryDisplayName,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Get profile by employee ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving other staff profile',
      error: error.message
    });
  }
};

// @desc    Upload/Update other staff profile image with Google Drive link
// @route   POST /api/v1/other-staff-profiles/upload-profile-image
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
    
    // Find the profile
    let profile = await OtherStaffProfile.findByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Other staff profile not found'
      });
    }

    // Extract file ID from Google Drive URL and create direct link
    let fileId;
    const driveUrlRegex = /(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=)([a-zA-Z0-9_-]+)/;
    const match = googleDriveUrl.match(driveUrlRegex);
    
    if (match) {
      fileId = match[1];
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google Drive URL format'
      });
    }

    // Create direct access URL
    const profilePhotoUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    // Update profile
    profile.profilePhotoUrl = profilePhotoUrl;
    await profile.save();

    // Also update User model
    await User.findByIdAndUpdate(userId, {
      profilePhotoUrl: profilePhotoUrl
    });

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      profilePhotoUrl: profilePhotoUrl
    });
  } catch (error) {
    console.error('❌ Update profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile image',
      error: error.message
    });
  }
};

// @desc    Update other staff profile image with Google Drive link (alternative endpoint)
// @route   POST /api/v1/other-staff-profiles/update-profile-image
// @access  Private (Own profile only)
exports.updateProfileImageUrl = async (req, res) => {
  try {
    const { googleDriveUrl } = req.body;

    if (!googleDriveUrl) {
      return res.status(400).json({
        success: false,
        message: 'Google Drive URL is required'
      });
    }

    const userId = req.user._id;
    
    // Find the profile
    let profile = await OtherStaffProfile.findByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Other staff profile not found'
      });
    }

    // Extract file ID from Google Drive URL and create direct link
    let fileId;
    const driveUrlRegex = /(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=)([a-zA-Z0-9_-]+)/;
    const match = googleDriveUrl.match(driveUrlRegex);
    
    if (match) {
      fileId = match[1];
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google Drive URL format'
      });
    }

    // Create direct access URL
    const profilePhotoUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    // Update profile
    profile.profilePhotoUrl = profilePhotoUrl;
    await profile.save();

    // Also update User model
    await User.findByIdAndUpdate(userId, {
      profilePhotoUrl: profilePhotoUrl
    });

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      profilePhotoUrl: profilePhotoUrl
    });
  } catch (error) {
    console.error('❌ Update profile image URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile image',
      error: error.message
    });
  }
};
