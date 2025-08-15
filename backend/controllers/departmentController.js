const Department = require('../models/Department');
const User = require('../models/User');

// Get all departments
const getAllDepartments = async (req, res) => {
  try {
    console.log('📋 Fetching departments - Request params:', req.query);
    console.log('👤 User making request:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');

    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      isActive = '',
      all = false 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    console.log('🔍 Filter applied:', filter);

    // Calculate pagination - if all=true, fetch all departments
    let skip, actualLimit;
    if (all === 'true' || all === true) {
      skip = 0;
      actualLimit = 0; // 0 means no limit in MongoDB
      console.log('📄 Fetching ALL departments (no pagination)');
    } else {
      skip = (parseInt(page) - 1) * parseInt(limit);
      actualLimit = parseInt(limit);
      console.log('📄 Pagination - Skip:', skip, 'Limit:', actualLimit);
    }

    // Get departments with safer populate operations
    let departments;
    try {
      departments = await Department.find(filter)
        .populate({
          path: 'courseCategory',
          select: 'name description',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'placementStaff',
          select: 'firstName lastName email role',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'createdBy',
          select: 'firstName lastName email',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'updatedBy',
          select: 'firstName lastName email',
          options: { strictPopulate: false }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(actualLimit || undefined) // Use actualLimit, undefined means no limit
        .lean(); // Use lean() for better performance

      console.log('✅ Departments found:', departments.length);
    } catch (populateError) {
      console.error('❌ Error during populate operations:', populateError);
      
      // Fallback: Get departments without populate
      departments = await Department.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(actualLimit || undefined) // Use actualLimit, undefined means no limit
        .lean();
      
      console.log('⚠️ Fallback: Retrieved departments without populate:', departments.length);
    }

    // Get total count for pagination
    const totalDepartments = await Department.countDocuments(filter);
    const totalPages = all === 'true' || all === true ? 1 : Math.ceil(totalDepartments / parseInt(limit));

    console.log('📊 Pagination info - Total:', totalDepartments, 'Pages:', totalPages, 'All mode:', all === 'true' || all === true);

    res.status(200).json({
      success: true,
      data: {
        departments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalDepartments,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching departments:', error);
    console.error('❌ Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name
      } : undefined
    });
  }
};

// Get single department
const getDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Fetching single department with ID:', id);

    let department;
    try {
      department = await Department.findById(id)
        .populate({
          path: 'courseCategory',
          select: 'name description',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'placementStaff',
          select: 'firstName lastName email role',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'createdBy',
          select: 'firstName lastName email',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'updatedBy',
          select: 'firstName lastName email',
          options: { strictPopulate: false }
        })
        .lean();
    } catch (populateError) {
      console.error('❌ Error during populate operations for single department:', populateError);
      
      // Fallback: Get department without populate
      department = await Department.findById(id).lean();
      console.log('⚠️ Fallback: Retrieved department without populate');
    }
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    console.log('✅ Department found:', department.name);

    res.status(200).json({
      success: true,
      data: { department }
    });
  } catch (error) {
    console.error('❌ Error fetching department:', error);
    console.error('❌ Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Error fetching department',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name
      } : undefined
    });
  }
};

// Get placement staff options
const getPlacementStaffOptions = async (req, res) => {
  try {
    const placementStaff = await User.find({
      role: { $in: ['placement_staff', 'placement_director'] },
      isActive: true
    }).select('firstName lastName email role');

    res.status(200).json({
      success: true,
      data: { placementStaff }
    });
  } catch (error) {
    console.error('Error fetching placement staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching placement staff',
      error: error.message
    });
  }
};

