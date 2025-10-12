import api from './api';

class OtherStaffProfileService {
  constructor() {
    this.baseURL = '/other-staff-profiles';
  }

  // Get current user's other staff profile
  async getProfile() {
    try {
      const response = await api.get(`${this.baseURL}/profile`);
      
      if (response.success) {
        return response.profile;
      }
      
      throw new Error(response.message || 'Failed to fetch other staff profile');
    } catch (error) {
      console.error('Error fetching other staff profile:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch other staff profile');
    }
  }

  // Update current user's other staff profile
  async updateProfile(profileData) {
    try {
      const response = await api.put(`${this.baseURL}/profile`, profileData);
      
      if (response.success) {
        return response.profile;
      }
      
      throw new Error(response.message || 'Failed to update other staff profile');
    } catch (error) {
      console.error('Error updating other staff profile:', error);
      throw new Error(error.response?.data?.message || 'Failed to update other staff profile');
    }
  }

  // Delete current user's other staff profile
  async deleteProfile() {
    try {
      const response = await api.delete(`${this.baseURL}/profile`);
      return response.data;
    } catch (error) {
      console.error('Error deleting other staff profile:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete other staff profile');
    }
  }

  // Upload profile image with Google Drive URL
  async updateProfileImageUrl(googleDriveUrl) {
    try {
      const response = await api.post(`${this.baseURL}/update-profile-image`, {
        googleDriveUrl
      });
      return response;
    } catch (error) {
      console.error('Error updating profile image:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile image');
    }
  }

  // Alternative endpoint for profile image upload
  async uploadProfileImage(googleDriveUrl) {
    try {
      const response = await api.post(`${this.baseURL}/upload-profile-image`, {
        googleDriveUrl
      });
      return response;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload profile image');
    }
  }

