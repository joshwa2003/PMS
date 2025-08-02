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
  getUserStats
} = require('../controllers/userController');

const { 
  protect, 
  authorize, 
  checkPermission, 
  checkDepartmentAccess,
  checkOwnership 
} = require('../middleware/auth');

const {
  validateUserUpdate,
  validateUserSearch,
  validateObjectId
} = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin only routes
router.get('/', authorize('admin', 'placement_director'), getAllUsers);
router.get('/stats', authorize('admin', 'placement_director'), getUserStats);
router.delete('/:id', authorize('admin'), validateObjectId('id'), deleteUser);

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
  validateUserUpdate,
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
