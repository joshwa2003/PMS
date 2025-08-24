import api from './api';

const API_BASE_URL = '/jobs';

// ============================================================================
// JOB MANAGEMENT SERVICES
// ============================================================================

/**
 * Get all jobs with filtering and pagination
 * @param {Object} params - Query parameters
 * @returns {Promise} API response
 */
export const getAllJobs = async (params = {}) => {
  try {
    const response = await api.get(API_BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get jobs for student dashboard
 * @returns {Promise} API response
 */
export const getStudentJobs = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/student`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student jobs:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get single job by ID
 * @param {string} jobId - Job ID
 * @returns {Promise} API response
 */
export const getJobById = async (jobId) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job:', error);
    throw error.response?.data || error;
  }
};

/**
 * Create new job
 * @param {Object} jobData - Job data
 * @param {File} companyLogo - Company logo file (optional)
 * @param {File[]} documents - Job documents (optional)
 * @returns {Promise} API response
 */
export const createJob = async (jobData, companyLogo = null, documents = []) => {
  try {
    const formData = new FormData();
    
    // Helper function to append nested object properties
    const appendNestedObject = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const fieldName = prefix ? `${prefix}.${key}` : key;
        
        if (value !== null && value !== undefined) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            // For nested objects, append each property individually
            appendNestedObject(value, fieldName);
          } else if (Array.isArray(value)) {
            // For arrays, stringify them
            formData.append(fieldName, JSON.stringify(value));
          } else {
            // For primitive values, append directly
            formData.append(fieldName, value);
          }
        }
      });
    };
    
    // Append job data with proper nested object handling
    appendNestedObject(jobData);
    
    // Append company logo if provided
    if (companyLogo) {
      formData.append('companyLogo', companyLogo);
    }
    
    // Append documents if provided
    documents.forEach((doc, index) => {
      formData.append('documents', doc);
    });
    
    const response = await api.post(API_BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error.response?.data || error;
  }
};

/**
 * Update job
 * @param {string} jobId - Job ID
 * @param {Object} jobData - Updated job data
 * @param {File} companyLogo - Company logo file (optional)
 * @param {File[]} documents - Job documents (optional)
 * @returns {Promise} API response
 */
export const updateJob = async (jobId, jobData, companyLogo = null, documents = []) => {
  try {
    const formData = new FormData();
    
    // Helper function to append nested object properties
    const appendNestedObject = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const fieldName = prefix ? `${prefix}.${key}` : key;
        
        if (value !== null && value !== undefined) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            // For nested objects, append each property individually
            appendNestedObject(value, fieldName);
          } else if (Array.isArray(value)) {
            // For arrays, stringify them
            formData.append(fieldName, JSON.stringify(value));
          } else {
            // For primitive values, append directly
            formData.append(fieldName, value);
          }
        }
      });
    };
    
    // Append job data with proper nested object handling
    appendNestedObject(jobData);
    
    // Append company logo if provided
    if (companyLogo) {
      formData.append('companyLogo', companyLogo);
    }
    
    // Append documents if provided
    documents.forEach((doc, index) => {
      formData.append('documents', doc);
    });
    
    const response = await api.put(`${API_BASE_URL}/${jobId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating job:', error);
    throw error.response?.data || error;
  }
};

/**
 * Delete job
 * @param {string} jobId - Job ID
 * @returns {Promise} API response
 */
export const deleteJob = async (jobId) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error.response?.data || error;
  }
};

// ============================================================================
// JOB APPLICATION TRACKING SERVICES
// ============================================================================

/**
 * Record job view by student
 * @param {string} jobId - Job ID
 * @param {Object} viewData - View tracking data
 * @returns {Promise} API response
 */
export const recordJobView = async (jobId, viewData = {}) => {
  try {
    const response = await api.post(`${API_BASE_URL}/${jobId}/view`, viewData);
    return response.data;
  } catch (error) {
    console.error('Error recording job view:', error);
    throw error.response?.data || error;
  }
};

/**
 * Record external application link click
 * @param {string} jobId - Job ID
 * @returns {Promise} API response
 */
export const recordApplicationClick = async (jobId) => {
  try {
    const response = await api.post(`${API_BASE_URL}/${jobId}/click`);
    return response.data;
  } catch (error) {
    console.error('Error recording application click:', error);
    throw error.response?.data || error;
  }
};

