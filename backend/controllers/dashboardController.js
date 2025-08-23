const Department = require('../models/Department');
const Student = require('../models/Student');
const User = require('../models/User');

class DashboardController {
  // Get department-wise student data for admin and placement director
  async getDepartmentWiseStudents(req, res) {
    try {
      console.log('getDepartmentWiseStudents called by user:', req.user?.email, 'role:', req.user?.role);
      
      // Check if user has permission (admin or placement_director)
      if (!['admin', 'placement_director'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only administrators and placement directors can view this dashboard.'
        });
      }

      // Get all departments with their placement staff
      const departments = await Department.find({ isActive: true })
        .populate({
          path: 'placementStaff',
          select: 'firstName lastName email role',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'courseCategory',
          select: 'name description',
          options: { strictPopulate: false }
        })
        .sort({ name: 1 })
        .lean();

      console.log(`Found ${departments.length} departments`);
      
      // Log placement staff data for debugging
      departments.forEach(dept => {
        console.log(`Department ${dept.name} (${dept.code}):`, {
          hasPlacementStaff: !!dept.placementStaff,
          placementStaffId: dept.placementStaff?._id,
          placementStaffName: dept.placementStaff ? `${dept.placementStaff.firstName} ${dept.placementStaff.lastName}` : 'None'
        });
      });

      // Get all students grouped by department
      const students = await Student.find({})
        .populate('userId', 'firstName lastName email isActive')
        .select('academic.department placement.placementStatus personalInfo.fullName studentId registrationNumber createdAt');

      console.log(`Found ${students.length} students`);

      // Create department-wise student mapping
      const departmentData = [];

      for (const department of departments) {
        // Filter students for this department - match by both department name and code
        const departmentStudents = students.filter(student => {
          if (!student.academic || !student.academic.department) {
            return false;
          }
          
          // Match by department name (full name like "Computer Science & Engineering")
          // OR by department code (like "CSE")
          return student.academic.department === department.name || 
                 student.academic.department === department.code;
        });

        // Calculate placement statistics
        const placementStats = {
          total: departmentStudents.length,
          placed: departmentStudents.filter(s => s.placement?.placementStatus === 'Placed').length,
          unplaced: departmentStudents.filter(s => s.placement?.placementStatus === 'Unplaced').length,
          multipleOffers: departmentStudents.filter(s => s.placement?.placementStatus === 'Multiple Offers').length
        };

        // Format student data for frontend
        const formattedStudents = departmentStudents.map(student => ({
          id: student._id,
          studentId: student.studentId,
          registrationNumber: student.registrationNumber,
          name: student.personalInfo?.fullName || `${student.userId?.firstName} ${student.userId?.lastName}`,
          email: student.userId?.email,
          placementStatus: student.placement?.placementStatus || 'Unplaced',
          isActive: student.userId?.isActive,
          createdAt: student.createdAt
        }));

        departmentData.push({
          id: department._id,
          name: department.name,
          code: department.code,
          description: department.description,
          courseCategory: department.courseCategory,
          placementStaff: department.placementStaff ? {
            id: department.placementStaff._id,
            name: `${department.placementStaff.firstName || ''} ${department.placementStaff.lastName || ''}`.trim(),
            email: department.placementStaff.email || ''
          } : null,
          students: formattedStudents,
          statistics: placementStats
        });
      }

      // Calculate overall statistics - match frontend expected structure
      const totalPlaced = students.filter(s => s.placement?.placementStatus === 'Placed').length;
      const totalUnplaced = students.filter(s => s.placement?.placementStatus === 'Unplaced').length;
      const totalMultipleOffers = students.filter(s => s.placement?.placementStatus === 'Multiple Offers').length;
      const departmentsWithStaff = departments.filter(d => d.placementStaff).length;
      const departmentsWithoutStaff = departments.filter(d => !d.placementStaff).length;
      
      // Calculate placement rate
      const placementRate = students.length > 0 ? 
        Math.round(((totalPlaced + totalMultipleOffers) / students.length) * 100) : 0;

      const overallStatistics = {
        departments: {
          total: departments.length,
          active: departments.length, // All fetched departments are active
          withStaff: departmentsWithStaff,
          withoutStaff: departmentsWithoutStaff
        },
        students: {
          total: students.length,
          placed: totalPlaced,
          unplaced: totalUnplaced,
          multipleOffers: totalMultipleOffers,
          placementRate: placementRate
        }
      };

      console.log('Sending response with:', {
        departmentCount: departmentData.length,
        totalStudents: students.length,
        overallStatistics
      });

      res.status(200).json({
        success: true,
        message: 'Department-wise student data retrieved successfully',
        data: {
          departments: departmentData,
          overallStatistics: overallStatistics
        }
      });

    } catch (error) {
      console.error('Error fetching department-wise students:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching department-wise student data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get students for a specific department
  async getDepartmentStudents(req, res) {
    try {
      const { departmentId } = req.params;
      const { page = 1, limit = 50, search = '', status = 'all' } = req.query;

      console.log('getDepartmentStudents called with:', { departmentId, page, limit, search, status });

      // Check if user has permission
      if (!['admin', 'placement_director'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only administrators and placement directors can view this data.'
        });
      }

      // Get department details
      const department = await Department.findById(departmentId)
        .populate('placementStaff', 'firstName lastName email')
        .populate('courseCategory', 'name');

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
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
        .populate('userId', 'firstName lastName email isActive')
        .select('academic placement personalInfo studentId registrationNumber createdAt')
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
        cgpa: student.academic?.cgpa
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

  // Get dashboard summary statistics
  async getDashboardSummary(req, res) {
    try {
      // Check if user has permission
      if (!['admin', 'placement_director'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only administrators and placement directors can view this dashboard.'
        });
      }

      // Get counts
      const [
        totalDepartments,
        activeDepartments,
        totalStudents,
        placedStudents,
        unplacedStudents,
        multipleOffersStudents,
        departmentsWithStaff
      ] = await Promise.all([
        Department.countDocuments({}),
        Department.countDocuments({ isActive: true }),
        Student.countDocuments({}),
        Student.countDocuments({ 'placement.placementStatus': 'Placed' }),
        Student.countDocuments({ 'placement.placementStatus': 'Unplaced' }),
        Student.countDocuments({ 'placement.placementStatus': 'Multiple Offers' }),
        Department.countDocuments({ placementStaff: { $ne: null } })
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
}

module.exports = new DashboardController();