// Create new department
const createDepartment = async (req, res) => {
  try {
    console.log('🏗️ Creating new department - Request body:', req.body);
    console.log('👤 User creating department:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');

    const { name, code, description, courseCategory, placementStaff } = req.body;
    const userId = req.user._id; // Fixed: Use _id instead of id

    // Validate required fields
    if (!name || !code || !courseCategory) {
      console.log('❌ Validation failed - Missing required fields:', { name: !!name, code: !!code, courseCategory: !!courseCategory });
      return res.status(400).json({
        success: false,
        message: 'Department name, code, and course category are required'
      });
    }

    console.log('🔍 Checking for existing departments...');
    
    // Check if department name already exists
    const existingDepartmentName = await Department.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingDepartmentName) {
      console.log('❌ Department name already exists:', name);
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }

    // Check if department code already exists
    const existingDepartmentCode = await Department.findOne({ 
      code: { $regex: new RegExp(`^${code}$`, 'i') } 
    });
    
    if (existingDepartmentCode) {
      console.log('❌ Department code already exists:', code);
      return res.status(400).json({
        success: false,
        message: 'Department with this code already exists'
      });
    }

    console.log('✅ No existing departments found with same name/code');

    // Verify course category exists
    console.log('🔍 Verifying course category:', courseCategory);
    const CourseCategory = require('../models/CourseCategory');
    const categoryExists = await CourseCategory.findById(courseCategory);
    if (!categoryExists) {
      console.log('❌ Course category not found:', courseCategory);
      return res.status(400).json({
        success: false,
        message: 'Selected course category not found'
      });
    }
    console.log('✅ Course category verified:', categoryExists.name);

    // Verify placement staff exists and has correct role (only if provided)
    if (placementStaff) {
      console.log('🔍 Verifying placement staff:', placementStaff);
      const staffMember = await User.findById(placementStaff);
      if (!staffMember) {
        console.log('❌ Placement staff not found:', placementStaff);
        return res.status(400).json({
          success: false,
          message: 'Selected placement staff not found'
        });
      }

      if (!['placement_staff', 'placement_director'].includes(staffMember.role)) {
        console.log('❌ Invalid staff role:', staffMember.role);
        return res.status(400).json({
          success: false,
          message: 'Selected user is not a placement staff member'
        });
      }
      console.log('✅ Placement staff verified:', staffMember.firstName, staffMember.lastName);
    }

    // Create new department
    console.log('🏗️ Creating department with data:', {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description?.trim(),
      courseCategory,
      createdBy: userId,
      placementStaff: placementStaff || null
    });

    const departmentData = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description?.trim(),
      courseCategory,
      createdBy: userId
    };

    // Only add placementStaff if provided
    if (placementStaff) {
      departmentData.placementStaff = placementStaff;
    }

    const department = new Department(departmentData);

    console.log('💾 Saving department to database...');
    await department.save();
    console.log('✅ Department saved successfully with ID:', department._id);

    console.log('🎉 Department created successfully:', department.name);

    // Skip populate operations entirely to avoid 500 errors
    // Return the basic department data without populated references
    const basicDepartmentData = {
      _id: department._id,
      name: department.name,
      code: department.code,
      description: department.description,
      courseCategory: department.courseCategory,
      placementStaff: department.placementStaff,
      isActive: department.isActive,
      createdBy: department.createdBy,
      updatedBy: department.updatedBy,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt
    };

    console.log('✅ Returning basic department data without populate to avoid errors');

    // Always send a successful response since the department was created
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department: basicDepartmentData }
    });
  } catch (error) {
    console.error('❌ Error creating department:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern
    });
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      console.log('❌ Duplicate key error for field:', field);
      return res.status(400).json({
        success: false,
        message: `Department with this ${field} already exists`
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.log('❌ Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating department',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name
      } : undefined
    });
  }
};

