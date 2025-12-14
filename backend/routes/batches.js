const express = require('express');
const router = express.Router();
const {
  getAllBatches,
  getBatchesByDepartments,
  getBatchById,
  getActiveBatchesForDepartment,
  getAlumniBatchesForDepartment,
  createBatch,
  updateBatch,
  deleteBatch,
  transferToAlumni
} = require('../controllers/batchController');
const { protect, authorize } = require('../middleware/auth');

// Public routes (with authentication)
router.get('/', protect, getAllBatches);
router.get('/:id', protect, getBatchById);
router.get('/department/:departmentId/active', protect, getActiveBatchesForDepartment);
router.get('/department/:departmentId/alumni', protect, getAlumniBatchesForDepartment);

// POST route for getting batches by multiple department IDs
router.post('/by-departments', protect, getBatchesByDepartments);

// Admin only routes
router.post('/', protect, authorize('admin', 'placement_director'), createBatch);
router.put('/:id', protect, authorize('admin', 'placement_director'), updateBatch);
router.delete('/:id', protect, authorize('admin', 'placement_director'), deleteBatch);
router.put('/:id/transfer-alumni', protect, authorize('placement_staff', 'admin', 'placement_director'), transferToAlumni);

module.exports = router;
