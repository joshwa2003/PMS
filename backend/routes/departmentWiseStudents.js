const express = require('express');
const router = express.Router();
const departmentWiseStudentController = require('../controllers/departmentWiseStudentController');
const { protect, authorize } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);
router.use(authorize('admin', 'placement_director'));

// Get all departments with basic info for dashboard
router.get('/dashboard/department-wise-students', departmentWiseStudentController.getDepartmentWiseStudents);

// Get batches for a specific department
router.get('/dashboard/departments/:departmentId/batches', departmentWiseStudentController.getDepartmentBatches);

// Get students for a specific department and batch
router.get('/dashboard/departments/:departmentId/batches/:batchId/students', departmentWiseStudentController.getDepartmentBatchStudents);

module.exports = router;