  // Validate profile data
  validateProfileData(profileData, isUpdate = false) {
    const errors = [];

    // Basic Information Validation
    if (!isUpdate || profileData.employeeId !== undefined) {
      if (!profileData.employeeId || profileData.employeeId.trim() === '') {
        errors.push('Employee ID is required');
      } else if (profileData.employeeId.length > 20) {
        errors.push('Employee ID cannot exceed 20 characters');
      }
    }

    if (!isUpdate || profileData.name) {
      if (!profileData.name?.firstName || profileData.name.firstName.trim() === '') {
        errors.push('First name is required');
      } else if (profileData.name.firstName.length > 50) {
        errors.push('First name cannot exceed 50 characters');
      }

      if (!profileData.name?.lastName || profileData.name.lastName.trim() === '') {
        errors.push('Last name is required');
      } else if (profileData.name.lastName.length > 50) {
        errors.push('Last name cannot exceed 50 characters');
      }
    }

    if (!isUpdate || profileData.email !== undefined) {
      if (!profileData.email || profileData.email.trim() === '') {
        errors.push('Email is required');
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email)) {
          errors.push('Please enter a valid email address');
        }
      }
    }

    if (!isUpdate || profileData.mobileNumber !== undefined) {
      if (!profileData.mobileNumber || profileData.mobileNumber.trim() === '') {
        errors.push('Mobile number is required');
      } else {
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(profileData.mobileNumber)) {
          errors.push('Mobile number must be 10 digits');
        }
      }
    }

    if (!isUpdate || profileData.gender !== undefined) {
      if (!profileData.gender || profileData.gender.trim() === '') {
        errors.push('Gender is required');
      } else if (!['Male', 'Female', 'Other'].includes(profileData.gender)) {
        errors.push('Please select a valid gender');
      }
    }

    // Professional Information Validation
    if (!isUpdate || profileData.role !== undefined) {
      const validRoles = ['admin', 'placement_director', 'placement_staff', 'department_hod', 'other_staff', 'student', 'company'];
      if (!profileData.role || !validRoles.includes(profileData.role)) {
        errors.push('Please select a valid role');
      }
    }

    if (!isUpdate || profileData.department !== undefined) {
      const validDepartments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'ADMIN', 'HR', 'OTHER'];
      if (!profileData.department || !validDepartments.includes(profileData.department)) {
        errors.push('Please select a valid department');
      }
    }

    if (!isUpdate || profileData.designation !== undefined) {
      if (!profileData.designation || profileData.designation.trim() === '') {
        errors.push('Designation is required');
      } else if (profileData.designation.length > 100) {
        errors.push('Designation cannot exceed 100 characters');
      }
    }

    if (!isUpdate || profileData.dateOfJoining !== undefined) {
      if (!profileData.dateOfJoining) {
        errors.push('Date of joining is required');
      }
    }

    if (!isUpdate || profileData.staffCategory !== undefined) {
      const validCategories = ['Administrative', 'Technical', 'Support', 'Maintenance', 'Security', 'Other'];
      if (!profileData.staffCategory || !validCategories.includes(profileData.staffCategory)) {
        errors.push('Please select a valid staff category');
      }
    }

    // Optional field validations
    if (profileData.yearsOfExperience !== undefined) {
      if (profileData.yearsOfExperience < 0 || profileData.yearsOfExperience > 50) {
        errors.push('Years of experience must be between 0 and 50');
      }
    }

    if (profileData.contact?.alternatePhone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(profileData.contact.alternatePhone)) {
        errors.push('Alternate phone must be 10 digits');
      }
    }

    if (profileData.contact?.emergencyContact) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(profileData.contact.emergencyContact)) {
        errors.push('Emergency contact must be 10 digits');
      }
    }

    if (profileData.contact?.address?.pincode) {
      const pincodeRegex = /^[0-9]{6}$/;
      if (!pincodeRegex.test(profileData.contact.address.pincode)) {
        errors.push('Pincode must be 6 digits');
      }
    }

    if (profileData.workingHours?.startTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(profileData.workingHours.startTime)) {
        errors.push('Start time must be in HH:MM format');
      }
    }

    if (profileData.workingHours?.endTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(profileData.workingHours.endTime)) {
        errors.push('End time must be in HH:MM format');
      }
    }

    return errors;
  }

  // Get role display name
  getRoleDisplayName(role) {
    const roleNames = {
      admin: 'Administrator',
      placement_director: 'Placement Director',
      placement_staff: 'Placement Staff',
      department_hod: 'Head of Department',
      other_staff: 'Other Staff',
      student: 'Student',
      company: 'Company'
    };
    return roleNames[role] || role;
  }

  // Get department display name
  getDepartmentDisplayName(department) {
    const departmentNames = {
      CSE: 'Computer Science & Engineering',
      ECE: 'Electronics & Communication Engineering',
      EEE: 'Electrical & Electronics Engineering',
      MECH: 'Mechanical Engineering',
      CIVIL: 'Civil Engineering',
      IT: 'Information Technology',
      ADMIN: 'Administration',
      HR: 'Human Resources',
      OTHER: 'Other'
    };
    return departmentNames[department] || department;
  }

  // Get staff category display name
  getStaffCategoryDisplayName(category) {
    const categoryNames = {
      Administrative: 'Administrative Staff',
      Technical: 'Technical Staff',
      Support: 'Support Staff',
      Maintenance: 'Maintenance Staff',
      Security: 'Security Staff',
      Other: 'Other Staff'
    };
    return categoryNames[category] || category;
  }

  // Get work shift display name
  getWorkShiftDisplayName(shift) {
    const shiftNames = {
      Morning: 'Morning Shift',
      Evening: 'Evening Shift',
      Night: 'Night Shift',
      Flexible: 'Flexible Hours'
    };
    return shiftNames[shift] || shift;
  }

  // Get status display name
  getStatusDisplayName(status) {
    const statusNames = {
      active: 'Active',
      inactive: 'Inactive'
    };
    return statusNames[status] || status;
  }

  // Get auth provider display name
  getAuthProviderDisplayName(provider) {
    const providerNames = {
      local: 'Local',
      google: 'Google',
      microsoft: 'Microsoft',
      other: 'Other'
    };
    return providerNames[provider] || provider;
  }

  // Get department options
  getDepartmentOptions() {
    return [
      { value: 'CSE', label: 'Computer Science & Engineering' },
      { value: 'ECE', label: 'Electronics & Communication Engineering' },
      { value: 'EEE', label: 'Electrical & Electronics Engineering' },
      { value: 'MECH', label: 'Mechanical Engineering' },
      { value: 'CIVIL', label: 'Civil Engineering' },
      { value: 'IT', label: 'Information Technology' },
      { value: 'ADMIN', label: 'Administration' },
      { value: 'HR', label: 'Human Resources' },
      { value: 'OTHER', label: 'Other' }
    ];
  }

  // Get staff category options
  getStaffCategoryOptions() {
    return [
      { value: 'Administrative', label: 'Administrative Staff' },
      { value: 'Technical', label: 'Technical Staff' },
      { value: 'Support', label: 'Support Staff' },
      { value: 'Maintenance', label: 'Maintenance Staff' },
      { value: 'Security', label: 'Security Staff' },
      { value: 'Other', label: 'Other Staff' }
    ];
  }

  // Get work shift options
  getWorkShiftOptions() {
    return [
      { value: 'Morning', label: 'Morning (9 AM - 5 PM)' },
      { value: 'Flexible', label: 'Flexible Hours' }
    ];
  }

  // Get status options
  getStatusOptions() {
    return [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ];
  }
  // Get auth provider options
  getAuthProviderOptions() {
    return [
      { value: 'local', label: 'Local' },
      { value: 'google', label: 'Google' },
      { value: 'microsoft', label: 'Microsoft' },
      { value: 'other', label: 'Other' }
    ];
  }

  // Validate Google Drive URL
  validateGoogleDriveUrl(url) {
    if (!url || url.trim() === '') {
      return 'Google Drive URL is required';
    }

    const driveUrlRegex = /(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=)([a-zA-Z0-9_-]+)/;
    if (!driveUrlRegex.test(url)) {
      return 'Please provide a valid Google Drive sharing URL';
    }

    return null;
  }

  // Process Google Drive URL for display
  processGoogleDriveUrl(url) {
    if (!url) return null;

    const driveUrlRegex = /(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=)([a-zA-Z0-9_-]+)/;
    const match = url.match(driveUrlRegex);
    
    if (match) {
      const fileId = match[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    return url;
  }

  // Get nested value from object
  getNestedValue(obj, path) {
    return path.split('.').reduce((obj, key) => obj && obj[key], obj);
  }

  // Calculate profile completion percentage
  calculateProfileCompletion(profileData) {
    if (!profileData) return 0;

    // Helper function to get nested value
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((obj, key) => obj && obj[key], obj);
    };

    const requiredFields = [
      'employeeId', 'name.firstName', 'name.lastName', 'email', 'mobileNumber', 
      'gender', 'department', 'dateOfJoining', 'staffCategory'
    ];

    const optionalFields = [
      'profilePhotoUrl', 'officeLocation', 'yearsOfExperience', 'qualifications',
      'contact.alternatePhone', 'contact.emergencyContact', 'contact.address.street',
      'contact.address.city', 'contact.address.state', 'contact.address.pincode'
    ];

    let requiredScore = 0;
    let optionalScore = 0;

    // Check required fields (70% weight)
    requiredFields.forEach(field => {
      const value = getNestedValue(profileData, field);
      if (value && value !== '' && value !== 0) {
        requiredScore++;
      }
    });

    // Check optional fields (30% weight)
    optionalFields.forEach(field => {
      const value = getNestedValue(profileData, field);
      if (value && value !== '' && value !== 0) {
        optionalScore++;
      }
    });

    const requiredPercentage = (requiredScore / requiredFields.length) * 70;
    const optionalPercentage = (optionalScore / optionalFields.length) * 30;

    return Math.round(requiredPercentage + optionalPercentage);
  }
}

// Create and export singleton instance
const otherStaffProfileService = new OtherStaffProfileService();
export default otherStaffProfileService;
