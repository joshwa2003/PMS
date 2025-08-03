const { validationResult } = require('express-validator');
const DepartmentHODProfile = require('../models/DepartmentHODProfile');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const supabaseStorage = require('../services/supabaseStorage');

// @desc    Get department HOD profile by user ID
// @route   GET /api/v1/department-hod-profiles/profile
// @access  Private (Own profile only)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    let profile = await DepartmentHODProfile.findByUserId(userId);
    
    // If profile doesn't exist, create one from user data
    if (!profile) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Create initial profile from user data with default values for required fields
      profile = new DepartmentHODProfile({
        userId: user._id,
        employeeId: user.employeeId || 'TBD',
        name: {
          firstName: user.firstName || 'Not Set',
          lastName: user.lastName || 'Not Set'
        },
        email: user.email,
        mobileNumber: user.mobileNumber || user.phone || '0000000000',
        gender: user.gender || 'Other',
        profilePhotoUrl: user.profilePhotoUrl || user.profilePicture || '',
        role: user.role === 'hod' ? 'hod' : 'hod',
        department: user.department || 'OTHER',
        designation: user.designation || 'Head of Department',
        dateOfJoining: user.dateOfJoining || new Date(),
        departmentHeadOf: user.department || 'CSE',
        officeRoomNo: user.officeRoomNo || 'TBD',
        yearsAsHOD: user.yearsAsHOD || 0,
        academicBackground: user.academicBackground || 'To be updated',
        numberOfFacultyManaged: user.numberOfFacultyManaged || 0,
        subjectsTaught: user.subjectsTaught || [],
        responsibilities: user.responsibilities || 'To be updated',
        meetingSlots: user.meetingSlots || [],
        calendarLink: user.calendarLink || '',
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
        status: profile.status,
        dateOfJoining: profile.dateOfJoining,
        registrationDate: profile.registrationDate,
        lastLoginAt: profile.lastLoginAt,
        authProvider: profile.authProvider,
        departmentHeadOf: profile.departmentHeadOf,
        officeRoomNo: profile.officeRoomNo,
        yearsAsHOD: profile.yearsAsHOD,
        academicBackground: profile.academicBackground,
        numberOfFacultyManaged: profile.numberOfFacultyManaged,
        subjectsTaught: profile.subjectsTaught,
        responsibilities: profile.responsibilities,
        meetingSlots: profile.meetingSlots,
        calendarLink: profile.calendarLink,
        contact: profile.contact,
        adminNotes: profile.adminNotes,
        profileCompletion: profile.profileCompletion,
        isProfileComplete: profile.isProfileComplete,
        fullName: profile.fullName,
        fullAddress: profile.fullAddress,
        departmentDisplayName: profile.departmentDisplayName,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }
    });
  } catch (error) {
    console.error('Get department HOD profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department HOD profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update department HOD profile
// @route   PUT /api/v1/department-hod-profiles/profile
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
    let profile = await DepartmentHODProfile.findByUserId(userId);
    
    if (!profile) {
      // Create new profile
      profile = new DepartmentHODProfile({
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
        } else if (key === 'subjectsTaught' && Array.isArray(req.body[key])) {
          profile.subjectsTaught = req.body[key];
        } else if (key === 'meetingSlots' && Array.isArray(req.body[key])) {
          profile.meetingSlots = req.body[key];
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
      departmentHeadOf: updatedProfile.departmentHeadOf,
      officeRoomNo: updatedProfile.officeRoomNo,
      yearsAsHOD: updatedProfile.yearsAsHOD,
      academicBackground: updatedProfile.academicBackground,
      numberOfFacultyManaged: updatedProfile.numberOfFacultyManaged,
      subjectsTaught: updatedProfile.subjectsTaught,
      responsibilities: updatedProfile.responsibilities,
      meetingSlots: updatedProfile.meetingSlots,
      calendarLink: updatedProfile.calendarLink,
      contact: updatedProfile.contact,
      adminNotes: updatedProfile.adminNotes
    });

    res.status(200).json({
      success: true,
      message: 'Department HOD profile updated successfully',
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
        departmentHeadOf: updatedProfile.departmentHeadOf,
        officeRoomNo: updatedProfile.officeRoomNo,
        yearsAsHOD: updatedProfile.yearsAsHOD,
        academicBackground: updatedProfile.academicBackground,
        numberOfFacultyManaged: updatedProfile.numberOfFacultyManaged,
        subjectsTaught: updatedProfile.subjectsTaught,
        responsibilities: updatedProfile.responsibilities,
        meetingSlots: updatedProfile.meetingSlots,
        calendarLink: updatedProfile.calendarLink,
        contact: updatedProfile.contact,
        adminNotes: updatedProfile.adminNotes,
        profileCompletion: updatedProfile.profileCompletion,
        isProfileComplete: updatedProfile.isProfileComplete,
        fullName: updatedProfile.fullName,
        fullAddress: updatedProfile.fullAddress,
        departmentDisplayName: updatedProfile.departmentDisplayName,
        createdAt: updatedProfile.createdAt,
        updatedAt: updatedProfile.updatedAt
      }
    });
  } catch (error) {
    console.error('Update department HOD profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating department HOD profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get department HOD profile by ID (Admin only)
// @route   GET /api/v1/department-hod-profiles/:id
// @access  Private (Admin only)
exports.getProfileById = async (req, res) => {
  try {
    const profile = await DepartmentHODProfile.findById(req.params.id)
      .populate('userId', 'email role isActive isVerified lastLogin');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Department HOD profile not found'
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
        departmentHeadOf: profile.departmentHeadOf,
        officeRoomNo: profile.officeRoomNo,
        yearsAsHOD: profile.yearsAsHOD,
        academicBackground: profile.academicBackground,
        numberOfFacultyManaged: profile.numberOfFacultyManaged,
        subjectsTaught: profile.subjectsTaught,
        responsibilities: profile.responsibilities,
        meetingSlots: profile.meetingSlots,
        calendarLink: profile.calendarLink,
        contact: profile.contact,
        adminNotes: profile.adminNotes,
        profileCompletion: profile.profileCompletion,
        isProfileComplete: profile.isProfileComplete,
        fullName: profile.fullName,
        fullAddress: profile.fullAddress,
        departmentDisplayName: profile.departmentDisplayName,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        user: profile.userId
      }
    });
  } catch (error) {
    console.error('Get department HOD profile by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department HOD profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all department HOD profiles (Admin only)
// @route   GET /api/v1/department-hod-profiles
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
    if (req.query.departmentHeadOf) filter.departmentHeadOf = req.query.departmentHeadOf;
    if (req.query.status) filter.status = req.query.status;

    const profiles = await DepartmentHODProfile.find(filter)
      .populate('userId', 'email role isActive isVerified lastLogin')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const totalProfiles = await DepartmentHODProfile.countDocuments(filter);
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
        departmentHeadOf: profile.departmentHeadOf,
        designation: profile.designation,
        status: profile.status,
        profileCompletion: profile.profileCompletion,
        isProfileComplete: profile.isProfileComplete,
        yearsAsHOD: profile.yearsAsHOD,
        numberOfFacultyManaged: profile.numberOfFacultyManaged,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get all department HOD profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department HOD profiles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete department HOD profile (Admin only)
// @route   DELETE /api/v1/department-hod-profiles/:id
// @access  Private (Admin only)
exports.deleteProfile = async (req, res) => {
  try {
    const profile = await DepartmentHODProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Department HOD profile not found'
      });
    }

    // Prevent admin from deleting their own profile
    if (profile.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own profile'
      });
    }

    await DepartmentHODProfile.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Department HOD profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete department HOD profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting department HOD profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get department HOD profile statistics (Admin only)
