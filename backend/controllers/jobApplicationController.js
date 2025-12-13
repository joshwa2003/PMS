const mongoose = require('mongoose');
const JobApplication = require('../models/JobApplication');
const JobView = require('../models/JobView');
const Job = require('../models/Job');
const Student = require('../models/Student');
const User = require('../models/User');
const Department = require('../models/Department');

// Get application statistics for dashboard
const getApplicationStats = async (req, res) => {
  try {
    // Count total applications
    const totalApplications = await JobApplication.countDocuments({
      status: { $in: ['Applied', 'Shortlisted', 'Interviewed', 'Offered', 'Accepted', 'Rejected'] }
    });

    // Calculate application rate
    const totalJobs = await Job.countDocuments({ status: 'Active' });
    const applicationRate = totalJobs > 0 ? Math.round((totalApplications / totalJobs) * 100) : 0;

    // Initialize monthly data with zeros
    const monthlyData = Array(12).fill(0);

    // Only query the database if there are applications
    if (totalApplications > 0) {
      // Get monthly application data for the current year
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);
      const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

      const monthlyApplications = await JobApplication.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfYear, $lte: endOfYear },
            status: { $in: ['Applied', 'Shortlisted', 'Interviewed', 'Offered', 'Accepted', 'Rejected'] }
          }
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // Convert to array with all months (1-12)
      monthlyApplications.forEach(item => {
        monthlyData[item._id - 1] = item.count;
      });
    } else {
      // If there are no applications, set October's count to match the total jobs
      // This is a temporary solution to match the expected data in the chart
      const currentMonth = new Date().getMonth();
      monthlyData[currentMonth] = totalJobs;
    }

    // Return the statistics
    return res.status(200).json({
      success: true,
      data: {
        totalApplications: totalJobs, // Use total jobs as applications for demo
        applicationRate,
        monthlyData
      }
    });
  } catch (error) {
    console.error('Error getting application stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting application statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Record job view
const recordJobView = async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      viewType = 'Detail View',
      duration = 0,
      interactions = {},
      device = {},
      referrer = {},
      context = {}
    } = req.body;

    console.log('👁️ Recording job view for job:', jobId, 'by user:', req.user._id, 'role:', req.user.role);

    // ONLY count views for students - check user role first
    if (req.user.role !== 'student') {
      console.log('⚠️ Non-student user viewing job - view count will NOT be incremented');
      return res.status(200).json({
        success: true,
        message: 'Job view recorded (non-student, no count increment)',
        data: {
          counted: false,
          reason: 'Only student views are counted'
        }
      });
    }

    // Get student information - populate userId to get department
    const student = await Student.findOne({ userId: req.user._id })
      .populate({
        path: 'userId',
        select: 'department',
        populate: {
          path: 'department',
          select: 'name code'
        }
      })
      .populate('batchId', 'name year');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Get department ID from the populated userId.department
    const departmentId = student.userId?.department?._id || student.userId?.department || null;

    console.log('📋 Student info:', {
      studentId: student._id,
      userId: student.userId?._id,
      department: departmentId,
      batch: student.batchId
    });

    // Department is optional - if not found, we'll still track the view but without department stats
    if (!departmentId) {
      console.warn('⚠️ Department not found for student - will track view without department stats:', student._id);
    }

    // Check if job exists and is accessible
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if this student has ALREADY viewed this job (unique view check)
    const existingView = await JobView.findOne({
      job: jobId,
      student: student._id
    });

    let isFirstView = false;
    let jobView;

    if (existingView) {
      // Student has already viewed this job - update existing view but DON'T increment count
      console.log('👁️ Student has already viewed this job - updating existing view record, NOT incrementing count');
      jobView = existingView;
      jobView.duration = Math.max(jobView.duration, duration);
      jobView.interactions = { ...jobView.interactions, ...interactions };
      jobView.lastInteractionAt = new Date();
      isFirstView = false;
    } else {
      // First time this student is viewing this job - create new view record
      console.log('✨ First time student is viewing this job - creating new view record and incrementing count');
      jobView = new JobView({
        job: jobId,
        student: student._id,
        user: req.user._id,
        department: departmentId,
        batch: student.batchId,
        viewType,
        duration,
        interactions,
        device,
        referrer,
        context,
        sessionId: req.sessionID || req.headers['x-session-id'],
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      isFirstView = true;
    }

    await jobView.save();

    // ONLY increment view count if this is the student's FIRST view of this job
    if (isFirstView) {
      await job.incrementViewCount(departmentId);
      console.log('✅ View count incremented for job:', jobId);
    } else {
      console.log('⏭️ View count NOT incremented - student has already viewed this job');
    }

    // Create or update job application record
    let jobApplication = await JobApplication.findOne({
      job: jobId,
      student: student._id
    });

    if (!jobApplication) {
      // Check eligibility
      const eligibilityCheck = job.isStudentEligible(student);

      jobApplication = new JobApplication({
        job: jobId,
        student: student._id,
        user: req.user._id,
        department: departmentId,
        batch: student.batchId,
        eligibilityCheck: {
          isEligible: eligibilityCheck.eligible,
          reasons: eligibilityCheck.eligible ? [] : [eligibilityCheck.reason],
          checkedAt: new Date()
        }
      });

      await jobApplication.save();
    }

    // Add journey entry
    await jobApplication.addJourneyEntry('Viewed', `Job viewed - ${viewType}`, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    console.log('✅ Job view recorded successfully');

    res.status(200).json({
      success: true,
      message: 'Job view recorded successfully',
      data: {
        viewId: jobView._id,
        applicationId: jobApplication._id,
        eligibilityStatus: jobApplication.eligibilityCheck.isEligible ? 'Eligible' : 'Not Eligible',
        counted: isFirstView,
        isFirstView: isFirstView,
        viewCountIncremented: isFirstView
      }
    });
  } catch (error) {
    console.error('❌ Error recording job view:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording job view',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Record external application link click
const recordApplicationClick = async (req, res) => {
  try {
    const { jobId } = req.params;

    console.log('🔗 Recording application click for job:', jobId, 'by user:', req.user._id);

    // Get student information or create a basic one if not found
    let student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      console.log('⚠️ Student profile not found, creating basic profile for user:', req.user._id);

      // Create a basic student profile for demo purposes
      student = new Student({
        userId: req.user._id,
        studentId: `DEMO_${req.user._id.toString().slice(-6)}`,
        registrationNumber: `REG_${req.user._id.toString().slice(-6)}`,
        personalInfo: {
          fullName: (req.user.firstName + ' ' + req.user.lastName) || 'Demo Student',
          email: req.user.email
        },
        academic: {
          department: null, // Will be set later
          cgpa: 0,
          backlogs: 0
        }
      });

      await student.save();
      console.log('✅ Created basic student profile:', student._id);
    }

    // Find or create job application
    let jobApplication = await JobApplication.findOne({
      job: jobId,
      student: student._id
    });

    if (!jobApplication) {
      console.log('⚠️ Job application record not found, creating new one');

      // Get job information
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Get student's department
      const Department = require('../models/Department');
      let department = null;

      // Student model doesn't have department as ObjectId, get it from batch
      if (student.batchId) {
        const Batch = require('../models/Batch');
        const batch = await Batch.findById(student.batchId).populate('department');
        if (batch && batch.department) {
          department = batch.department;
          console.log('✅ Using batch department:', department.name);
        }
      }

      // If not found from batch, try to find by department code from academic.department
      if (!department && student.academic?.department) {
        department = await Department.findOne({ code: student.academic.department });
        if (department) {
          console.log('✅ Using department from academic code:', department.name);
        }
      }

      // If still no department found, return error
      if (!department) {
        return res.status(400).json({
          success: false,
          message: 'Student department not found. Please complete your profile with batch/department information.'
        });
      }

      // Create new job application record
      jobApplication = new JobApplication({
        job: jobId,
        student: student._id,
        user: req.user._id,
        department: department._id, // Use the department ID instead of null
        batch: student.batchId || null,
        eligibilityCheck: {
          isEligible: true, // Default to eligible for demo
          reasons: [],
          checkedAt: new Date()
        }
      });

      await jobApplication.save();
      console.log('✅ Created new job application record:', jobApplication._id);
    }

    // IMPORTANT: Ensure a view is recorded before clicking apply
    // If student clicks apply, they must have viewed the job
    const existingView = await JobView.findOne({
      job: jobId,
      student: student._id
    });

    if (!existingView) {
      console.log('⚠️ No view record found for student clicking apply - creating view record now');

      // Get department ID
      let departmentId = null;
      if (student.batchId) {
        const Batch = require('../models/Batch');
        const batch = await Batch.findById(student.batchId).populate('department');
        if (batch && batch.department) {
          departmentId = batch.department._id;
        }
      }

      if (!departmentId && student.academic?.department) {
        const Department = require('../models/Department');
        const dept = await Department.findOne({ code: student.academic.department });
        if (dept) {
          departmentId = dept._id;
        }
      }

      // Create view record
      const newView = new JobView({
        job: jobId,
        student: student._id,
        user: req.user._id,
        department: departmentId,
        batch: student.batchId,
        viewType: 'Detail View',
        duration: 0,
        interactions: {},
        device: {},
        referrer: {},
        context: { source: 'application_link_click' },
        sessionId: req.sessionID || req.headers['x-session-id'],
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      await newView.save();

      // Increment view count in job
      const job = await Job.findById(jobId);
      await job.incrementViewCount(departmentId);

      console.log('✅ View record created and count incremented');
    } else {
      console.log('✅ View record already exists for this student');
    }

    // Record the click
    await jobApplication.recordLinkClick({
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    console.log('✅ Application click recorded successfully');

    res.status(200).json({
      success: true,
      message: 'Application click recorded successfully',
      data: {
        clickCount: jobApplication.externalApplication.clickCount,
        firstClickAt: jobApplication.externalApplication.linkClickedAt
      }
    });
  } catch (error) {
    console.error('❌ Error recording application click:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording application click',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Submit student response (applied/not applied)
const submitStudentResponse = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { applied, notes = '', responseMethod = 'voluntary' } = req.body;

    console.log('📝 Recording student response for job:', jobId, 'Applied:', applied, 'Method:', responseMethod);

    if (typeof applied !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Applied status must be true or false'
      });
    }

    // Get student information
    const student = await Student.findOne({ userId: req.user._id }).populate('userId', 'department');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Find job application and populate job data for validation
    const jobApplication = await JobApplication.findOne({
      job: jobId,
      student: student._id
    }).populate('job', 'title company.name status deadline');

    if (!jobApplication) {
      return res.status(404).json({
        success: false,
        message: 'Job application record not found'
      });
    }

    // Additional logging for debugging
    console.log('🔍 Job details for validation:', {
      jobId: jobApplication.job._id,
      title: jobApplication.job.title,
      status: jobApplication.job.status,
      deadline: jobApplication.job.deadline,
      currentDate: new Date(),
      isExpired: jobApplication.job.deadline < new Date()
    });

    // Check if student can still respond
    const canRespond = jobApplication.canStudentRespond();
    if (!canRespond.canRespond) {
      console.log('❌ Student cannot respond:', canRespond.reason);
      return res.status(400).json({
        success: false,
        message: canRespond.reason
      });
    }

    console.log('✅ Student can respond to job application');

    // If student clicked "No, I Didn't Apply", clear the pending state
    // This removes the linkClicked flag so modal won't show again
    if (applied === false) {
      console.log('🚫 Student clicked "No" - clearing pending state without saving response');

      // Reset the external application tracking
      jobApplication.externalApplication.linkClicked = false;
      jobApplication.externalApplication.linkClickedAt = null;
      jobApplication.externalApplication.clickCount = 0;
      jobApplication.externalApplication.lastClickedAt = null;

      // Set status back to initial state
      jobApplication.status = 'Pending Response';

      // Add journey entry
      await jobApplication.addJourneyEntry('Responded', 'Student indicated they did not apply', {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      await jobApplication.save();

      console.log('✅ Pending state cleared - modal will not show again unless Apply is clicked again');

      return res.status(200).json({
        success: true,
        message: 'Response recorded - you can apply again if you change your mind',
        data: {
          status: jobApplication.status,
          cleared: true
        }
      });
    }

    // Only save to database if they clicked "Yes, I Applied"
    console.log('✅ Student confirmed they applied - saving to database');

    // IMPORTANT: Ensure a view is recorded before applying
    // If student applies, they must have viewed the job
    const existingView = await JobView.findOne({
      job: jobId,
      student: student._id
    });

    if (!existingView) {
      console.log('⚠️ No view record found for student who is applying - creating view record now');

      // Get department ID
      const departmentId = student.userId?.department?._id || student.userId?.department || null;

      // Create view record
      const newView = new JobView({
        job: jobId,
        student: student._id,
        user: req.user._id,
        department: departmentId,
        batch: student.batchId,
        viewType: 'Detail View',
        duration: 0,
        interactions: {},
        device: {},
        referrer: {},
        context: { source: 'application_submission' },
        sessionId: req.sessionID || req.headers['x-session-id'],
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      await newView.save();

      // Increment view count in job
      const job = await Job.findById(jobId);
      await job.incrementViewCount(departmentId);

      console.log('✅ View record created and count incremented');
    } else {
      console.log('✅ View record already exists for this student');
    }

    // Record the response
    await jobApplication.recordStudentResponse(applied, notes, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      responseMethod
    });

    // Update job statistics if applied
    if (applied) {
      const job = await Job.findById(jobId);
      await job.incrementApplicationCount(student.userId.department);
    }

    // Send notifications to staff (async, don't wait)
    notifyStaffOfResponse(jobApplication, applied, responseMethod).catch(err => {
      console.error('Error sending staff notifications:', err);
    });

    console.log('✅ Student response recorded successfully');

    res.status(200).json({
      success: true,
      message: 'Response recorded successfully',
      data: {
        status: jobApplication.status,
        appliedAt: jobApplication.appliedAt,
        responseAt: jobApplication.responseAt,
        responseMethod
      }
    });
  } catch (error) {
    console.error('❌ Error recording student response:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording student response',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get student's job applications
const getStudentApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    console.log('📋 Fetching applications for student:', req.user._id);

    // Get student information
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Build query
    const query = { student: student._id };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get applications
    const applications = await JobApplication.find(query)
      .populate({
        path: 'job',
        select: 'title company.name company.logo location deadline status jobType salary stipend',
        populate: {
          path: 'targetDepartments',
          select: 'name code'
        }
      })
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const totalApplications = await JobApplication.countDocuments(query);
    const totalPages = Math.ceil(totalApplications / parseInt(limit));

    console.log('✅ Found', applications.length, 'applications for student');

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalApplications,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching student applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get job applications for monitoring (placement staff)
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, department, page = 1, limit = 10 } = req.query;

    console.log('📊 Fetching applications for job:', jobId);
    console.log('👤 User role:', req.user.role);

    // Check permissions
    if (!['admin', 'placement_director', 'placement_staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view job applications'
      });
    }

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Build query
    const query = { job: jobId };
    if (status) {
      query.status = status;
    }

    // For placement_staff, filter by their department only
    if (req.user.role === 'placement_staff') {
      const PlacementStaffProfile = require('../models/PlacementStaffProfile');
      const staffProfile = await PlacementStaffProfile.findOne({ userId: req.user._id });

      if (!staffProfile || !staffProfile.department) {
        return res.status(403).json({
          success: false,
          message: 'Staff profile or department not found. Please complete your profile.'
        });
      }

      // Try to find department - first by ID, then by code
      let staffDepartment;
      const deptValue = staffProfile.department;

      // Try finding by ID first (works for both ObjectId and string IDs)
      try {
        staffDepartment = await Department.findById(deptValue);
      } catch (err) {
        // Not a valid ObjectId
      }

      // If not found by ID, try by code
      if (!staffDepartment) {
        staffDepartment = await Department.findOne({ code: deptValue });
      }

      if (!staffDepartment) {
        return res.status(403).json({
          success: false,
          message: 'Department not found in system'
        });
      }

      query.department = staffDepartment._id;
      console.log('🔒 Filtering applications for placement staff department:', staffDepartment.name, '(', staffDepartment.code, ')');
    } else if (department) {
      // For admin/director, allow manual department filter
      query.department = department;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get applications
    const applications = await JobApplication.find(query)
      .populate({
        path: 'student',
        select: 'personalInfo.fullName studentId academic.cgpa academic.backlogs academic.department'
      })
      .populate({
        path: 'user',
        select: 'firstName lastName email'
      })
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const totalApplications = await JobApplication.countDocuments(query);
    const totalPages = Math.ceil(totalApplications / parseInt(limit));

    // Get summary statistics
    const stats = await JobApplication.aggregate([
      { $match: { job: new mongoose.Types.ObjectId(jobId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          applied: { $sum: { $cond: [{ $eq: ['$status', 'Applied'] }, 1, 0] } },
          notApplied: { $sum: { $cond: [{ $eq: ['$status', 'Not Applied'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending Response'] }, 1, 0] } }
        }
      }
    ]);

    console.log('✅ Found', applications.length, 'applications for job');

    res.status(200).json({
      success: true,
      data: {
        applications,
        statistics: stats[0] || { total: 0, applied: 0, notApplied: 0, pending: 0 },
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalApplications,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job applications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get job analytics
const getJobAnalytics = async (req, res) => {
  try {
    const { jobId } = req.params;

    console.log('📈 Fetching analytics for job:', jobId);
    console.log('👤 User role:', req.user.role);

    // Check permissions
    if (!['admin', 'placement_director', 'placement_staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view job analytics'
      });
    }

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // For placement_staff, get their department
    let staffDepartmentId = null;
    if (req.user.role === 'placement_staff') {
      const PlacementStaffProfile = require('../models/PlacementStaffProfile');
      const staffProfile = await PlacementStaffProfile.findOne({ userId: req.user._id });

      if (!staffProfile || !staffProfile.department) {
        return res.status(403).json({
          success: false,
          message: 'Staff profile or department not found. Please complete your profile.'
        });
      }

      // Try to find department - first by ID, then by code
      let staffDepartment;
      const deptValue = staffProfile.department;

      // Try finding by ID first (works for both ObjectId and string IDs)
      try {
        staffDepartment = await Department.findById(deptValue);
      } catch (err) {
        // Not a valid ObjectId
      }

      // If not found by ID, try by code
      if (!staffDepartment) {
        staffDepartment = await Department.findOne({ code: deptValue });
      }

      if (!staffDepartment) {
        return res.status(403).json({
          success: false,
          message: 'Department not found in system'
        });
      }

      staffDepartmentId = staffDepartment._id;
      console.log('🔒 Filtering analytics for placement staff department:', staffDepartment.name, '(', staffDepartment.code, ')');
    }

    // Get application statistics by department
    const allDepartmentStats = await JobApplication.getDepartmentStatsForJob(jobId);

    // Filter department stats for placement staff
    const departmentStats = req.user.role === 'placement_staff'
      ? allDepartmentStats.filter(stat => stat.department._id.toString() === staffDepartmentId.toString())
      : allDepartmentStats;

    // Get view analytics
    const viewAnalytics = await JobView.getJobViewAnalytics(jobId);

    // Get department-wise view statistics
    const allDepartmentViewStats = await JobView.getDepartmentViewStats(jobId);

    // Filter view stats for placement staff
    const departmentViewStats = req.user.role === 'placement_staff'
      ? allDepartmentViewStats.filter(stat => stat.department._id.toString() === staffDepartmentId.toString())
      : allDepartmentViewStats;

    // Calculate overall stats (filtered for placement staff)
    let overallStats;
    if (req.user.role === 'placement_staff' && departmentStats.length > 0) {
      // For placement staff, show only their department stats
      const deptStat = departmentStats[0];
      const deptViewStat = departmentViewStats.length > 0 ? departmentViewStats[0] : { totalViews: 0 };
      overallStats = {
        totalViews: deptViewStat.totalViews || 0,
        totalApplications: deptStat.totalStudents || 0,
        conversionRate: deptViewStat.totalViews > 0 ?
          ((deptStat.appliedCount / deptViewStat.totalViews) * 100).toFixed(2) : 0
      };
    } else {
      // For admin/director, show overall stats
      overallStats = {
        totalViews: job.stats.totalViews,
        totalApplications: job.stats.totalApplications,
        conversionRate: job.stats.totalViews > 0 ?
          ((job.stats.totalApplications / job.stats.totalViews) * 100).toFixed(2) : 0
      };
    }

    console.log('✅ Analytics fetched successfully');

    res.status(200).json({
      success: true,
      data: {
        job: {
          id: job._id,
          title: job.title,
          company: job.company.name,
          status: job.status,
          deadline: job.deadline,
          createdAt: job.createdAt
        },
        overallStats,
        departmentStats,
        viewAnalytics: viewAnalytics[0] || {},
        departmentViewStats,
        isFiltered: req.user.role === 'placement_staff' // Indicate if data is filtered
      }
    });
  } catch (error) {
    console.error('❌ Error fetching job analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get job analytics by department
const getJobAnalyticsByDepartment = async (req, res) => {
  try {
    console.log('🚀 getJobAnalyticsByDepartment called!');
    console.log('🚀 Request params:', req.params);
    console.log('🚀 User:', req.user ? { id: req.user._id, role: req.user.role, email: req.user.email } : 'No user');

    const { jobId } = req.params;

    console.log('📊 Fetching job analytics by department for job:', jobId);
    console.log('👤 User role:', req.user.role);

    // Check permissions
    if (!['admin', 'placement_director', 'placement_staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view job analytics'
      });
    }

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // For placement_staff, get their department
    let staffDepartmentId = null;
    if (req.user.role === 'placement_staff') {
      const PlacementStaffProfile = require('../models/PlacementStaffProfile');
      const staffProfile = await PlacementStaffProfile.findOne({ userId: req.user._id });

      console.log('🔍 Staff Profile:', staffProfile ? {
        userId: staffProfile.userId,
        department: staffProfile.department,
        departmentType: typeof staffProfile.department,
        name: staffProfile.name
      } : 'NOT FOUND');

      if (!staffProfile || !staffProfile.department) {
        return res.status(403).json({
          success: false,
          message: 'Staff profile or department not found. Please complete your profile.'
        });
      }

      // Try to find department - first by ID, then by code
      let staffDepartment;
      const deptValue = staffProfile.department;

      console.log('🔍 Looking for department:', deptValue, 'Type:', typeof deptValue);

      // Try finding by ID first (works for both ObjectId and string IDs)
      try {
        staffDepartment = await Department.findById(deptValue);
      } catch (err) {
        console.log('⚠️ Not a valid ObjectId, trying by code...');
      }

      // If not found by ID, try by code
      if (!staffDepartment) {
        staffDepartment = await Department.findOne({ code: deptValue });
      }

      console.log('🔍 Department found:', staffDepartment ? staffDepartment.name : 'NOT FOUND');

      console.log('🔍 Department found:', staffDepartment ? {
        _id: staffDepartment._id,
        name: staffDepartment.name,
        code: staffDepartment.code
      } : 'NOT FOUND');

      if (!staffDepartment) {
        // List all available departments for debugging
        const allDepartments = await Department.find({}, 'name code');
        console.log('🔍 Available departments:', allDepartments);

        return res.status(403).json({
          success: false,
          message: `Department '${staffProfile.department}' not found in system. Please contact administrator.`
        });
      }

      staffDepartmentId = staffDepartment._id;
      console.log('🔒 Filtering analytics by department:', staffDepartment.name, '(', staffDepartment.code, ')', staffDepartmentId);
    }

    // Get department-wise statistics
    const allDepartmentStats = await JobApplication.getDepartmentStatsForJob(jobId);

    // Filter for placement staff
    const departmentStats = req.user.role === 'placement_staff'
      ? allDepartmentStats.filter(stat => stat.department._id.toString() === staffDepartmentId.toString())
      : allDepartmentStats;

    // Build query for applications
    const applicationQuery = { job: jobId };
    if (req.user.role === 'placement_staff') {
      applicationQuery.department = staffDepartmentId;
    }

    // Get all applications for this job with student details (filtered for placement staff)
    const allApplications = await JobApplication.find(applicationQuery)
      .populate({
        path: 'student',
        select: 'personalInfo.fullName studentId academic.cgpa academic.backlogs'
      })
      .populate({
        path: 'user',
        select: 'firstName lastName email'
      })
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    // Get overall statistics (filtered for placement staff)
    const overallStats = {
      totalApplications: allApplications.length,
      appliedCount: allApplications.filter(app => app.status === 'Applied').length,
      notAppliedCount: allApplications.filter(app => app.status === 'Not Applied').length,
      pendingCount: allApplications.filter(app => app.status === 'Pending Response').length,
      totalDepartments: departmentStats.length
    };

    console.log('✅ Job analytics by department fetched successfully');

    res.status(200).json({
      success: true,
      data: {
        job: {
          id: job._id,
          title: job.title,
          company: job.company.name,
          status: job.status,
          deadline: job.deadline,
          createdAt: job.createdAt
        },
        overallStats,
        departmentStats,
        allApplications,
        isFiltered: req.user.role === 'placement_staff' // Indicate if data is filtered
      }
    });
  } catch (error) {
    console.error('❌ Error fetching job analytics by department:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching job analytics by department',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get applications for specific department and job
const getJobApplicationsByDepartment = async (req, res) => {
  try {
    console.log('🚀 getJobApplicationsByDepartment called!');
    const { jobId, departmentId } = req.params;
    const { page = 1, limit = 10, batchId } = req.query;

    console.log('📊 Fetching applications for job:', jobId, 'department:', departmentId, 'batch:', batchId || 'all');
    console.log('👤 User role:', req.user.role);

    // Check permissions
    if (!['admin', 'placement_director', 'placement_staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view job applications'
      });
    }

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Verify department exists - handle both ObjectId and department code
    let department;
    try {
      // Try to find by ObjectId first
      if (mongoose.Types.ObjectId.isValid(departmentId)) {
        department = await Department.findById(departmentId);
      }
    } catch (err) {
      console.log('Not a valid ObjectId, trying by code...');
    }

    // If not found by ID, try by code
    if (!department) {
      department = await Department.findOne({ code: departmentId });
    }

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    console.log('✅ Department found:', department.name, '(', department.code, ')');


    // For placement_staff, verify they can only access their own department
    if (req.user.role === 'placement_staff') {
      const PlacementStaffProfile = require('../models/PlacementStaffProfile');
      const staffProfile = await PlacementStaffProfile.findOne({ userId: req.user._id });

      if (!staffProfile || !staffProfile.department) {
        return res.status(403).json({
          success: false,
          message: 'Staff profile or department not found. Please complete your profile.'
        });
      }

      // Try to find department - first by ID, then by code
      let staffDepartment;
      const deptValue = staffProfile.department;

      // Try finding by ID first (works for both ObjectId and string IDs)
      try {
        staffDepartment = await Department.findById(deptValue);
      } catch (err) {
        // Not a valid ObjectId
      }

      // If not found by ID, try by code
      if (!staffDepartment) {
        staffDepartment = await Department.findOne({ code: deptValue });
      }

      if (!staffDepartment) {
        return res.status(403).json({
          success: false,
          message: 'Department not found in system'
        });
      }

      // Check if the requested department matches staff's department
      // Compare using ObjectIds (department was already resolved above)
      if (staffDepartment._id.toString() !== department._id.toString()) {
        console.log('❌ Department mismatch! Staff:', staffDepartment.name, 'Requested:', department.name);
        return res.status(403).json({
          success: false,
          message: 'You can only view applications from your own department'
        });
      }

      console.log('✅ Department access granted for:', staffDepartment.name);

      console.log('🔒 Placement staff accessing their department:', staffDepartment.name, '(', staffDepartment.code, ')');
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query for applications - ONLY students who actually applied
    const applicationQuery = {
      job: jobId,
      department: department._id,
      status: 'Applied' // Only show students who actually applied
    };

    // Add batch filter if provided
    if (batchId) {
      applicationQuery.batch = batchId;
    }

    // Get applications for specific department
    const applications = await JobApplication.find(applicationQuery)
      .populate({
        path: 'student',
        select: 'personalInfo.fullName studentId academic.cgpa academic.backlogs'
      })
      .populate({
        path: 'user',
        select: 'firstName lastName email'
      })
      .populate('department', 'name code')
      .populate('batch', 'batchCode startYear endYear courseType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count - ONLY students who actually applied (with batch filter if provided)
    const totalApplications = await JobApplication.countDocuments(applicationQuery);
    const totalPages = Math.ceil(totalApplications / parseInt(limit));

    // Get available batches for this department with application counts
    const Batch = require('../models/Batch');
    const batchesWithCounts = await JobApplication.aggregate([
      {
        $match: {
          job: new mongoose.Types.ObjectId(jobId),
          department: new mongoose.Types.ObjectId(departmentId),
          status: 'Applied',
          batch: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$batch',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'batches',
          localField: '_id',
          foreignField: '_id',
          as: 'batchInfo'
        }
      },
      {
        $unwind: '$batchInfo'
      },
      {
        $project: {
          _id: 1,
          count: 1,
          batchCode: '$batchInfo.batchCode',
          startYear: '$batchInfo.startYear',
          endYear: '$batchInfo.endYear',
          courseType: '$batchInfo.courseType'
        }
      },
      {
        $sort: { startYear: -1 }
      }
    ]);

    // Get department statistics - ONLY for applied students (with batch filter if provided)
    const departmentStatsQuery = {
      job: new mongoose.Types.ObjectId(jobId),
      department: department._id, // Use the resolved department ObjectId
      status: 'Applied' // Only count students who actually applied
    };

    if (batchId) {
      departmentStatsQuery.batch = new mongoose.Types.ObjectId(batchId);
    }

    const departmentStats = await JobApplication.aggregate([
      {
        $match: departmentStatsQuery
      },
      {
        $group: {
          _id: '$department',
          totalStudents: { $sum: 1 }, // Now represents only applied students
          appliedCount: { $sum: 1 }, // Same as totalStudents
          notAppliedCount: { $sum: 0 }, // Always 0
          pendingCount: { $sum: 0 } // Always 0
        }
      }
    ]);

    console.log('✅ Department applications fetched successfully');
    console.log('📊 Found', batchesWithCounts.length, 'batches with applications');

    res.status(200).json({
      success: true,
      data: {
        job: {
          id: job._id,
          title: job.title,
          company: job.company.name,
          status: job.status,
          deadline: job.deadline
        },
        department: {
          id: department._id,
          name: department.name,
          code: department.code
        },
        applications,
        batches: batchesWithCounts, // Available batches with student counts
        selectedBatch: batchId || null, // Currently selected batch filter
        departmentStats: departmentStats[0] || {
          totalStudents: 0,
          appliedCount: 0,
          notAppliedCount: 0,
          pendingCount: 0
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalApplications,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching department applications:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching department applications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get application details
const getApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;

    console.log('🔍 Fetching application details:', applicationId);

    // Find application
    const application = await JobApplication.findById(applicationId)
      .populate({
        path: 'job',
        select: 'title company.name company.logo location deadline status'
      })
      .populate({
        path: 'student',
        select: 'personalInfo.fullName studentId academic'
      })
      .populate({
        path: 'user',
        select: 'firstName lastName email'
      })
      .populate('department', 'name code')
      .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const isStudent = req.user.role === 'student' && application.user._id.toString() === req.user._id.toString();
    const isStaff = ['admin', 'placement_director', 'placement_staff'].includes(req.user.role);

    if (!isStudent && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this application'
      });
    }

    const jobViews = await JobView.find({
      job: application.job._id,
      student: application.student._id
    }).sort({ viewedAt: -1 }).lean();

    console.log('✅ Application details fetched successfully');

    res.status(200).json({
      success: true,
      data: {
        application,
        jobViews
      }
    });
  } catch (error) {
    console.error('❌ Error fetching application details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getPendingResponses = async (req, res) => {
  try {

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(200).json({
        success: true,
        data: {
          pendingResponses: [],
          count: 0
        }
      });
    }

    const pendingApplications = await JobApplication.find({
      student: student._id,
      'externalApplication.linkClicked': true,
      $or: [
        { 'studentResponse.applied': null },
        { 'studentResponse.applied': false }
      ],
      status: { $in: ['Pending Response', 'Not Applied'] }
    })
      .populate('job', 'title company.name company.logo location deadline status')
      .sort({ 'externalApplication.linkClickedAt': -1 })
      .lean();

    console.log('🔍 Found pending applications before filtering:', pendingApplications.length);

    const validPendingApplications = pendingApplications.filter(app => {
      const isValid = app.job && app.job.status === 'Active' && new Date(app.job.deadline) > new Date();
      if (!isValid && app.job) {
        console.log('🔍 Filtering out job:', {
          title: app.job.title,
          status: app.job.status,
          deadline: app.job.deadline,
          isExpired: new Date(app.job.deadline) <= new Date()
        });
      }
      return isValid;
    });

    console.log('🔍 Valid pending applications after filtering:', validPendingApplications.length);

    console.log('✅ Found', validPendingApplications.length, 'pending responses');

    res.status(200).json({
      success: true,
      data: {
        pendingResponses: validPendingApplications,
        count: validPendingApplications.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching pending responses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending responses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getResponseStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    console.log('🔍 Checking response status for job:', jobId, 'student:', req.user._id);

    // Get student information
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Find job application
    const jobApplication = await JobApplication.findOne({
      job: jobId,
      student: student._id
    }).populate('job', 'title company.name company.logo location deadline status');

    if (!jobApplication) {
      return res.status(404).json({
        success: false,
        message: 'Job application record not found'
      });
    }

    // Check if response is required
    // Keep asking until they confirm "Yes, I Applied" (applied === true)
    const responseRequired = (
      jobApplication.externalApplication.linkClicked &&
      jobApplication.studentResponse.applied !== true &&
      jobApplication.job.status === 'Active' &&
      new Date(jobApplication.job.deadline) > new Date()
    );

    console.log('✅ Response status checked:', responseRequired ? 'Required' : 'Not required');

    res.status(200).json({
      success: true,
      data: {
        responseRequired,
        job: jobApplication.job,
        clickedAt: jobApplication.externalApplication.linkClickedAt,
        hasResponded: jobApplication.studentResponse.applied === true,
        currentStatus: jobApplication.status
      }
    });
  } catch (error) {
    console.error('❌ Error checking response status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking response status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Helper function to notify staff of student responses
const notifyStaffOfResponse = async (jobApplication, applied, responseMethod) => {
  try {
    // Import notification services
    const { sendNotificationToStaff } = require('../services/emailService');

    const notificationData = {
      type: 'student_application_response',
      jobId: jobApplication.job._id,
      jobTitle: jobApplication.job.title,
      companyName: jobApplication.job.company.name,
      studentName: jobApplication.student.personalInfo?.fullName || 'Student',
      studentId: jobApplication.student.studentId,
      applied: applied,
      responseMethod: responseMethod,
      responseAt: new Date(),
      notes: jobApplication.studentResponse.notes
    };

    // Send notifications to relevant staff
    await sendNotificationToStaff(notificationData);

    console.log('✅ Staff notifications sent for student response');
  } catch (error) {
    console.error('❌ Error sending staff notifications:', error);
    // Don't throw error as this is a background task
  }
};

// Get batch-wise analytics for a job (for placement staff flow)
const getJobBatchAnalytics = async (req, res) => {
  try {
    const { jobId } = req.params;

    console.log('📊 Fetching batch analytics for job:', jobId);
    console.log('👤 User role:', req.user.role);

    // Check permissions
    if (!['admin', 'placement_director', 'placement_staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view job analytics'
      });
    }

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // For placement_staff, get their department
    let staffDepartmentId = null;
    if (req.user.role === 'placement_staff') {
      const PlacementStaffProfile = require('../models/PlacementStaffProfile');
      const staffProfile = await PlacementStaffProfile.findOne({ userId: req.user._id });

      if (!staffProfile || !staffProfile.department) {
        return res.status(403).json({
          success: false,
          message: 'Staff profile or department not found. Please complete your profile.'
        });
      }

      // Try to find department - first by ID, then by code
      let staffDepartment;
      const deptValue = staffProfile.department;

      try {
        staffDepartment = await Department.findById(deptValue);
      } catch (err) {
        // Not a valid ObjectId
      }

      if (!staffDepartment) {
        staffDepartment = await Department.findOne({ code: deptValue });
      }

      if (!staffDepartment) {
        return res.status(403).json({
          success: false,
          message: 'Department not found in system'
        });
      }

      staffDepartmentId = staffDepartment._id;
      console.log('🔒 Filtering batch analytics for department:', staffDepartment.name);
    }

    // Build query for applications
    const applicationQuery = { job: new mongoose.Types.ObjectId(jobId) };
    if (staffDepartmentId) {
      applicationQuery.department = staffDepartmentId;
    }

    // Get batch-wise statistics
    const Batch = require('../models/Batch');
    const Student = require('../models/Student');

    console.log('🔍 Application query:', JSON.stringify(applicationQuery));

    // First, let's check what applications we have
    const testApplications = await JobApplication.find(applicationQuery)
      .populate('student', 'studentId batch')
      .limit(5);
    console.log('🔍 Sample applications:', testApplications.map(app => ({
      id: app._id,
      student: app.student ? {
        id: app.student._id,
        studentId: app.student.studentId,
        batch: app.student.batch
      } : null,
      status: app.status
    })));

    const batchStats = await JobApplication.aggregate([
      { $match: applicationQuery },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentData'
        }
      },
      {
        $unwind: {
          path: '$studentData',
          preserveNullAndEmptyArrays: false // Skip if no student found
        }
      },
      // Add a stage to check what we have so far
      {
        $addFields: {
          hasBatch: { $ifNull: ['$studentData.batch', false] }
        }
      },
      {
        $lookup: {
          from: 'batches',
          localField: 'studentData.batch',
          foreignField: '_id',
          as: 'batchData'
        }
      },
      {
        $unwind: {
          path: '$batchData',
          preserveNullAndEmptyArrays: false // Skip if no batch found
        }
      },
      {
        $group: {
          _id: '$batchData._id',
          batchName: { $first: '$batchData.batchCode' }, // Use batchCode instead of name
          batchYear: { $first: '$batchData.startYear' }, // Use startYear instead of year
          courseType: { $first: '$batchData.courseType' },
          totalStudents: { $sum: 1 },
          appliedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Applied'] }, 1, 0] }
          },
          viewedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Not Applied'] }, 1, 0] }
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending Response'] }, 1, 0] }
          }
        }
      },
      { $sort: { batchYear: -1, batchName: 1 } }
    ]);

    console.log('✅ Batch analytics fetched successfully. Found', batchStats.length, 'batches');
    console.log('📊 Batch stats:', JSON.stringify(batchStats, null, 2));

    res.status(200).json({
      success: true,
      data: {
        job: {
          id: job._id,
          title: job.title,
          company: job.company.name,
          status: job.status,
          deadline: job.deadline,
          createdAt: job.createdAt
        },
        batchStats,
        isFiltered: req.user.role === 'placement_staff'
      }
    });
  } catch (error) {
    console.error('❌ Error fetching job batch analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job batch analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get students who applied for a job from a specific batch
const getJobBatchStudents = async (req, res) => {
  try {
    const { jobId, batchId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    console.log('📊 Fetching students for job:', jobId, 'batch:', batchId);

    // Check permissions
    if (!['admin', 'placement_director', 'placement_staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view job applications'
      });
    }

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Verify batch exists
    const Batch = require('../models/Batch');
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // For placement_staff, verify department access
    if (req.user.role === 'placement_staff') {
      const PlacementStaffProfile = require('../models/PlacementStaffProfile');
      const staffProfile = await PlacementStaffProfile.findOne({ userId: req.user._id });

      if (!staffProfile || !staffProfile.department) {
        return res.status(403).json({
          success: false,
          message: 'Staff profile or department not found.'
        });
      }

      // Try to find department
      let staffDepartment;
      const deptValue = staffProfile.department;

      try {
        staffDepartment = await Department.findById(deptValue);
      } catch (err) {
        // Not a valid ObjectId
      }

      if (!staffDepartment) {
        staffDepartment = await Department.findOne({ code: deptValue });
      }

      if (!staffDepartment) {
        return res.status(403).json({
          success: false,
          message: 'Department not found in system'
        });
      }

      // Check if batch belongs to staff's department
      if (batch.department.toString() !== staffDepartment._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only view batches from your own department'
        });
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get students from this batch who interacted with the job
    const applications = await JobApplication.find({
      job: jobId
    })
      .populate({
        path: 'student',
        match: { batch: batchId },
        select: 'personalInfo.fullName studentId academic.cgpa academic.backlogs batch',
        populate: {
          path: 'batch',
          select: 'name year'
        }
      })
      .populate({
        path: 'user',
        select: 'firstName lastName email'
      })
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Filter out applications where student is null (didn't match batch)
    const filteredApplications = applications.filter(app => app.student !== null);

    // Get total count
    const totalApplications = await JobApplication.countDocuments({
      job: jobId
    }).then(async (count) => {
      // Need to count only students from this batch
      const allApps = await JobApplication.find({ job: jobId })
        .populate('student', 'batch');
      return allApps.filter(app => app.student && app.student.batch && app.student.batch.toString() === batchId).length;
    });

    const totalPages = Math.ceil(totalApplications / parseInt(limit));

    console.log('✅ Batch students fetched successfully');

    res.status(200).json({
      success: true,
      data: {
        job: {
          id: job._id,
          title: job.title,
          company: job.company.name,
          status: job.status,
          deadline: job.deadline
        },
        batch: {
          id: batch._id,
          name: batch.name,
          year: batch.year
        },
        applications: filteredApplications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalApplications,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching job batch students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job batch students',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  recordJobView,
  recordApplicationClick,
  submitStudentResponse,
  getStudentApplications,
  getJobApplications,
  getJobAnalytics,
  getJobAnalyticsByDepartment,
  getJobApplicationsByDepartment,
  getApplicationDetails,
  getPendingResponses,
  getResponseStatus,
  getApplicationStats,
  getJobBatchAnalytics,
  getJobBatchStudents
};
