import api from './api';

class AdministratorProfileService {
  // Get own administrator profile
  async getProfile() {
    try {
      const response = await api.get('/administrator-profiles/profile');
      
      if (response.success) {
        return response.profile;
      }
      
      throw new Error(response.message || 'Failed to fetch administrator profile');
    } catch (error) {
      throw error;
    }
  }

  // Update own administrator profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/administrator-profiles/profile', profileData);
      
      if (response.success) {
        return response.profile;
      }
      
      throw new Error(response.message || 'Failed to update administrator profile');
    } catch (error) {
      throw error;
    }
  }

  // Get administrator profile by ID (Admin only)
  async getProfileById(profileId) {
    try {
      const response = await api.get(`/administrator-profiles/${profileId}`);
      
      if (response.success) {
        return response.profile;
      }
      
      throw new Error(response.message || 'Failed to fetch administrator profile');
    } catch (error) {
      throw error;
    }
  }

  // Get all administrator profiles (Admin only)
  async getAllProfiles(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/administrator-profiles?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch administrator profiles');
    } catch (error) {
      throw error;
    }
  }

  // Delete administrator profile (Admin only)
  async deleteProfile(profileId) {
    try {
      const response = await api.delete(`/administrator-profiles/${profileId}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to delete administrator profile');
    } catch (error) {
      throw error;
    }
  }

  // Get administrator profile statistics (Admin only)
  async getProfileStats() {
    try {
      const response = await api.get('/administrator-profiles/stats');
      
      if (response.success) {
        return response.stats;
      }
      
      throw new Error(response.message || 'Failed to fetch administrator profile statistics');
    } catch (error) {
      throw error;
    }
  }

  // Upload profile image
  async uploadProfileImage(file) {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('profileImage', file);
      
      // Get token for authorization
      const token = localStorage.getItem('pms_token');
      
      // Use fetch for file upload since axios has issues with FormData
      const response = await fetch(`${api.defaults.baseURL}/administrator-profiles/upload-profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to upload profile image');
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get profiles by role
  async getProfilesByRole(role, params = {}) {
    try {
      const queryParams = new URLSearchParams({ ...params, role }).toString();
      const response = await api.get(`/administrator-profiles?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch administrator profiles by role');
    } catch (error) {
      throw error;
    }
  }

  // Get profiles by department
  async getProfilesByDepartment(department, params = {}) {
    try {
      const queryParams = new URLSearchParams({ ...params, department }).toString();
      const response = await api.get(`/administrator-profiles?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch administrator profiles by department');
    } catch (error) {
      throw error;
    }
  }

  // Utility methods for profile data processing
  formatProfileData(profile) {
    return {
      id: profile.id,
      employeeId: profile.employeeId,
      fullName: profile.fullName,
      email: profile.email,
      mobileNumber: profile.mobileNumber,
      role: profile.role,
      department: profile.department,
      designation: profile.designation,
      status: profile.status,
      profileCompletion: profile.profileCompletion,
      isProfileComplete: profile.isProfileComplete,
      dateOfJoining: profile.dateOfJoining,
      officeLocation: profile.officeLocation,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };
  }

  // Get role display name
  getRoleDisplayName(role) {
    const roleNames = {
      admin: 'Administrator',
      director: 'Director',
      staff: 'Staff',
      hod: 'Head of Department',
      other: 'Other'
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

  // Get access level display name
  getAccessLevelDisplayName(accessLevel) {
    const accessLevelNames = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      limited: 'Limited',
      read_only: 'Read Only'
    };
    return accessLevelNames[accessLevel] || accessLevel;
  }

  // Get profile status badge color
  getProfileStatusColor(profile) {
    if (profile.status === 'inactive') return 'error';
    if (!profile.isProfileComplete) return 'warning';
    return 'success';
  }

  // Get profile status text
  getProfileStatusText(profile) {
    if (profile.status === 'inactive') return 'Inactive';
    if (!profile.isProfileComplete) return 'Incomplete';
    return 'Active';
  }

  // Calculate profile completion percentage
  calculateProfileCompletion(profile) {
    const requiredFields = [
      'employeeId',
      'name.firstName',
      'name.lastName',
      'email',
      'mobileNumber',
      'gender',
      'role',
      'department',
      'designation',
      'dateOfJoining',
      'accessLevel',
      'officeLocation'
    ];
    
    const optionalFields = [
      'profilePhotoUrl',
      'contact.alternatePhone',
      'contact.emergencyContact',
      'contact.address.street',
      'contact.address.city',
      'contact.address.state',
      'contact.address.pincode',
      'adminNotes'
    ];
    
    let completedRequired = 0;
    let completedOptional = 0;
    
    // Check required fields
    requiredFields.forEach(field => {
      const value = this.getNestedValue(profile, field);
      if (value !== undefined && value !== null && value !== '') {
        completedRequired++;
      }
    });
    
    // Check optional fields
    optionalFields.forEach(field => {
      const value = this.getNestedValue(profile, field);
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

  // Validate profile data
  validateProfileData(profileData, isUpdate = false) {
    const errors = [];

    if (!isUpdate || profileData.employeeId) {
      if (!profileData.employeeId || profileData.employeeId.trim().length < 3) {
        errors.push('Employee ID must be at least 3 characters long');
      }
    }

    if (!isUpdate || profileData.name?.firstName) {
      if (!profileData.name?.firstName || profileData.name.firstName.trim().length < 2) {
        errors.push('First name must be at least 2 characters long');
      }
    }

    if (!isUpdate || profileData.name?.lastName) {
      if (!profileData.name?.lastName || profileData.name.lastName.trim().length < 2) {
        errors.push('Last name must be at least 2 characters long');
      }
    }

    if (!isUpdate || profileData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!profileData.email || !emailRegex.test(profileData.email)) {
        errors.push('Please provide a valid email address');
      }
    }

    if (!isUpdate || profileData.mobileNumber) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!profileData.mobileNumber || !phoneRegex.test(profileData.mobileNumber)) {
        errors.push('Mobile number must be exactly 10 digits');
      }
    }

    if (!isUpdate || profileData.role) {
      const validRoles = ['admin', 'director', 'staff', 'hod', 'other'];
      if (!profileData.role || !validRoles.includes(profileData.role)) {
        errors.push('Please select a valid role');
      }
    }

    if (!isUpdate || profileData.department) {
      const validDepartments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'ADMIN', 'HR', 'OTHER'];
      if (!profileData.department || !validDepartments.includes(profileData.department)) {
        errors.push('Please select a valid department');
      }
    }

    return errors;
  }
}

// Create and export singleton instance
const administratorProfileService = new AdministratorProfileService();
export default administratorProfileService;
