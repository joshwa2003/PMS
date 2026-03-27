const Department = require('../models/Department');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const User = require('../models/User');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const mongoose = require('mongoose');

class DashboardController {
  // Get department-wise student data for admin and placement director
  // Removed getDepartmentWiseStudents method as per user request to delete Department-wise Student Dashboard

  // Get students for a specific department
  async getDepartmentStudents(req, res) {
    try {
      const { departmentId } = req.params;
      const { page = 1, limit = 50, search = '', status = 'all' } = req.query;

      console.log('getDepartmentStudents called with:', { departmentId, page, limit, search, status });

      // Check if user has permission
      if (!['admin', 'placement_director', 'placement_staff'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only administrators and placement staff can view this data.'
        });
      }

      // Get department details
      const department = await Department.findById(departmentId)
        .populate('placementStaff', 'firstName lastName email')
        .populate('courseCategory', 'name')
        .lean();

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      // Fallback: If placementStaff is not set, look for a user with role 'placement_staff' assigned to this department
      // Fallback: If placementStaff is not set, look for a user with role 'placement_staff' assigned to this department
      // Fallback: If placementStaff is not set, look for a user with role 'placement_staff' assigned to this department
      if (!department.placementStaff) {
        const staff = await User.findOne({
          department: department._id,
          role: 'placement_staff',
          isActive: true
        }).select('firstName lastName email').lean();

        if (staff) {
          department.placementStaff = staff;
          console.log('Found assigned placement staff (fallback):', staff.email);
        }
      }

      console.log('Department found:', { name: department.name, code: department.code });

      // First, let's check what students exist and their department values
      const allStudents = await Student.find({})
        .select('academic.department personalInfo.fullName studentId')
        .limit(10);

      console.log('Sample students and their departments:');
      allStudents.forEach(student => {
        console.log(`Student ${student.studentId}: department = "${student.academic?.department}"`);
      });

      // Build query for students - match by both department name and code
      let studentQuery = {
        $or: [
          { 'academic.department': department.name },
          { 'academic.department': department.code }
        ]
      };

      console.log('Initial student query:', JSON.stringify(studentQuery, null, 2));

      // Add search filter while preserving department filter
      if (search) {
        studentQuery = {
          $and: [
            {
              $or: [
                { 'academic.department': department.name },
                { 'academic.department': department.code }
              ]
            },
            {
              $or: [
                { 'personalInfo.fullName': { $regex: search, $options: 'i' } },
                { studentId: { $regex: search, $options: 'i' } },
                { registrationNumber: { $regex: search, $options: 'i' } }
              ]
            }
          ]
        };
      }

      // Add status filter
      if (status !== 'all') {
        if (search) {
          // If we already have an $and query, add status to it
          studentQuery.$and.push({ 'placement.placementStatus': status });
        } else {
          // If we only have department filter, add status with $and
          studentQuery = {
            $and: [
              studentQuery,
              { 'placement.placementStatus': status }
            ]
          };
        }
      }

      console.log('Final student query:', JSON.stringify(studentQuery, null, 2));

      // Get students with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const students = await Student.find(studentQuery)
        .populate('userId', 'firstName lastName email isActive profilePicture profilePhotoUrl')
        .select('academic placement personalInfo studentId registrationNumber createdAt profileImageUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      console.log(`Found ${students.length} students matching query`);

      const totalStudents = await Student.countDocuments(studentQuery);
      console.log(`Total students matching query: ${totalStudents}`);

      // Format student data
      const formattedStudents = students.map(student => ({
        id: student._id,
        studentId: student.studentId,
        registrationNumber: student.registrationNumber,
        name: student.personalInfo?.fullName || `${student.userId?.firstName} ${student.userId?.lastName}`,
        email: student.userId?.email,
        placementStatus: student.placement?.placementStatus || 'Unplaced',
        isActive: student.userId?.isActive,
        createdAt: student.createdAt,
        department: student.academic?.department,
        program: student.academic?.program,
        cgpa: student.academic?.cgpa,
        profilePicture: student.profileImageUrl || student.userId?.profilePicture || student.userId?.profilePhotoUrl
      }));

      res.status(200).json({
        success: true,
        message: 'Department students retrieved successfully',
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
          students: formattedStudents,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalStudents / parseInt(limit)),
            totalStudents,
            hasNextPage: skip + students.length < totalStudents,
            hasPrevPage: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      console.error('Error fetching department students:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching department students',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get batches for a specific department (Admin and Placement Director only)
  async getDepartmentBatches(req, res) {
    try {
      const { departmentId } = req.params;

      console.log('getDepartmentBatches called with:', { departmentId, userRole: req.user?.role });

      // Check if user has permission
      if (!['admin', 'placement_director'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only administrators and placement directors can view this data.'
        });
      }

      // Validate department ID
      if (!departmentId || !require('mongoose').Types.ObjectId.isValid(departmentId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid department ID is required'
        });
      }

      // Get department details
      const department = await Department.findById(departmentId)
        .populate('placementStaff', 'firstName lastName email')
        .populate('courseCategory', 'name')
        .lean();

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      // Fallback: If placementStaff is not set, look for a user with role 'placement_staff' assigned to this department
      // Fallback: If placementStaff is not set, look for a user with role 'placement_staff' assigned to this department
      // Fallback: If placementStaff is not set, look for a user with role 'placement_staff' assigned to this department
      if (!department.placementStaff) {
        const staff = await User.findOne({
          department: department._id,
          role: 'placement_staff',
          isActive: true
        }).select('firstName lastName email').lean();

        if (staff) {
          department.placementStaff = staff;
          console.log('Found assigned placement staff (fallback):', staff.email);
        }
      }

      console.log('Department found:', { name: department.name, code: department.code });

      // Get all batches for this department
      const Batch = require('../models/Batch');
      const batches = await Batch.find({
        department: departmentId,
        isGraduated: { $ne: true }
      })
        .select('batchCode startYear endYear courseType courseDuration isActive isGraduated')
        .sort({ startYear: -1 }) // Most recent first
        .lean();

      console.log(`Found ${batches.length} batches for department ${department.name}`);

      // Get student counts for each batch
      const batchesWithStats = [];

      for (const batch of batches) {
        try {
          // Get students in this batch for this department
          const studentsInBatch = await Student.find({
            batchId: batch._id,
            'academic.department': { $in: [department.name, department.code] }
          })
            .select('placement.placementStatus')
            .lean();

          // Calculate placement statistics
          const placementSummary = {
            unplaced: studentsInBatch.filter(s => !s.placement?.placementStatus || s.placement.placementStatus === 'Unplaced').length,
            placed: studentsInBatch.filter(s => s.placement?.placementStatus === 'Placed').length,
            multipleOffers: studentsInBatch.filter(s => s.placement?.placementStatus === 'Multiple Offers').length
          };

          const totalStudents = studentsInBatch.length;
          const placementRate = totalStudents > 0 ?
            Math.round(((placementSummary.placed + placementSummary.multipleOffers) / totalStudents) * 100) : 0;

          console.log(`Batch ${batch.batchCode}: Found ${totalStudents} students (Placed: ${placementSummary.placed}, Unplaced: ${placementSummary.unplaced})`);

          batchesWithStats.push({
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
              placed: placementSummary.placed,
              unplaced: placementSummary.unplaced,
              multipleOffers: placementSummary.multipleOffers
            }
          });

        } catch (statsError) {
          console.error(`Error calculating stats for batch ${batch.batchCode}:`, statsError);
          // Add batch with zero stats to avoid breaking the entire response
          batchesWithStats.push({
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
              total: 0,
              placed: 0,
              unplaced: 0,
              multipleOffers: 0
            }
          });
        }
      }

      res.status(200).json({
        success: true,
        message: 'Department batches retrieved successfully',
        data: {
          department: {
            id: department._id,
            name: department.name,
            code: department.code,
            description: department.description,
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
      console.error('Error fetching department batches:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching department batches',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get students for a specific department and batch (Admin and Placement Director only)
  async getDepartmentBatchStudents(req, res) {
    try {
      const { departmentId, batchId } = req.params;
      const { page = 1, limit = 50, search = '', status = 'all' } = req.query;

      console.log('getDepartmentBatchStudents called with:', { departmentId, batchId, page, limit, search, status });

      // Check if user has permission
      if (!['admin', 'placement_director', 'placement_staff'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only administrators and placement staff can view this data.'
        });
      }

      // Validate IDs
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(departmentId) || !mongoose.Types.ObjectId.isValid(batchId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid department ID and batch ID are required'
        });
      }

      // Get department and batch details
      const [department, batch] = await Promise.all([
        Department.findById(departmentId)
          .populate('placementStaff', 'firstName lastName email')
          .populate('courseCategory', 'name')
          .lean(),
        require('../models/Batch').findById(batchId).populate('department', 'name code')
      ]);

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      // Fallback: If placementStaff is not set, look for a user with role 'placement_staff' assigned to this department
      // Fallback: If placementStaff is not set, look for a user with role 'placement_staff' assigned to this department
      // Fallback: If placementStaff is not set, look for a user with role 'placement_staff' assigned to this department
      if (!department.placementStaff) {
        const staff = await User.findOne({
          department: department._id,
          role: 'placement_staff',
          isActive: true
        }).select('firstName lastName email').lean();

        if (staff) {
          department.placementStaff = staff;
          console.log('Found assigned placement staff (fallback):', staff.email);
        }
      }

      console.log('Department and batch found:', {
        departmentName: department.name,
        batchCode: batch.batchCode
      });

      // Build query for students - match by department and batch
      let studentQuery = {
        batchId: batchId,
        $or: [
          { 'academic.department': department.name },
          { 'academic.department': department.code }
        ]
      };

      // Add search filter
      if (search) {
        studentQuery = {
          $and: [
            studentQuery,
            {
              $or: [
                { 'personalInfo.fullName': { $regex: search, $options: 'i' } },
                { studentId: { $regex: search, $options: 'i' } },
                { registrationNumber: { $regex: search, $options: 'i' } }
              ]
            }
          ]
        };
      }

      // Add status filter
      if (status !== 'all') {
        if (search) {
          studentQuery.$and.push({ 'placement.placementStatus': status });
        } else {
          studentQuery = {
            $and: [
              studentQuery,
              { 'placement.placementStatus': status }
            ]
          };
        }
      }

      console.log('Final student query:', JSON.stringify(studentQuery, null, 2));

      // Get students with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const students = await Student.find(studentQuery)
        .populate('userId', 'firstName lastName email isActive profilePicture profilePhotoUrl')
        .select('academic placement personalInfo studentId registrationNumber createdAt profileImageUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalStudents = await Student.countDocuments(studentQuery);

      console.log(`Found ${students.length} students for batch ${batch.batchCode} in department ${department.name}`);

      // Format student data
      const formattedStudents = students.map(student => ({
        id: student._id,
        studentId: student.studentId,
        registrationNumber: student.registrationNumber,
        name: student.personalInfo?.fullName || `${student.userId?.firstName} ${student.userId?.lastName}`,
        email: student.userId?.email,
        placementStatus: student.placement?.placementStatus || 'Unplaced',
        isActive: student.userId?.isActive,
        createdAt: student.createdAt,
        department: student.academic?.department,
        program: student.academic?.program,
        cgpa: student.academic?.cgpa,
        profilePicture: student.profileImageUrl || student.userId?.profilePicture || student.userId?.profilePhotoUrl
      }));

      res.status(200).json({
        success: true,
        message: 'Department batch students retrieved successfully',
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
          batch: {
            id: batch._id,
            batchCode: batch.batchCode,
            startYear: batch.startYear,
            endYear: batch.endYear,
            courseType: batch.courseType,
            academicStatus: batch.academicStatus,
            displayName: batch.displayName
          },
          students: formattedStudents,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalStudents / parseInt(limit)),
            totalStudents,
            hasNextPage: skip + students.length < totalStudents,
            hasPrevPage: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      console.error('Error fetching department batch students:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching department batch students',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get dashboard summary statistics
  async getDashboardSummary(req, res) {
    try {
      // Check if user has permission
      if (!['admin', 'placement_director', 'placement_staff'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to view this dashboard.'
        });
      }

      let studentFilter = {};
      let jobFilter = { status: 'Active' }; // Default for jobs
      let departmentFilter = {};
      let departmentWithStaffFilter = { placementStaff: { $ne: null } };

      // If placement staff, filter by their department
      if (req.user.role === 'placement_staff') {
        const PlacementStaffProfile = require('../models/PlacementStaffProfile');
        const staffProfile = await PlacementStaffProfile.findOne({ userId: req.user._id });

        if (staffProfile && staffProfile.department) {
          // Find the department to get both name and code
          const Department = require('../models/Department');
          const mongoose = require('mongoose'); // Ensure mongoose is available

          let departmentDoc;

          if (mongoose.Types.ObjectId.isValid(staffProfile.department)) {
            departmentDoc = await Department.findById(staffProfile.department);
          }

          if (!departmentDoc) {
            // Try to find by code or name
            departmentDoc = await Department.findOne({
              $or: [
                { code: staffProfile.department },
                { name: staffProfile.department }
              ]
            });
          }

          if (departmentDoc) {
            console.log(`🔒 Filtering dashboard for staff: ${req.user.email} (Dept: ${departmentDoc.name})`);

            // Get alumni batch IDs to exclude them from counts
            const Batch = require('../models/Batch');
            const alumniBatches = await Batch.find({ isGraduated: true }).select('_id');
            const alumniBatchIds = alumniBatches.map(b => b._id);

            // Student Filter: Belong to dept AND not alumni
            studentFilter = {
              $and: [
                {
                  $or: [
                    { 'academic.department': departmentDoc.name },
                    { 'academic.department': departmentDoc.code }
                  ]
                },
                { batchId: { $nin: alumniBatchIds } }
              ]
            };

            // Job Filter: Target dept OR All Departments
            jobFilter = {
              status: 'Active',
              $or: [
                { postingType: 'All Departments' },
                { targetDepartments: departmentDoc._id },
                { 'eligibility.departments': departmentDoc._id }
              ]
            };

            // Department Filter: Only this department
            departmentFilter = { _id: departmentDoc._id };
            departmentWithStaffFilter = { _id: departmentDoc._id, placementStaff: { $ne: null } };
          } else {
            console.warn(`⚠️ Staff department '${staffProfile.department}' not found in DB`);
            studentFilter = { _id: null };
            jobFilter = { _id: null };
          }
        } else {
          console.warn(`⚠️ Staff profile not found for user ${req.user._id}`);
          studentFilter = { _id: null };
          jobFilter = { _id: null };
        }
      } else {
        // For Admin/Director: Exclude Alumni from general counts?
        // Usually dashboard shows current active students. Let's exclude alumni to be consistent with previous fix.
        const Batch = require('../models/Batch');
        const alumniBatches = await Batch.find({ isGraduated: true }).select('_id');
        const alumniBatchIds = alumniBatches.map(b => b._id);
        studentFilter = { batchId: { $nin: alumniBatchIds } };
      }

      // Get counts
      const [
        totalDepartments,
        activeDepartments,
        totalStudents,
        placedStudents,
        unplacedStudents,
        multipleOffersStudents,
        departmentsWithStaff,
        totalJobs,
        activeJobs
      ] = await Promise.all([
        Department.countDocuments(departmentFilter),
        Department.countDocuments({ ...departmentFilter, isActive: true }),
        Student.countDocuments(studentFilter),
        Student.countDocuments({ ...studentFilter, 'placement.placementStatus': 'Placed' }),
        Student.countDocuments({ ...studentFilter, 'placement.placementStatus': 'Unplaced' }),
        Student.countDocuments({ ...studentFilter, 'placement.placementStatus': 'Multiple Offers' }),
        Department.countDocuments(departmentWithStaffFilter),
        Job.countDocuments(req.user.role === 'placement_staff' ? { ...jobFilter, status: { $exists: true } } : {}), // Total jobs visible
        Job.countDocuments(jobFilter) // Active jobs
      ]);

      const placementRate = totalStudents > 0 ? ((placedStudents + multipleOffersStudents) / totalStudents * 100).toFixed(2) : 0;

      res.status(200).json({
        success: true,
        message: 'Dashboard summary retrieved successfully',
        data: {
          departments: {
            total: totalDepartments,
            active: activeDepartments,
            withStaff: departmentsWithStaff,
            withoutStaff: activeDepartments - departmentsWithStaff
          },
          students: {
            total: totalStudents,
            placed: placedStudents,
            unplaced: unplacedStudents,
            multipleOffers: multipleOffersStudents,
            placementRate: parseFloat(placementRate)
          },
          jobs: {
            total: totalJobs,
            active: activeJobs
          }
        }
      });

    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching dashboard summary',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get daily active students for the past week
  async getDailyActiveStudents(req, res) {
    try {
      // Check if user has permission
      if (!['admin', 'placement_director', 'placement_staff'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only administrators and placement directors can view this data.'
        });
      }

      // Get current date and date 7 days ago
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6); // Get data for past 7 days (including today)

      // Initialize data array for each day of the week (Sunday to Saturday)
      const dailyData = Array(7).fill(0);

      let userFilter = {
        role: 'student',
        lastLogin: { $gte: startDate, $lte: endDate }
      };

      // Ensure placement staff only see students from their department
      if (req.user.role === 'placement_staff') {
        const PlacementStaffProfile = require('../models/PlacementStaffProfile');
        const staffProfile = await PlacementStaffProfile.findOne({ userId: req.user._id });

        if (staffProfile && staffProfile.department) {
          const Department = require('../models/Department');
          const mongoose = require('mongoose');

          let departmentDoc;
          if (mongoose.Types.ObjectId.isValid(staffProfile.department)) {
            departmentDoc = await Department.findById(staffProfile.department);
          }

          if (!departmentDoc) {
            departmentDoc = await Department.findOne({
              $or: [{ code: staffProfile.department }, { name: staffProfile.department }]
            });
          }

          if (departmentDoc) {
            // Find all students in this department
            const Student = require('../models/Student');
            const studentsInDept = await Student.find({
              $or: [
                { 'academic.department': departmentDoc.name },
                { 'academic.department': departmentDoc.code }
              ]
            }).select('userId');

            const studentUserIds = studentsInDept.map(s => s.userId);
            userFilter._id = { $in: studentUserIds };
          } else {
            userFilter._id = null; // No students if dept not found
          }
        } else {
          userFilter._id = null;
        }
      }

      // Query users with login activity in the past week
      const users = await User.find(userFilter);

      // Count logins for each day
      users.forEach(user => {
        if (user.lastLogin) {
          const dayOfWeek = user.lastLogin.getDay(); // 0 = Sunday, 6 = Saturday
          dailyData[dayOfWeek]++;
        }
      });

      // Return the data
      return res.status(200).json({
        success: true,
        data: {
          labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          dailyActiveStudents: dailyData,
          totalActiveStudents: users.length
        }
      });
    } catch (error) {
      console.error('Error getting daily active students:', error);
      return res.status(500).json({
        success: false,
        message: 'Error getting daily active students',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
      });
    }
  }
}

module.exports = new DashboardController();
