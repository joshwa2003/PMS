import api from '../services/api';

// Department HOD Profile API endpoints
const departmentHODApi = {
  // Get own profile
  getProfile: () => api.get('/department-hod-profiles/profile'),
  
  // Update own profile
  updateProfile: (profileData) => api.put('/department-hod-profiles/profile', profileData),
  
  // Upload profile image
  uploadProfileImage: async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    const token = localStorage.getItem('pms_token');
    
    const response = await fetch(`${api.defaults.baseURL}/department-hod-profiles/upload-profile-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    return response.json();
  },
  
  // Admin only endpoints
  getAllProfiles: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/department-hod-profiles?${queryParams}`);
  },
  
  getProfileById: (profileId) => api.get(`/department-hod-profiles/${profileId}`),
  
  deleteProfile: (profileId) => api.delete(`/department-hod-profiles/${profileId}`),
  
  getProfileStats: () => api.get('/department-hod-profiles/stats'),
  
  // Filter endpoints
  getProfilesByDepartment: (department, params = {}) => {
    const queryParams = new URLSearchParams({ ...params, department }).toString();
    return api.get(`/department-hod-profiles?${queryParams}`);
  },
  
  getProfilesByDepartmentHeadOf: (departmentHeadOf, params = {}) => {
    const queryParams = new URLSearchParams({ ...params, departmentHeadOf }).toString();
    return api.get(`/department-hod-profiles?${queryParams}`);
  },
  
  getProfilesByStatus: (status, params = {}) => {
    const queryParams = new URLSearchParams({ ...params, status }).toString();
    return api.get(`/department-hod-profiles?${queryParams}`);
  }
};

export default departmentHODApi;
