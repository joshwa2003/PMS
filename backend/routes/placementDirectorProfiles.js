const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getProfileById,
  getAllProfiles,
  deleteProfile,
  getProfileStats,
  uploadProfileImage,
  uploadResume
} = require('../controllers/placementDirectorProfileController');
const { protect, authorize } = require('../middleware/auth');
const { validatePlacementDirectorProfileUpdate } = require('../middleware/validation');

// @route   GET /api/v1/placement-director-profiles/profile
// @desc    Get own placement director profile
// @access  Private (Placement Director role only)
router.get('/profile', protect, authorize('placement_director'), getProfile);

// @route   PUT /api/v1/placement-director-profiles/profile
// @desc    Update own placement director profile
// @access  Private (Placement Director role only)
router.put('/profile', protect, authorize('placement_director'), validatePlacementDirectorProfileUpdate, updateProfile);

// @route   POST /api/v1/placement-director-profiles/upload-profile-image
// @desc    Upload placement director profile image
// @access  Private (Placement Director role only)
router.post('/upload-profile-image', protect, authorize('placement_director'), uploadProfileImage);

// @route   POST /api/v1/placement-director-profiles/upload-resume
// @desc    Upload placement director resume
// @access  Private (Placement Director role only)
router.post('/upload-resume', protect, authorize('placement_director'), uploadResume);

// @route   GET /api/v1/placement-director-profiles/stats
// @desc    Get placement director profile statistics
// @access  Private (Admin only)
router.get('/stats', protect, authorize('admin'), getProfileStats);

// @route   GET /api/v1/placement-director-profiles
// @desc    Get all placement director profiles
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), getAllProfiles);

// @route   GET /api/v1/placement-director-profiles/:id
// @desc    Get placement director profile by ID
// @access  Private (Admin only)
router.get('/:id', protect, authorize('admin'), getProfileById);

// @route   DELETE /api/v1/placement-director-profiles/:id
// @desc    Delete placement director profile
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), deleteProfile);

module.exports = router;
