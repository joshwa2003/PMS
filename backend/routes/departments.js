const express = require('express');
const router = express.Router();
const {
  getAllDepartments,
  getDepartment,
  getPlacementStaffOptions,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

// Public route for all authenticated users
router.get('/', protect, getAllDepartments);
router.get('/placement-staff-options', protect, getPlacementStaffOptions);

// Admin and Placement Director only routes for management
router.post('/', protect, authorize('admin', 'placement_director'), createDepartment);
router.get('/:id', protect, authorize('admin', 'placement_director'), getDepartment);
router.put('/:id', protect, authorize('admin', 'placement_director'), updateDepartment);
router.delete('/:id', protect, authorize('admin', 'placement_director'), deleteDepartment);
router.patch('/:id/toggle-status', protect, authorize('admin', 'placement_director'), toggleDepartmentStatus);

module.exports = router;
