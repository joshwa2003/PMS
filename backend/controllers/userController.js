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
      'firstName', 'lastName', 'phone', 'bio', 'profilePicture', 'department',
      // Student fields
      'cgpa', 'studentId', 'batch',
      // Alumni fields
      'currentCompany', 'currentPosition', 'graduationYear',
      // Staff/Administrator fields
      'employeeId', 'designation', 'mobileNumber', 'gender', 'profilePhotoUrl',
      'dateOfJoining', 'officeLocation',
      // Contact information and administrative notes
      'contact', 'adminNotes'
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
        // Administrator-specific fields
        mobileNumber: updatedProfile.mobileNumber,
        gender: updatedProfile.gender,
        profilePhotoUrl: updatedProfile.profilePhotoUrl,
        dateOfJoining: updatedProfile.dateOfJoining,
        officeLocation: updatedProfile.officeLocation,
        contact: updatedProfile.contact,
        adminNotes: updatedProfile.adminNotes,
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

// @desc    Create staff member (Admin and Placement Director only)
// @route   POST /api/v1/users/staff
// @access  Private (Admin, Placement Director)
exports.createStaff = async (req, res) => {
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
      role,
      department,
      designation,
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

    // Validate staff role
    const validStaffRoles = ['placement_staff', 'department_hod', 'other_staff'];
    if (!validStaffRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff role specified'
      });
    }

    // Generate default password (can be changed later)
    const defaultPassword = `Staff@${Math.random().toString(36).slice(-6)}`;

    // Create staff user
    const staffData = {
      firstName,
      lastName,
      email,
      password: defaultPassword,
      role,
      department,
      designation,
      employeeId,
      phone,
      adminNotes,
      permissions: User.getRolePermissions(role),
      isActive: true,
      isVerified: false // Staff needs to verify their account
    };

    const staff = await User.create(staffData);

    // Remove password from response
    staff.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      staff: {
        id: staff._id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        fullName: staff.fullName,
        email: staff.email,
        role: staff.role,
        department: staff.department,
        designation: staff.designation,
        employeeId: staff.employeeId,
        phone: staff.phone,
        isActive: staff.isActive,
        isVerified: staff.isVerified,
        createdAt: staff.createdAt,
        adminNotes: staff.adminNotes
      },
      defaultPassword // Include in response for admin to share with staff
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating staff member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create multiple staff members at once (Admin and Placement Director only)
// @route   POST /api/v1/users/staff/bulk
// @access  Private (Admin, Placement Director)
exports.createBulkStaff = async (req, res) => {
  try {
    const { staffData } = req.body;

    if (!staffData || !Array.isArray(staffData) || staffData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Staff data array is required and cannot be empty'
      });
    }

    if (staffData.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create more than 100 staff members at once'
      });
    }

    const createdStaff = [];
    const failedStaff = [];
    const validStaffRoles = ['placement_staff', 'department_hod', 'other_staff'];

    // Process each staff member
    for (let i = 0; i < staffData.length; i++) {
      const staffMember = staffData[i];
      const rowNumber = i + 1;

      try {
        // Validate required fields (only firstName, lastName, email are required)
        if (!staffMember.firstName || !staffMember.lastName || !staffMember.email) {
          failedStaff.push({
            rowNumber,
            data: staffMember,
            error: 'Missing required fields: firstName, lastName, email'
          });
          continue;
        }

        // Validate staff role if provided
        if (staffMember.role && !validStaffRoles.includes(staffMember.role)) {
          failedStaff.push({
            rowNumber,
            data: staffMember,
            error: 'Invalid staff role. Must be: placement_staff, department_hod, or other_staff'
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: staffMember.email });
        if (existingUser) {
          failedStaff.push({
            rowNumber,
            data: staffMember,
            error: `User with email ${staffMember.email} already exists`
          });
          continue;
        }

        // Check if employeeId already exists (if provided)
        if (staffMember.employeeId) {
          const existingEmployee = await User.findOne({ employeeId: staffMember.employeeId });
          if (existingEmployee) {
            failedStaff.push({
              rowNumber,
              data: staffMember,
              error: `Employee ID ${staffMember.employeeId} already exists`
            });
            continue;
          }
        }

        // Generate default password
        const defaultPassword = `Staff@${Math.random().toString(36).slice(-6)}`;

        // Create staff user data with defaults for optional fields
        const role = staffMember.role || 'other_staff';
        const department = staffMember.department || 'OTHER';
        
        const newStaffData = {
          firstName: staffMember.firstName.trim(),
          lastName: staffMember.lastName.trim(),
          email: staffMember.email.trim().toLowerCase(),
          password: defaultPassword,
          role: role,
          department: department,
          designation: staffMember.designation?.trim() || '',
          employeeId: staffMember.employeeId?.trim() || '',
          phone: staffMember.phone?.toString().trim() || '',
          adminNotes: staffMember.adminNotes?.trim() || '',
          permissions: User.getRolePermissions(role),
          isActive: staffMember.isActive !== undefined ? staffMember.isActive : true,
          isVerified: staffMember.isVerified !== undefined ? staffMember.isVerified : false
        };

        // Create the staff member
        const staff = await User.create(newStaffData);

        // Remove password from response
        staff.password = undefined;

        createdStaff.push({
          id: staff._id,
          firstName: staff.firstName,
          lastName: staff.lastName,
          fullName: staff.fullName,
          email: staff.email,
          role: staff.role,
          department: staff.department,
          designation: staff.designation,
          employeeId: staff.employeeId,
          phone: staff.phone,
          isActive: staff.isActive,
          isVerified: staff.isVerified,
          createdAt: staff.createdAt,
          adminNotes: staff.adminNotes,
          defaultPassword // Include for admin reference
        });

      } catch (error) {
        console.error(`Error creating staff member at row ${rowNumber}:`, error);
        failedStaff.push({
          rowNumber,
          data: staffMember,
          error: error.message || 'Failed to create staff member'
        });
      }
    }

    // Return results
    res.status(201).json({
      success: true,
      message: `Bulk staff creation completed. ${createdStaff.length} created, ${failedStaff.length} failed.`,
      results: {
        totalProcessed: staffData.length,
        successCount: createdStaff.length,
        failureCount: failedStaff.length,
        createdStaff,
        failedStaff
      }
    });

  } catch (error) {
    console.error('Bulk create staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating bulk staff members',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all staff members (Admin and Placement Director only)
// @route   GET /api/v1/users/staff
// @access  Private (Admin, Placement Director)
exports.getAllStaff = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter for staff roles
    const staffRoles = ['placement_staff', 'department_hod', 'other_staff'];
    const filter = { role: { $in: staffRoles } };

    // Add additional filters
    if (req.query.role && staffRoles.includes(req.query.role)) {
      filter.role = req.query.role;
    }
    if (req.query.department) filter.department = req.query.department;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.isVerified !== undefined) filter.isVerified = req.query.isVerified === 'true';

    // Get staff with pagination
    const staff = await User.find(filter)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalStaff = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalStaff / limit);

    res.status(200).json({
      success: true,
      count: staff.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalStaff,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      staff: staff.map(member => ({
        id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        fullName: member.fullName,
        email: member.email,
        role: member.role,
        department: member.department,
        designation: member.designation,
        employeeId: member.employeeId,
        phone: member.phone,
        profilePicture: member.profilePicture, // Include profile picture
        isActive: member.isActive,
        isVerified: member.isVerified,
        lastLogin: member.lastLogin,
        createdAt: member.createdAt,
        adminNotes: member.adminNotes
      }))
    });
  } catch (error) {
    console.error('Get all staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching staff members',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update staff member (Admin and Placement Director only)
// @route   PUT /api/v1/users/staff/:id
// @access  Private (Admin, Placement Director)
exports.updateStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const staff = await User.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Verify it's a staff member
    const staffRoles = ['placement_staff', 'department_hod', 'other_staff'];
    if (!staffRoles.includes(staff.role)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a staff member'
      });
    }

    // Define fields that can be updated
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'department', 'designation',
      'employeeId', 'isActive', 'isVerified', 'adminNotes'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Check if employeeId is being updated and doesn't conflict
    if (updates.employeeId && updates.employeeId !== staff.employeeId) {
      const existingEmployee = await User.findOne({ 
        employeeId: updates.employeeId,
        _id: { $ne: staff._id }
      });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }

    const updatedStaff = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      staff: {
        id: updatedStaff._id,
        firstName: updatedStaff.firstName,
        lastName: updatedStaff.lastName,
        fullName: updatedStaff.fullName,
        email: updatedStaff.email,
        role: updatedStaff.role,
        department: updatedStaff.department,
        designation: updatedStaff.designation,
        employeeId: updatedStaff.employeeId,
        phone: updatedStaff.phone,
        isActive: updatedStaff.isActive,
        isVerified: updatedStaff.isVerified,
        updatedAt: updatedStaff.updatedAt,
        adminNotes: updatedStaff.adminNotes
      }
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating staff member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete staff member (Admin only)
// @route   DELETE /api/v1/users/staff/:id
// @access  Private (Admin only)
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Verify it's a staff member
    const staffRoles = ['placement_staff', 'department_hod', 'other_staff'];
    if (!staffRoles.includes(staff.role)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a staff member'
      });
    }

    // Prevent admin from deleting themselves
    if (staff._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting staff member',
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

    // Get staff statistics
    const staffRoles = ['placement_staff', 'department_hod', 'other_staff'];
    const totalStaff = await User.countDocuments({ role: { $in: staffRoles } });
    const activeStaff = await User.countDocuments({ 
      role: { $in: staffRoles }, 
      isActive: true 
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
        totalStaff,
        activeStaff,
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
