const express = require('express');
const router = express.Router();
const {
  createStudent,
  createBulkStudents,
  getStudentsForPlacementStaff,
  getStudentStatsForPlacementStaff,
  updateStudentStatus,
  deleteStudent,
  testEmailConfiguration,
  sendTestEmail,
  resendWelcomeEmail
} = require('../controllers/studentManagementController');

// Middleware
const { protect: auth } = require('../middleware/auth');

// Role-based access middleware for placement staff
const requirePlacementStaff = (req, res, next) => {
  if (req.user.role !== 'placement_staff') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Placement staff role required.'
    });
  }
  next();
};

// @desc    Create a single student
// @route   POST /api/student-management/students
// @access  Private (Placement Staff only)
router.post('/students', auth, requirePlacementStaff, createStudent);

// @desc    Create multiple students at once
// @route   POST /api/student-management/students/bulk
// @access  Private (Placement Staff only)
router.post('/students/bulk', auth, requirePlacementStaff, createBulkStudents);

// @desc    Get students created by placement staff
// @route   GET /api/student-management/students
// @access  Private (Placement Staff only)
router.get('/students', auth, requirePlacementStaff, getStudentsForPlacementStaff);

// @desc    Get student statistics for placement staff
// @route   GET /api/student-management/stats
// @access  Private (Placement Staff only)
router.get('/stats', auth, requirePlacementStaff, getStudentStatsForPlacementStaff);

// @desc    Update student status (verify/unverify, activate/deactivate)
// @route   PUT /api/student-management/students/:id/status
// @access  Private (Placement Staff only)
router.put('/students/:id/status', auth, requirePlacementStaff, updateStudentStatus);

// @desc    Delete student
// @route   DELETE /api/student-management/students/:id
// @access  Private (Placement Staff only)
router.delete('/students/:id', auth, requirePlacementStaff, deleteStudent);

// @desc    Test email configuration
// @route   GET /api/student-management/test-email-config
// @access  Private (Placement Staff only)
router.get('/test-email-config', auth, requirePlacementStaff, testEmailConfiguration);

// @desc    Send test email
// @route   POST /api/student-management/send-test-email
// @access  Private (Placement Staff only)
router.post('/send-test-email', auth, requirePlacementStaff, sendTestEmail);

// @desc    Resend welcome email to student
// @route   POST /api/student-management/students/:id/resend-email
// @access  Private (Placement Staff only)
router.post('/students/:id/resend-email', auth, requirePlacementStaff, resendWelcomeEmail);

module.exports = router;
