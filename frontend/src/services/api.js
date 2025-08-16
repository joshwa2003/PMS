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
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('pms_token');
      localStorage.removeItem('pms_user');
      window.location.href = '/authentication/sign-in';
    }
    
    // Return error message
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
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
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('pms_token');
      localStorage.removeItem('pms_user');
      window.location.href = '/authentication/sign-in';
    }
    
    // Return error message
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
export { bulkApi };
