import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1',
  timeout: 30000, // Default timeout for regular operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a separate instance for bulk operations with extended timeout
const bulkApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1',
  timeout: 300000, // 5 minutes for bulk operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token for regular API
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors for regular API
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('🔍 API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        data: error.config?.data
      }
    });

    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('pms_token');
      localStorage.removeItem('pms_user');
      window.location.href = '/authentication/sign-in';
    }
    
    // Preserve the original backend error message with better fallback
    let errorMessage = 'An error occurred';
    
    if (error.response?.data?.message) {
      // Use backend error message if available
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      // Use backend error field if message is not available
      errorMessage = error.response.data.error;
    } else if (error.message) {
      // Use axios error message as fallback
      errorMessage = error.message;
    }

    // Add status code context for better debugging
    if (error.response?.status) {
      errorMessage = `${errorMessage} (Status: ${error.response.status})`;
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

// Request interceptor to add auth token for bulk API
bulkApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors for bulk API
bulkApi.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('🔍 Bulk API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        data: error.config?.data
      }
    });

    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('pms_token');
      localStorage.removeItem('pms_user');
      window.location.href = '/authentication/sign-in';
    }
    
    // Preserve the original backend error message with better fallback
    let errorMessage = 'An error occurred';
    
    if (error.response?.data?.message) {
      // Use backend error message if available
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      // Use backend error field if message is not available
      errorMessage = error.response.data.error;
    } else if (error.message) {
      // Use axios error message as fallback
      errorMessage = error.message;
    }

    // Add status code context for better debugging
    if (error.response?.status) {
      errorMessage = `${errorMessage} (Status: ${error.response.status})`;
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
export { bulkApi };