// @route   GET /api/v1/department-hod-profiles/stats
// @access  Private (Admin only)
exports.getProfileStats = async (req, res) => {
  try {
    // Get total profiles count
    const totalProfiles = await DepartmentHODProfile.countDocuments();

    // Get profiles by department head of
    const profilesByDepartmentHeadOf = await DepartmentHODProfile.aggregate([
      {
        $group: {
          _id: '$departmentHeadOf',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get profiles by department
    const profilesByDepartment = await DepartmentHODProfile.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get profiles by status
    const profilesByStatus = await DepartmentHODProfile.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get complete vs incomplete profiles
    const completeProfiles = await DepartmentHODProfile.countDocuments({ isProfileComplete: true });
    const incompleteProfiles = await DepartmentHODProfile.countDocuments({ isProfileComplete: false });

    // Get average profile completion
    const avgCompletion = await DepartmentHODProfile.aggregate([
      {
        $group: {
          _id: null,
          avgCompletion: { $avg: '$profileCompletion' }
        }
      }
    ]);

    // Get average years as HOD
    const avgYearsAsHOD = await DepartmentHODProfile.aggregate([
      {
        $group: {
          _id: null,
          avgYears: { $avg: '$yearsAsHOD' }
        }
      }
    ]);

    // Get average faculty managed
    const avgFacultyManaged = await DepartmentHODProfile.aggregate([
      {
        $group: {
          _id: null,
          avgFaculty: { $avg: '$numberOfFacultyManaged' }
        }
      }
    ]);

    // Get recent profiles (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentProfiles = await DepartmentHODProfile.countDocuments({
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
        averageYearsAsHOD: avgYearsAsHOD[0]?.avgYears || 0,
        averageFacultyManaged: avgFacultyManaged[0]?.avgFaculty || 0,
        profilesByDepartmentHeadOf: profilesByDepartmentHeadOf.reduce((acc, item) => {
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
    console.error('Get department HOD profile stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department HOD profile statistics',
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

// @desc    Upload department HOD profile image
// @route   POST /api/v1/department-hod-profiles/upload-profile-image
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

      // Update department HOD profile with new image URL
      let profile = await DepartmentHODProfile.findOne({ userId });
      
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
