const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  upload,
  uploadStudentResume,
  getStudentResume,
  deleteStudentResume,
  getResumeInfo
} = require('../controllers/studentResumeController');

// Role-based access middleware
const requireStudent = (req, res, next) => {
  console.log('🔍 requireStudent middleware - User info:', {
    userId: req.user?._id,
    email: req.user?.email,
    role: req.user?.role,
    userExists: !!req.user
  });
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }
  
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: `Access denied. Student role required. Current role: ${req.user.role}`
    });
  }
  next();
};

const requirePlacementAccess = (req, res, next) => {
  const allowedRoles = ['admin', 'placement_director', 'placement_staff', 'student'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Placement access required.'
    });
  }
  next();
};

// @desc    Upload student resume (Hybrid approach: Base64 for images, GridFS for PDFs)
// @route   POST /api/student-resume/upload
// @access  Private (Student only)
router.post('/upload', 
  (req, res, next) => {
    console.log('🔍 Upload route hit - Headers:', {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      contentType: req.headers['content-type']
    });
    next();
  },
  protect, 
  requireStudent, 
  upload.single('resume'), 
  uploadStudentResume
);

// @desc    Test endpoint to verify student access
// @route   GET /api/student-resume/test
// @access  Private (Student only)
router.get('/test', 
  protect, 
  requireStudent, 
  (req, res) => {
    res.json({
      success: true,
      message: 'Student access verified!',
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role
      }
    });
  }
);

// @desc    Get resume upload status and info
// @route   GET /api/student-resume/info
// @access  Private (Student only)
router.get('/info', 
  protect, 
  requireStudent, 
  getResumeInfo
);

// @desc    Delete student resume
// @route   DELETE /api/student-resume
// @access  Private (Student only)
router.delete('/', 
  protect, 
  requireStudent, 
  deleteStudentResume
);

// Legacy route for backward compatibility
// @desc    Upload student resume (Legacy endpoint)
// @route   POST /api/file-upload/resume
// @access  Private (Student only)
router.post('/resume', 
  protect, 
  requireStudent, 
  upload.single('resume'), 
  uploadStudentResume
);

// @desc    Get student resume file (MUST BE LAST - catches all other GET requests)
// @route   GET /api/student-resume/:filename
// @access  Private (Student, Placement Staff, Admin)
router.get('/:filename', 
  protect, 
  requirePlacementAccess, 
  getStudentResume
);

module.exports = router;
