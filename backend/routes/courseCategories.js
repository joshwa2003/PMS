const express = require('express');
const router = express.Router();
const {
  getAllCourseCategories,
  getCourseCategory,
  createCourseCategory,
  updateCourseCategory,
  deleteCourseCategory,
  toggleCourseCategoryStatus
} = require('../controllers/courseCategoryController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Admin and Placement Director only routes
router.use(authorize('admin', 'placement_director'));

// Routes
router
  .route('/')
  .get(getAllCourseCategories)
  .post(createCourseCategory);

router
  .route('/:id')
  .get(getCourseCategory)
  .put(updateCourseCategory)
  .delete(deleteCourseCategory);

router
  .route('/:id/toggle-status')
  .patch(toggleCourseCategoryStatus);

module.exports = router;
