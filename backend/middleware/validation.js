const { body } = require('express-validator');

// Common validation rules
const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

const passwordValidation = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number');

const nameValidation = (field) => 
  body(field)
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage(`${field} must be between 2 and 50 characters`)
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage(`${field} must contain only letters and spaces`);

const phoneValidation = body('phone')
  .optional()
  .matches(/^[0-9]{10}$/)
  .withMessage('Phone number must be exactly 10 digits');

const roleValidation = body('role')
  .isIn(['admin', 'placement_director', 'placement_staff', 'department_hod', 'other_staff', 'student', 'alumni'])
  .withMessage('Invalid role specified');

const departmentValidation = body('department')
  .optional()
  .isIn(['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'ADMIN', 'HR', 'OTHER'])
  .withMessage('Invalid department specified');

// Registration validation
exports.validateRegister = [
  nameValidation('firstName'),
  nameValidation('lastName'),
  emailValidation,
  passwordValidation,
  roleValidation,
  phoneValidation,
  departmentValidation,
  
  // Student-specific validations
  body('studentId')
    .if(body('role').equals('student'))
    .notEmpty()
    .withMessage('Student ID is required for students')
    .isLength({ min: 6, max: 20 })
    .withMessage('Student ID must be between 6 and 20 characters'),
  
  body('batch')
    .if(body('role').equals('student'))
    .notEmpty()
    .withMessage('Batch is required for students')
    .matches(/^(20\d{2})-(20\d{2})$/)
    .withMessage('Batch must be in format YYYY-YYYY (e.g., 2020-2024)'),
  
  body('cgpa')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('CGPA must be between 0 and 10'),
  
  // Alumni-specific validations
  body('graduationYear')
    .if(body('role').equals('alumni'))
    .notEmpty()
    .withMessage('Graduation year is required for alumni')
    .isInt({ min: 1990, max: new Date().getFullYear() })
    .withMessage('Invalid graduation year'),
  
  body('currentCompany')
    .if(body('role').equals('alumni'))
    .optional()
    .isLength({ max: 100 })
    .withMessage('Current company name cannot exceed 100 characters'),
  
  body('currentPosition')
    .if(body('role').equals('alumni'))
    .optional()
    .isLength({ max: 100 })
    .withMessage('Current position cannot exceed 100 characters'),
  
  // Staff-specific validations
  body('employeeId')
    .if(body('role').isIn(['placement_staff', 'department_hod', 'other_staff', 'admin']))
    .notEmpty()
    .withMessage('Employee ID is required for staff members')
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters'),
  
  body('designation')
    .if(body('role').isIn(['placement_staff', 'department_hod', 'other_staff', 'admin']))
    .notEmpty()
    .withMessage('Designation is required for staff members')
    .isLength({ min: 2, max: 100 })
    .withMessage('Designation must be between 2 and 100 characters'),
];

// Login validation
exports.validateLogin = [
  emailValidation,
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Profile update validation
exports.validateProfileUpdate = [
  nameValidation('firstName').optional(),
  nameValidation('lastName').optional(),
  phoneValidation,
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('profilePicture')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL'),
  
  // Student-specific fields
  body('cgpa')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('CGPA must be between 0 and 10'),
  
  body('studentId')
    .optional()
    .isLength({ min: 6, max: 20 })
    .withMessage('Student ID must be between 6 and 20 characters'),
  
  body('batch')
    .optional()
    .matches(/^(20\d{2})-(20\d{2})$/)
    .withMessage('Batch must be in format YYYY-YYYY (e.g., 2020-2024)'),
  
  // Alumni-specific fields
  body('currentCompany')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Current company name cannot exceed 100 characters'),
  
  body('currentPosition')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Current position cannot exceed 100 characters'),
  
  body('graduationYear')
    .optional()
    .isInt({ min: 1990, max: new Date().getFullYear() })
    .withMessage('Invalid graduation year'),
  
  // Staff/Administrator-specific fields
  body('employeeId')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters'),
  
  body('designation')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Designation must be between 2 and 100 characters'),
  
  body('mobileNumber')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile number must be exactly 10 digits'),
  
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  
  body('profilePhotoUrl')
    .optional()
    .isURL()
    .withMessage('Profile photo URL must be a valid URL'),
  
  body('dateOfJoining')
    .optional()
    .isISO8601()
    .withMessage('Date of joining must be a valid date'),
  
  body('officeLocation')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Office location must be between 2 and 100 characters'),
  
  // Department validation
  body('department')
    .optional()
    .isIn(['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'ADMIN', 'HR', 'OTHER'])
    .withMessage('Invalid department specified'),
];

// Change password validation
exports.validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
];

// User management validation (for admin)
exports.validateUserUpdate = [
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
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('role')
    .optional()
    .isIn(['admin', 'placement_director', 'placement_staff', 'department_hod', 'other_staff', 'student', 'alumni'])
    .withMessage('Invalid role specified'),
  
  body('department')
    .optional()
    .isIn(['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'ADMIN', 'HR', 'OTHER'])
    .withMessage('Invalid department specified'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean value'),
];

// Search and filter validation
exports.validateUserSearch = [
  body('role')
    .optional()
    .isIn(['admin', 'placement_director', 'placement_staff', 'department_hod', 'other_staff', 'student', 'alumni'])
    .withMessage('Invalid role specified'),
  
  body('department')
    .optional()
    .isIn(['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'ADMIN', 'HR', 'OTHER'])
    .withMessage('Invalid department specified'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean value'),
  
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  body('sortBy')
    .optional()
    .isIn(['firstName', 'lastName', 'email', 'role', 'department', 'createdAt', 'lastLogin'])
    .withMessage('Invalid sort field'),
  
  body('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
];

// ID parameter validation
exports.validateObjectId = (paramName = 'id') => [
  body(paramName)
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage(`Invalid ${paramName} format`),
];
