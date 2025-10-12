const express = require('express');
const { body } = require('express-validator');
const {
  createPlacementDirector,
  getAllPlacementDirectors,
  getPlacementDirectorById,
  updatePlacementDirector,
  deletePlacementDirector,
  resendWelcomeEmail,
  getPlacementDirectorStats
} = require('../controllers/placementDirectorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules for creating placement director
const createPlacementDirectorValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  
  body('employeeId')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Admin notes cannot exceed 1000 characters')
];

// Validation rules for updating placement director
const updatePlacementDirectorValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  
  body('employeeId')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean'),
  
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Admin notes cannot exceed 1000 characters')
];

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(authorize('admin'));

// Routes
router.route('/')
  .get(getAllPlacementDirectors)
  .post(createPlacementDirectorValidation, createPlacementDirector);

router.route('/stats')
  .get(getPlacementDirectorStats);

router.route('/:id')
  .get(getPlacementDirectorById)
  .put(updatePlacementDirectorValidation, updatePlacementDirector)
  .delete(deletePlacementDirector);

router.route('/:id/resend-email')
  .post(resendWelcomeEmail);

module.exports = router;
