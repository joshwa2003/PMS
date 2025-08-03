const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');

// Import middleware
const { protect: auth } = require('../middleware/auth');

// Import controller
const {
  getStudentProfile,
  updateStudentProfile,
  getAllStudents,
  getStudentById,
  updatePlacementStatus,
  getStudentStats,
  deleteStudent,
  uploadResume
} = require('../controllers/studentController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resumes/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Validation middleware
const validateStudentProfile = [
  body('studentId')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Student ID is required'),
  
  body('registrationNumber')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Registration number is required'),
  
  body('personalInfo.fullName')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters long'),
  
  body('personalInfo.gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Invalid gender value'),
  
  body('personalInfo.category')
    .optional()
    .isIn(['GEN', 'SC', 'ST', 'OBC', 'Others'])
    .withMessage('Invalid category value'),
  
  body('contact.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('contact.phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  
  body('contact.pincode')
    .optional()
    .matches(/^[0-9]{6}$/)
    .withMessage('Pincode must be exactly 6 digits'),
  
  body('academic.cgpa')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('CGPA must be between 0 and 10'),
  
  body('academic.backlogs')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Backlogs must be a non-negative integer'),
  
  body('academic.yearOfStudy')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Year of study must be between 1 and 5'),
  
  body('academic.currentSemester')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Current semester must be between 1 and 10'),
  
  body('placement.placementStatus')
    .optional()
    .isIn(['Unplaced', 'Placed', 'Multiple Offers'])
    .withMessage('Invalid placement status'),
  
  body('careerProfile.experienceStatus')
    .optional()
    .isIn(['Fresher', 'Experienced'])
    .withMessage('Invalid experience status'),
  
  body('careerProfile.availableToJoinInDays')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Available to join days must be a non-negative integer'),
  
  body('languagesKnown.*.proficiency')
    .optional()
    .isIn(['Basic', 'Intermediate', 'Fluent'])
    .withMessage('Invalid language proficiency level')
];

// Role-based access middleware
const requireStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student role required.'
    });
  }
  next();
};

const requirePlacementAccess = (req, res, next) => {
  const allowedRoles = ['admin', 'placement_director', 'placement_staff'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Placement access required.'
    });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

// Routes

// @route   GET /api/students/profile
// @desc    Get current student's profile
// @access  Private (Student only)
router.get('/profile', auth, requireStudent, getStudentProfile);

// @route   PUT /api/students/profile
// @desc    Create or update student profile
// @access  Private (Student only)
router.put('/profile', auth, requireStudent, validateStudentProfile, updateStudentProfile);

// @route   POST /api/students/resume
// @desc    Upload resume
// @access  Private (Student only)
router.post('/resume', auth, requireStudent, upload.single('resume'), uploadResume);

// @route   GET /api/students/stats
// @desc    Get student statistics
// @access  Private (Admin/Placement staff)
router.get('/stats', auth, requirePlacementAccess, getStudentStats);

// @route   GET /api/students
// @desc    Get all students with filtering and pagination
// @access  Private (Admin/Placement staff)
router.get('/', auth, requirePlacementAccess, getAllStudents);

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private (Admin/Placement staff)
router.get('/:id', auth, requirePlacementAccess, getStudentById);

// @route   PUT /api/students/:id/placement
// @desc    Update student placement status
// @access  Private (Placement staff)
router.put('/:id/placement', auth, requirePlacementAccess, [
  body('placementStatus')
    .isIn(['Unplaced', 'Placed', 'Multiple Offers'])
    .withMessage('Invalid placement status'),
  body('offerDetails.companyName')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Company name is required when offer details are provided'),
  body('offerDetails.ctc')
    .optional()
    .isLength({ min: 1 })
    .withMessage('CTC is required when offer details are provided'),
  body('offerDetails.jobRole')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Job role is required when offer details are provided')
], updatePlacementStatus);

// @route   DELETE /api/students/:id
// @desc    Delete student profile
// @access  Private (Admin only)
router.delete('/:id', auth, requireAdmin, deleteStudent);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only PDF files are allowed for resume upload.'
    });
  }
  
  next(error);
});

module.exports = router;
