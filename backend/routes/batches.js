const express = require('express');
const router = express.Router();
const {
  getAllBatches,
  getBatchesByDepartments,
  getBatchById,
  getActiveBatchesForDepartment,
  createBatch,
  updateBatch,
  deleteBatch
} = require('../controllers/batchController');
const { protect, authorize } = require('../middleware/auth');

// Public routes (with authentication)
router.get('/', protect, getAllBatches);
router.get('/:id', protect, getBatchById);
router.get('/department/:departmentId/active', protect, getActiveBatchesForDepartment);

// POST route for getting batches by multiple department IDs
router.post('/by-departments', protect, getBatchesByDepartments);

// Admin only routes
router.post('/', protect, authorize('admin', 'placement_director'), createBatch);
router.put('/:id', protect, authorize('admin', 'placement_director'), updateBatch);
router.delete('/:id', protect, authorize('admin'), deleteBatch);

module.exports = router;
