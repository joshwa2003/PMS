import api from '../services/api';

// Placement Director Profile API endpoints
export const placementDirectorProfileApi = {
  // Get current user's placement director profile
  getProfile: () => api.get('/placement-director-profiles/profile'),
  
  // Update current user's placement director profile
  updateProfile: (profileData) => api.put('/placement-director-profiles/profile', profileData),
  
  // Upload profile image
  uploadProfileImage: (formData) => api.post('/placement-director-profiles/upload-profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Upload resume
  uploadResume: (formData) => api.post('/placement-director-profiles/upload-resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Get all placement director profiles (Admin only)
  getAllProfiles: (params) => api.get('/placement-director-profiles', { params }),
  
  // Get placement director profile by ID (Admin only)
  getProfileById: (id) => api.get(`/placement-director-profiles/${id}`),
  
  // Delete placement director profile (Admin only)
  deleteProfile: (id) => api.delete(`/placement-director-profiles/${id}`),
  
  // Get placement director profile statistics (Admin only)
  getProfileStats: () => api.get('/placement-director-profiles/stats')
};

export default placementDirectorProfileApi;
