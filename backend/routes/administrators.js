const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body } = require('express-validator');

// Import middleware
const { protect: auth } = require('../middleware/auth');

// Import controller
const {
  getAdministratorProfile,
  updateAdministratorProfile,
  getAllAdministrators,
  getAdministratorById,
  updateAdministratorStatus,
  getAdministratorStats,
  deleteAdministrator,
  uploadProfileImage
} = require('../controllers/administratorController');

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

// Multer configuration for profile images
const uploadImage = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
  }
});

// Validation middleware
const validateAdministratorProfile = [
  body('employeeId')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Employee ID cannot be empty')
    .isAlphanumeric()
    .withMessage('Employee ID must contain only letters and numbers'),
  
  body('name.firstName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long'),
  
  body('name.lastName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('mobileNumber')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        if (!/^[0-9]{10}$/.test(value.replace(/\s/g, ''))) {
          throw new Error('Mobile number must be exactly 10 digits');
        }
      }
      return true;
    }),
  
  body('gender')
    .optional()
    .custom((value) => {
      if (value && !['Male', 'Female', 'Other'].includes(value)) {
        throw new Error('Invalid gender value');
      }
      return true;
    }),
  
  body('role')
    .optional()
    .custom((value) => {
      if (value && !['admin', 'director', 'staff', 'hod', 'other', 'student', 'alumni', 'company'].includes(value)) {
        throw new Error('Invalid role value');
      }
      return true;
    }),
  
  body('status')
    .optional()
    .custom((value) => {
      if (value && !['active', 'inactive', 'deleted'].includes(value)) {
        throw new Error('Invalid status value');
      }
      return true;
    }),
  
  body('accessLevel')
    .optional()
    .custom((value) => {
      if (value && !['superAdmin', 'admin', 'limited'].includes(value)) {
        throw new Error('Invalid access level value');
      }
      return true;
    }),
  
  body('authProvider')
    .optional()
    .custom((value) => {
      if (value && !['local', 'google', 'microsoft', 'other'].includes(value)) {
        throw new Error('Invalid auth provider value');
      }
      return true;
    }),
  
  body('dateOfJoining')
    .optional()
    .isISO8601()
    .withMessage('Date of joining must be a valid date'),
  
  body('contact.address.pincode')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        if (!/^[0-9]{6}$/.test(value)) {
          throw new Error('Pincode must be exactly 6 digits');
        }
      }
      return true;
    }),
  
  body('adminNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Admin notes cannot exceed 1000 characters')
];

// Role-based access middleware
const requireAdministrator = (req, res, next) => {
  const allowedRoles = ['admin', 'director', 'staff', 'hod'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator role required.'
    });
  }
  next();
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' || req.user.accessLevel !== 'superAdmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Admin access required.'
    });
  }
  next();
};

const requireAdminAccess = (req, res, next) => {
  const allowedRoles = ['admin'];
  const allowedAccessLevels = ['superAdmin', 'admin'];
  
  if (!allowedRoles.includes(req.user.role) || !allowedAccessLevels.includes(req.user.accessLevel)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin access required.'
    });
  }
  next();
};

// Routes

// @route   GET /api/administrators/profile
// @desc    Get current administrator's profile
// @access  Private (Administrator only)
router.get('/profile', auth, requireAdministrator, getAdministratorProfile);

// @route   PUT /api/administrators/profile
// @desc    Create or update administrator profile
// @access  Private (Administrator only)
router.put('/profile', auth, requireAdministrator, validateAdministratorProfile, updateAdministratorProfile);

// @route   POST /api/administrators/profile-image
// @desc    Upload profile image
// @access  Private (Administrator only)
router.post('/profile-image', auth, requireAdministrator, uploadImage.single('profileImage'), uploadProfileImage);

// @route   GET /api/administrators/stats
// @desc    Get administrator statistics
// @access  Private (Super Admin only)
router.get('/stats', auth, requireSuperAdmin, getAdministratorStats);

// @route   GET /api/administrators
// @desc    Get all administrators with filtering and pagination
// @access  Private (Admin access)
router.get('/', auth, requireAdminAccess, getAllAdministrators);

// @route   GET /api/administrators/:id
// @desc    Get administrator by ID
// @access  Private (Admin access)
router.get('/:id', auth, requireAdminAccess, getAdministratorById);

// @route   PUT /api/administrators/:id/status
// @desc    Update administrator status
// @access  Private (Super Admin only)
router.put('/:id/status', auth, requireSuperAdmin, [
  body('status')
    .isIn(['active', 'inactive', 'deleted'])
    .withMessage('Invalid status value')
], updateAdministratorStatus);

// @route   DELETE /api/administrators/:id
// @desc    Delete administrator profile
// @access  Private (Super Admin only)
router.delete('/:id', auth, requireSuperAdmin, deleteAdministrator);

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
  
  if (error.message === 'Only JPEG, PNG, and WebP images are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only JPEG, PNG, and WebP images are allowed for profile image upload.'
    });
  }
  
  next(error);
});

module.exports = router;
