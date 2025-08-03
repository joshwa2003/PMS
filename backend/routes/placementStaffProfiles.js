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
} = require('../controllers/placementStaffProfileController');
const { protect, authorize } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');

// @route   GET /api/v1/placement-staff-profiles/profile
// @desc    Get own placement staff profile
// @access  Private
router.get('/profile', protect, getProfile);

// @route   PUT /api/v1/placement-staff-profiles/profile
// @desc    Update own placement staff profile
// @access  Private
router.put('/profile', protect, validateProfileUpdate, updateProfile);

// @route   POST /api/v1/placement-staff-profiles/upload-profile-image
// @desc    Upload placement staff profile image
// @access  Private
router.post('/upload-profile-image', protect, uploadProfileImage);

// @route   GET /api/v1/placement-staff-profiles/stats
// @desc    Get placement staff profile statistics
// @access  Private (Admin only)
router.get('/stats', protect, authorize('admin'), getProfileStats);

// @route   GET /api/v1/placement-staff-profiles
// @desc    Get all placement staff profiles
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), getAllProfiles);

// @route   GET /api/v1/placement-staff-profiles/:id
// @desc    Get placement staff profile by ID
// @access  Private (Admin only)
router.get('/:id', protect, authorize('admin'), getProfileById);

// @route   DELETE /api/v1/placement-staff-profiles/:id
// @desc    Delete placement staff profile
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), deleteProfile);

module.exports = router;
