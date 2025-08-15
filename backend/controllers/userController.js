const { validationResult } = require('express-validator');
const User = require('../models/User');
const Department = require('../models/Department');
const ImportHistory = require('../models/ImportHistory');
const emailService = require('../services/emailService');

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

    // Set default password to "Staff@123" for all staff
    const defaultPassword = "Staff@123";

    // Find the department ObjectId from the department code
    const departmentObj = await Department.findOne({ code: department, isActive: true });
    if (!departmentObj) {
      return res.status(400).json({
        success: false,
        message: `Department with code '${department}' not found or inactive`
      });
    }

    // Create staff user
    const staffData = {
      firstName,
      lastName,
      email,
      password: defaultPassword,
      role,
      department: departmentObj._id, // Store department ObjectId
      departmentCode: department, // Also store department code for backward compatibility
      designation,
      employeeId,
      phone,
      adminNotes,
      permissions: User.getRolePermissions(role),
      isActive: true,
      isVerified: false, // Staff needs to verify their account
      isFirstLogin: true // Mark as first login to force password change
    };

    const staff = await User.create(staffData);

    // Remove password from response
    staff.password = undefined;

    // Send welcome email to the staff member
    try {
      const emailResult = await emailService.sendStaffWelcomeEmail(staff, defaultPassword);
      
      if (emailResult.success) {
        console.log(`Welcome email sent successfully to ${staff.email}`);
      } else {
        console.error(`Failed to send welcome email to ${staff.email}:`, emailResult.error);
      }
    } catch (emailError) {
      console.error(`Error sending welcome email to ${staff.email}:`, emailError);
      // Don't fail the staff creation if email fails
    }

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
        departmentCode: staff.departmentCode,
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
  const startTime = new Date();
  let importHistory = null;

  try {
    const { staffData, fileName, fileSize } = req.body;

    if (!staffData || !Array.isArray(staffData) || staffData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Staff data array is required and cannot be empty'
      });
    }

    if (staffData.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create more than 1000 staff members at once'
      });
    }

    // Create import history record
    importHistory = await ImportHistory.create({
      fileName: fileName || 'bulk_staff_upload.xlsx',
      fileSize: fileSize || 0,
      importType: 'staff',
      totalRecords: staffData.length,
      successfulRecords: 0,
      failedRecords: 0,
      warningRecords: 0,
      status: 'processing',
      importedBy: req.user._id,
      startTime: startTime,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    // Get all active departments for validation
    const activeDepartments = await Department.find({ isActive: true });
    const validDepartmentCodes = activeDepartments.map(dept => dept.code);
    const departmentMap = activeDepartments.reduce((map, dept) => {
      map[dept.code] = dept._id;
      return map;
    }, {});

    const createdStaff = [];
    const failedStaff = [];
    const warningStaff = [];
    const validStaffRoles = ['placement_staff', 'department_hod', 'other_staff'];
    const duplicateEmails = [];
    const duplicateEmployeeIds = [];
    const createdRecordIds = [];

    // Process each staff member
    for (let i = 0; i < staffData.length; i++) {
      const staffMember = staffData[i];
      const rowNumber = i + 1;
      const errors = [];
      const warnings = [];

      try {
        // Validate required fields (firstName, lastName, email are required)
        if (!staffMember.firstName?.trim()) {
          errors.push('First Name is required');
        }
        if (!staffMember.lastName?.trim()) {
          errors.push('Last Name is required');
        }
        if (!staffMember.email?.trim()) {
          errors.push('Email is required');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (staffMember.email && !emailRegex.test(staffMember.email.trim())) {
          errors.push('Invalid email format');
        }

        // Validate department code if provided (now required)
        if (!staffMember.department?.trim()) {
          errors.push('Department is required');
        } else if (!validDepartmentCodes.includes(staffMember.department.trim())) {
          errors.push(`Invalid department code: ${staffMember.department}. Valid codes are: ${validDepartmentCodes.join(', ')}`);
        }

        // Validate staff role if provided
        if (staffMember.role && !validStaffRoles.includes(staffMember.role)) {
          errors.push('Invalid staff role. Must be: placement_staff, department_hod, or other_staff');
        }

        // Validate phone number (if provided)
        if (staffMember.phone && !/^[0-9]{10}$/.test(staffMember.phone.toString().trim())) {
          warnings.push('Phone number should be 10 digits');
        }

        // Validate employee ID length (if provided)
        if (staffMember.employeeId && staffMember.employeeId.trim().length < 3) {
          warnings.push('Employee ID should be at least 3 characters');
        }

        // Check if user already exists
        if (staffMember.email) {
          const existingUser = await User.findOne({ email: staffMember.email.trim().toLowerCase() });
          if (existingUser) {
            errors.push(`User with email ${staffMember.email} already exists`);
            duplicateEmails.push(staffMember.email);
          }
        }

        // Check if employeeId already exists (if provided)
        if (staffMember.employeeId?.trim()) {
          const existingEmployee = await User.findOne({ employeeId: staffMember.employeeId.trim() });
          if (existingEmployee) {
            errors.push(`Employee ID ${staffMember.employeeId} already exists`);
            duplicateEmployeeIds.push(staffMember.employeeId);
          }
        }

        // If there are errors, add to failed list
        if (errors.length > 0) {
          failedStaff.push({
            rowNumber,
            data: staffMember,
            errors,
            warnings
          });

          // Add to import history
          importHistory.importedData.push({
            rowNumber,
            status: 'failed',
            data: staffMember,
            errors,
            warnings
          });

          continue;
        }

        // Set default password to "Staff@123" for all staff
        const defaultPassword = "Staff@123";

        // Create staff user data with defaults for optional fields
        const role = staffMember.role || 'other_staff';
        const departmentCode = staffMember.department.trim();
        
        // Find the department ObjectId from the department code
        const departmentObj = departmentMap[departmentCode];
        if (!departmentObj) {
          errors.push(`Department ${departmentCode} not found in system`);
          failedStaff.push({
            rowNumber,
            data: staffMember,
            errors,
            warnings
          });

          // Add to import history
          importHistory.importedData.push({
            rowNumber,
            status: 'failed',
            data: staffMember,
            errors,
            warnings
          });

          continue;
        }
        
        const newStaffData = {
          firstName: staffMember.firstName.trim(),
          lastName: staffMember.lastName.trim(),
          email: staffMember.email.trim().toLowerCase(),
          password: defaultPassword,
          role: role,
          department: departmentObj, // Store department ObjectId
          departmentCode: departmentCode, // Also store department code for backward compatibility
          designation: staffMember.designation?.trim() || '',
          employeeId: staffMember.employeeId?.trim() || '',
          phone: staffMember.phone?.toString().trim() || '',
          adminNotes: staffMember.adminNotes?.trim() || '',
          permissions: User.getRolePermissions(role),
          isActive: staffMember.isActive !== undefined ? staffMember.isActive : true,
          isVerified: staffMember.isVerified !== undefined ? staffMember.isVerified : false,
          isFirstLogin: true, // Mark as first login to force password change
          emailSent: false, // Email will be sent only after role assignment
          createdBy: req.user._id
        };

        // Create the staff member
        const staff = await User.create(newStaffData);
        createdRecordIds.push(staff._id);

        // Remove password from response
        staff.password = undefined;

        const staffResult = {
          id: staff._id,
          firstName: staff.firstName,
          lastName: staff.lastName,
          fullName: staff.fullName,
          email: staff.email,
          role: staff.role,
          department: staff.department,
          departmentCode: staff.departmentCode,
          designation: staff.designation,
          employeeId: staff.employeeId,
          phone: staff.phone,
          isActive: staff.isActive,
          isVerified: staff.isVerified,
          emailSent: staff.emailSent,
          roleAssignedAt: staff.roleAssignedAt,
          createdAt: staff.createdAt,
          adminNotes: staff.adminNotes,
          defaultPassword // Include for admin reference
        };

        if (warnings.length > 0) {
          warningStaff.push({
            rowNumber,
            data: staffMember,
            staff: staffResult,
            warnings
          });
        } else {
          createdStaff.push(staffResult);
        }

        // Add to import history
        importHistory.importedData.push({
          recordId: staff._id,
          rowNumber,
          status: warnings.length > 0 ? 'warning' : 'success',
          data: staffMember,
          errors: [],
          warnings
        });

      } catch (error) {
        console.error(`Error creating staff member at row ${rowNumber}:`, error);
        const errorMessage = error.message || 'Failed to create staff member';
        
        failedStaff.push({
          rowNumber,
          data: staffMember,
          errors: [errorMessage],
          warnings: []
        });

        // Add to import history
        importHistory.importedData.push({
          rowNumber,
          status: 'failed',
          data: staffMember,
          errors: [errorMessage],
          warnings: []
        });
      }
    }

    // Update import history with final results
    importHistory.successfulRecords = createdStaff.length;
    importHistory.failedRecords = failedStaff.length;
    importHistory.warningRecords = warningStaff.length;
    importHistory.endTime = new Date();
    importHistory.status = 'completed';
    importHistory.metadata.departmentCodes = [...new Set(staffData.map(s => s.department).filter(Boolean))];
    importHistory.metadata.roles = [...new Set(staffData.map(s => s.role).filter(Boolean))];
    importHistory.metadata.duplicateEmails = duplicateEmails;
    importHistory.metadata.duplicateEmployeeIds = duplicateEmployeeIds;
    importHistory.rollbackData.createdRecordIds = createdRecordIds;
    importHistory.calculateProcessingTime();

    await importHistory.save();

    // Note: Emails will be sent only after role assignment, not immediately
    console.log(`Bulk staff creation completed. ${createdStaff.length} created, ${failedStaff.length} failed, ${warningStaff.length} warnings. Emails will be sent after role assignment.`);

    // Return results
    res.status(201).json({
      success: true,
      message: `Bulk staff creation completed. ${createdStaff.length} created, ${failedStaff.length} failed, ${warningStaff.length} warnings. Emails will be sent after role assignment.`,
      results: {
        totalProcessed: staffData.length,
        successCount: createdStaff.length,
        failureCount: failedStaff.length,
        warningCount: warningStaff.length,
        createdStaff: [...createdStaff, ...warningStaff.map(w => w.staff)],
        failedStaff,
        warningStaff,
        validDepartments: validDepartmentCodes,
        importHistoryId: importHistory._id,
        processingTime: importHistory.formattedProcessingTime,
        note: 'Welcome emails will be sent only after role assignment'
      }
    });

  } catch (error) {
    console.error('Bulk create staff error:', error);
    
    // Mark import history as failed if it exists
    if (importHistory) {
      try {
        await importHistory.markFailed(error.message);
      } catch (historyError) {
        console.error('Error updating import history:', historyError);
      }
    }

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

    // Get staff with pagination - temporarily remove population to fix 500 error
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
        department: member.departmentCode || member.department || null, // Prioritize departmentCode for display
        departmentCode: member.departmentCode || null,
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
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching staff members',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

// @desc    Delete multiple staff members (Admin only)
// @route   DELETE /api/v1/users/staff/bulk
// @access  Private (Admin only)
exports.deleteBulkStaff = async (req, res) => {
  try {
    const { staffIds } = req.body;

    if (!staffIds || !Array.isArray(staffIds) || staffIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Staff IDs array is required and cannot be empty'
      });
    }

    // Removed the 100 staff member limit for bulk deletion

    const deletedStaff = [];
    const failedStaff = [];
    const staffRoles = ['placement_staff', 'department_hod', 'other_staff'];

    // Process each staff member
    for (let i = 0; i < staffIds.length; i++) {
      const staffId = staffIds[i];

      try {
        const staff = await User.findById(staffId);

        if (!staff) {
          failedStaff.push({
            staffId,
            error: 'Staff member not found'
          });
          continue;
        }

        // Verify it's a staff member
        if (!staffRoles.includes(staff.role)) {
          failedStaff.push({
            staffId,
            error: 'User is not a staff member'
          });
          continue;
        }

        // Prevent admin from deleting themselves
        if (staff._id.toString() === req.user._id.toString()) {
          failedStaff.push({
            staffId,
            error: 'You cannot delete your own account'
          });
          continue;
        }

        await User.findByIdAndDelete(staffId);

        deletedStaff.push({
          id: staff._id,
          firstName: staff.firstName,
          lastName: staff.lastName,
          fullName: staff.fullName,
          email: staff.email,
          role: staff.role,
          department: staff.department
        });

      } catch (error) {
        console.error(`Error deleting staff member ${staffId}:`, error);
        failedStaff.push({
          staffId,
          error: error.message || 'Failed to delete staff member'
        });
      }
    }

    // Return results
    res.status(200).json({
      success: true,
      message: `Bulk staff deletion completed. ${deletedStaff.length} deleted, ${failedStaff.length} failed.`,
      results: {
        totalProcessed: staffIds.length,
        successCount: deletedStaff.length,
        failureCount: failedStaff.length,
        deletedStaff,
        failedStaff
      }
    });

  } catch (error) {
    console.error('Bulk delete staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting bulk staff members',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Assign role to staff and trigger welcome email
// @route   POST /api/v1/users/staff/:id/assign-role
// @access  Private (Admin, Placement Director)
exports.assignStaffRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { role } = req.body;
    const staffId = req.params.id;

    // Validate staff role
    const validStaffRoles = ['placement_staff', 'department_hod', 'other_staff'];
    if (!validStaffRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff role specified'
      });
    }

    // Find the staff member
    const staff = await User.findById(staffId).populate('department');
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

    // Update staff role and assignment tracking
    const updatedStaff = await User.findByIdAndUpdate(
      staffId,
      {
        role: role,
        permissions: User.getRolePermissions(role),
        roleAssignedAt: new Date(),
        roleAssignedBy: req.user._id
      },
      { new: true, runValidators: true }
    ).populate('department');

    // Send welcome email if not already sent
    let emailResult = null;
    if (!updatedStaff.emailSent) {
      try {
        console.log(`Sending welcome email to staff member: ${updatedStaff.email}`);
        
        // Prepare staff data for email
        const staffDataForEmail = {
          firstName: updatedStaff.firstName,
          lastName: updatedStaff.lastName,
          email: updatedStaff.email,
          role: updatedStaff.role,
          department: updatedStaff.departmentCode || (updatedStaff.department ? updatedStaff.department.code : 'OTHER'),
          designation: updatedStaff.designation,
          employeeId: updatedStaff.employeeId
        };

        emailResult = await emailService.sendStaffWelcomeEmail(staffDataForEmail, "Staff@123");
        
        if (emailResult.success) {
          // Update email sent status
          await User.findByIdAndUpdate(staffId, {
            emailSent: true,
            emailSentAt: new Date()
          });
          console.log(`Welcome email sent successfully to ${updatedStaff.email}`);
        } else {
          console.error(`Failed to send welcome email to ${updatedStaff.email}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error(`Error sending welcome email to ${updatedStaff.email}:`, emailError);
        emailResult = { success: false, error: emailError.message };
      }
    }

    // Remove password from response
    updatedStaff.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Staff role assigned successfully and welcome email sent',
      staff: {
        id: updatedStaff._id,
        firstName: updatedStaff.firstName,
        lastName: updatedStaff.lastName,
        fullName: updatedStaff.fullName,
        email: updatedStaff.email,
        role: updatedStaff.role,
        department: updatedStaff.department,
        departmentCode: updatedStaff.departmentCode,
        designation: updatedStaff.designation,
        employeeId: updatedStaff.employeeId,
        phone: updatedStaff.phone,
        isActive: updatedStaff.isActive,
        isVerified: updatedStaff.isVerified,
        roleAssignedAt: updatedStaff.roleAssignedAt,
        roleAssignedBy: updatedStaff.roleAssignedBy,
        emailSent: updatedStaff.emailSent,
        emailSentAt: updatedStaff.emailSentAt,
        updatedAt: updatedStaff.updatedAt,
        adminNotes: updatedStaff.adminNotes
      },
      emailResult: emailResult ? {
        success: emailResult.success,
        error: emailResult.error || null
      } : null
    });
  } catch (error) {
    console.error('Assign staff role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning staff role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get staff by department
// @route   GET /api/v1/users/staff/department/:departmentId
// @access  Private (Admin, Placement Director)
exports.getStaffByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    let department = null;

    // Try to find department by ObjectId first, then by code
    if (departmentId.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId
      department = await Department.findById(departmentId);
    } else {
      // It's a department code
      department = await Department.findOne({ code: departmentId.toUpperCase() });
    }

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Build filter for staff roles in the specific department
    const staffRoles = ['placement_staff', 'department_hod', 'other_staff'];
    const filter = { 
      role: { $in: staffRoles },
      $or: [
        { department: department._id },
        { departmentCode: department.code }
      ]
    };

    // Add additional filters - only apply if values are not empty strings
    if (req.query.role && req.query.role.trim() !== '' && staffRoles.includes(req.query.role)) {
      filter.role = req.query.role;
    }
    if (req.query.isActive !== undefined && req.query.isActive.trim() !== '') {
      filter.isActive = req.query.isActive === 'true';
    }
    if (req.query.emailSent !== undefined && req.query.emailSent.trim() !== '') {
      filter.emailSent = req.query.emailSent === 'true';
    }
    if (req.query.roleAssigned !== undefined && req.query.roleAssigned.trim() !== '') {
      if (req.query.roleAssigned === 'true') {
        filter.roleAssignedAt = { $ne: null };
      } else {
        filter.roleAssignedAt = null;
      }
    }
    if (req.query.search && req.query.search.trim() !== '') {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { employeeId: searchRegex }
        ]
      });
    }

    console.log('🔍 Staff filter applied:', JSON.stringify(filter, null, 2));

    // Get staff with pagination - remove population to avoid errors
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
      department: {
        id: department._id,
        name: department.name,
        code: department.code
      },
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
        department: member.departmentCode || member.department || null, // Prioritize departmentCode for display
        departmentCode: member.departmentCode || null,
        designation: member.designation,
        employeeId: member.employeeId,
        phone: member.phone,
        profilePicture: member.profilePicture,
        isActive: member.isActive,
        isVerified: member.isVerified,
        emailSent: member.emailSent,
        emailSentAt: member.emailSentAt,
        roleAssignedAt: member.roleAssignedAt,
        roleAssignedBy: member.roleAssignedBy,
        lastLogin: member.lastLogin,
        createdAt: member.createdAt,
        adminNotes: member.adminNotes
      }))
    });
  } catch (error) {
    console.error('Get staff by department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching staff by department',
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

    // Get staff with assigned roles
    const staffWithAssignedRoles = await User.countDocuments({
      role: { $in: staffRoles },
      roleAssignedAt: { $ne: null }
    });

    // Get staff with emails sent
    const staffWithEmailsSent = await User.countDocuments({
      role: { $in: staffRoles },
      emailSent: true
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
        staffWithAssignedRoles,
        staffWithEmailsSent,
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

// @desc    Get import history
// @route   GET /api/v1/users/import-history
// @access  Private (Admin, Placement Director)
exports.getImportHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter object
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.importType) filter.importType = req.query.importType;
    if (req.query.importedBy) filter.importedBy = req.query.importedBy;

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    // Get import history with pagination
    const importHistory = await ImportHistory.find(filter)
      .populate('importedBy', 'firstName lastName email')
      .populate('rollbackData.rollbackBy', 'firstName lastName email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalRecords = await ImportHistory.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
      success: true,
      count: importHistory.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      importHistory: importHistory.map(record => ({
        id: record._id,
        fileName: record.fileName,
        fileSize: record.fileSize,
        formattedFileSize: record.formattedFileSize,
        importType: record.importType,
        totalRecords: record.totalRecords,
        successfulRecords: record.successfulRecords,
        failedRecords: record.failedRecords,
        warningRecords: record.warningRecords,
        successRate: record.successRate,
        status: record.status,
        processingTime: record.processingTime,
        formattedProcessingTime: record.formattedProcessingTime,
        importedBy: record.importedBy,
        rollbackData: record.rollbackData,
        metadata: record.metadata,
        notes: record.notes,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get import history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching import history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get import history details
// @route   GET /api/v1/users/import-history/:id
// @access  Private (Admin, Placement Director)
exports.getImportHistoryDetails = async (req, res) => {
  try {
    const importHistory = await ImportHistory.findById(req.params.id)
      .populate('importedBy', 'firstName lastName email')
      .populate('rollbackData.rollbackBy', 'firstName lastName email')
      .populate('importedData.recordId', 'firstName lastName email role department');

    if (!importHistory) {
      return res.status(404).json({
        success: false,
        message: 'Import history record not found'
      });
    }

    res.status(200).json({
      success: true,
      importHistory: {
        id: importHistory._id,
        fileName: importHistory.fileName,
        fileSize: importHistory.fileSize,
        formattedFileSize: importHistory.formattedFileSize,
        importType: importHistory.importType,
        totalRecords: importHistory.totalRecords,
        successfulRecords: importHistory.successfulRecords,
        failedRecords: importHistory.failedRecords,
        warningRecords: importHistory.warningRecords,
        successRate: importHistory.successRate,
        status: importHistory.status,
        processingTime: importHistory.processingTime,
        formattedProcessingTime: importHistory.formattedProcessingTime,
        startTime: importHistory.startTime,
        endTime: importHistory.endTime,
        importedBy: importHistory.importedBy,
        importedData: importHistory.importedData,
        validationErrors: importHistory.validationErrors,
        rollbackData: importHistory.rollbackData,
        metadata: importHistory.metadata,
        notes: importHistory.notes,
        createdAt: importHistory.createdAt,
        updatedAt: importHistory.updatedAt
      }
    });
  } catch (error) {
    console.error('Get import history details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching import history details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Rollback bulk import
// @route   POST /api/v1/users/import-history/:id/rollback
// @access  Private (Admin only)
exports.rollbackBulkImport = async (req, res) => {
  try {
    const { reason } = req.body;
    const importHistoryId = req.params.id;

    // Find the import history record
    const importHistory = await ImportHistory.findById(importHistoryId);
    if (!importHistory) {
      return res.status(404).json({
        success: false,
        message: 'Import history record not found'
      });
    }

    // Check if rollback is available
    if (!importHistory.rollbackData.isRollbackAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Rollback is not available for this import'
      });
    }

    // Check if already rolled back
    if (importHistory.rollbackData.rollbackAt) {
      return res.status(400).json({
        success: false,
        message: 'This import has already been rolled back'
      });
    }

    const createdRecordIds = importHistory.rollbackData.createdRecordIds;
    if (!createdRecordIds || createdRecordIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No records to rollback'
      });
    }

    // Delete all created records
    const deleteResult = await User.deleteMany({
      _id: { $in: createdRecordIds }
    });

    // Update rollback data
    importHistory.rollbackData.rollbackBy = req.user._id;
    importHistory.rollbackData.rollbackAt = new Date();
    importHistory.rollbackData.rollbackReason = reason || 'Manual rollback';
    importHistory.rollbackData.isRollbackAvailable = false;
    importHistory.status = 'cancelled';

    await importHistory.save();

    res.status(200).json({
      success: true,
      message: `Successfully rolled back import. ${deleteResult.deletedCount} records deleted.`,
      rollback: {
        importHistoryId: importHistory._id,
        deletedCount: deleteResult.deletedCount,
        rollbackBy: req.user._id,
        rollbackAt: importHistory.rollbackData.rollbackAt,
        rollbackReason: importHistory.rollbackData.rollbackReason
      }
    });
  } catch (error) {
    console.error('Rollback bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rolling back import',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get import statistics
// @route   GET /api/v1/users/import-stats
// @access  Private (Admin, Placement Director)
exports.getImportStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const userId = req.query.userId || req.user._id;

    const stats = await ImportHistory.getImportStats(userId, days);

    res.status(200).json({
      success: true,
      stats: {
        ...stats,
        period: `Last ${days} days`,
        successRate: stats.totalRecords > 0 ? Math.round((stats.totalSuccessful / stats.totalRecords) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Get import stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching import statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get available departments for bulk upload
// @route   GET /api/v1/users/departments
// @access  Private (Admin, Placement Director)
exports.getAvailableDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .select('name code description')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      departments: departments.map(dept => ({
        id: dept._id,
        name: dept.name,
        code: dept.code,
        description: dept.description,
        displayName: `${dept.name} (${dept.code})`
      }))
    });
  } catch (error) {
    console.error('Get available departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching departments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
