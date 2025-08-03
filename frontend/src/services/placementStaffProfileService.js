import api from './api';

class PlacementStaffProfileService {
  // Get own placement staff profile
  async getProfile() {
    try {
      const response = await api.get('/placement-staff-profiles/profile');
      
      if (response.success) {
        return response.profile;
      }
      
      throw new Error(response.message || 'Failed to fetch placement staff profile');
    } catch (error) {
      throw error;
    }
  }

  // Update own placement staff profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/placement-staff-profiles/profile', profileData);
      
      if (response.success) {
        return response.profile;
      }
      
      throw new Error(response.message || 'Failed to update placement staff profile');
    } catch (error) {
      throw error;
    }
  }

  // Get placement staff profile by ID (Admin only)
  async getProfileById(profileId) {
    try {
      const response = await api.get(`/placement-staff-profiles/${profileId}`);
      
      if (response.success) {
        return response.profile;
      }
      
      throw new Error(response.message || 'Failed to fetch placement staff profile');
    } catch (error) {
      throw error;
    }
  }

  // Get all placement staff profiles (Admin only)
  async getAllProfiles(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/placement-staff-profiles?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch placement staff profiles');
    } catch (error) {
      throw error;
    }
  }

  // Delete placement staff profile (Admin only)
  async deleteProfile(profileId) {
    try {
      const response = await api.delete(`/placement-staff-profiles/${profileId}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to delete placement staff profile');
    } catch (error) {
      throw error;
    }
  }

  // Get placement staff profile statistics (Admin only)
  async getProfileStats() {
    try {
      const response = await api.get('/placement-staff-profiles/stats');
      
      if (response.success) {
        return response.stats;
      }
      
      throw new Error(response.message || 'Failed to fetch placement staff profile statistics');
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
      const response = await fetch(`${api.defaults.baseURL}/placement-staff-profiles/upload-profile-image`, {
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
      const response = await api.get(`/placement-staff-profiles?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch placement staff profiles by role');
    } catch (error) {
      throw error;
    }
  }

  // Get profiles by department
  async getProfilesByDepartment(department, params = {}) {
    try {
      const queryParams = new URLSearchParams({ ...params, department }).toString();
      const response = await api.get(`/placement-staff-profiles?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch placement staff profiles by department');
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
      officialEmail: profile.officialEmail,
      experienceYears: profile.experienceYears,
      qualifications: profile.qualifications,
      assignedStudentsCount: profile.assignedStudentsCount,
      responsibilitiesText: profile.responsibilitiesText,
      trainingProgramsHandled: profile.trainingProgramsHandled,
      languagesSpoken: profile.languagesSpoken,
      availabilityTimeSlots: profile.availabilityTimeSlots,
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
      other: 'Other',
      student: 'Student',
      alumni: 'Alumni',
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

  // Get profile status badge color
  getProfileStatusColor(profile) {
    if (profile.status === 'inactive' || profile.status === 'deleted') return 'error';
    if (!profile.isProfileComplete) return 'warning';
    return 'success';
  }

  // Get profile status text
  getProfileStatusText(profile) {
    if (profile.status === 'inactive') return 'Inactive';
    if (profile.status === 'deleted') return 'Deleted';
    if (!profile.isProfileComplete) return 'Incomplete';
    return 'Active';
  }

  // Calculate profile completion percentage
  calculateProfileCompletion(profile) {
    const requiredFields = [
      'name.firstName',
      'name.lastName',
      'email',
      'mobileNumber',
      'gender',
      'role',
      'department',
      'designation',
      'dateOfJoining',
      'employeeId',
      'officeLocation'
    ];
    
    const optionalFields = [
      'profilePhotoUrl',
      'officialEmail',
      'experienceYears',
      'qualifications',
      'responsibilitiesText',
      'trainingProgramsHandled',
      'languagesSpoken',
      'availabilityTimeSlots',
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
      if (value !== undefined && value !== null && value !== '' && 
          (!Array.isArray(value) || value.length > 0)) {
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
      const validRoles = ['admin', 'director', 'staff', 'hod', 'other', 'student', 'alumni', 'company'];
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

    if (!isUpdate || profileData.officialEmail) {
      if (profileData.officialEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.officialEmail)) {
          errors.push('Please provide a valid official email address');
        }
      }
    }

    if (!isUpdate || profileData.experienceYears !== undefined) {
      if (profileData.experienceYears !== undefined && 
          (profileData.experienceYears < 0 || profileData.experienceYears > 50)) {
        errors.push('Experience years must be between 0 and 50');
      }
    }

    return errors;
  }

  // Helper methods for array fields
  addArrayItem(array, item) {
    if (!array) return [item];
    if (!array.includes(item)) {
      return [...array, item];
    }
    return array;
  }

  removeArrayItem(array, item) {
    if (!array) return [];
    return array.filter(i => i !== item);
  }

  updateArrayItem(array, index, newItem) {
    if (!array) return [newItem];
    const newArray = [...array];
    newArray[index] = newItem;
    return newArray;
  }
}

// Create and export singleton instance
const placementStaffProfileService = new PlacementStaffProfileService();
export default placementStaffProfileService;
