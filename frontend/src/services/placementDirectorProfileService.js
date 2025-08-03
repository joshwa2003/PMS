import api from './api';

class PlacementDirectorProfileService {
  constructor() {
    this.baseURL = '/placement-director-profiles';
  }

  // Get current user's placement director profile
  async getProfile() {
    try {
      const response = await api.get(`${this.baseURL}/profile`);
      return response.profile;
    } catch (error) {
      console.error('Get placement director profile error:', error);
      throw new Error(error.message || 'Failed to fetch placement director profile');
    }
  }

  // Update current user's placement director profile
  async updateProfile(profileData) {
    try {
      const response = await api.put(`${this.baseURL}/profile`, profileData);
      return response.profile;
    } catch (error) {
      console.error('Update placement director profile error:', error);
      throw new Error(error.message || 'Failed to update placement director profile');
    }
  }

  // Upload profile image
  async uploadProfileImage(file) {
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await api.post(`${this.baseURL}/upload-profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error) {
      console.error('Upload profile image error:', error);
      throw new Error(error.message || 'Failed to upload profile image');
    }
  }

  // Upload resume
  async uploadResume(file) {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await api.post(`${this.baseURL}/upload-resume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error) {
      console.error('Upload resume error:', error);
      throw new Error(error.message || 'Failed to upload resume');
    }
  }

  // Get all placement director profiles (Admin only)
  async getAllProfiles(params = {}) {
    try {
      const response = await api.get(this.baseURL, { params });
      return response;
    } catch (error) {
      console.error('Get all placement director profiles error:', error);
      throw new Error(error.message || 'Failed to fetch placement director profiles');
    }
  }

  // Get placement director profile by ID (Admin only)
  async getProfileById(id) {
    try {
      const response = await api.get(`${this.baseURL}/${id}`);
      return response.profile;
    } catch (error) {
      console.error('Get placement director profile by ID error:', error);
      throw new Error(error.message || 'Failed to fetch placement director profile');
    }
  }

  // Delete placement director profile (Admin only)
  async deleteProfile(id) {
    try {
      const response = await api.delete(`${this.baseURL}/${id}`);
      return response;
    } catch (error) {
      console.error('Delete placement director profile error:', error);
      throw new Error(error.message || 'Failed to delete placement director profile');
    }
  }

  // Get placement director profile statistics (Admin only)
  async getProfileStats() {
    try {
      const response = await api.get(`${this.baseURL}/stats`);
      return response.stats;
    } catch (error) {
      console.error('Get placement director profile stats error:', error);
      throw new Error(error.message || 'Failed to fetch placement director profile statistics');
    }
  }

  // Validate profile data
  validateProfileData(data, isUpdate = false) {
    const errors = [];

    // Required fields validation
    if (!isUpdate || data.employeeId !== undefined) {
      if (!data.employeeId || data.employeeId.trim() === '') {
        errors.push('Employee ID is required');
      }
    }

    if (!isUpdate || data.name !== undefined) {
      if (!data.name?.firstName || data.name.firstName.trim() === '') {
        errors.push('First name is required');
      }
      if (!data.name?.lastName || data.name.lastName.trim() === '') {
        errors.push('Last name is required');
      }
    }

    if (!isUpdate || data.email !== undefined) {
      if (!data.email || data.email.trim() === '') {
        errors.push('Email is required');
      } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
        errors.push('Please enter a valid email address');
      }
    }

    if (!isUpdate || data.mobileNumber !== undefined) {
      if (!data.mobileNumber || data.mobileNumber.trim() === '') {
        errors.push('Mobile number is required');
      } else if (!/^[0-9]{10}$/.test(data.mobileNumber.replace(/\D/g, ''))) {
        errors.push('Please enter a valid 10-digit mobile number');
      }
    }

    if (!isUpdate || data.gender !== undefined) {
      if (!data.gender || data.gender.trim() === '') {
        errors.push('Gender is required');
      }
    }

    if (!isUpdate || data.designation !== undefined) {
      if (!data.designation || data.designation.trim() === '') {
        errors.push('Designation is required');
      }
    }