/**
 * Submit student response (applied/not applied)
 * @param {string} jobId - Job ID
 * @param {boolean} applied - Whether student applied
 * @param {string} notes - Optional notes
 * @returns {Promise} API response
 */
export const submitStudentResponse = async (jobId, applied, notes = '') => {
  try {
    const response = await api.post(`${API_BASE_URL}/${jobId}/response`, {
      applied,
      notes
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting student response:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get job applications for monitoring (placement staff)
 * @param {string} jobId - Job ID
 * @param {Object} params - Query parameters
 * @returns {Promise} API response
 */
export const getJobApplications = async (jobId, params = {}) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${jobId}/applications`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching job applications:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get job analytics and statistics
 * @param {string} jobId - Job ID
 * @returns {Promise} API response
 */
export const getJobAnalytics = async (jobId) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${jobId}/analytics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job analytics:', error);
    throw error.response?.data || error;
  }
};

// ============================================================================
// STUDENT APPLICATION SERVICES
// ============================================================================

/**
 * Get student's job applications
 * @param {Object} params - Query parameters
 * @returns {Promise} API response
 */
export const getStudentApplications = async (params = {}) => {
  try {
    const response = await api.get(`${API_BASE_URL}/applications/my`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching student applications:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get application details
 * @param {string} applicationId - Application ID
 * @returns {Promise} API response
 */
export const getApplicationDetails = async (applicationId) => {
  try {
    const response = await api.get(`${API_BASE_URL}/applications/${applicationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching application details:', error);
    throw error.response?.data || error;
  }
};

// ============================================================================
// UTILITY SERVICES
// ============================================================================

/**
 * Get departments for job posting
 * @returns {Promise} API response
 */
export const getDepartmentsForJobs = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/utils/departments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get available job types
 * @returns {Promise} API response
 */
export const getJobTypes = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/utils/job-types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job types:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get available job statuses
 * @returns {Promise} API response
 */
export const getJobStatuses = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/utils/job-statuses`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job statuses:', error);
    throw error.response?.data || error;
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format salary range for display
 * @param {Object} salary - Salary object
 * @returns {string} Formatted salary string
 */
export const formatSalary = (salary) => {
  if (!salary || (!salary.min && !salary.max)) return 'Not specified';
  
  const formatAmount = (amount) => {
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toString();
  };
  
  const currency = salary.currency || 'INR';
  
  if (salary.min && salary.max) {
    return `${formatAmount(salary.min)} - ${formatAmount(salary.max)} ${currency}`;
  } else if (salary.min) {
    return `${formatAmount(salary.min)}+ ${currency}`;
  } else if (salary.max) {
    return `Up to ${formatAmount(salary.max)} ${currency}`;
  }
  
  return 'Not specified';
};

/**
 * Calculate days until deadline
 * @param {string|Date} deadline - Deadline date
 * @returns {number} Days until deadline
 */
export const getDaysUntilDeadline = (deadline) => {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffTime = deadlineDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if job is expired
 * @param {string|Date} deadline - Deadline date
 * @returns {boolean} Whether job is expired
 */
export const isJobExpired = (deadline) => {
  return new Date(deadline) < new Date();
};

/**
 * Get job status color for UI
 * @param {string} status - Job status
 * @returns {string} Color name for Material-UI
 */
export const getJobStatusColor = (status) => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Draft':
      return 'warning';
    case 'Closed':
      return 'info';
    case 'Expired':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Get application status color for UI
 * @param {string} status - Application status
 * @returns {string} Color name for Material-UI
 */
export const getApplicationStatusColor = (status) => {
  switch (status) {
    case 'Applied':
      return 'success';
    case 'Not Applied':
      return 'error';
    case 'Pending Response':
      return 'warning';
    case 'Not Viewed':
      return 'default';
    default:
      return 'default';
  }
};

export default {
  // Job Management
  getAllJobs,
  getStudentJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  
  // Job Application Tracking
  recordJobView,
  recordApplicationClick,
  submitStudentResponse,
  getJobApplications,
  getJobAnalytics,
  
  // Student Applications
  getStudentApplications,
  getApplicationDetails,
  
  // Utilities
  getDepartmentsForJobs,
  getJobTypes,
  getJobStatuses,
  
  // Helpers
  formatSalary,
  getDaysUntilDeadline,
  isJobExpired,
  getJobStatusColor,
  getApplicationStatusColor
};
