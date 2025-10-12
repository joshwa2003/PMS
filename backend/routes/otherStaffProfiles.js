const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  deleteProfile,
  getProfileByEmployeeId,
  updateProfileImage,
  updateProfileImageUrl
} = require('../controllers/otherStaffProfileController');

// Validation middleware for profile updates
const validateProfileUpdate = [
  body('employeeId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Employee ID must be between 1 and 20 characters'),
  
  body('name.firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  
  body('name.lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('mobileNumber')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile number must be 10 digits'),
  
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  
  body('role')
    .optional()
    .isIn(['admin', 'placement_director', 'placement_staff', 'department_hod', 'other_staff', 'student', 'company'])
    .withMessage('Invalid role specified'),
  
  body('department')
    .optional()
    .isIn(['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'ADMIN', 'HR', 'OTHER'])
    .withMessage('Invalid department specified'),
  
  body('designation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Designation cannot exceed 100 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),
  
  body('dateOfJoining')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of joining'),
  
  body('authProvider')
    .optional()
    .isIn(['local', 'google', 'microsoft', 'other'])
    .withMessage('Invalid auth provider specified'),
  
  body('staffCategory')
    .optional()
    .isIn(['Administrative', 'Technical', 'Support', 'Maintenance', 'Security', 'Other'])
    .withMessage('Invalid staff category specified'),
  
  body('officeLocation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Office location cannot exceed 100 characters'),
  
  body('workShift')
    .optional()
    .isIn(['Morning', 'Evening', 'Night', 'Flexible'])
    .withMessage('Invalid work shift specified'),
  
  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),
  
  body('qualifications')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Qualifications cannot exceed 500 characters'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('skills.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each skill cannot exceed 50 characters'),
  
  body('responsibilities')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Responsibilities cannot exceed 1000 characters'),
  
  body('reportingManager')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Reporting manager cannot exceed 100 characters'),
  
  body('workingHours.startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  
  body('workingHours.endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  
  body('contact.alternatePhone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Alternate phone must be 10 digits'),
  
  body('contact.emergencyContact')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Emergency contact must be 10 digits'),
  
  body('contact.address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street address cannot exceed 200 characters'),
  
  body('contact.address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),
  
  body('contact.address.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),
  
  body('contact.address.pincode')
    .optional()
    .matches(/^[0-9]{6}$/)
    .withMessage('Pincode must be 6 digits'),
  
  body('contact.address.country')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Country cannot exceed 50 characters'),
  
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Admin notes cannot exceed 1000 characters')
];

// Validation middleware for profile image updates
const validateProfileImageUpdate = [
  body('googleDriveUrl')
    .notEmpty()
    .withMessage('Google Drive URL is required')
    .isURL()
    .withMessage('Please provide a valid URL')
    .custom((value) => {
      const driveUrlRegex = /(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=)([a-zA-Z0-9_-]+)/;
      if (!driveUrlRegex.test(value)) {
        throw new Error('Please provide a valid Google Drive sharing URL');
      }
      return true;
    })
];

// @route   GET /api/v1/other-staff-profiles/profile
// @desc    Get current user's other staff profile
// @access  Private (Other Staff only)
router.get('/profile', 
  protect, 
  authorize('other_staff'), 
  getProfile
);

// @route   PUT /api/v1/other-staff-profiles/profile
// @desc    Update current user's other staff profile
// @access  Private (Other Staff only)
router.put('/profile', 
  protect, 
  authorize('other_staff'), 
  validateProfileUpdate, 
  updateProfile
);

// @route   DELETE /api/v1/other-staff-profiles/profile
// @desc    Delete current user's other staff profile
// @access  Private (Other Staff only)
router.delete('/profile', 
  protect, 
  authorize('other_staff'), 
  deleteProfile
);

// @route   GET /api/v1/other-staff-profiles/employee/:employeeId
// @desc    Get other staff profile by employee ID
// @access  Private (Admin only)
router.get('/employee/:employeeId', 
  protect, 
  authorize('admin'), 
  getProfileByEmployeeId
);

// @route   POST /api/v1/other-staff-profiles/upload-profile-image
// @desc    Upload/Update other staff profile image with Google Drive link
// @access  Private (Other Staff only)
router.post('/upload-profile-image', 
  protect, 
  authorize('other_staff'), 
  validateProfileImageUpdate, 
  updateProfileImage
);

// @route   POST /api/v1/other-staff-profiles/update-profile-image
// @desc    Update other staff profile image with Google Drive link (alternative endpoint)
// @access  Private (Other Staff only)
router.post('/update-profile-image', 
  protect, 
  authorize('other_staff'), 
  validateProfileImageUpdate, 
  updateProfileImageUrl
);

module.exports = router;
