const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const JobView = require('../models/JobView');
const User = require('../models/User');
const Student = require('../models/Student');
const Department = require('../models/Department');

// Get all jobs with filtering and pagination
const getAllJobs = async (req, res) => {
  try {
    console.log('📋 Fetching jobs - Request params:', req.query);
    console.log('👤 User making request:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');

    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '',
      department = '',
      jobType = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      all = false 
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Role-based filtering
    if (req.user.role === 'placement_staff') {
      // Placement staff can only see jobs, not create them
      filter.status = { $in: ['Active', 'Closed', 'Expired'] };
    } else if (req.user.role === 'student') {
      // Students can only see active jobs for their department
      filter.status = 'Active';
      filter.deadline = { $gt: new Date() };
      
      // Filter by student's department
      const student = await Student.findOne({ userId: req.user._id }).populate('userId', 'department');
      if (student && student.userId.department) {
        filter.$or = [
          { postingType: 'All Departments' },
          { targetDepartments: student.userId.department },
          { 'eligibility.departments': student.userId.department }
        ];
      }
    } else if (!['admin', 'placement_director'].includes(req.user.role)) {
      // Other roles have limited access
      filter.status = { $in: ['Active', 'Closed'] };
    }
    
    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status) {
      filter.status = status;
    }
    
    // Job type filter
    if (jobType) {
      filter.jobType = jobType;
    }
    
    // Department filter
    if (department) {
      filter.$or = [
        { targetDepartments: department },
        { 'eligibility.departments': department }
      ];
    }

    console.log('🔍 Filter applied:', JSON.stringify(filter, null, 2));

    // Calculate pagination
    let skip, actualLimit;
    if (all === 'true' || all === true) {
      skip = 0;
      actualLimit = 0;
      console.log('📄 Fetching ALL jobs (no pagination)');
    } else {
      skip = (parseInt(page) - 1) * parseInt(limit);
      actualLimit = parseInt(limit);
      console.log('📄 Pagination - Skip:', skip, 'Limit:', actualLimit);
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get jobs with population
    const jobs = await Job.find(filter)
      .populate({
        path: 'targetDepartments',
        select: 'name code',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'eligibility.departments',
        select: 'name code',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'createdBy',
        select: 'firstName lastName email role',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'updatedBy',
        select: 'firstName lastName email',
        options: { strictPopulate: false }
      })
      .sort(sortObj)
      .skip(skip)
      .limit(actualLimit || undefined)
      .lean();

    console.log('✅ Jobs found:', jobs.length);

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(filter);
    const totalPages = all === 'true' || all === true ? 1 : Math.ceil(totalJobs / parseInt(limit));

    console.log('📊 Pagination info - Total:', totalJobs, 'Pages:', totalPages);

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalJobs,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get single job
const getJob = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Fetching single job with ID:', id);

    const job = await Job.findById(id)
      .populate('targetDepartments', 'name code')
      .populate('eligibility.departments', 'name code')
      .populate('createdBy', 'firstName lastName email role')
      .populate('updatedBy', 'firstName lastName email')
      .lean();
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Role-based access control
    if (req.user.role === 'student') {
      // Students can only view active jobs they're eligible for
      if (job.status !== 'Active' || job.deadline <= new Date()) {
        return res.status(403).json({
          success: false,
          message: 'Job is not available'
        });
      }
      
      // Check if student is eligible
      const student = await Student.findOne({ userId: req.user._id }).populate('userId', 'department');
      if (student) {
        const eligibilityCheck = await Job.findById(id).then(jobDoc => jobDoc.isStudentEligible(student));
        if (!eligibilityCheck.eligible) {
          return res.status(403).json({
            success: false,
            message: eligibilityCheck.reason
          });
        }
      }
    }

    console.log('✅ Job found:', job.title);

    res.status(200).json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error('❌ Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Helper function to reconstruct nested objects from FormData
const reconstructNestedObject = (body) => {
  const result = {};
  
  Object.keys(body).forEach(key => {
    const value = body[key];
    
    if (key.includes('.')) {
      // Handle nested properties like 'company.name', 'salary.min', etc.
      const keys = key.split('.');
      let current = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      // Handle array fields that were JSON stringified
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        try {
          current[keys[keys.length - 1]] = JSON.parse(value);
        } catch (e) {
          current[keys[keys.length - 1]] = value;
        }
      } else {
        current[keys[keys.length - 1]] = value;
      }
    } else {
      // Handle array fields that were JSON stringified
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        try {
          result[key] = JSON.parse(value);
        } catch (e) {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    }
  });
  
  return result;
};

// Create new job
const createJob = async (req, res) => {
  try {
    console.log('🏗️ Creating new job - Raw request body:', req.body);
    console.log('👤 User creating job:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');

    // Check permissions
    if (!['admin', 'placement_director'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create jobs'
      });
    }

    // Reconstruct nested objects from FormData
    const reconstructedBody = reconstructNestedObject(req.body);
    console.log('🔄 Reconstructed body:', JSON.stringify(reconstructedBody, null, 2));

    const {
      title,
      company,
      description,
      location,
      jobType,
      applicationLink,
      deadline,
      salary,
      stipend,
      eligibility,
      postingType,
      targetDepartments,
      documents,
      status = 'Draft',
      // Enhanced fields
      keyResponsibilities,
      requirements,
      skillsRequired,
      otherRequirements,
      workMode,
      startDate,
      numberOfOpenings,
      probation,
      workEnvironmentRequirements,
      benefits,
      educationQualifications
    } = reconstructedBody;

    const userId = req.user._id;

    // Validate required fields
    if (!title || !company?.name || !description || !location || !applicationLink || !deadline || !postingType) {
      console.log('❌ Validation failed - Missing fields:', {
        title: !!title,
        companyName: !!company?.name,
        description: !!description,
        location: !!location,
        applicationLink: !!applicationLink,
        deadline: !!deadline,
        postingType: !!postingType
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, company name, description, location, application link, deadline, and posting type are required'
      });
    }

    // Validate deadline
    if (new Date(deadline) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Deadline must be in the future'
      });
    }

    // Validate departments if specified
    if (targetDepartments && targetDepartments.length > 0) {
      const validDepartments = await Department.find({ _id: { $in: targetDepartments } });
      if (validDepartments.length !== targetDepartments.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more selected departments are invalid'
        });
      }
    }

    // Validate eligibility departments if specified
    if (eligibility?.departments && eligibility.departments.length > 0) {
      const validEligibilityDepts = await Department.find({ _id: { $in: eligibility.departments } });
      if (validEligibilityDepts.length !== eligibility.departments.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more eligibility departments are invalid'
        });
      }
    }

    // Create job data
    const jobData = {
      title: title.trim(),
      company: {
        name: company.name.trim(),
        logo: company.logo || null,
        website: company.website?.trim() || undefined,
        about: company.about?.trim() || undefined,
        size: company.size?.trim() || undefined,
        industry: company.industry?.trim() || undefined,
        founded: company.founded ? parseInt(company.founded) || undefined : undefined
      },
      description: description.trim(),
      location: location.trim(),
      jobType: jobType || 'Full-time',
      applicationLink: applicationLink.trim(),
      deadline: new Date(deadline),
      salary: salary || {},
      stipend: stipend || {},
      eligibility: eligibility || {},
      postingType,
      targetDepartments: targetDepartments || [],
      documents: documents || [],
      status,
      createdBy: userId,
      // Enhanced fields
      keyResponsibilities: keyResponsibilities || [],
      requirements: requirements || [],
      skillsRequired: skillsRequired || [],
      otherRequirements: Array.isArray(otherRequirements) ? otherRequirements : (otherRequirements?.trim() || null),
      workMode: workMode || 'On-site',
      startDate: startDate || null,
      numberOfOpenings: numberOfOpenings || 1,
      probation: probation || { hasProbation: false },
      workEnvironmentRequirements: workEnvironmentRequirements || [],
      benefits: benefits || [],
      educationQualifications: educationQualifications || []
    };

    console.log('🏗️ Creating job with data:', JSON.stringify(jobData, null, 2));

    const job = new Job(jobData);
    await job.save();

    console.log('✅ Job created successfully with ID:', job._id);

    // If job is published, create job applications for eligible students
    if (status === 'Active') {
      await createJobApplicationsForStudents(job._id);
    }

    // Return basic job data
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job }
    });
  } catch (error) {
    console.error('❌ Error creating job:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating job',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update job
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔄 Updating job:', id);

    // Check permissions
    if (!['admin', 'placement_director'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update jobs'
      });
    }

    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user can update this job
    if (req.user.role !== 'admin' && job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update jobs you created'
      });
    }

    // Reconstruct nested objects from FormData
    const reconstructedBody = reconstructNestedObject(req.body);
    console.log('🔄 Reconstructed update body:', JSON.stringify(reconstructedBody, null, 2));

    const updateData = { ...reconstructedBody };
    updateData.updatedBy = req.user._id;

    // Validate deadline if being updated
    if (updateData.deadline && new Date(updateData.deadline) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Deadline must be in the future'
      });
    }

    // Validate departments if being updated
    if (updateData.targetDepartments) {
      const validDepartments = await Department.find({ _id: { $in: updateData.targetDepartments } });
      if (validDepartments.length !== updateData.targetDepartments.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more selected departments are invalid'
        });
      }
    }

    const updatedJob = await Job.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    }).populate('targetDepartments', 'name code')
      .populate('eligibility.departments', 'name code')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    // If job status changed to Active, create applications for students
    if (updateData.status === 'Active' && job.status !== 'Active') {
      await createJobApplicationsForStudents(id);
    }

    console.log('✅ Job updated successfully:', updatedJob.title);

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    console.error('❌ Error updating job:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete job
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check permissions
    if (!['admin', 'placement_director'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete jobs'
      });
    }

    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user can delete this job
    if (req.user.role !== 'admin' && job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete jobs you created'
      });
    }

    // Delete related data
    await JobApplication.deleteMany({ job: id });
    await JobView.deleteMany({ job: id });
    await Job.findByIdAndDelete(id);

    console.log('✅ Job deleted successfully:', job.title);

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get jobs for student dashboard
const getStudentJobs = async (req, res) => {
  try {
    console.log('📋 Fetching jobs for student:', req.user._id);

    // Get student information
    const student = await Student.findOne({ userId: req.user._id }).populate('userId', 'department');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const studentDepartment = student.userId.department;

    // Get active jobs for student's department
    const jobs = await Job.find({
      status: 'Active',
      deadline: { $gt: new Date() },
      $or: [
        { postingType: 'All Departments' },
        { targetDepartments: studentDepartment },
        { 'eligibility.departments': studentDepartment }
      ]
    })
    .populate('targetDepartments', 'name code')
    .populate('eligibility.departments', 'name code')
    .sort({ createdAt: -1 })
    .lean();

    // Filter jobs based on eligibility
    const eligibleJobs = [];
    for (const job of jobs) {
      const jobDoc = await Job.findById(job._id);
      const eligibilityCheck = jobDoc.isStudentEligible(student);
      if (eligibilityCheck.eligible) {
        eligibleJobs.push({
          ...job,
          eligibilityStatus: 'Eligible'
        });
      } else {
        eligibleJobs.push({
          ...job,
          eligibilityStatus: 'Not Eligible',
          eligibilityReason: eligibilityCheck.reason
        });
      }
    }

    // Get student's application status for these jobs
    const jobIds = eligibleJobs.map(job => job._id);
    const applications = await JobApplication.find({
      job: { $in: jobIds },
      student: student._id
    }).lean();

    const applicationMap = {};
    applications.forEach(app => {
      applicationMap[app.job.toString()] = app;
    });

    // Add application status to jobs
    const jobsWithStatus = eligibleJobs.map(job => ({
      ...job,
      applicationStatus: applicationMap[job._id.toString()]?.status || 'Not Viewed',
      hasApplied: applicationMap[job._id.toString()]?.studentResponse?.applied || false,
      applicationDate: applicationMap[job._id.toString()]?.appliedAt || null
    }));

    console.log('✅ Found', jobsWithStatus.length, 'jobs for student');

    res.status(200).json({
      success: true,
      data: {
        jobs: jobsWithStatus,
        studentInfo: {
          department: studentDepartment,
          cgpa: student.academic?.cgpa,
          backlogs: student.academic?.backlogs
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching student jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Helper function to create job applications for eligible students
const createJobApplicationsForStudents = async (jobId) => {
  try {
    console.log('🔄 Creating job applications for job:', jobId);

    const job = await Job.findById(jobId).populate('targetDepartments eligibility.departments');
    if (!job) return;

    // Determine which departments to target
    let targetDepartmentIds = [];
    
    if (job.postingType === 'All Departments') {
      const allDepartments = await Department.find({ isActive: true });
      targetDepartmentIds = allDepartments.map(dept => dept._id);
    } else {
      targetDepartmentIds = [
        ...job.targetDepartments.map(dept => dept._id),
        ...job.eligibility.departments.map(dept => dept._id)
      ];
      // Remove duplicates
      targetDepartmentIds = [...new Set(targetDepartmentIds.map(id => id.toString()))];
    }

    // Get eligible students from target departments
    const students = await Student.find({
      'userId': { $exists: true }
    }).populate({
      path: 'userId',
      match: { 
        department: { $in: targetDepartmentIds },
        role: 'student',
        isActive: true
      }
    });

    const eligibleStudents = students.filter(student => student.userId);

    console.log('👥 Found', eligibleStudents.length, 'students in target departments');

    // Create job applications for eligible students
    const applications = [];
    for (const student of eligibleStudents) {
      // Check if application already exists
      const existingApplication = await JobApplication.findOne({
        job: jobId,
        student: student._id
      });

      if (!existingApplication) {
        // Check eligibility
        const eligibilityCheck = job.isStudentEligible(student);
        
        applications.push({
          job: jobId,
          student: student._id,
          user: student.userId._id,
          department: student.userId.department,
          batch: student.batchId,
          eligibilityCheck: {
            isEligible: eligibilityCheck.eligible,
            reasons: eligibilityCheck.eligible ? [] : [eligibilityCheck.reason],
            checkedAt: new Date()
          }
        });
      }
    }

    if (applications.length > 0) {
      await JobApplication.insertMany(applications);
      console.log('✅ Created', applications.length, 'job applications');
    }

  } catch (error) {
    console.error('❌ Error creating job applications:', error);
  }
};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getStudentJobs
};
