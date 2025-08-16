const { validationResult } = require('express-validator');
const PlacementStaffProfile = require('../models/PlacementStaffProfile');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const supabaseStorage = require('../services/supabaseStorage');

// @desc    Get placement staff profile by user ID
// @route   GET /api/v1/placement-staff-profiles/profile
// @access  Private (Own profile only)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    let profile = await PlacementStaffProfile.findByUserId(userId);
    
    // If profile doesn't exist, create one from user data
    if (!profile) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Create initial profile from user data with required defaults
      profile = new PlacementStaffProfile({
        userId: user._id,
        employeeId: user.employeeId || `EMP${Date.now()}`,
        name: {
          firstName: user.firstName || 'Staff',
          lastName: user.lastName || 'Member'
        },
        email: user.email,
        mobileNumber: user.mobileNumber || user.phone || '0000000000',
        gender: user.gender || 'Other',
        profilePhotoUrl: user.profilePhotoUrl || user.profilePicture || '',
        role: user.role === 'placement_staff' ? 'staff' : 'other',
        department: user.department || 'OTHER',
        designation: user.designation || 'Staff Coordinator',
        dateOfJoining: user.dateOfJoining || new Date(),
        officeLocation: user.officeLocation || 'Main Campus',
        officialEmail: user.officialEmail || user.email,
        experienceYears: user.experienceYears || 0,
        qualifications: user.qualifications || [],
        assignedStudents: [],
        responsibilitiesText: user.responsibilitiesText || '',
        trainingProgramsHandled: user.trainingProgramsHandled || [],
        languagesSpoken: user.languagesSpoken || [],
        availabilityTimeSlots: user.availabilityTimeSlots || [],
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
      
      // Save with validation disabled initially, then update profile completion
      await profile.save({ validateBeforeSave: false });
      await profile.updateProfileCompletion();
    }

    res.status(200).json({
      success: true,
      profile: {
        id: profile._id,
        userId: profile.userId,
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
        employeeId: profile.employeeId,
        officeLocation: profile.officeLocation,
        officialEmail: profile.officialEmail,
        experienceYears: profile.experienceYears,
        qualifications: profile.qualifications,
        assignedStudents: profile.assignedStudents,
        responsibilitiesText: profile.responsibilitiesText,
        trainingProgramsHandled: profile.trainingProgramsHandled,
        languagesSpoken: profile.languagesSpoken,
        availabilityTimeSlots: profile.availabilityTimeSlots,
        contact: profile.contact,
        adminNotes: profile.adminNotes,
        profileCompletion: profile.profileCompletion,
        isProfileComplete: profile.isProfileComplete,
        fullName: profile.fullName,
        fullAddress: profile.fullAddress,
        assignedStudentsCount: profile.assignedStudentsCount,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }
    });
  } catch (error) {
    console.error('Get placement staff profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching placement staff profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update placement staff profile
// @route   PUT /api/v1/placement-staff-profiles/profile
// @access  Private (Own profile only)
exports.updateProfile = async (req, res) => {
  try {
    console.log('Update profile request received for user:', req.user._id);
    console.log('Update data:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    
    // Find existing profile or create new one
    let profile = await PlacementStaffProfile.findByUserId(userId);
    
    if (!profile) {
      console.log('Profile not found, creating new profile for user:', userId);
      
      // For new profile creation, we need to ensure required fields have default values
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Create new profile with required defaults and merge with request body
      const profileData = {
        userId,
        employeeId: req.body.employeeId || user.employeeId || `EMP${Date.now()}`,
        name: req.body.name || {
          firstName: user.firstName || 'Staff',
          lastName: user.lastName || 'Member'
        },
        email: req.body.email || user.email,
        mobileNumber: req.body.mobileNumber || user.mobileNumber || user.phone || '0000000000',
        gender: req.body.gender || user.gender || 'Other',
        role: req.body.role || (user.role === 'placement_staff' ? 'staff' : 'other'),
        department: req.body.department || user.department || 'OTHER',
        designation: req.body.designation || user.designation || 'Staff Coordinator',
        dateOfJoining: req.body.dateOfJoining || user.dateOfJoining || new Date(),
        officeLocation: req.body.officeLocation || user.officeLocation || 'Main Campus',
        officialEmail: req.body.officialEmail || user.officialEmail || user.email,
        experienceYears: req.body.experienceYears !== undefined ? req.body.experienceYears : (user.experienceYears || 0),
        qualifications: req.body.qualifications || user.qualifications || [],
        assignedStudents: req.body.assignedStudents || [],
        responsibilitiesText: req.body.responsibilitiesText || user.responsibilitiesText || '',
        trainingProgramsHandled: req.body.trainingProgramsHandled || user.trainingProgramsHandled || [],
        languagesSpoken: req.body.languagesSpoken || user.languagesSpoken || [],
        availabilityTimeSlots: req.body.availabilityTimeSlots || user.availabilityTimeSlots || [],
        contact: req.body.contact || user.contact || {
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
        adminNotes: req.body.adminNotes || user.adminNotes || '',
        profilePhotoUrl: req.body.profilePhotoUrl || user.profilePhotoUrl || '',
        createdBy: user._id,
        lastLoginAt: user.lastLogin
      };

      profile = new PlacementStaffProfile(profileData);
      console.log('Creating new profile with data:', profileData);
    } else {
      console.log('Updating existing profile');
      // Update existing profile - only update provided fields
      Object.keys(req.body).forEach(key => {
        if (key === 'name' && typeof req.body[key] === 'object') {
          profile.name = { ...profile.name, ...req.body[key] };
        } else if (key === 'contact' && typeof req.body[key] === 'object') {
          profile.contact = { ...profile.contact, ...req.body[key] };
          if (req.body[key].address && typeof req.body[key].address === 'object') {
            profile.contact.address = { ...profile.contact.address, ...req.body[key].address };
          }
        } else if (Array.isArray(req.body[key])) {
          profile[key] = req.body[key];
        } else {
          profile[key] = req.body[key];
        }
      });
    }

    // Use validateBeforeSave: false to skip validation for partial updates
    console.log('Saving profile...');
    const updatedProfile = await profile.save({ validateBeforeSave: false });
    console.log('Profile saved successfully');

    // Manually trigger profile completion calculation after save
    await updatedProfile.updateProfileCompletion();

    // Prepare user update data - only include fields that are compatible with User model
    const userUpdateData = {};
    if (updatedProfile.name?.firstName) userUpdateData.firstName = updatedProfile.name.firstName;
    if (updatedProfile.name?.lastName) userUpdateData.lastName = updatedProfile.name.lastName;
    if (updatedProfile.mobileNumber) userUpdateData.mobileNumber = updatedProfile.mobileNumber;
    if (updatedProfile.gender) userUpdateData.gender = updatedProfile.gender;
    if (updatedProfile.profilePhotoUrl) userUpdateData.profilePhotoUrl = updatedProfile.profilePhotoUrl;
    // Note: Skip department field as User model expects ObjectId but PlacementStaffProfile uses string
    // Store department code in departmentCode field instead
    if (updatedProfile.department) userUpdateData.departmentCode = updatedProfile.department;
    if (updatedProfile.employeeId) userUpdateData.employeeId = updatedProfile.employeeId;
    if (updatedProfile.designation) userUpdateData.designation = updatedProfile.designation;
    if (updatedProfile.dateOfJoining) userUpdateData.dateOfJoining = updatedProfile.dateOfJoining;
    if (updatedProfile.officeLocation) userUpdateData.officeLocation = updatedProfile.officeLocation;
    if (updatedProfile.contact) userUpdateData.contact = updatedProfile.contact;
    if (updatedProfile.adminNotes) userUpdateData.adminNotes = updatedProfile.adminNotes;

    // Update the User model with compatible fields only
    if (Object.keys(userUpdateData).length > 0) {
      console.log('Updating user model with:', userUpdateData);
      await User.findByIdAndUpdate(userId, userUpdateData);
    }

    console.log('Profile update completed successfully');
    res.status(200).json({
      success: true,
      message: 'Placement staff profile updated successfully',
      profile: {
        id: updatedProfile._id,
        userId: updatedProfile.userId,
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
        employeeId: updatedProfile.employeeId,
        officeLocation: updatedProfile.officeLocation,
        officialEmail: updatedProfile.officialEmail,
        experienceYears: updatedProfile.experienceYears,
        qualifications: updatedProfile.qualifications,
        assignedStudents: updatedProfile.assignedStudents,
        responsibilitiesText: updatedProfile.responsibilitiesText,
        trainingProgramsHandled: updatedProfile.trainingProgramsHandled,
        languagesSpoken: updatedProfile.languagesSpoken,
        availabilityTimeSlots: updatedProfile.availabilityTimeSlots,
        contact: updatedProfile.contact,
        adminNotes: updatedProfile.adminNotes,
        profileCompletion: updatedProfile.profileCompletion,
        isProfileComplete: updatedProfile.isProfileComplete,
        fullName: updatedProfile.fullName,
        fullAddress: updatedProfile.fullAddress,
        assignedStudentsCount: updatedProfile.assignedStudentsCount,
        createdAt: updatedProfile.createdAt,
        updatedAt: updatedProfile.updatedAt
      }
    });
  } catch (error) {
    console.error('Update placement staff profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating placement staff profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get placement staff profile by ID (Admin only)
// @route   GET /api/v1/placement-staff-profiles/:id
// @access  Private (Admin only)
exports.getProfileById = async (req, res) => {
  try {
    const profile = await PlacementStaffProfile.findById(req.params.id)
      .populate('userId', 'email role isActive isVerified lastLogin')
      .populate('assignedStudents', 'firstName lastName email rollNumber');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Placement staff profile not found'
      });
    }

    res.status(200).json({
      success: true,
      profile: {
        id: profile._id,
        userId: profile.userId,
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
        employeeId: profile.employeeId,
        officeLocation: profile.officeLocation,
        officialEmail: profile.officialEmail,
        experienceYears: profile.experienceYears,
        qualifications: profile.qualifications,
        assignedStudents: profile.assignedStudents,
        responsibilitiesText: profile.responsibilitiesText,
        trainingProgramsHandled: profile.trainingProgramsHandled,
        languagesSpoken: profile.languagesSpoken,
        availabilityTimeSlots: profile.availabilityTimeSlots,
        contact: profile.contact,
        adminNotes: profile.adminNotes,
        profileCompletion: profile.profileCompletion,
        isProfileComplete: profile.isProfileComplete,
        fullName: profile.fullName,
        fullAddress: profile.fullAddress,
        assignedStudentsCount: profile.assignedStudentsCount,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        user: profile.userId
      }
    });
  } catch (error) {
    console.error('Get placement staff profile by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching placement staff profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all placement staff profiles (Admin only)
// @route   GET /api/v1/placement-staff-profiles
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

    const profiles = await PlacementStaffProfile.find(filter)
      .populate('userId', 'email role isActive isVerified lastLogin')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const totalProfiles = await PlacementStaffProfile.countDocuments(filter);
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
        assignedStudentsCount: profile.assignedStudentsCount,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get all placement staff profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching placement staff profiles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete placement staff profile (Admin only)
// @route   DELETE /api/v1/placement-staff-profiles/:id
// @access  Private (Admin only)
exports.deleteProfile = async (req, res) => {
  try {
    const profile = await PlacementStaffProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Placement staff profile not found'
      });
    }

    // Prevent staff from deleting their own profile
    if (profile.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own profile'
      });
    }

    await PlacementStaffProfile.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Placement staff profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete placement staff profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting placement staff profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get placement staff profile statistics (Admin only)
// @route   GET /api/v1/placement-staff-profiles/stats
// @access  Private (Admin only)
exports.getProfileStats = async (req, res) => {
  try {
    // Get total profiles count
    const totalProfiles = await PlacementStaffProfile.countDocuments();

    // Get profiles by role
    const profilesByRole = await PlacementStaffProfile.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get profiles by department
    const profilesByDepartment = await PlacementStaffProfile.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get profiles by status
    const profilesByStatus = await PlacementStaffProfile.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get complete vs incomplete profiles
    const completeProfiles = await PlacementStaffProfile.countDocuments({ isProfileComplete: true });
    const incompleteProfiles = await PlacementStaffProfile.countDocuments({ isProfileComplete: false });

    // Get average profile completion
    const avgCompletion = await PlacementStaffProfile.aggregate([
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
    const recentProfiles = await PlacementStaffProfile.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get average assigned students per staff
    const avgAssignedStudents = await PlacementStaffProfile.aggregate([
      {
        $group: {
          _id: null,
          avgAssigned: { $avg: { $size: '$assignedStudents' } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalProfiles,
        completeProfiles,
        incompleteProfiles,
        recentProfiles,
        averageCompletion: avgCompletion[0]?.avgCompletion || 0,
        averageAssignedStudents: avgAssignedStudents[0]?.avgAssigned || 0,
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
    console.error('Get placement staff profile stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching placement staff profile statistics',
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
    try {
      // Check file type
      const allowedTypes = /jpeg|jpg|png|gif/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
      }
    } catch (error) {
      cb(new Error('Invalid file format'));
    }
  }
});

// @desc    Upload placement staff profile image
// @route   POST /api/v1/placement-staff-profiles/upload-profile-image
// @access  Private (Own profile only)
exports.uploadProfileImage = async (req, res) => {
  // Apply multer middleware
  upload.single('profileImage')(req, res, async (err) => {
    try {
      // Handle multer errors
      if (err) {
        console.error('Multer error:', err);
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File size too large. Maximum size is 5MB.'
            });
          }
          return res.status(400).json({
            success: false,
            message: `File upload error: ${err.message}`
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed'
        });
      }

      // Check if file was provided
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided. Please select an image file.'
        });
      }

      const userId = req.user._id;
      console.log('Starting profile image upload for user:', userId);
      console.log('File details:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      // Ensure placement staff profile exists before uploading image
      let profile = await PlacementStaffProfile.findOne({ userId });
      
      if (!profile) {
        console.log('Profile not found, creating new profile for user:', userId);
        
        // Get user data to create profile
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        // Create new profile with minimal required data
        profile = new PlacementStaffProfile({
          userId: user._id,
          employeeId: user.employeeId || `EMP${Date.now()}`,
          name: {
            firstName: user.firstName || 'Staff',
            lastName: user.lastName || 'Member'
          },
          email: user.email,
          mobileNumber: user.mobileNumber || user.phone || '0000000000',
          gender: user.gender || 'Other',
          role: user.role === 'placement_staff' ? 'staff' : 'other',
          department: user.department || 'OTHER',
          designation: user.designation || 'Staff Coordinator',
          dateOfJoining: user.dateOfJoining || new Date(),
          officeLocation: user.officeLocation || 'Main Campus',
          officialEmail: user.officialEmail || user.email,
          experienceYears: user.experienceYears || 0,
          qualifications: user.qualifications || [],
          assignedStudents: [],
          responsibilitiesText: user.responsibilitiesText || '',
          trainingProgramsHandled: user.trainingProgramsHandled || [],
          languagesSpoken: user.languagesSpoken || [],
          availabilityTimeSlots: user.availabilityTimeSlots || [],
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
        
        // Save with validation disabled initially
        await profile.save({ validateBeforeSave: false });
        console.log('New profile created successfully');
      }
      
      // Upload to storage using the uploadProfileImage method
      console.log('Uploading to storage service...');
      const uploadResult = await supabaseStorage.uploadProfileImage(
        req.file.buffer, 
        req.file.originalname, 
        userId
      );

      if (!uploadResult.success) {
        console.error('Storage upload failed:', uploadResult.error);
        return res.status(500).json({
          success: false,
          message: uploadResult.error || 'Failed to upload image to storage'
        });
      }

      const profilePhotoUrl = uploadResult.url;
      console.log('Storage upload successful, URL:', profilePhotoUrl);

      // Update placement staff profile with new image URL
      profile.profilePhotoUrl = profilePhotoUrl;
      await profile.save({ validateBeforeSave: false });
      console.log('Profile updated with new image URL');

      // Also update User model
      await User.findByIdAndUpdate(userId, {
        profilePhotoUrl: profilePhotoUrl
      });
      console.log('User model updated with new image URL');

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
  });
};
