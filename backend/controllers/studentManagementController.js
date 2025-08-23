const User = require('../models/User');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Department = require('../models/Department');
const PlacementStaffProfile = require('../models/PlacementStaffProfile');
const emailService = require('../services/emailService');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// @desc    Create a single student (Placement Staff only)
// @route   POST /api/student-management/students
// @access  Private (Placement Staff only)
const createStudent = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required'
      });
    }

    // Get placement staff's department from user record
    const placementStaffUser = await User.findById(req.user.id).populate('department');
    if (!placementStaffUser) {
      return res.status(400).json({
        success: false,
        message: 'Placement staff user not found.'
      });
    }

    // Enhanced department retrieval logic to handle both ObjectId and string formats
    let staffDepartment = 'CSE'; // Default fallback
    
    if (placementStaffUser.department) {
      // If department is populated (ObjectId reference)
      if (typeof placementStaffUser.department === 'object' && placementStaffUser.department.code) {
        staffDepartment = placementStaffUser.department.code;
      } else if (typeof placementStaffUser.department === 'string') {
        staffDepartment = placementStaffUser.department;
      }
    } else if (placementStaffUser.departmentCode) {
      // Fallback to legacy departmentCode field
      staffDepartment = placementStaffUser.departmentCode;
    }

    console.log(`Placement staff ${placementStaffUser.email} from department: ${staffDepartment}`);

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // Generate student ID (format: YEAR + DEPT + sequential number)
    const currentYear = new Date().getFullYear();
    const studentIdPrefix = `${currentYear}STU`;
    
    // Find the last student ID to generate next sequential number
    const lastStudent = await User.findOne(
      { studentId: { $regex: `^${studentIdPrefix}` } },
      {},
      { sort: { studentId: -1 } }
    );
    
    let nextNumber = 1;
    if (lastStudent && lastStudent.studentId) {
      const lastNumber = parseInt(lastStudent.studentId.replace(studentIdPrefix, ''));
      nextNumber = lastNumber + 1;
    }
    
    const studentId = `${studentIdPrefix}${nextNumber.toString().padStart(3, '0')}`;

    // Generate a temporary password
    const tempPassword = `Student@${Math.floor(Math.random() * 9000) + 1000}`;
    
    // Create user account (password will be hashed by User model pre-save middleware)
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: tempPassword, // Don't hash here - let the User model handle it
      role: 'student',
      studentId: studentId,
      isActive: true,
      isVerified: false,
      createdBy: req.user.id
    });

    const savedUser = await newUser.save();

    // Create basic student profile with staff's department
    const newStudent = new Student({
      userId: savedUser._id,
      studentId: studentId,
      registrationNumber: studentId, // Using same as student ID for now
      personalInfo: {
        fullName: `${firstName.trim()} ${lastName.trim()}`
      },
      contact: {
        email: email.toLowerCase().trim()
      },
      academic: {
        department: staffDepartment, // Auto-assign staff's department
        program: 'Not Specified'
      },
      placement: {
        placementStatus: 'Unplaced'
      }
    });

    const savedStudent = await newStudent.save();

    // Update user with student profile reference
    savedUser.studentProfile = savedStudent._id;
    await savedUser.save();

    // Prepare student data for email
    const studentData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      studentId: studentId,
      defaultPassword: tempPassword
    };

    // Send welcome email
    try {
      const emailResult = await emailService.sendStudentWelcomeEmail(studentData, tempPassword);
      console.log(`Welcome email result for student ${email}:`, emailResult);
      
      if (!emailResult.success) {
        console.error(`Failed to send welcome email to ${email}:`, emailResult.error);
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the student creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        studentId: savedUser.studentId,
        role: savedUser.role,
        isActive: savedUser.isActive,
        createdAt: savedUser.createdAt
      },
      defaultPassword: tempPassword
    });

  } catch (error) {
    console.error('Error creating student:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A student with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Create multiple students at once (Placement Staff only)
// @route   POST /api/student-management/students/bulk
// @access  Private (Placement Staff only)
const createBulkStudents = async (req, res) => {
  try {
    // Enhanced request body handling - support both formats for backward compatibility
    console.log('🔍 Bulk upload request received');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    let studentData;
    
    let batchInfo = null;
    
    // Handle different request body formats
    if (req.body.studentData && Array.isArray(req.body.studentData)) {
      // Format: { studentData: [...], batchInfo: {...} }
      studentData = req.body.studentData;
      batchInfo = req.body.batchInfo;
      console.log('✅ Using wrapped format: req.body.studentData');
      console.log('✅ Batch info received:', batchInfo);
    } else if (Array.isArray(req.body)) {
      // Format: [...]
      studentData = req.body;
      console.log('✅ Using direct array format: req.body');
    } else if (req.body.length !== undefined) {
      // Handle case where body might be array-like
      studentData = Array.from(req.body);
      console.log('✅ Converting array-like object to array');
    } else {
      console.log('❌ Invalid request format');
      return res.status(400).json({
        success: false,
        message: 'Invalid request format. Expected student data array or object with studentData property.',
        receivedKeys: Object.keys(req.body),
        receivedType: typeof req.body,
        isArray: Array.isArray(req.body)
      });
    }

    if (!studentData || !Array.isArray(studentData) || studentData.length === 0) {
      console.log('❌ Student data validation failed');
      return res.status(400).json({
        success: false,
        message: 'Student data array is required and must not be empty',
        receivedData: studentData,
        dataType: typeof studentData,
        isArray: Array.isArray(studentData),
        length: studentData ? studentData.length : 'N/A'
      });
    }

    console.log(`✅ Processing ${studentData.length} students for bulk creation`);

    // Get placement staff's department from user record
    const placementStaffUser = await User.findById(req.user.id).populate('department');
    if (!placementStaffUser) {
      return res.status(400).json({
        success: false,
        message: 'Placement staff user not found.'
      });
    }

    // Enhanced department retrieval logic to handle both ObjectId and string formats
    let staffDepartment = 'CSE'; // Default fallback
    
    if (placementStaffUser.department) {
      // If department is populated (ObjectId reference)
      if (typeof placementStaffUser.department === 'object' && placementStaffUser.department.code) {
        staffDepartment = placementStaffUser.department.code;
      } else if (typeof placementStaffUser.department === 'string') {
        staffDepartment = placementStaffUser.department;
      }
    } else if (placementStaffUser.departmentCode) {
      // Fallback to legacy departmentCode field
      staffDepartment = placementStaffUser.departmentCode;
    }

    console.log(`Bulk creation - Placement staff ${placementStaffUser.email} from department: ${staffDepartment}`);

    // Handle batch creation/assignment if batch info is provided
    let batch = null;
    if (batchInfo && batchInfo.joiningYear && batchInfo.courseType && batchInfo.batchCode) {
      try {
        console.log('🎓 Creating/finding batch:', batchInfo);
        
        // Calculate course duration based on course type
        const courseDurations = {
          'UG': 4,
          'PG': 2,
          'Diploma': 3,
          'Certificate': 1
        };
        
        const courseDuration = courseDurations[batchInfo.courseType] || 4;
        const endYear = batchInfo.joiningYear + courseDuration;
        
        // Resolve department ObjectId properly
        let departmentObjectId = null;
        
        if (placementStaffUser.department) {
          // If department is already populated as ObjectId
          if (typeof placementStaffUser.department === 'object' && placementStaffUser.department._id) {
            departmentObjectId = placementStaffUser.department._id;
            console.log('✅ Using populated department ObjectId:', departmentObjectId);
          } else if (mongoose.Types.ObjectId.isValid(placementStaffUser.department)) {
            // If department is a valid ObjectId string
            departmentObjectId = new mongoose.Types.ObjectId(placementStaffUser.department);
            console.log('✅ Using department ObjectId from string:', departmentObjectId);
          }
        }
        
        // If we still don't have a department ObjectId, try to find by code
        if (!departmentObjectId && staffDepartment) {
          console.log('🔍 Looking up department by code:', staffDepartment);
          const departmentDoc = await Department.findOne({ 
            code: staffDepartment.toUpperCase(),
            isActive: true 
          });
          
          if (departmentDoc) {
            departmentObjectId = departmentDoc._id;
            console.log('✅ Found department by code:', staffDepartment, '-> ObjectId:', departmentObjectId);
          } else {
            console.log('❌ Department not found by code:', staffDepartment);
          }
        }
        
        // Validate that we have a department ObjectId
        if (!departmentObjectId) {
          throw new Error(`Department is required for batch creation. Staff department: ${staffDepartment}, User department: ${placementStaffUser.department}`);
        }
        
        console.log('🎓 Creating batch with department ObjectId:', departmentObjectId);
        
        // Find or create batch with all required fields
        batch = await Batch.findOrCreateBatch({
          batchCode: batchInfo.batchCode,
          startYear: batchInfo.joiningYear,
          endYear: endYear,
          courseType: batchInfo.courseType,
          courseDuration: courseDuration,
          department: departmentObjectId, // Use the resolved ObjectId
          academicYearStart: batchInfo.joiningYear,
          academicYearEnd: endYear,
          createdBy: req.user.id
        });
        
        console.log('✅ Batch created/found:', batch.batchCode, batch._id);
      } catch (batchError) {
        console.error('❌ Error creating batch:', batchError);
        return res.status(400).json({
          success: false,
          message: 'Error creating batch: ' + batchError.message
        });
      }
    }

    const results = {
      successful: [],
      failed: [],
      totalProcessed: studentData.length,
      totalSuccessful: 0,
      totalFailed: 0,
      batchInfo: batch ? {
        id: batch._id,
        batchCode: batch.batchCode,
        courseType: batch.courseType,
        academicStatus: batch.academicStatus
      } : null
    };

    // Pre-calculate starting student ID to avoid race conditions
    const currentYear = new Date().getFullYear();
    const studentIdPrefix = `${currentYear}STU`;
    
    // Get the last student ID once at the beginning
    const lastStudent = await User.findOne(
      { studentId: { $regex: `^${studentIdPrefix}` } },
      {},
      { sort: { studentId: -1 } }
    );
    
    let startingNumber = 1;
    if (lastStudent && lastStudent.studentId) {
      const lastNumber = parseInt(lastStudent.studentId.replace(studentIdPrefix, ''));
      startingNumber = lastNumber + 1;
    }

    console.log(`Starting bulk student creation. Last student ID: ${lastStudent?.studentId || 'None'}, Starting from: ${startingNumber}`);

    // Process each student
    for (let i = 0; i < studentData.length; i++) {
      const student = studentData[i];
      
      try {
        const { firstName, lastName, email } = student;

        // Validate required fields
        if (!firstName || !lastName || !email) {
          results.failed.push({
            index: i + 1,
            email: email || 'No email provided',
            error: 'First name, last name, and email are required'
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          results.failed.push({
            index: i + 1,
            email: email,
            error: 'User with this email already exists'
          });
          continue;
        }

        // Generate sequential student ID (FIXED: Use loop index instead of successful results length)
        const currentStudentNumber = startingNumber + i;
        const studentId = `${studentIdPrefix}${currentStudentNumber.toString().padStart(3, '0')}`;

        console.log(`Creating student ${i + 1}/${studentData.length}: ${firstName} ${lastName} with ID: ${studentId}`);

        // Check if this student ID already exists (additional safety check)
        const existingStudentId = await User.findOne({ studentId: studentId });
        if (existingStudentId) {
          results.failed.push({
            index: i + 1,
            email: email,
            error: `Student ID ${studentId} already exists. Please try again.`
          });
          continue;
        }

        // Generate temporary password
        const tempPassword = `Student@${Math.floor(Math.random() * 9000) + 1000}`;
        
        // Create user account (password will be hashed by User model pre-save middleware)
        const newUser = new User({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.toLowerCase().trim(),
          password: tempPassword, // Don't hash here - let the User model handle it
          role: 'student',
          studentId: studentId,
          isActive: true,
          isVerified: false,
          createdBy: req.user.id
        });

        const savedUser = await newUser.save();

        // Create basic student profile with staff's department
        const newStudent = new Student({
          userId: savedUser._id,
          studentId: studentId,
          registrationNumber: studentId,
          batchId: batch ? batch._id : null, // Assign to batch if available
          personalInfo: {
            fullName: `${firstName.trim()} ${lastName.trim()}`
          },
          contact: {
            email: email.toLowerCase().trim()
          },
          academic: {
            department: staffDepartment, // Auto-assign staff's department
            program: 'Not Specified'
          },
          placement: {
            placementStatus: 'Unplaced'
          }
        });

        const savedStudent = await newStudent.save();

        // Update user with student profile reference
        savedUser.studentProfile = savedStudent._id;
        await savedUser.save();

        // Add to successful results
        results.successful.push({
          index: i + 1,
          id: savedUser._id,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
          studentId: savedUser.studentId,
          defaultPassword: tempPassword
        });

        console.log(`Successfully created student: ${firstName} ${lastName} (${studentId})`);

      } catch (error) {
        console.error(`Error creating student at index ${i}:`, error);
        
        // Provide more specific error messages
        let errorMessage = 'Unknown error occurred';
        if (error.code === 11000) {
          // Duplicate key error
          const field = Object.keys(error.keyPattern || {})[0];
          if (field === 'studentId') {
            errorMessage = `Student ID already exists. This might be due to concurrent requests.`;
          } else if (field === 'email') {
            errorMessage = `Email address already exists`;
          } else {
            errorMessage = `Duplicate ${field} detected`;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        results.failed.push({
          index: i + 1,
          email: student.email || 'Unknown',
          error: errorMessage
        });
      }
    }

    results.totalSuccessful = results.successful.length;
    results.totalFailed = results.failed.length;

    console.log(`Bulk creation completed. Successful: ${results.totalSuccessful}, Failed: ${results.totalFailed}`);

    // Send bulk welcome emails for successful students asynchronously (fire-and-forget)
    if (results.successful.length > 0) {
      // Don't await this - let it run in background
      setImmediate(async () => {
        try {
          console.log(`🚀 Starting background email sending to ${results.successful.length} students...`);
          const emailResults = await emailService.sendBulkStudentWelcomeEmailsParallel(results.successful);
          console.log(`📧 Background bulk emails completed. Success: ${emailResults.totalSent}, Failed: ${emailResults.totalFailed}`);
          
          if (emailResults.totalFailed > 0) {
            console.warn(`⚠️ Some emails failed to send:`, emailResults.failed);
          }
        } catch (emailError) {
          console.error('❌ Error in background email sending:', emailError);
        }
      });
      
      console.log(`✅ Student creation completed. Email sending started in background for ${results.successful.length} students.`);
    }

    const statusCode = results.totalSuccessful > 0 ? 201 : 400;
    
    res.status(statusCode).json({
      success: results.totalSuccessful > 0,
      message: `Bulk student creation completed. ${results.totalSuccessful} successful, ${results.totalFailed} failed.`,
      results
    });

  } catch (error) {
    console.error('Error in bulk student creation:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing bulk student creation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get students created by placement staff
// @route   GET /api/student-management/students
// @access  Private (Placement Staff only)
const getStudentsForPlacementStaff = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = '',
      placementStatus = ''
    } = req.query;

    // Build filter query - show all students created by this placement staff
    const filter = {
      role: 'student',
      createdBy: new mongoose.Types.ObjectId(req.user.id) // Convert to ObjectId for proper comparison
    };


    // Add status filtering
    if (status) {
      switch (status) {
        case 'active':
          filter.isActive = true;
          filter.isVerified = true;
          break;
        case 'inactive':
          filter.isActive = false;
          break;
        case 'verified':
          filter.isVerified = true;
          break;
        case 'unverified':
          filter.isVerified = false;
          break;
      }
    }

    // Add search functionality
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Simplified aggregation pipeline - removed restrictive department filtering
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'students',
          localField: 'studentProfile',
          foreignField: '_id',
          as: 'profile'
        }
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } }
    ];

    // Add placement status filtering if specified
    if (placementStatus) {
      if (placementStatus === 'Unplaced') {
        // For Unplaced, include students without profiles or with Unplaced status
        pipeline.push({
          $match: {
            $or: [
              { 'profile.placement.placementStatus': 'Unplaced' },
              { 'profile.placement.placementStatus': { $exists: false } },
              { 'profile': null }
            ]
          }
        });
      } else {
        // For other statuses, only match students with that specific status
        pipeline.push({
          $match: {
            'profile.placement.placementStatus': placementStatus
          }
        });
      }
    }

    // Add sorting
    pipeline.push({ $sort: sort });

    // Get total count for pagination
    const totalPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await User.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: parseInt(limit) });

    // Execute aggregation
    const students = await User.aggregate(pipeline);

    console.log('Pipeline:', JSON.stringify(pipeline, null, 2));
    console.log('Students found:', students.length);
    console.log('Total from pipeline:', total);

    // Format response data
    const formattedStudents = students.map(student => ({
      id: student._id,
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: `${student.firstName} ${student.lastName}`,
      email: student.email,
      studentId: student.studentId,
      role: student.role,
      isActive: student.isActive,
      isVerified: student.isVerified,
      lastLogin: student.lastLogin,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      profile: student.profile ? {
        department: student.profile.academic?.department || 'Not Specified',
        program: student.profile.academic?.program || 'Not Specified',
        placementStatus: student.profile.placement?.placementStatus || 'Unplaced',
        profileCompletionPercentage: student.profile.profileCompletionPercentage || 0
      } : {
        department: 'Not Specified',
        program: 'Not Specified',
        placementStatus: 'Unplaced',
        profileCompletionPercentage: 0
      }
    }));

    res.json({
      success: true,
      students: formattedStudents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalStudents: total,
        hasNextPage: skip + formattedStudents.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get student statistics for placement staff
// @route   GET /api/student-management/stats
// @access  Private (Placement Staff only)
const getStudentStatsForPlacementStaff = async (req, res) => {
  try {
    // Convert user ID to ObjectId for proper comparison
    const createdByObjectId = new mongoose.Types.ObjectId(req.user.id);

    // Get total students created by this placement staff
    const totalStudents = await User.countDocuments({
      role: 'student',
      createdBy: createdByObjectId
    });

    // Get active students created by this placement staff
    const activeStudents = await User.countDocuments({
      role: 'student',
      createdBy: createdByObjectId,
      isActive: true
    });

    // Get verified students created by this placement staff
    const verifiedStudents = await User.countDocuments({
      role: 'student',
      createdBy: createdByObjectId,
      isVerified: true
    });

    // Get placement statistics for students created by this placement staff
    const placementStats = await User.aggregate([
      {
        $match: {
          role: 'student',
          createdBy: createdByObjectId
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'studentProfile',
          foreignField: '_id',
          as: 'profile'
        }
      },
      {
        $unwind: {
          path: '$profile',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: {
            $ifNull: ['$profile.placement.placementStatus', 'Unplaced']
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Format placement stats
    const placementSummary = {
      unplaced: 0,
      placed: 0,
      multipleOffers: 0
    };

    placementStats.forEach(stat => {
      switch (stat._id) {
        case 'Unplaced':
          placementSummary.unplaced = stat.count;
          break;
        case 'Placed':
          placementSummary.placed = stat.count;
          break;
        case 'Multiple Offers':
          placementSummary.multipleOffers = stat.count;
          break;
        default:
          placementSummary.unplaced += stat.count;
      }
    });

    // Get recent students (last 7 days) created by this placement staff
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentStudents = await User.countDocuments({
      role: 'student',
      createdBy: createdByObjectId,
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      stats: {
        total: totalStudents,
        active: activeStudents,
        verified: verifiedStudents,
        recent: recentStudents,
        placement: placementSummary
      }
    });

  } catch (error) {
    console.error('Error fetching student statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update student status (verify/unverify, activate/deactivate)
// @route   PUT /api/student-management/students/:id/status
// @access  Private (Placement Staff only)
const updateStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, isVerified } = req.body;

    // Validate input
    if (typeof isActive !== 'boolean' && typeof isVerified !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'At least one status field (isActive or isVerified) must be provided'
      });
    }

    // Find the student
    const student = await User.findOne({
      _id: id,
      role: 'student',
      createdBy: req.user.id // Ensure placement staff can only update their own students
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or you do not have permission to update this student'
      });
    }

    // Update the status fields
    const updateFields = {};
    if (typeof isActive === 'boolean') {
      updateFields.isActive = isActive;
    }
    if (typeof isVerified === 'boolean') {
      updateFields.isVerified = isVerified;
    }

    const updatedStudent = await User.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Student status updated successfully',
      student: {
        id: updatedStudent._id,
        firstName: updatedStudent.firstName,
        lastName: updatedStudent.lastName,
        email: updatedStudent.email,
        studentId: updatedStudent.studentId,
        isActive: updatedStudent.isActive,
        isVerified: updatedStudent.isVerified,
        updatedAt: updatedStudent.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating student status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/student-management/students/:id
// @access  Private (Placement Staff only)
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the student
    const student = await User.findOne({
      _id: id,
      role: 'student',
      createdBy: req.user.id // Ensure placement staff can only delete their own students
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or you do not have permission to delete this student'
      });
    }

    // Delete the student profile if it exists
    if (student.studentProfile) {
      await Student.findByIdAndDelete(student.studentProfile);
    }

    // Delete the user account
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Delete multiple students
// @route   DELETE /api/student-management/students/bulk
// @access  Private (Placement Staff only)
const deleteBulkStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;

    console.log('🔍 Bulk delete request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Student IDs to delete:', studentIds);
    console.log('User ID:', req.user.id);
    console.log('User role:', req.user.role);

    // Validate input
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      console.log('❌ Validation failed: Invalid studentIds');
      return res.status(400).json({
        success: false,
        message: 'Student IDs array is required and must not be empty',
        receivedData: {
          studentIds: studentIds,
          type: typeof studentIds,
          isArray: Array.isArray(studentIds),
          length: studentIds ? studentIds.length : 'N/A'
        }
      });
    }

    // Convert string IDs to ObjectIds and validate
    let objectIds;
    try {
      objectIds = studentIds.map(id => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error(`Invalid student ID format: ${id}`);
        }
        return new mongoose.Types.ObjectId(id);
      });
      console.log('✅ Successfully converted student IDs to ObjectIds');
    } catch (validationError) {
      console.log('❌ ID validation failed:', validationError.message);
      return res.status(400).json({
        success: false,
        message: validationError.message,
        invalidIds: studentIds.filter(id => !mongoose.Types.ObjectId.isValid(id))
      });
    }

    // Find students that belong to this placement staff
    console.log('🔍 Searching for students with query:', {
      _id: { $in: objectIds },
      role: 'student',
      createdBy: req.user.id
    });

    const students = await User.find({
      _id: { $in: objectIds },
      role: 'student',
      createdBy: req.user.id // Ensure placement staff can only delete their own students
    });

    console.log(`✅ Found ${students.length} students out of ${studentIds.length} requested`);
    console.log('Found students:', students.map(s => ({ id: s._id, email: s.email, name: `${s.firstName} ${s.lastName}` })));

    if (students.length === 0) {
      console.log('❌ No students found or no permission');
      return res.status(404).json({
        success: false,
        message: 'No students found or you do not have permission to delete these students',
        requestedIds: studentIds,
        userPermissions: {
          userId: req.user.id,
          role: req.user.role
        }
      });
    }

    const results = {
      successful: [],
      failed: [],
      totalProcessed: studentIds.length,
      totalSuccessful: 0,
      totalFailed: 0
    };

    // Process each student deletion
    for (const student of students) {
      try {
        console.log(`🗑️ Deleting student: ${student.firstName} ${student.lastName} (${student.email})`);

        // Delete the student profile if it exists
        if (student.studentProfile) {
          const deletedProfile = await Student.findByIdAndDelete(student.studentProfile);
          console.log(`✅ Deleted student profile for: ${student.email}`, deletedProfile ? 'Success' : 'Profile not found');
        }

        // Delete the user account
        const deletedUser = await User.findByIdAndDelete(student._id);
        console.log(`✅ Deleted user account for: ${student.email}`, deletedUser ? 'Success' : 'User not found');

        results.successful.push({
          id: student._id,
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          studentId: student.studentId
        });
        results.totalSuccessful++;

      } catch (error) {
        console.error(`❌ Error deleting student ${student.email}:`, error);
        results.failed.push({
          id: student._id,
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          error: error.message
        });
        results.totalFailed++;
      }
    }

    // Check for students that were not found (don't have permission or don't exist)
    const foundIds = students.map(s => s._id.toString());
    const notFoundIds = studentIds.filter(id => !foundIds.includes(id));
    
    if (notFoundIds.length > 0) {
      console.log('⚠️ Some students were not found or no permission:', notFoundIds);
    }
    
    notFoundIds.forEach(id => {
      results.failed.push({
        id: id,
        name: 'Unknown',
        email: 'Unknown',
        error: 'Student not found or no permission to delete'
      });
      results.totalFailed++;
    });

    console.log(`✅ Bulk deletion completed. Successful: ${results.totalSuccessful}, Failed: ${results.totalFailed}`);

    const statusCode = results.totalSuccessful > 0 ? 200 : 400;
    
    res.status(statusCode).json({
      success: results.totalSuccessful > 0,
      message: `Bulk student deletion completed. ${results.totalSuccessful} successful, ${results.totalFailed} failed.`,
      results
    });

  } catch (error) {
    console.error('❌ Critical error in bulk student deletion:', error);
    console.error('Error stack:', error.stack);
    
    // Provide detailed error information for debugging
    const errorResponse = {
      success: false,
      message: 'Error processing bulk student deletion',
      error: error.message,
      timestamp: new Date().toISOString(),
      requestInfo: {
        userId: req.user?.id,
        userRole: req.user?.role,
        requestBody: req.body
      }
    };

    // Add stack trace in development mode
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
    }

    res.status(500).json(errorResponse);
  }
};

// @desc    Test email configuration
// @route   GET /api/student-management/test-email-config
// @access  Private (Placement Staff only)
const testEmailConfiguration = async (req, res) => {
  try {
    console.log('🧪 Testing email configuration...');
    
    // Test SMTP connection
    const connectionTest = await emailService.testSMTPConnection();
    
    // Get email service status
    const serviceStatus = emailService.getEmailServiceStatus();
    
    res.json({
      success: true,
      message: 'Email configuration test completed',
      connectionTest,
      serviceStatus,
      recommendations: [
        'Check if Gmail 2FA is enabled',
        'Verify app password is correctly set',
        'Ensure SMTP_EMAIL and SMTP_PASSWORD are in .env file',
        'Check spam/junk folder for test emails'
      ]
    });

  } catch (error) {
    console.error('Error testing email configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing email configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Send test email
// @route   POST /api/student-management/send-test-email
// @access  Private (Placement Staff only)
const sendTestEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    console.log(`🧪 Sending test email to: ${email}`);
    
    const result = await emailService.sendTestEmail(email);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error,
        errorDetails: result.errorDetails
      });
    }

  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Resend welcome email to student
// @route   POST /api/student-management/students/:id/resend-email
// @access  Private (Placement Staff only)
const resendWelcomeEmail = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the student
    const student = await User.findOne({
      _id: id,
      role: 'student',
      createdBy: req.user.id // Ensure placement staff can only resend emails for their own students
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or you do not have permission to resend email for this student'
      });
    }

    // Generate a new temporary password
    const tempPassword = `Student@${Math.floor(Math.random() * 9000) + 1000}`;

    // Update the student's password (will be hashed by User model pre-save middleware)
    student.password = tempPassword; // Don't hash here - let the User model handle it
    await student.save();

    // Prepare student data for email
    const studentData = {
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      studentId: student.studentId
    };

    console.log(`📧 Resending welcome email to student: ${student.email}`);
    
    // Send welcome email
    const emailResult = await emailService.sendStudentWelcomeEmail(studentData, tempPassword);
    
    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Welcome email resent successfully',
        emailResult,
        newPassword: tempPassword
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to resend welcome email',
        error: emailResult.error,
        errorDetails: emailResult.errorDetails
      });
    }

  } catch (error) {
    console.error('Error resending welcome email:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending welcome email',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get batches for placement staff
// @route   GET /api/student-management/batches
// @access  Private (Placement Staff only)
const getBatchesForPlacementStaff = async (req, res) => {
  try {
    console.log(`🔍 Fetching batches for placement staff user ID: ${req.user.id}`);

    // Get placement staff's department from user record
    const placementStaffUser = await User.findById(req.user.id).populate('department');
    if (!placementStaffUser) {
      console.error('❌ Placement staff user not found');
      return res.status(400).json({
        success: false,
        message: 'Placement staff user not found.'
      });
    }

    console.log(`✅ Found placement staff user: ${placementStaffUser.email}`);
    console.log(`🏢 User department info:`, {
      department: placementStaffUser.department,
      departmentCode: placementStaffUser.departmentCode,
      departmentType: typeof placementStaffUser.department
    });

    // Enhanced department retrieval logic with better error handling
    let staffDepartment = 'CSE'; // Default fallback
    let departmentObjectId = null;
    
    try {
      if (placementStaffUser.department) {
        // If department is populated (ObjectId reference)
        if (typeof placementStaffUser.department === 'object' && placementStaffUser.department.code) {
          staffDepartment = placementStaffUser.department.code;
          departmentObjectId = placementStaffUser.department._id;
          console.log(`✅ Using populated department: ${staffDepartment} (${departmentObjectId})`);
        } else if (typeof placementStaffUser.department === 'string') {
          staffDepartment = placementStaffUser.department;
          console.log(`🔍 Looking up department by code: ${staffDepartment}`);
          
          // Try to find department by code
          const departmentDoc = await Department.findOne({ 
            code: staffDepartment.toUpperCase(),
            isActive: true 
          });
          
          if (departmentDoc) {
            departmentObjectId = departmentDoc._id;
            console.log(`✅ Found department by code: ${staffDepartment} -> ${departmentObjectId}`);
          } else {
            console.warn(`⚠️ Department not found by code: ${staffDepartment}`);
          }
        }
      } else if (placementStaffUser.departmentCode) {
        // Fallback to legacy departmentCode field
        staffDepartment = placementStaffUser.departmentCode;
        console.log(`🔍 Using legacy departmentCode: ${staffDepartment}`);
        
        const departmentDoc = await Department.findOne({ 
          code: staffDepartment.toUpperCase(),
          isActive: true 
        });
        
        if (departmentDoc) {
          departmentObjectId = departmentDoc._id;
          console.log(`✅ Found department by legacy code: ${staffDepartment} -> ${departmentObjectId}`);
        } else {
          console.warn(`⚠️ Department not found by legacy code: ${staffDepartment}`);
        }
      }
    } catch (deptError) {
      console.error('❌ Error resolving department:', deptError);
      // Continue with default department
    }

    console.log(`🎯 Final department resolution: ${staffDepartment} (ObjectId: ${departmentObjectId})`);

    // Get all batches for the staff's department (or all batches if no department found)
    let batches = [];
    try {
      if (departmentObjectId) {
        console.log(`🔍 Fetching batches for department ObjectId: ${departmentObjectId}`);
        batches = await Batch.find({ 
          department: departmentObjectId,
          isActive: true 
        })
        .populate('department', 'name code')
        .sort({ startYear: -1 }) // Most recent first
        .lean(); // Use lean for better performance
      } else {
        console.log(`🔍 No department ObjectId found, fetching all active batches`);
        batches = await Batch.find({ 
          isActive: true 
        })
        .populate('department', 'name code')
        .sort({ startYear: -1 })
        .lean();
      }
      
      console.log(`✅ Found ${batches.length} batches`);
    } catch (batchError) {
      console.error('❌ Error fetching batches:', batchError);
      throw new Error(`Failed to fetch batches: ${batchError.message}`);
    }

    // If no batches found, return empty result
    if (batches.length === 0) {
      console.log('📝 No batches found, returning empty result');
      return res.json({
        success: true,
        batches: [],
        department: {
          code: staffDepartment,
          id: departmentObjectId
        }
      });
    }

    // Get student counts for each batch with simplified queries
    console.log(`🔢 Calculating stats for ${batches.length} batches...`);
    const batchesWithStats = [];

    for (const batch of batches) {
      try {
        console.log(`📊 Processing batch: ${batch.batchCode}`);

        // Simplified student count query - count students in this batch created by this placement staff
        let batchStudentCount = 0;
        let placementSummary = {
          unplaced: 0,
          placed: 0,
          multipleOffers: 0
        };

        try {
          // Get students in this batch created by this placement staff
          const studentsInBatch = await User.find({
            role: 'student',
            createdBy: req.user.id,
            studentProfile: { $exists: true }
          })
          .populate({
            path: 'studentProfile',
            match: { batchId: batch._id },
            select: 'placement.placementStatus'
          })
          .lean();

          // Filter out users where studentProfile didn't match (populate returned null)
          const validStudents = studentsInBatch.filter(student => student.studentProfile);
          batchStudentCount = validStudents.length;

          // Count placement statuses
          validStudents.forEach(student => {
            const status = student.studentProfile?.placement?.placementStatus || 'Unplaced';
            switch (status) {
              case 'Placed':
                placementSummary.placed++;
                break;
              case 'Multiple Offers':
                placementSummary.multipleOffers++;
                break;
              default:
                placementSummary.unplaced++;
            }
          });

          console.log(`✅ Batch ${batch.batchCode}: ${batchStudentCount} students`);
        } catch (statsError) {
          console.error(`❌ Error calculating stats for batch ${batch.batchCode}:`, statsError);
          // Continue with zero stats
        }

        // Build batch response object
        const batchResponse = {
          id: batch._id,
          batchCode: batch.batchCode,
          startYear: batch.startYear,
          endYear: batch.endYear,
          courseType: batch.courseType,
          courseDuration: batch.courseDuration,
          academicStatus: batch.academicStatus,
          displayName: batch.displayName,
          fullDisplayName: batch.fullDisplayName,
          department: batch.department,
          isActive: batch.isActive,
          isGraduated: batch.isGraduated,
          createdAt: batch.createdAt,
          stats: {
            totalStudents: batchStudentCount,
            placement: placementSummary,
            placementRate: batchStudentCount > 0 ? 
              Math.round(((placementSummary.placed + placementSummary.multipleOffers) / batchStudentCount) * 100) : 0
          }
        };

        batchesWithStats.push(batchResponse);
      } catch (batchProcessError) {
        console.error(`❌ Error processing batch ${batch.batchCode}:`, batchProcessError);
        // Add batch with zero stats to avoid breaking the entire response
        batchesWithStats.push({
          id: batch._id,
          batchCode: batch.batchCode,
          startYear: batch.startYear,
          endYear: batch.endYear,
          courseType: batch.courseType,
          courseDuration: batch.courseDuration,
          academicStatus: batch.academicStatus,
          displayName: batch.displayName,
          fullDisplayName: batch.fullDisplayName,
          department: batch.department,
          isActive: batch.isActive,
          isGraduated: batch.isGraduated,
          createdAt: batch.createdAt,
          stats: {
            totalStudents: 0,
            placement: { unplaced: 0, placed: 0, multipleOffers: 0 },
            placementRate: 0
          }
        });
      }
    }

    console.log(`✅ Successfully processed ${batchesWithStats.length} batches`);

    res.json({
      success: true,
      batches: batchesWithStats,
      department: {
        code: staffDepartment,
        id: departmentObjectId
      }
    });

  } catch (error) {
    console.error('❌ Critical error in getBatchesForPlacementStaff:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Error fetching batches',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? {
        userId: req.user?.id,
        timestamp: new Date().toISOString(),
        stack: error.stack
      } : undefined
    });
  }
};

// @desc    Get students for a specific batch (Placement Staff only)
// @route   GET /api/student-management/batches/:batchId/students
// @access  Private (Placement Staff only)
const getStudentsForBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = '',
      placementStatus = ''
    } = req.query;

    console.log(`🔍 Fetching students for batch ID: ${batchId}`);
    console.log(`📋 Query params:`, { page, limit, search, sortBy, sortOrder, status, placementStatus });

    // Validate batch ID
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      console.error('❌ Invalid batch ID format:', batchId);
      return res.status(400).json({
        success: false,
        message: 'Invalid batch ID'
      });
    }

    // Get batch details
    let batch;
    try {
      batch = await Batch.findById(batchId).populate('department', 'name code');
      if (!batch) {
        console.error('❌ Batch not found:', batchId);
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }
      console.log(`✅ Found batch: ${batch.batchCode}`);
    } catch (batchError) {
      console.error('❌ Error fetching batch:', batchError);
      return res.status(500).json({
        success: false,
        message: 'Error fetching batch details',
        error: process.env.NODE_ENV === 'development' ? batchError.message : 'Internal server error'
      });
    }

    // Build filter query - show students in this batch created by this placement staff
    const filter = {
      role: 'student',
      createdBy: req.user.id, // Use string instead of ObjectId for simpler comparison
      studentProfile: { $exists: true }
    };

    console.log(`🔍 Base filter:`, filter);

    // Add status filtering
    if (status) {
      switch (status) {
        case 'active':
          filter.isActive = true;
          filter.isVerified = true;
          break;
        case 'inactive':
          filter.isActive = false;
          break;
        case 'verified':
          filter.isVerified = true;
          break;
        case 'unverified':
          filter.isVerified = false;
          break;
      }
      console.log(`🔍 Added status filter: ${status}`);
    }

    // Add search functionality
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
      console.log(`🔍 Added search filter: ${search}`);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log(`📊 Pagination: page=${page}, limit=${limit}, skip=${skip}`);

    // Use simplified approach with populate instead of complex aggregation
    let students = [];
    let total = 0;

    try {
      // First, get all students that match the basic filter
      const allStudents = await User.find(filter)
        .populate({
          path: 'studentProfile',
          select: 'batchId placement.placementStatus academic.department academic.program profileCompletionPercentage'
        })
        .lean();

      console.log(`✅ Found ${allStudents.length} students created by this placement staff`);

      // Filter students that belong to this specific batch
      const studentsInBatch = allStudents.filter(student => {
        if (!student.studentProfile) {
          console.log(`⚠️ Student ${student.email} has no profile`);
          return false;
        }
        
        const studentBatchId = student.studentProfile.batchId;
        if (!studentBatchId) {
          console.log(`⚠️ Student ${student.email} has no batchId in profile`);
          return false;
        }

        const matches = studentBatchId.toString() === batchId;
        if (matches) {
          console.log(`✅ Student ${student.email} belongs to batch ${batchId}`);
        }
        return matches;
      });

      console.log(`✅ Found ${studentsInBatch.length} students in batch ${batch.batchCode}`);

      // Apply placement status filtering if specified
      let filteredStudents = studentsInBatch;
      if (placementStatus) {
        filteredStudents = studentsInBatch.filter(student => {
          const status = student.studentProfile?.placement?.placementStatus || 'Unplaced';
          if (placementStatus === 'Unplaced') {
            return status === 'Unplaced' || !status;
          }
          return status === placementStatus;
        });
        console.log(`✅ After placement status filter (${placementStatus}): ${filteredStudents.length} students`);
      }

      total = filteredStudents.length;

      // Apply sorting
      filteredStudents.sort((a, b) => {
        let aValue, bValue;
        switch (sortBy) {
          case 'firstName':
            aValue = a.firstName?.toLowerCase() || '';
            bValue = b.firstName?.toLowerCase() || '';
            break;
          case 'lastName':
            aValue = a.lastName?.toLowerCase() || '';
            bValue = b.lastName?.toLowerCase() || '';
            break;
          case 'email':
            aValue = a.email?.toLowerCase() || '';
            bValue = b.email?.toLowerCase() || '';
            break;
          case 'studentId':
            aValue = a.studentId || '';
            bValue = b.studentId || '';
            break;
          case 'createdAt':
          default:
            aValue = new Date(a.createdAt || 0);
            bValue = new Date(b.createdAt || 0);
            break;
        }

        if (aValue < bValue) return sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return sortOrder === 'desc' ? -1 : 1;
        return 0;
      });

      // Apply pagination
      students = filteredStudents.slice(skip, skip + parseInt(limit));

      console.log(`✅ Final result: ${students.length} students (page ${page} of ${Math.ceil(total / parseInt(limit))})`);

    } catch (queryError) {
      console.error('❌ Error in student query:', queryError);
      throw new Error(`Database query failed: ${queryError.message}`);
    }

    // Format response data
    const formattedStudents = students.map(student => ({
      id: student._id,
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: `${student.firstName} ${student.lastName}`,
      email: student.email,
      studentId: student.studentId,
      role: student.role,
      isActive: student.isActive,
      isVerified: student.isVerified,
      lastLogin: student.lastLogin,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      profile: student.studentProfile ? {
        department: student.studentProfile.academic?.department || 'Not Specified',
        program: student.studentProfile.academic?.program || 'Not Specified',
        placementStatus: student.studentProfile.placement?.placementStatus || 'Unplaced',
        profileCompletionPercentage: student.studentProfile.profileCompletionPercentage || 0
      } : {
        department: 'Not Specified',
        program: 'Not Specified',
        placementStatus: 'Unplaced',
        profileCompletionPercentage: 0
      }
    }));

    res.json({
      success: true,
      students: formattedStudents,
      batch: {
        id: batch._id,
        batchCode: batch.batchCode,
        startYear: batch.startYear,
        endYear: batch.endYear,
        courseType: batch.courseType,
        academicStatus: batch.academicStatus,
        displayName: batch.displayName,
        department: batch.department
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalStudents: total,
        hasNextPage: skip + formattedStudents.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('❌ Critical error in getStudentsForBatch:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Error fetching students for batch',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? {
        batchId: req.params.batchId,
        userId: req.user?.id,
        timestamp: new Date().toISOString(),
        stack: error.stack
      } : undefined
    });
  }
};

module.exports = {
  createStudent,
  createBulkStudents,
  getStudentsForPlacementStaff,
  getStudentStatsForPlacementStaff,
  updateStudentStatus,
  deleteStudent,
  deleteBulkStudents,
  testEmailConfiguration,
  sendTestEmail,
  resendWelcomeEmail,
  getBatchesForPlacementStaff,
  getStudentsForBatch
};
