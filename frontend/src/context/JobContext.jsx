import React, { createContext, useContext, useReducer, useCallback } from 'react';
import jobService from '../services/jobService';

// Initial state
const initialState = {
  // Job Management
  jobs: [],
  currentJob: null,
  jobsLoading: false,
  jobsError: null,
  
  // Student Jobs
  studentJobs: [],
  studentJobsLoading: false,
  studentJobsError: null,
  
  // Job Applications
  applications: [],
  applicationsLoading: false,
  applicationsError: null,
  
  // Job Analytics
  analytics: null,
  analyticsLoading: false,
  analyticsError: null,
  
  // Utility Data
  departments: [],
  jobTypes: [],
  jobStatuses: [],
  
  // UI State
  filters: {
    search: '',
    status: '',
    department: '',
    jobType: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    hasNextPage: false,
    hasPrevPage: false
  }
};

// Action types
const ActionTypes = {
  // Loading states
  SET_JOBS_LOADING: 'SET_JOBS_LOADING',
  SET_STUDENT_JOBS_LOADING: 'SET_STUDENT_JOBS_LOADING',
  SET_APPLICATIONS_LOADING: 'SET_APPLICATIONS_LOADING',
  SET_ANALYTICS_LOADING: 'SET_ANALYTICS_LOADING',
  
  // Success states
  SET_JOBS: 'SET_JOBS',
  SET_STUDENT_JOBS: 'SET_STUDENT_JOBS',
  SET_CURRENT_JOB: 'SET_CURRENT_JOB',
  SET_APPLICATIONS: 'SET_APPLICATIONS',
  SET_ANALYTICS: 'SET_ANALYTICS',
  
  // Error states
  SET_JOBS_ERROR: 'SET_JOBS_ERROR',
  SET_STUDENT_JOBS_ERROR: 'SET_STUDENT_JOBS_ERROR',
  SET_APPLICATIONS_ERROR: 'SET_APPLICATIONS_ERROR',
  SET_ANALYTICS_ERROR: 'SET_ANALYTICS_ERROR',
  
  // Utility data
  SET_DEPARTMENTS: 'SET_DEPARTMENTS',
  SET_JOB_TYPES: 'SET_JOB_TYPES',
  SET_JOB_STATUSES: 'SET_JOB_STATUSES',
  
  // UI state
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION',
  RESET_FILTERS: 'RESET_FILTERS',
  
  // CRUD operations
  ADD_JOB: 'ADD_JOB',
  UPDATE_JOB: 'UPDATE_JOB',
  REMOVE_JOB: 'REMOVE_JOB',
  
  // Clear states
  CLEAR_CURRENT_JOB: 'CLEAR_CURRENT_JOB',
  CLEAR_ANALYTICS: 'CLEAR_ANALYTICS',
  CLEAR_ERRORS: 'CLEAR_ERRORS'
};

// Reducer function
const jobReducer = (state, action) => {
  switch (action.type) {
    // Loading states
    case ActionTypes.SET_JOBS_LOADING:
      return { ...state, jobsLoading: action.payload, jobsError: null };
    case ActionTypes.SET_STUDENT_JOBS_LOADING:
      return { ...state, studentJobsLoading: action.payload, studentJobsError: null };
    case ActionTypes.SET_APPLICATIONS_LOADING:
      return { ...state, applicationsLoading: action.payload, applicationsError: null };
    case ActionTypes.SET_ANALYTICS_LOADING:
      return { ...state, analyticsLoading: action.payload, analyticsError: null };
    
    // Success states
    case ActionTypes.SET_JOBS:
      return {
        ...state,
        jobs: action.payload.jobs,
        pagination: action.payload.pagination,
        jobsLoading: false,
        jobsError: null
      };
    case ActionTypes.SET_STUDENT_JOBS:
      return {
        ...state,
        studentJobs: action.payload.jobs,
        studentJobsLoading: false,
        studentJobsError: null
      };
    case ActionTypes.SET_CURRENT_JOB:
      return { ...state, currentJob: action.payload };
    case ActionTypes.SET_APPLICATIONS:
      return {
        ...state,
        applications: action.payload.applications,
        applicationsLoading: false,
        applicationsError: null
      };
    case ActionTypes.SET_ANALYTICS:
      return {
        ...state,
        analytics: action.payload,
        analyticsLoading: false,
        analyticsError: null
      };
    
    // Error states
    case ActionTypes.SET_JOBS_ERROR:
      return { ...state, jobsError: action.payload, jobsLoading: false };
    case ActionTypes.SET_STUDENT_JOBS_ERROR:
      return { ...state, studentJobsError: action.payload, studentJobsLoading: false };
    case ActionTypes.SET_APPLICATIONS_ERROR:
      return { ...state, applicationsError: action.payload, applicationsLoading: false };
    case ActionTypes.SET_ANALYTICS_ERROR:
      return { ...state, analyticsError: action.payload, analyticsLoading: false };
    
    // Utility data
    case ActionTypes.SET_DEPARTMENTS:
      return { ...state, departments: action.payload };
    case ActionTypes.SET_JOB_TYPES:
      return { ...state, jobTypes: action.payload };
    case ActionTypes.SET_JOB_STATUSES:
      return { ...state, jobStatuses: action.payload };
    
    // UI state
    case ActionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case ActionTypes.SET_PAGINATION:
      return { ...state, pagination: action.payload };
    case ActionTypes.RESET_FILTERS:
      return { ...state, filters: initialState.filters };
    
    // CRUD operations
    case ActionTypes.ADD_JOB:
      return { ...state, jobs: [action.payload, ...state.jobs] };
    case ActionTypes.UPDATE_JOB:
      return {
        ...state,
        jobs: state.jobs.map(job => 
          job._id === action.payload._id ? action.payload : job
        ),
        currentJob: state.currentJob?._id === action.payload._id ? action.payload : state.currentJob
      };
    case ActionTypes.REMOVE_JOB:
      return {
        ...state,
        jobs: state.jobs.filter(job => job._id !== action.payload),
        currentJob: state.currentJob?._id === action.payload ? null : state.currentJob
      };
    
    // Clear states
    case ActionTypes.CLEAR_CURRENT_JOB:
      return { ...state, currentJob: null };
    case ActionTypes.CLEAR_ANALYTICS:
      return { ...state, analytics: null };
    case ActionTypes.CLEAR_ERRORS:
      return {
        ...state,
        jobsError: null,
        studentJobsError: null,
        applicationsError: null,
        analyticsError: null
      };
    
    default:
      return state;
  }
};

