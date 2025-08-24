const mongoose = require('mongoose');
const JobApplication = require('../models/JobApplication');
const JobView = require('../models/JobView');
const Job = require('../models/Job');
const Student = require('../models/Student');
const User = require('../models/User');

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

    console.log('👁️ Recording job view for job:', jobId, 'by user:', req.user._id);

    // Get student information
    const student = await Student.findOne({ userId: req.user._id }).populate('userId', 'department');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Check if job exists and is accessible
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Create or update job view record
    let jobView = await JobView.findOne({
      job: jobId,
      student: student._id,
      sessionId: req.sessionID || req.headers['x-session-id']
    });

    if (jobView) {
      // Update existing view
      jobView.duration = Math.max(jobView.duration, duration);
      jobView.interactions = { ...jobView.interactions, ...interactions };
      jobView.lastInteractionAt = new Date();
    } else {
      // Create new view record
      jobView = new JobView({
        job: jobId,
        student: student._id,
        user: req.user._id,
        department: student.userId.department,
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
    }

    await jobView.save();

    // Update job statistics
    await job.incrementViewCount(student.userId.department);

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
        department: student.userId.department,
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
        eligibilityStatus: jobApplication.eligibilityCheck.isEligible ? 'Eligible' : 'Not Eligible'
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
    });

    if (!jobApplication) {
      return res.status(404).json({
        success: false,
        message: 'Job application record not found'
      });
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
    const { applied, notes = '' } = req.body;

    console.log('📝 Recording student response for job:', jobId, 'Applied:', applied);

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

    // Find job application
    const jobApplication = await JobApplication.findOne({
      job: jobId,
      student: student._id
    });

    if (!jobApplication) {
      return res.status(404).json({
        success: false,
        message: 'Job application record not found'
      });
    }

    // Check if student can still respond
    const canRespond = jobApplication.canStudentRespond();
    if (!canRespond.canRespond) {
      return res.status(400).json({
        success: false,
        message: canRespond.reason
      });
    }

    // Record the response
    await jobApplication.recordStudentResponse(applied, notes, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Update job statistics if applied
    if (applied) {
      const job = await Job.findById(jobId);
      await job.incrementApplicationCount(student.userId.department);
    }

    console.log('✅ Student response recorded successfully');

    res.status(200).json({
      success: true,
      message: 'Response recorded successfully',
      data: {
        status: jobApplication.status,
        appliedAt: jobApplication.appliedAt,
        responseAt: jobApplication.responseAt
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
    if (department) {
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

    // Get application statistics by department
    const departmentStats = await JobApplication.getDepartmentStatsForJob(jobId);

    // Get view analytics
    const viewAnalytics = await JobView.getJobViewAnalytics(jobId);

    // Get department-wise view statistics
    const departmentViewStats = await JobView.getDepartmentViewStats(jobId);

    // Get overall job statistics
    const overallStats = {
      totalViews: job.stats.totalViews,
      totalApplications: job.stats.totalApplications,
      conversionRate: job.stats.totalViews > 0 ? 
        ((job.stats.totalApplications / job.stats.totalViews) * 100).toFixed(2) : 0
    };

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
        departmentViewStats
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

    // Check permissions
    const isStudent = req.user.role === 'student' && application.user._id.toString() === req.user._id.toString();
    const isStaff = ['admin', 'placement_director', 'placement_staff'].includes(req.user.role);

    if (!isStudent && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this application'
      });
    }

    // Get related job views for this student
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

module.exports = {
  recordJobView,
  recordApplicationClick,
  submitStudentResponse,
  getStudentApplications,
  getJobApplications,
  getJobAnalytics,
  getApplicationDetails
};
