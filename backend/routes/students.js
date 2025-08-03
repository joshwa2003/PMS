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
  uploadProfileImage,
  uploadResume
} = require('../controllers/studentController');

// Configure multer for file uploads (using memory storage for Supabase)
const storage = multer.memoryStorage();

// File filter for profile images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

// File filter for PDF files (resumes)
const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Multer configuration for profile images
const uploadImage = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
  }
});

// Multer configuration for PDF files
const uploadPDF = multer({
  storage: storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for PDFs
  }
});

// Validation middleware
const validateStudentProfile = [
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Student ID cannot be empty'),
  
  body('registrationNumber')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Registration number cannot be empty'),
  
  body('personalInfo.fullName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters long'),
  
  body('personalInfo.gender')
    .optional()
    .custom((value) => {
      if (value && !['Male', 'Female', 'Other'].includes(value)) {
        throw new Error('Invalid gender value');
      }
      return true;
    }),
  
  body('personalInfo.category')
    .optional()
    .custom((value) => {
      if (value && !['GEN', 'SC', 'ST', 'OBC', 'Others'].includes(value)) {
        throw new Error('Invalid category value');
      }
      return true;
    }),
  
  body('contact.email')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new Error('Please provide a valid email');
        }
      }
      return true;
    }),
  
  body('contact.phone')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        if (!/^[0-9]{10}$/.test(value.replace(/\s/g, ''))) {
          throw new Error('Phone number must be exactly 10 digits');
        }
      }
      return true;
    }),
  
  body('contact.pincode')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        if (!/^[0-9]{6}$/.test(value)) {
          throw new Error('Pincode must be exactly 6 digits');
        }
      }
      return true;
    }),
  
  body('academic.cgpa')
    .optional()
    .custom((value) => {
      if (value !== null && value !== undefined && value !== '') {
        const cgpa = parseFloat(value);
        if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
          throw new Error('CGPA must be between 0 and 10');
        }
      }
      return true;
    }),
  
  body('academic.backlogs')
    .optional()
    .custom((value) => {
      if (value !== null && value !== undefined && value !== '') {
        const backlogs = parseInt(value);
        if (isNaN(backlogs) || backlogs < 0) {
          throw new Error('Backlogs must be a non-negative integer');
        }
      }
      return true;
    }),
  
  body('academic.yearOfStudy')
    .optional()
    .custom((value) => {
      if (value !== null && value !== undefined && value !== '') {
        const year = parseInt(value);
        if (isNaN(year) || year < 1 || year > 5) {
          throw new Error('Year of study must be between 1 and 5');
        }
      }
      return true;
    }),
  
  body('academic.currentSemester')
    .optional()
    .custom((value) => {
      if (value !== null && value !== undefined && value !== '') {
        const semester = parseInt(value);
        if (isNaN(semester) || semester < 1 || semester > 10) {
          throw new Error('Current semester must be between 1 and 10');
        }
      }
      return true;
    }),
  
  body('placement.placementStatus')
    .optional()
    .custom((value) => {
      if (value && !['Unplaced', 'Placed', 'Multiple Offers'].includes(value)) {
        throw new Error('Invalid placement status');
      }
      return true;
    }),
  
  body('careerProfile.experienceStatus')
    .optional()
    .custom((value) => {
      if (value && !['Fresher', 'Experienced'].includes(value)) {
        throw new Error('Invalid experience status');
      }
      return true;
    }),
  
  body('careerProfile.availableToJoinInDays')
    .optional()
    .custom((value) => {
      if (value !== null && value !== undefined && value !== '') {
        const days = parseInt(value);
        if (isNaN(days) || days < 0) {
          throw new Error('Available to join days must be a non-negative integer');
        }
      }
      return true;
    }),
  
  body('languagesKnown.*.proficiency')
    .optional()
    .custom((value) => {
      if (value && !['Basic', 'Intermediate', 'Fluent'].includes(value)) {
        throw new Error('Invalid language proficiency level');
      }
      return true;
    })
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

// @route   POST /api/students/profile-image
// @desc    Upload profile image
// @access  Private (Student only)
router.post('/profile-image', auth, requireStudent, uploadImage.single('profileImage'), uploadProfileImage);

// @route   POST /api/students/resume
// @desc    Upload resume
// @access  Private (Student only)
router.post('/resume', auth, requireStudent, uploadPDF.single('resume'), uploadResume);

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
        message: 'File too large. Maximum size exceeded.'
      });
    }
  }
  
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only PDF files are allowed for resume upload.'
    });
  }
  
  if (error.message === 'Only JPEG, PNG, and WebP images are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only JPEG, PNG, and WebP images are allowed for profile image upload.'
    });
  }
  
  next(error);
});

module.exports = router;
