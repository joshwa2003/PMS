const Batch = require('../models/Batch');
const Department = require('../models/Department');

// Get all batches with optional department filter
const getAllBatches = async (req, res) => {
  try {
    const { department, active = true } = req.query;
    
    const filter = {};
    if (department) {
      filter.department = department;
    }
    if (active !== 'false') {
      filter.isActive = true;
      filter.isGraduated = false;
    }

    const batches = await Batch.find(filter)
      .populate('department', 'name code')
      .sort({ startYear: -1, batchCode: 1 });

    res.status(200).json({
      success: true,
      count: batches.length,
      data: batches
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching batches',
      error: error.message
    });
  }
};

// Get batches grouped by departments
const getBatchesByDepartments = async (req, res) => {
  try {
    const { departmentIds } = req.body;
    
    if (!departmentIds || !Array.isArray(departmentIds)) {
      return res.status(400).json({
        success: false,
        message: 'Department IDs array is required'
      });
    }

    // Fetch batches for the specified departments
    const batches = await Batch.find({
      department: { $in: departmentIds },
      isActive: true,
      isGraduated: false
    })
    .populate('department', 'name code')
    .sort({ department: 1, startYear: -1 });

    // Group batches by department
    const batchesByDepartment = {};
    
    batches.forEach(batch => {
      const deptId = batch.department._id.toString();
      if (!batchesByDepartment[deptId]) {
        batchesByDepartment[deptId] = {
          department: batch.department,
          batches: []
        };
      }
      batchesByDepartment[deptId].batches.push({
        _id: batch._id,
        batchCode: batch.batchCode,
        displayName: batch.displayName,
        fullDisplayName: batch.fullDisplayName,
        courseType: batch.courseType,
        courseDuration: batch.courseDuration,
        startYear: batch.startYear,
        endYear: batch.endYear,
        academicStatus: batch.academicStatus,
        totalStudents: batch.totalStudents
      });
    });

    res.status(200).json({
      success: true,
      data: batchesByDepartment
    });
  } catch (error) {
    console.error('Error fetching batches by departments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching batches by departments',
      error: error.message
    });
  }
};

// Get batch by ID
const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const batch = await Batch.findById(id)
      .populate('department', 'name code');
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    res.status(200).json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Error fetching batch:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching batch',
      error: error.message
    });
  }
};

// Get active batches for a specific department
const getActiveBatchesForDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    const batches = await Batch.getActiveBatches(departmentId);
    
    res.status(200).json({
      success: true,
      count: batches.length,
      data: batches
    });
  } catch (error) {
    console.error('Error fetching active batches for department:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active batches for department',
      error: error.message
    });
  }
};

// Create new batch (admin only)
const createBatch = async (req, res) => {
  try {
    const batchData = {
      ...req.body,
      createdBy: req.user._id
    };

    const batch = new Batch(batchData);
    await batch.save();
    
    await batch.populate('department', 'name code');

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: batch
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    
    if (error.code === 11000) {
      // Check if it's a duplicate batchCode + department combination
      if (error.message.includes('batchCode_1_department_1')) {
        return res.status(400).json({
          success: false,
          message: 'A batch with this batch code already exists in this department'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Batch code already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating batch',
      error: error.message
    });
  }
};

// Update batch (admin only)
const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    const batch = await Batch.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('department', 'name code');

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      data: batch
    });
  } catch (error) {
    console.error('Error updating batch:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating batch',
      error: error.message
    });
  }
};

// Delete batch (admin only)
const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    
    const batch = await Batch.findByIdAndDelete(id);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Batch deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting batch',
      error: error.message
    });
  }
};

module.exports = {
  getAllBatches,
  getBatchesByDepartments,
  getBatchById,
  getActiveBatchesForDepartment,
  createBatch,
  updateBatch,
  deleteBatch
};
