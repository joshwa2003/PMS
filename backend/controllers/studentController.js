const Student = require('../models/Student');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get current student's profile
// @route   GET /api/students/profile
// @access  Private (Student only)
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findByUserId(req.user.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.status(200).json({
      success: true,
      student
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student profile'
    });
  }
};

// @desc    Create or update student profile
// @route   PUT /api/students/profile
// @access  Private (Student only)
const updateStudentProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    let student = await Student.findOne({ userId });

    if (student) {
      // Update existing profile
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          if (typeof req.body[key] === 'object' && !Array.isArray(req.body[key])) {
            // Handle nested objects
            student[key] = { ...student[key], ...req.body[key] };
          } else {
            student[key] = req.body[key];
          }
        }
      });

      student = await student.save();
    } else {
      // Create new profile
      student = new Student({
        ...req.body,
        userId
      });
      await student.save();
    }

    // Populate user data
    await student.populate('userId', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      student
    });
  } catch (error) {
    console.error('Update student profile error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Student ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating student profile'
    });
  }
};

// @desc    Get all students (Admin/Placement staff only)
// @route   GET /api/students
// @access  Private (Admin/Placement staff)
const getAllStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      yearOfStudy,
      placementStatus,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (department) {
      filter['academic.department'] = department;
    }
    
    if (yearOfStudy) {
      filter['academic.yearOfStudy'] = parseInt(yearOfStudy);
    }
    
    if (placementStatus) {
      filter['placement.placementStatus'] = placementStatus;
    }

    // Build search query
    let query = Student.find(filter);

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = query.find({
        $or: [
          { studentId: searchRegex },
          { 'personalInfo.fullName': searchRegex },
          { 'contact.email': searchRegex },
          { 'academic.department': searchRegex }
        ]
      });
    }

    // Apply sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    query = query.sort(sortOptions);

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    query = query.skip(skip).limit(parseInt(limit));

    // Populate user data
    query = query.populate('userId', 'firstName lastName email isActive');

    const students = await query;
    const total = await Student.countDocuments(filter);

    res.status(200).json({
      success: true,
      students,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching students'
    });
  }
};

// @desc    Get student by ID (Admin/Placement staff only)
// @route   GET /api/students/:id
// @access  Private (Admin/Placement staff)
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'firstName lastName email isActive');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      student
    });
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student'
    });
  }
};

// @desc    Update student placement status (Placement staff only)
// @route   PUT /api/students/:id/placement
// @access  Private (Placement staff)
const updatePlacementStatus = async (req, res) => {
  try {
    const { placementStatus, offerDetails } = req.body;
    
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await student.updatePlacementStatus(placementStatus, offerDetails);

    res.status(200).json({
      success: true,
      message: 'Placement status updated successfully',
      student
    });
  } catch (error) {
    console.error('Update placement status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating placement status'
    });
  }
};

// @desc    Get student statistics (Admin/Placement staff only)
// @route   GET /api/students/stats
// @access  Private (Admin/Placement staff)
const getStudentStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    
    const placementStats = await Student.aggregate([
      {
        $group: {
          _id: '$placement.placementStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const departmentStats = await Student.aggregate([
      {
        $group: {
          _id: '$academic.department',
          count: { $sum: 1 }
        }
      }
    ]);

    const yearStats = await Student.aggregate([
      {
        $group: {
          _id: '$academic.yearOfStudy',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate average CGPA
    const cgpaStats = await Student.aggregate([
      {
        $group: {
          _id: null,
          averageCGPA: { $avg: '$academic.cgpa' },
          maxCGPA: { $max: '$academic.cgpa' },
          minCGPA: { $min: '$academic.cgpa' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total: totalStudents,
        placement: placementStats,
        departments: departmentStats,
        years: yearStats,
        cgpa: cgpaStats[0] || { averageCGPA: 0, maxCGPA: 0, minCGPA: 0 }
      }
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

// @desc    Delete student profile (Admin only)
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Student profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting student'
    });
  }
};

// @desc    Upload resume (Student only)
// @route   POST /api/students/resume
// @access  Private (Student only)
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const student = await Student.findOne({ userId: req.user.id });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Update resume link and last updated date
    student.placement.resumeLink = req.file.path;
    student.placement.resumeLastUpdated = new Date();
    
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeLink: req.file.path
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading resume'
    });
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  getAllStudents,
  getStudentById,
  updatePlacementStatus,
  getStudentStats,
  deleteStudent,
  uploadResume
};
