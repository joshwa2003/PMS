const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getProfileById,
  getAllProfiles,
  deleteProfile,
  getProfileStats,
  uploadProfileImage
} = require('../controllers/departmentHODProfileController');
const { protect, authorize } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');

// @route   GET /api/v1/department-hod-profiles/profile
// @desc    Get own department HOD profile
// @access  Private
router.get('/profile', protect, getProfile);

// @route   PUT /api/v1/department-hod-profiles/profile
// @desc    Update own department HOD profile
// @access  Private
router.put('/profile', protect, validateProfileUpdate, updateProfile);

// @route   POST /api/v1/department-hod-profiles/upload-profile-image
// @desc    Upload department HOD profile image
// @access  Private
router.post('/upload-profile-image', protect, uploadProfileImage);

// @route   GET /api/v1/department-hod-profiles/stats
// @desc    Get department HOD profile statistics
// @access  Private (Admin only)
router.get('/stats', protect, authorize('admin'), getProfileStats);

// @route   GET /api/v1/department-hod-profiles
// @desc    Get all department HOD profiles
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), getAllProfiles);

// @route   GET /api/v1/department-hod-profiles/:id
// @desc    Get department HOD profile by ID
// @access  Private (Admin only)
router.get('/:id', protect, authorize('admin'), getProfileById);

// @route   DELETE /api/v1/department-hod-profiles/:id
// @desc    Delete department HOD profile
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), deleteProfile);

module.exports = router;