// Create context
const JobContext = createContext();

// Context provider component
export const JobProvider = ({ children }) => {
  const [state, dispatch] = useReducer(jobReducer, initialState);

  // ============================================================================
  // JOB MANAGEMENT ACTIONS
  // ============================================================================

  const fetchJobs = useCallback(async (params = {}) => {
    dispatch({ type: ActionTypes.SET_JOBS_LOADING, payload: true });
    
    try {
      const response = await jobService.getAllJobs({
        ...state.filters,
        ...params,
        page: state.pagination.currentPage
      });
      
      // Handle different response structures
      let jobs, pagination;
      
      if (response.data && response.data.jobs) {
        // Direct structure: { jobs: [...], pagination: {...} }
        jobs = response.data.jobs;
        pagination = response.data.pagination;
      } else if (response.jobs) {
        // Response is already the data: { jobs: [...], pagination: {...} }
        jobs = response.jobs;
        pagination = response.pagination;
      } else {
        // Fallback - empty array
        jobs = [];
        pagination = {
          currentPage: 1,
          totalPages: 1,
          totalJobs: 0,
          hasNextPage: false,
          hasPrevPage: false
        };
      }
      
      dispatch({
        type: ActionTypes.SET_JOBS,
        payload: {
          jobs: jobs || [],
          pagination: pagination || {
            currentPage: 1,
            totalPages: 1,
            totalJobs: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        }
      });
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_JOBS_ERROR,
        payload: error.message || 'Failed to fetch jobs'
      });
    }
  }, [state.filters, state.pagination.currentPage]);

  const fetchJobById = useCallback(async (jobId) => {
    try {
      const response = await jobService.getJobById(jobId);
      // Handle nested response structure: response.data.data.job
      const job = response.data?.data?.job || response.data?.job || response.job;
      if (!job) {
        throw new Error('Job data not found in response');
      }
      dispatch({ type: ActionTypes.SET_CURRENT_JOB, payload: job });
      return job;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  }, []);

  const createJob = useCallback(async (jobData, companyLogo, documents) => {
    try {
      const response = await jobService.createJob(jobData, companyLogo, documents);
      // Handle nested response structure: response.data.data.job
      const job = response.data?.data?.job || response.data?.job || response.job;
      if (!job) {
        throw new Error('Job data not found in response');
      }
      dispatch({ type: ActionTypes.ADD_JOB, payload: job });
      return job;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }, []);

  const updateJob = useCallback(async (jobId, jobData, companyLogo, documents) => {
    try {
      const response = await jobService.updateJob(jobId, jobData, companyLogo, documents);
      // Handle nested response structure: response.data.data.job
      const job = response.data?.data?.job || response.data?.job || response.job;
      if (!job) {
        throw new Error('Job data not found in response');
      }
      dispatch({ type: ActionTypes.UPDATE_JOB, payload: job });
      return job;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }, []);

  const deleteJob = useCallback(async (jobId) => {
    try {
      await jobService.deleteJob(jobId);
      dispatch({ type: ActionTypes.REMOVE_JOB, payload: jobId });
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }, []);

  // ============================================================================
  // STUDENT JOB ACTIONS
  // ============================================================================

  const fetchStudentJobs = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_STUDENT_JOBS_LOADING, payload: true });
    
    try {
      const response = await jobService.getStudentJobs();
      dispatch({ type: ActionTypes.SET_STUDENT_JOBS, payload: response.data });
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_STUDENT_JOBS_ERROR,
        payload: error.message || 'Failed to fetch student jobs'
      });
    }
  }, []);

  const recordJobView = useCallback(async (jobId, viewData) => {
    try {
      await jobService.recordJobView(jobId, viewData);
    } catch (error) {
      console.error('Error recording job view:', error);
    }
  }, []);

  const recordApplicationClick = useCallback(async (jobId) => {
    try {
      await jobService.recordApplicationClick(jobId);
    } catch (error) {
      console.error('Error recording application click:', error);
    }
  }, []);

  const submitStudentResponse = useCallback(async (jobId, applied, notes) => {
    try {
      const response = await jobService.submitStudentResponse(jobId, applied, notes);
      
      // Update the student job in the list
      const updatedJobs = state.studentJobs.map(job => {
        if (job._id === jobId) {
          return {
            ...job,
            applicationStatus: applied ? 'Applied' : 'Not Applied',
            hasApplied: applied
          };
        }
        return job;
      });
      
      dispatch({ type: ActionTypes.SET_STUDENT_JOBS, payload: { jobs: updatedJobs } });
      return response;
    } catch (error) {
      console.error('Error submitting student response:', error);
      throw error;
    }
  }, [state.studentJobs]);

  // ============================================================================
  // APPLICATION MONITORING ACTIONS
  // ============================================================================

  const fetchJobApplications = useCallback(async (jobId, params = {}) => {
    dispatch({ type: ActionTypes.SET_APPLICATIONS_LOADING, payload: true });
    
    try {
      const response = await jobService.getJobApplications(jobId, params);
      dispatch({ type: ActionTypes.SET_APPLICATIONS, payload: response.data });
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_APPLICATIONS_ERROR,
        payload: error.message || 'Failed to fetch job applications'
      });
    }
  }, []);

  const fetchJobAnalytics = useCallback(async (jobId) => {
    dispatch({ type: ActionTypes.SET_ANALYTICS_LOADING, payload: true });
    
    try {
      const response = await jobService.getJobAnalytics(jobId);
      dispatch({ type: ActionTypes.SET_ANALYTICS, payload: response.data });
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_ANALYTICS_ERROR,
        payload: error.message || 'Failed to fetch job analytics'
      });
    }
  }, []);

  // ============================================================================
  // UTILITY ACTIONS
  // ============================================================================

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await jobService.getDepartmentsForJobs();
      // Handle different possible response structures
      const departments = response.data?.departments || response.departments || response.data || [];
      dispatch({ type: ActionTypes.SET_DEPARTMENTS, payload: departments });
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Set empty array as fallback
      dispatch({ type: ActionTypes.SET_DEPARTMENTS, payload: [] });
    }
  }, []);

  const fetchJobTypes = useCallback(async () => {
    try {
      const response = await jobService.getJobTypes();
      // Handle different possible response structures
      const jobTypes = response.data?.jobTypes || response.jobTypes || response.data || [];
      dispatch({ type: ActionTypes.SET_JOB_TYPES, payload: jobTypes });
    } catch (error) {
      console.error('Error fetching job types:', error);
      // Set default job types as fallback
      dispatch({ type: ActionTypes.SET_JOB_TYPES, payload: ['Full-time', 'Part-time', 'Internship', 'Contract'] });
    }
  }, []);

  const fetchJobStatuses = useCallback(async () => {
    try {
      const response = await jobService.getJobStatuses();
      // Handle different possible response structures
      const jobStatuses = response.data?.jobStatuses || response.jobStatuses || response.data || [];
      dispatch({ type: ActionTypes.SET_JOB_STATUSES, payload: jobStatuses });
    } catch (error) {
      console.error('Error fetching job statuses:', error);
      // Set default job statuses as fallback
      dispatch({ type: ActionTypes.SET_JOB_STATUSES, payload: ['Draft', 'Active', 'Closed', 'Expired'] });
    }
  }, []);

  // ============================================================================
  // UI STATE ACTIONS
  // ============================================================================

  const setFilters = useCallback((filters) => {
    dispatch({ type: ActionTypes.SET_FILTERS, payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_FILTERS });
  }, []);

  const setCurrentPage = useCallback((page) => {
    dispatch({
      type: ActionTypes.SET_PAGINATION,
      payload: { ...state.pagination, currentPage: page }
    });
  }, [state.pagination]);

  const clearCurrentJob = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_CURRENT_JOB });
  }, []);

  const clearAnalytics = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ANALYTICS });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERRORS });
  }, []);

  // Context value
  const value = {
    // State
    ...state,
    
    // Job Management Actions
    fetchJobs,
    fetchJobById,
    createJob,
    updateJob,
    deleteJob,
    
    // Student Job Actions
    fetchStudentJobs,
    recordJobView,
    recordApplicationClick,
    submitStudentResponse,
    
    // Application Monitoring Actions
    fetchJobApplications,
    fetchJobAnalytics,
    
    // Utility Actions
    fetchDepartments,
    fetchJobTypes,
    fetchJobStatuses,
    
    // UI State Actions
    setFilters,
    resetFilters,
    setCurrentPage,
    clearCurrentJob,
    clearAnalytics,
    clearErrors
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};

// Custom hook to use job context
export const useJob = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
};

export default JobContext;
