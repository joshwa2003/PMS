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
} = require('../controllers/administratorProfileController');
const { protect, authorize } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');

// @route   GET /api/v1/administrator-profiles/profile
// @desc    Get own administrator profile
// @access  Private
router.get('/profile', protect, getProfile);

// @route   PUT /api/v1/administrator-profiles/profile
// @desc    Update own administrator profile
// @access  Private
router.put('/profile', protect, validateProfileUpdate, updateProfile);

// @route   POST /api/v1/administrator-profiles/upload-profile-image
// @desc    Upload administrator profile image
// @access  Private
router.post('/upload-profile-image', protect, uploadProfileImage);

// @route   GET /api/v1/administrator-profiles/stats
// @desc    Get administrator profile statistics
// @access  Private (Admin only)
router.get('/stats', protect, authorize('admin'), getProfileStats);

// @route   GET /api/v1/administrator-profiles
// @desc    Get all administrator profiles
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), getAllProfiles);

// @route   GET /api/v1/administrator-profiles/:id
// @desc    Get administrator profile by ID
// @access  Private (Admin only)
router.get('/:id', protect, authorize('admin'), getProfileById);

// @route   DELETE /api/v1/administrator-profiles/:id
// @desc    Delete administrator profile
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), deleteProfile);

module.exports = router;
