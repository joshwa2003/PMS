const { validationResult } = require('express-validator');
const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private (Admin, Placement Director)
exports.getAllUsers = async (req, res) => {
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
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.isVerified !== undefined) filter.isVerified = req.query.isVerified === 'true';

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      users: users.map(user => ({
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
      }))
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/v1/users/:id
// @access  Private (Own profile or Admin)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

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
        profilePicture: user.profilePicture,
        bio: user.bio,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update own profile
// @route   PUT /api/v1/users/profile
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
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Define fields that can be updated by user themselves
    const profileAllowedFields = [
      'firstName', 'lastName', 'phone', 'bio', 'profilePicture',
      'cgpa', 'currentCompany', 'currentPosition',
      'studentId', 'batch', 'employeeId', 'designation',
      'graduationYear'
    ];

    const profileUpdates = {};
    Object.keys(req.body).forEach(key => {
      if (profileAllowedFields.includes(key)) {
        profileUpdates[key] = req.body[key];
      }
    });

    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      profileUpdates,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedProfile._id,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        fullName: updatedProfile.fullName,
        email: updatedProfile.email,
        role: updatedProfile.role,
        department: updatedProfile.department,
        phone: updatedProfile.phone,
        isActive: updatedProfile.isActive,
        isVerified: updatedProfile.isVerified,
        profilePicture: updatedProfile.profilePicture,
        bio: updatedProfile.bio,
        updatedAt: updatedProfile.updatedAt,
        // Role-specific fields
        ...(updatedProfile.role === 'student' && {
          studentId: updatedProfile.studentId,
          batch: updatedProfile.batch,
          cgpa: updatedProfile.cgpa
        }),
        ...(updatedProfile.role === 'alumni' && {
          graduationYear: updatedProfile.graduationYear,
          currentCompany: updatedProfile.currentCompany,
          currentPosition: updatedProfile.currentPosition
        }),
        ...(['placement_staff', 'department_hod', 'other_staff', 'admin'].includes(updatedProfile.role) && {
          employeeId: updatedProfile.employeeId,
          designation: updatedProfile.designation
        })
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private (Own profile or Admin)
exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Define fields that can be updated
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'bio', 'profilePicture',
      'cgpa', 'currentCompany', 'currentPosition'
    ];

    // Admin can update additional fields
    if (req.user.role === 'admin') {
      allowedFields.push(
        'email', 'role', 'department', 'isActive', 'isVerified',
        'studentId', 'batch', 'employeeId', 'designation',
        'graduationYear'
      );
    }

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        phone: updatedUser.phone,
        isActive: updatedUser.isActive,
        isVerified: updatedUser.isVerified,
        profilePicture: updatedUser.profilePicture,
        bio: updatedUser.bio,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get users by role
// @route   GET /api/v1/users/role/:role
// @access  Private (Admin, Placement Director, Placement Staff)
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const validRoles = ['admin', 'placement_director', 'placement_staff', 'department_hod', 'other_staff', 'student', 'alumni'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const users = await User.find({ role })
      .select('-password')
      .sort({ firstName: 1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments({ role });
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      users: users.map(user => ({
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
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users by role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get users by department
// @route   GET /api/v1/users/department/:department
// @access  Private (Admin, Placement Director, Placement Staff, Department HOD)
exports.getUsersByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const validDepartments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'ADMIN', 'HR', 'OTHER'];
    
    if (!validDepartments.includes(department)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department specified'
      });
    }

    const users = await User.find({ department })
      .select('-password')
      .sort({ firstName: 1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments({ department });
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      users: users.map(user => ({
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
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Get users by department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users by department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Search users
// @route   POST /api/v1/users/search
// @access  Private (Admin, Placement Director, Placement Staff, Department HOD)
exports.searchUsers = async (req, res) => {
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
      searchTerm,
      role,
      department,
      isActive,
      isVerified,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.body;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Build search query
    const query = {};

    // Text search across multiple fields
    if (searchTerm) {
      query.$or = [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { studentId: { $regex: searchTerm, $options: 'i' } },
        { employeeId: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Filter by role
    if (role) query.role = role;

    // Filter by department
    if (department) query.department = department;

    // Filter by active status
    if (isActive !== undefined) query.isActive = isActive;

    // Filter by verified status
    if (isVerified !== undefined) query.isVerified = isVerified;

    // Department-based access control for non-admin users
    if (req.user.role === 'department_hod') {
      query.department = req.user.department;
    } else if (req.user.role === 'placement_staff') {
      query.department = req.user.department;
    }

    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      users: users.map(user => ({
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
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/v1/users/stats
// @access  Private (Admin, Placement Director)
exports.getUserStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();

    // Get users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get users by department
    const usersByDepartment = await User.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get active vs inactive users
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    // Get verified vs unverified users
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get users who logged in recently (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentlyActiveUsers = await User.countDocuments({
      lastLogin: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        verifiedUsers,
        unverifiedUsers,
        recentRegistrations,
        recentlyActiveUsers,
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        usersByDepartment: usersByDepartment.reduce((acc, item) => {
          acc[item._id || 'Not Specified'] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
