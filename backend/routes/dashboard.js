const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// Apply authentication middleware to all dashboard routes
router.use(protect);
router.use(authorize('admin', 'placement_director'));

// @route   GET /api/dashboard/department-wise-students
// @desc    Get department-wise student data for admin and placement director
// @access  Private (Admin, Placement Director)
router.get('/department-wise-students', dashboardController.getDepartmentWiseStudents);

// @route   GET /api/dashboard/department/:departmentId/students
// @desc    Get students for a specific department with pagination and filters
// @access  Private (Admin, Placement Director)
router.get('/department/:departmentId/students', dashboardController.getDepartmentStudents);

// @route   GET /api/dashboard/departments/:departmentId/batches
// @desc    Get batches for a specific department
// @access  Private (Admin, Placement Director)
router.get('/departments/:departmentId/batches', dashboardController.getDepartmentBatches);

// @route   GET /api/dashboard/departments/:departmentId/batches/:batchId/students
// @desc    Get students for a specific department and batch
// @access  Private (Admin, Placement Director)
router.get('/departments/:departmentId/batches/:batchId/students', dashboardController.getDepartmentBatchStudents);

// @route   GET /api/dashboard/summary
// @desc    Get dashboard summary statistics
// @access  Private (Admin, Placement Director)
router.get('/summary', dashboardController.getDashboardSummary);

module.exports = router;
