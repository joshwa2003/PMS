const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Import controllers
const jobController = require('../controllers/jobController');
const jobApplicationController = require('../controllers/jobApplicationController');

// Import middleware
const { protect: auth } = require('../middleware/auth');

// Configure multer for file uploads (company logos and documents)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'companyLogo') {
      cb(null, 'uploads/company-logos/');
    } else if (file.fieldname === 'documents') {
      cb(null, 'uploads/job-documents/');
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'companyLogo') {
    // Accept only image files for company logos
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for company logos'), false);
    }
  } else if (file.fieldname === 'documents') {
    // Accept PDF, DOC, DOCX files for documents
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed for documents'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  }
});

// ============================================================================
// JOB MANAGEMENT ROUTES (Admin & Placement Director)
// ============================================================================

/**
 * @route   GET /api/v1/jobs
 * @desc    Get all jobs with filtering and pagination
 * @access  Private (Admin, Placement Director, Placement Staff, Students)
 * @query   page, limit, search, status, department, jobType, sortBy, sortOrder, all
 */
router.get('/', auth, jobController.getAllJobs);

/**
 * @route   GET /api/v1/jobs/student
 * @desc    Get jobs for student dashboard
 * @access  Private (Students only)
 */
router.get('/student', auth, jobController.getStudentJobs);

/**
 * @route   GET /api/v1/jobs/utils/departments
 * @desc    Get departments for job posting
 * @access  Private (Admin, Placement Director)
 */
router.get('/utils/departments', auth, async (req, res) => {
  try {
    // Check permissions
    if (!['admin', 'placement_director'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }

    const Department = require('../models/Department');
    const departments = await Department.find({ isActive: true })
      .select('name code')
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: { departments }
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/v1/jobs/utils/job-types
 * @desc    Get available job types
 * @access  Private (All authenticated users)
 */
router.get('/utils/job-types', auth, (req, res) => {
  const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'];
  
  res.status(200).json({
    success: true,
    data: { jobTypes }
  });
});

/**
 * @route   GET /api/v1/jobs/utils/job-statuses
 * @desc    Get available job statuses
 * @access  Private (Admin, Placement Director, Placement Staff)
 */
router.get('/utils/job-statuses', auth, (req, res) => {
  // Check permissions
  if (!['admin', 'placement_director', 'placement_staff'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource'
    });
  }

  const jobStatuses = ['Draft', 'Active', 'Closed', 'Expired'];
  
  res.status(200).json({
    success: true,
    data: { jobStatuses }
  });
});

/**
 * @route   GET /api/v1/jobs/applications/my
 * @desc    Get student's job applications
 * @access  Private (Students only)
 * @query   status, page, limit
 */
router.get('/applications/my', auth, jobApplicationController.getStudentApplications);

/**
 * @route   GET /api/v1/jobs/applications/:applicationId
 * @desc    Get application details
 * @access  Private (Student who owns the application, or Staff)
 */
router.get('/applications/:applicationId', auth, jobApplicationController.getApplicationDetails);

/**
 * @route   GET /api/v1/jobs/:id
 * @desc    Get single job by ID
 * @access  Private (All authenticated users)
 */
router.get('/:id', auth, jobController.getJob);

/**
 * @route   POST /api/v1/jobs
 * @desc    Create new job
 * @access  Private (Admin, Placement Director only)
 * @body    title, company, description, location, applicationLink, deadline, etc.
 */
router.post('/', 
  auth, 
  upload.fields([
    { name: 'companyLogo', maxCount: 1 },
    { name: 'documents', maxCount: 5 }
  ]), 
  jobController.createJob
);

/**
 * @route   PUT /api/v1/jobs/:id
 * @desc    Update job
 * @access  Private (Admin, Placement Director only)
 */
router.put('/:id', 
  auth, 
  upload.fields([
    { name: 'companyLogo', maxCount: 1 },
    { name: 'documents', maxCount: 5 }
  ]), 
  jobController.updateJob
);

/**
 * @route   DELETE /api/v1/jobs/:id
 * @desc    Delete job
 * @access  Private (Admin, Placement Director only)
 */
router.delete('/:id', auth, jobController.deleteJob);

// ============================================================================
// JOB APPLICATION TRACKING ROUTES
// ============================================================================

/**
 * @route   POST /api/v1/jobs/:jobId/view
 * @desc    Record job view by student
 * @access  Private (Students only)
 * @body    viewType, duration, interactions, device, referrer, context
 */
router.post('/:jobId/view', auth, jobApplicationController.recordJobView);

/**
 * @route   POST /api/v1/jobs/:jobId/click
 * @desc    Record external application link click
 * @access  Private (Students only)
 */
router.post('/:jobId/click', auth, jobApplicationController.recordApplicationClick);

/**
 * @route   POST /api/v1/jobs/:jobId/response
 * @desc    Submit student response (applied/not applied)
 * @access  Private (Students only)
 * @body    applied (boolean), notes (optional)
 */
router.post('/:jobId/response', auth, jobApplicationController.submitStudentResponse);

/**
 * @route   GET /api/v1/jobs/:jobId/applications
 * @desc    Get job applications for monitoring (placement staff)
 * @access  Private (Admin, Placement Director, Placement Staff)
 * @query   status, department, page, limit
 */
router.get('/:jobId/applications', auth, jobApplicationController.getJobApplications);

/**
 * @route   GET /api/v1/jobs/:jobId/analytics
 * @desc    Get job analytics and statistics
 * @access  Private (Admin, Placement Director, Placement Staff)
 */
router.get('/:jobId/analytics', auth, jobApplicationController.getJobAnalytics);

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// Handle multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message.includes('Only image files are allowed')) {
    return res.status(400).json({
      success: false,
      message: 'Only image files (PNG, JPG, JPEG, GIF) are allowed for company logos.'
    });
  }
  
  if (error.message.includes('Only PDF, DOC, and DOCX files are allowed')) {
    return res.status(400).json({
      success: false,
      message: 'Only PDF, DOC, and DOCX files are allowed for documents.'
    });
  }
  
  next(error);
});

module.exports = router;
