const Batch = require('../models/Batch');
const Department = require('../models/Department');
const Student = require('../models/Student');
const User = require('../models/User');

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

// Get alumni batches for a specific department with statistics
const getAlumniBatchesForDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    // First verify department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Get raw batches
    const batches = await Batch.find({
      department: departmentId,
      isGraduated: true
    }).populate('department', 'name code').lean();

    // Calculate statistics for each batch
    const batchesWithStats = [];

    for (const batch of batches) {
      // Find students in this batch
      // optimizing to select only needed fields
      const students = await Student.find({
        batchId: batch._id
      }).select('placement.placementStatus academic.department userId');

      const totalStudents = students.length;

      // Calculate placement stats
      const placed = students.filter(s => s.placement?.placementStatus === 'Placed').length;
      const multipleOffers = students.filter(s => s.placement?.placementStatus === 'Multiple Offers').length;
      const unplaced = students.filter(s => !s.placement?.placementStatus || s.placement.placementStatus === 'Unplaced').length;

      batchesWithStats.push({
        ...batch,
        id: batch._id,
        statistics: {
          total: totalStudents,
          placed: placed,
          multipleOffers: multipleOffers,
          unplaced: unplaced
        }
      });
    }

    res.status(200).json({
      success: true,
      count: batchesWithStats.length,
      data: batchesWithStats
    });
  } catch (error) {
    console.error('Error fetching alumni batches for department:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alumni batches for department',
      error: error.message
    });
  }
};

// Transfer batch to alumni (Placement Staff only)
const transferToAlumni = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the batch first
    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if already alumni
    if (batch.isGraduated) {
      return res.status(400).json({
        success: false,
        message: 'Batch is already marked as Alumni'
      });
    }

    // Use transaction if possible, or just sequential updates
    // Update the batch
    batch.isGraduated = true;
    batch.isActive = false;
    await batch.save();

    // Deactivate all student accounts in this batch
    const students = await Student.find({ batchId: batch._id }).select('userId');
    const userIds = students.map(s => s.userId).filter(id => id); // filter out nulls

    if (userIds.length > 0) {
      await User.updateMany(
        { _id: { $in: userIds } },
        { $set: { isActive: false } }
      );
      console.log(`Deactivated ${userIds.length} users for alumni batch ${batch.batchCode}`);
    }

    res.status(200).json({
      success: true,
      message: 'Batch transferred to Alumni successfully and students deactivated',
      data: batch
    });
  } catch (error) {
    console.error('Error transferring batch to alumni:', error);
    res.status(500).json({
      success: false,
      message: 'Error transferring batch to alumni',
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
  deleteBatch,
  transferToAlumni,
  getAlumniBatchesForDepartment
};