    if (!isUpdate || data.dateOfJoining !== undefined) {
      if (!data.dateOfJoining) {
        errors.push('Date of joining is required');
      }
    }

    // Optional field validations
    if (data.officialEmail && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.officialEmail)) {
      errors.push('Please enter a valid official email address');
    }

    if (data.alternateMobile && !/^[0-9]{10}$/.test(data.alternateMobile.replace(/\D/g, ''))) {
      errors.push('Please enter a valid 10-digit alternate mobile number');
    }

    if (data.contact?.address?.pincode && !/^[0-9]{6}$/.test(data.contact.address.pincode)) {
      errors.push('Please enter a valid 6-digit pincode');
    }

    if (data.yearsOfExperience !== undefined && data.yearsOfExperience !== null) {
      if (data.yearsOfExperience < 0 || data.yearsOfExperience > 50) {
        errors.push('Years of experience must be between 0 and 50');
      }
    }

    return errors;
  }

  // Calculate profile completion percentage
  calculateProfileCompletion(data) {
    const requiredFields = [
      'employeeId',
      'name.firstName',
      'name.lastName',
      'email',
      'mobileNumber',
      'gender',
      'designation',
      'dateOfJoining'
    ];

    const optionalFields = [
      'profilePhotoUrl',
      'officeRoomNo',
      'officialEmail',
      'alternateMobile',
      'yearsOfExperience',
      'resumeUrl',
      'responsibilitiesText',
      'contact.address.street',
      'contact.address.city',
      'contact.address.state',
      'contact.address.pincode'
    ];

    let completedRequired = 0;
    let completedOptional = 0;

    // Check required fields
    requiredFields.forEach(field => {
      const value = this.getNestedValue(data, field);
      if (value !== undefined && value !== null && value !== '') {
        completedRequired++;
      }
    });

    // Check optional fields
    optionalFields.forEach(field => {
      const value = this.getNestedValue(data, field);
      if (value !== undefined && value !== null && value !== '') {
        completedOptional++;
      }
    });

    // Calculate completion percentage (70% for required, 30% for optional)
    const requiredPercentage = (completedRequired / requiredFields.length) * 70;
    const optionalPercentage = (completedOptional / optionalFields.length) * 30;

    return Math.round(requiredPercentage + optionalPercentage);
  }

  // Helper function to get nested values
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  // Format profile data for display
  formatProfileData(profile) {
    if (!profile) return null;

    return {
      ...profile,
      fullName: `${profile.name?.firstName || ''} ${profile.name?.lastName || ''}`.trim(),
      formattedDateOfJoining: profile.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString() : '',
      formattedRegistrationDate: profile.registrationDate ? new Date(profile.registrationDate).toLocaleDateString() : '',
      formattedLastLogin: profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : 'Never',
      communicationPreferencesText: profile.communicationPreferences?.join(', ') || '',
      experienceText: profile.yearsOfExperience ? `${profile.yearsOfExperience} years` : 'Not specified'
    };
  }

  // Get department options
  getDepartmentOptions() {
    return [
      { value: 'Placement Cell', label: 'Placement Cell' },
      { value: 'Training & Placement', label: 'Training & Placement' },
      { value: 'Career Development', label: 'Career Development' },
      { value: 'Industry Relations', label: 'Industry Relations' }
    ];
  }

  // Get designation options
  getDesignationOptions() {
    return [
      { value: 'Director', label: 'Director' },
      { value: 'Assistant Director', label: 'Assistant Director' },
      { value: 'Deputy Director', label: 'Deputy Director' },
      { value: 'Placement Officer', label: 'Placement Officer' },
      { value: 'Training Officer', label: 'Training Officer' }
    ];
  }

  // Get communication preference options
  getCommunicationPreferenceOptions() {
    return [
      { value: 'email', label: 'Email' },
      { value: 'SMS', label: 'SMS' },
      { value: 'portal', label: 'Portal Notifications' }
    ];
  }

  // Get gender options
  getGenderOptions() {
    return [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Other', label: 'Other' }
    ];
  }

  // Get status options
  getStatusOptions() {
    return [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ];
  }
}

// Create and export a singleton instance
const placementDirectorProfileService = new PlacementDirectorProfileService();
export default placementDirectorProfileService;