// Update department
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, courseCategory, placementStaff, isActive } = req.body;
    const userId = req.user._id; // Fixed: Use _id instead of id

    console.log('🔄 Updating department:', id);
    console.log('📝 Update data:', { name, code, description, courseCategory, placementStaff, isActive });
    console.log('👤 User making request:', { id: userId, role: req.user.role });

    // Find the department
    const department = await Department.findById(id);
    
    if (!department) {
      console.log('❌ Department not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    console.log('✅ Department found:', department.name);

    // Check if name is being changed and if it already exists
    if (name && name !== department.name) {
      const existingDepartmentName = await Department.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (existingDepartmentName) {
        console.log('❌ Department name already exists:', name);
        return res.status(400).json({
          success: false,
          message: 'Department with this name already exists'
        });
      }
    }

    // Check if code is being changed and if it already exists
    if (code && code !== department.code) {
      const existingDepartmentCode = await Department.findOne({ 
        code: { $regex: new RegExp(`^${code}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (existingDepartmentCode) {
        console.log('❌ Department code already exists:', code);
        return res.status(400).json({
          success: false,
          message: 'Department with this code already exists'
        });
      }
    }

    // Verify course category if being changed
    if (courseCategory && courseCategory !== department.courseCategory.toString()) {
      const CourseCategory = require('../models/CourseCategory');
      const categoryExists = await CourseCategory.findById(courseCategory);
      if (!categoryExists) {
        console.log('❌ Course category not found:', courseCategory);
        return res.status(400).json({
          success: false,
          message: 'Selected course category not found'
        });
      }
    }

    // Verify placement staff if being changed (handle both null and valid ID cases)
    if (placementStaff !== undefined) {
      if (placementStaff === null || placementStaff === '') {
        console.log('🔄 Removing placement staff assignment');
        // Allow null/empty to remove assignment
      } else if (placementStaff !== department.placementStaff?.toString()) {
        console.log('🔍 Verifying placement staff:', placementStaff);
        const staffMember = await User.findById(placementStaff);
        if (!staffMember) {
          console.log('❌ Placement staff not found:', placementStaff);
          return res.status(400).json({
            success: false,
            message: 'Selected placement staff not found'
          });
        }

        if (!['placement_staff', 'placement_director'].includes(staffMember.role)) {
          console.log('❌ Invalid staff role:', staffMember.role);
          return res.status(400).json({
            success: false,
            message: 'Selected user is not a placement staff member'
          });
        }
        console.log('✅ Placement staff verified:', staffMember.firstName, staffMember.lastName);
      }
    }

    // Update fields
    if (name) department.name = name.trim();
    if (code) department.code = code.trim().toUpperCase();
    if (description !== undefined) department.description = description?.trim();
    if (courseCategory) department.courseCategory = courseCategory;
    if (placementStaff !== undefined) {
      department.placementStaff = placementStaff || null;
    }
    if (isActive !== undefined) department.isActive = isActive;
    department.updatedBy = userId;

    console.log('💾 Saving department updates...');
    await department.save();

    console.log('✅ Department updated successfully:', department.name);

    // Skip populate operations entirely to avoid 500 errors
    // Return the basic department data without populated references
    const basicDepartmentData = {
      _id: department._id,
      name: department.name,
      code: department.code,
      description: department.description,
      courseCategory: department.courseCategory,
      placementStaff: department.placementStaff,
      isActive: department.isActive,
      createdBy: department.createdBy,
      updatedBy: department.updatedBy,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt
    };

    console.log('✅ Returning basic department data without populate to avoid errors');

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: { department: basicDepartmentData }
    });
  } catch (error) {
    console.error('❌ Error updating department:', error);
    console.error('❌ Error stack:', error.stack);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Department with this ${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating department',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name
      } : undefined
    });
  }
};

// Delete department
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const department = await Department.findById(id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    await Department.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting department',
      error: error.message
    });
  }
};

// Toggle department status
const toggleDepartmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // Fixed: Use _id instead of id
    
    const department = await Department.findById(id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    department.isActive = !department.isActive;
    department.updatedBy = userId;
    
    await department.save();

    // Skip populate operations entirely to avoid 500 errors
    // Return the basic department data without populated references
    const basicDepartmentData = {
      _id: department._id,
      name: department.name,
      code: department.code,
      description: department.description,
      courseCategory: department.courseCategory,
      placementStaff: department.placementStaff,
      isActive: department.isActive,
      createdBy: department.createdBy,
      updatedBy: department.updatedBy,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt
    };

    res.status(200).json({
      success: true,
      message: `Department ${department.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { department: basicDepartmentData }
    });
  } catch (error) {
    console.error('Error toggling department status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating department status',
      error: error.message
    });
  }
};

module.exports = {
  getAllDepartments,
  getDepartment,
  getPlacementStaffOptions,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus
};
