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

// Protect all routes
router.use(protect);

// Admin and Placement Director only routes
router.use(authorize('admin', 'placement_director'));

// Routes
router
  .route('/')
  .get(getAllDepartments)
  .post(createDepartment);

router
  .route('/placement-staff-options')
  .get(getPlacementStaffOptions);

router
  .route('/:id')
  .get(getDepartment)
  .put(updateDepartment)
  .delete(deleteDepartment);

router
  .route('/:id/toggle-status')
  .patch(toggleDepartmentStatus);

module.exports = router;
