const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateProfile,
  updateUser,
  deleteUser,
  getUsersByRole,
  getUsersByDepartment,
  searchUsers,
  getUserStats,
  createStaff,
  createBulkStaff,
  getAllStaff,
  updateStaff,
  deleteStaff,
  deleteBulkStaff,
  assignStaffRole,
  getStaffByDepartment,
  getImportHistory,
  getImportHistoryDetails,
  rollbackBulkImport,
  getImportStats,
  getAvailableDepartments
} = require('../controllers/userController');

const { 
  protect, 
  authorize, 
  checkPermission, 
  checkDepartmentAccess,
  checkOwnership 
} = require('../middleware/auth');

const {
  validateProfileUpdate,
  validateUserUpdate,
  validateUserSearch,
  validateObjectId,
  validateStaffCreation,
  validateStaffUpdate,
  validateStaffStatusUpdate
} = require('../middleware/validation');

const { body } = require('express-validator');

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin only routes
router.get('/', authorize('admin', 'placement_director'), getAllUsers);
router.get('/stats', authorize('admin', 'placement_director'), getUserStats);
router.delete('/:id', authorize('admin'), validateObjectId('id'), deleteUser);

// Staff management routes (Admin and Placement Director)
router.post('/staff', 
  authorize('admin', 'placement_director'), 
  validateStaffCreation,
  createStaff
);

router.post('/staff/bulk', 
  authorize('admin', 'placement_director'), 
  createBulkStaff
);

router.get('/staff', 
  authorize('admin', 'placement_director'), 
  getAllStaff
);

// Status update route (separate from full staff update)
router.patch('/staff/:id/status', 
  authorize('admin', 'placement_director'), 
  validateObjectId('id'),
  validateStaffStatusUpdate,
  updateStaff
);

router.put('/staff/:id', 
  authorize('admin', 'placement_director'), 
  validateObjectId('id'),
  validateStaffUpdate,
  updateStaff
);

router.delete('/staff/bulk', 
  authorize('admin', 'placement_director'), 
  deleteBulkStaff
);

router.delete('/staff/:id', 
  authorize('admin', 'placement_director'), 
  validateObjectId('id'),
  deleteStaff
);

// @desc    Assign role to staff and trigger welcome email
// @route   POST /api/v1/users/staff/:id/assign-role
// @access  Private (Admin, Placement Director)
router.post('/staff/:id/assign-role',
  authorize('admin', 'placement_director'),
  validateObjectId('id'),
  [
    body('role')
      .isIn(['placement_staff', 'department_hod', 'other_staff'])
      .withMessage('Invalid staff role')
  ],
  assignStaffRole
);

// @desc    Get staff by department
// @route   GET /api/v1/users/staff/department/:departmentId
// @access  Private (Admin, Placement Director)
router.get('/staff/department/:departmentId',
  authorize('admin', 'placement_director'),
  validateObjectId('departmentId'),
  getStaffByDepartment
);

// Import history routes
router.get('/import-history', 
  authorize('admin', 'placement_director'), 
  getImportHistory
);

router.get('/import-history/:id', 
  authorize('admin', 'placement_director'), 
  validateObjectId('id'),
  getImportHistoryDetails
);

router.post('/import-history/:id/rollback', 
  authorize('admin'), 
  validateObjectId('id'),
  rollbackBulkImport
);

router.get('/import-stats', 
  authorize('admin', 'placement_director'), 
  getImportStats
);

// Get available departments for bulk upload
router.get('/departments', 
  authorize('admin', 'placement_director'), 
  getAvailableDepartments
);

// Admin and placement staff routes
router.get('/role/:role', 
  authorize('admin', 'placement_director', 'placement_staff'), 
  getUsersByRole
);

router.get('/department/:department', 
  authorize('admin', 'placement_director', 'placement_staff', 'department_hod'),
  checkDepartmentAccess,
  getUsersByDepartment
);

// Search users (role-based access)
router.post('/search', 
  authorize('admin', 'placement_director', 'placement_staff', 'department_hod'),
  validateUserSearch,
  searchUsers
);

// Update own profile
router.put('/profile', 
  validateProfileUpdate,
  updateProfile
);

// Get specific user (with ownership check)
router.get('/:id', 
  validateObjectId('id'),
  checkOwnership('id'),
  getUserById
);

// Update user (admin can update anyone, others can update themselves)
router.put('/:id', 
  validateObjectId('id'),
  validateUserUpdate,
  checkOwnership('id'),
  updateUser
);

module.exports = router;
