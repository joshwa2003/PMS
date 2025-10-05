const Department = require('../models/Department');
const Student = require('../models/Student');
const Batch = require('../models/Batch');

// Get all departments with basic info for dashboard
exports.getDepartmentWiseStudents = async (req, res) => {
  try {
    // Get all departments with placement staff populated
    const departments = await Department.find()
      .select('name code description placementStaff')
      .populate('placementStaff', 'firstName lastName email')
      .sort({ name: 1 });
    
    // Get all students grouped by department and placement status
    const studentsByDepartment = await Student.aggregate([
      {
        $group: {
          _id: {
            department: '$academic.department',
            placementStatus: '$placement.placementStatus'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate statistics for each department
    const departmentsWithStats = departments.map(dept => {
      // Find students for this department
      const deptStudents = studentsByDepartment.filter(
        s => s._id.department === dept.code
      );

      // Calculate statistics
      const placed = deptStudents.find(s => s._id.placementStatus === 'Placed')?.count || 0;
      const unplaced = deptStudents.find(s => s._id.placementStatus === 'Unplaced')?.count || 0;
      const multipleOffers = deptStudents.find(s => s._id.placementStatus === 'Multiple Offers')?.count || 0;
      const total = placed + unplaced + multipleOffers;

      return {
        _id: dept._id,
        id: dept._id,
        name: dept.name,
        code: dept.code,
        description: dept.description,
        placementStaff: dept.placementStaff ? {
          id: dept.placementStaff._id,
          name: `${dept.placementStaff.firstName} ${dept.placementStaff.lastName}`,
          email: dept.placementStaff.email
        } : null,
        statistics: {
          total,
          placed,
          unplaced,
          multipleOffers
        }
      };
    });

    // Calculate overall statistics
    const totalStudents = await Student.countDocuments();
    const placedStudents = await Student.countDocuments({ 'placement.placementStatus': 'Placed' });
    const unplacedStudents = await Student.countDocuments({ 'placement.placementStatus': 'Unplaced' });
    const multipleOffersStudents = await Student.countDocuments({ 'placement.placementStatus': 'Multiple Offers' });
    const departmentsWithoutStaff = departments.filter(d => !d.placementStaff).length;
    
    const placementRate = totalStudents > 0 
      ? Math.round(((placedStudents + multipleOffersStudents) / totalStudents) * 100) 
      : 0;
    
    // Set cache control headers to prevent stale data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    return res.status(200).json({
      success: true,
      data: {
        departments: departmentsWithStats,
        overallStatistics: {
          totalDepartments: departments.length,
          totalStudents: totalStudents,
          departments: { 
            total: departments.length, 
            active: departments.length, 
            withoutStaff: departmentsWithoutStaff 
          },
          students: { 
            total: totalStudents, 
            placed: placedStudents, 
            unplaced: unplacedStudents, 
            placementRate: placementRate, 
            multipleOffers: multipleOffersStudents 
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

    // Get the department to get its code
    const department = await Department.findById(departmentId)
      .select('name code')
      .populate('placementStaff', 'firstName lastName email');
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Get all batches for this specific department
    const batches = await Batch.find({ department: departmentId })
      .select('batchCode startYear endYear courseType courseDuration isActive isGraduated')
      .sort({ startYear: -1 }) // Sort by newest batch first
      .lean(); // Use lean for better performance and plain objects

    console.log('=== getDepartmentBatches START ===');
    console.log('getDepartmentBatches called with:', { departmentId, userRole: req.user?.role });
    console.log('Department found:', { name: department.name, code: department.code });
    console.log(`Found ${batches.length} batches for department ${department.name}`);
    
    if (batches.length > 0) {
      console.log('First batch raw data:', JSON.stringify(batches[0], null, 2));
    }

    // Calculate statistics for each batch
    const batchesWithStats = await Promise.all(batches.map(async (batch) => {
      // Query students by department code OR name (for flexibility)
      const departmentQuery = {
        batchId: batch._id,
        $or: [
          { 'academic.department': department.code },
          { 'academic.department': department.name }
        ]
      };

      const totalStudents = await Student.countDocuments(departmentQuery);

      const placedStudents = await Student.countDocuments({
        ...departmentQuery,
        'placement.placementStatus': 'Placed'
      });

      const unplacedStudents = await Student.countDocuments({
        ...departmentQuery,
        'placement.placementStatus': 'Unplaced'
      });

      const multipleOffersStudents = await Student.countDocuments({
        ...departmentQuery,
        'placement.placementStatus': 'Multiple Offers'
      });
      
      console.log(`Batch ${batch.batchCode}: Total=${totalStudents}, Placed=${placedStudents}, Unplaced=${unplacedStudents}, Multiple=${multipleOffersStudents}`);

      const batchData = {
        _id: batch._id,
        id: batch._id,
        name: batch.batchCode,
        batchCode: batch.batchCode,
        yearRange: `${batch.startYear}-${batch.endYear}`,
        startYear: batch.startYear,
        endYear: batch.endYear,
        courseType: batch.courseType,
        courseDuration: batch.courseDuration,
        isActive: batch.isActive,
        isGraduated: batch.isGraduated,
        statistics: {
          total: totalStudents,
          placed: placedStudents,
          unplaced: unplacedStudents,
          multipleOffers: multipleOffersStudents
        }
      };
      
      console.log('Batch data:', { 
        batchCode: batch.batchCode, 
        yearRange: batchData.yearRange,
        stats: batchData.statistics 
      });
      
      return batchData;
    }));

    console.log('=== FINAL RESPONSE ===');
    console.log('Batches being returned:', JSON.stringify(batchesWithStats, null, 2));
    console.log('=== getDepartmentBatches END ===');

    // Set cache control headers to prevent stale data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('ETag', `"${Date.now()}"`); // Force new ETag to prevent 304

    return res.status(200).json({
      success: true,
      data: {
        department: {
          id: department._id,
          name: department.name,
          code: department.code,
          placementStaff: department.placementStaff ? {
            id: department.placementStaff._id,
            name: `${department.placementStaff.firstName} ${department.placementStaff.lastName}`,
            email: department.placementStaff.email
          } : null
        },
        batches: batchesWithStats
      }
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
    const { page = 1, limit = 50, search = '', status = 'all' } = req.query;

    // Get the department to get its code
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Build query - check both department code and name for flexibility
    const query = {
      batchId: batchId,
      $and: [
        {
          $or: [
            { 'academic.department': department.code },
            { 'academic.department': department.name }
          ]
        }
      ]
    };

    // Add search filter if provided
    if (search) {
      query.$and.push({
        $or: [
          { studentId: { $regex: search, $options: 'i' } },
          { registrationNumber: { $regex: search, $options: 'i' } },
          { 'personalInfo.fullName': { $regex: search, $options: 'i' } },
          { 'contact.email': { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Add status filter if provided
    if (status && status !== 'all') {
      query['placement.placementStatus'] = status;
    }

    // Get students with pagination
    const skip = (page - 1) * limit;
    const students = await Student.find(query)
      .select('studentId registrationNumber personalInfo.fullName contact.email placement.placementStatus')
      .sort({ 'personalInfo.fullName': 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalStudents = await Student.countDocuments(query);

    // Calculate statistics
    const baseQuery = {
      batchId: batchId,
      $or: [
        { 'academic.department': department.code },
        { 'academic.department': department.name }
      ]
    };
    
    const placed = await Student.countDocuments({ 
      ...baseQuery,
      'placement.placementStatus': 'Placed' 
    });
    const unplaced = await Student.countDocuments({ 
      ...baseQuery,
      'placement.placementStatus': 'Unplaced' 
    });
    const multipleOffers = await Student.countDocuments({ 
      ...baseQuery,
      'placement.placementStatus': 'Multiple Offers' 
    });

    // Format students for response
    const formattedStudents = students.map(student => ({
      id: student._id,
      studentId: student.studentId,
      registrationNumber: student.registrationNumber,
      name: student.personalInfo?.fullName || 'N/A',
      email: student.contact?.email || 'N/A',
      placementStatus: student.placement?.placementStatus || 'Unplaced'
    }));

    return res.status(200).json({
      success: true,
      data: {
        students: formattedStudents,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalStudents / limit),
          totalStudents,
          limit: parseInt(limit)
        },
        statistics: {
          total: totalStudents,
          placed,
          unplaced,
          multipleOffers
        }
      }
    });
  } catch (error) {
    console.error(`Error fetching students for department ${req.params.departmentId} and batch ${req.params.batchId}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching department batch students'
    });
  }
};