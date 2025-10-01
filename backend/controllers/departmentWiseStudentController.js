const Department = require('../models/Department');
const Student = require('../models/Student');
const Batch = require('../models/Batch');

// Get all departments with basic info for dashboard
exports.getDepartmentWiseStudents = async (req, res) => {
  try {
    // Get all departments
    const departments = await Department.find()
      .select('name code description')
      .sort({ name: 1 });
    
    // Count total students for statistics
    const totalStudents = await Student.countDocuments();
    
    return res.status(200).json({
      success: true,
      data: {
        departments: departments,
        overallStatistics: {
          totalDepartments: departments.length,
          totalStudents: totalStudents,
          departments: { total: departments.length, active: departments.length, withoutStaff: 0 },
          students: { 
            total: totalStudents, 
            placed: 0, 
            unplaced: 0, 
            placementRate: 0, 
            multipleOffers: 0 
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching department-wise students:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching department-wise student data'
    });
  }
};

// Get batches for a specific department
exports.getDepartmentBatches = async (req, res) => {
  try {
    const { departmentId } = req.params;

    // Get all batches
    const batches = await Batch.find()
      .sort({ name: -1 }); // Sort by newest batch first

    return res.status(200).json({
      success: true,
      data: batches
    });
  } catch (error) {
    console.error(`Error fetching batches for department ${req.params.departmentId}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching department batches'
    });
  }
};

// Get students for a specific department and batch
exports.getDepartmentBatchStudents = async (req, res) => {
  try {
    const { departmentId, batchId } = req.params;

    // Get students for the department and batch
    const students = await Student.find({
      department: departmentId,
      batch: batchId
    })
    .select('rollNo name email status')
    .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error(`Error fetching students for department ${req.params.departmentId} and batch ${req.params.batchId}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching department batch students'
    });
  }
};