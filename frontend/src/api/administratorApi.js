import api from '../services/api';

class AdministratorApi {
  // Get current administrator's profile
  async getProfile() {
    try {
      const response = await api.get('/administrators/profile');
      
      if (response.success) {
        return response.administrator;
      }
      
      throw new Error(response.message || 'Failed to fetch administrator profile');
    } catch (error) {
      throw error;
    }
  }

  // Update administrator profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/administrators/profile', profileData);
      
      if (response.success) {
        return response.administrator;
      }
      
      throw new Error(response.message || 'Failed to update administrator profile');
    } catch (error) {
      throw error;
    }
  }

  // Upload profile image
  async uploadProfileImage(file) {
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await api.post('/administrators/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to upload profile image');
    } catch (error) {
      throw error;
    }
  }

  // Get all administrators (Admin access)
  async getAllAdministrators(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/administrators?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch administrators');
    } catch (error) {
      throw error;
    }
  }

  // Get administrator by ID (Admin access)
  async getAdministratorById(administratorId) {
    try {
      const response = await api.get(`/administrators/${administratorId}`);
      
      if (response.success) {
        return response.administrator;
      }
      
      throw new Error(response.message || 'Failed to fetch administrator');
    } catch (error) {
      throw error;
    }
  }

  // Update administrator status (Super Admin only)
  async updateAdministratorStatus(administratorId, statusData) {
    try {
      const response = await api.put(`/administrators/${administratorId}/status`, statusData);
      
      if (response.success) {
        return response.administrator;
      }
      
      throw new Error(response.message || 'Failed to update administrator status');
    } catch (error) {
      throw error;
    }
  }

  // Get administrator statistics (Super Admin only)
  async getAdministratorStats() {
    try {
      const response = await api.get('/administrators/stats');
      
      if (response.success) {
        return response.stats;
      }
      
      throw new Error(response.message || 'Failed to fetch administrator statistics');
    } catch (error) {
      throw error;
    }
  }

  // Delete administrator (Super Admin only)
  async deleteAdministrator(administratorId) {
    try {
      const response = await api.delete(`/administrators/${administratorId}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to delete administrator');
    } catch (error) {
      throw error;
    }
  }

  // Utility methods for data processing
  formatAdministratorData(administrator) {
    return {
      id: administrator._id,
      employeeId: administrator.employeeId,
      fullName: administrator.fullName,
      firstName: administrator.name?.firstName,
      lastName: administrator.name?.lastName,
      email: administrator.email,
      mobileNumber: administrator.mobileNumber,
      gender: administrator.gender,
      role: administrator.role,
      department: administrator.department,
      designation: administrator.designation,
      status: administrator.status,
      accessLevel: administrator.accessLevel,
      officeLocation: administrator.officeLocation,
      dateOfJoining: administrator.dateOfJoining,
      profilePhotoUrl: administrator.profilePhotoUrl,
      profileCompletionPercentage: administrator.profileCompletionPercentage,
      createdAt: administrator.createdAt,
      updatedAt: administrator.updatedAt
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

  // Get status color
  getStatusColor(status) {
    const statusColors = {
      'active': 'success',
      'inactive': 'warning',
      'deleted': 'error'
    };
    return statusColors[status] || 'secondary';
  }

  // Get access level color
  getAccessLevelColor(accessLevel) {
    const accessLevelColors = {
      'superAdmin': 'error',
      'admin': 'warning',
      'limited': 'info'
    };
    return accessLevelColors[accessLevel] || 'secondary';
  }

  // Get profile completion color
  getProfileCompletionColor(percentage) {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 40) return 'warning';
    return 'error';
  }

  // Validate administrator data
  validateAdministratorData(data) {
    const errors = [];

    // Only validate if we're creating a new profile (has required fields)
    const isNewProfile = data.employeeId || data.name?.firstName || data.name?.lastName;
    
    if (isNewProfile) {
      // Basic validation for new profiles
      if (!data.employeeId || (typeof data.employeeId === 'string' && data.employeeId.trim().length === 0)) {
        errors.push('Employee ID is required');
      }

      if (!data.name?.firstName || (typeof data.name.firstName === 'string' && data.name.firstName.trim().length < 2)) {
        errors.push('First name must be at least 2 characters long');
      }

      if (!data.name?.lastName || (typeof data.name.lastName === 'string' && data.name.lastName.trim().length < 2)) {
        errors.push('Last name must be at least 2 characters long');
      }

      if (!data.email || (typeof data.email === 'string' && data.email.trim().length === 0)) {
        errors.push('Email is required');
      }

      if (!data.mobileNumber || (typeof data.mobileNumber === 'string' && data.mobileNumber.trim().length === 0)) {
        errors.push('Mobile number is required');
      }

      if (!data.role || (typeof data.role === 'string' && data.role.trim().length === 0)) {
        errors.push('Role is required');
      }

      if (!data.designation || (typeof data.designation === 'string' && data.designation.trim().length === 0)) {
        errors.push('Designation is required');
      }

      if (!data.accessLevel || (typeof data.accessLevel === 'string' && data.accessLevel.trim().length === 0)) {
        errors.push('Access level is required');
      }

      if (!data.officeLocation || (typeof data.officeLocation === 'string' && data.officeLocation.trim().length === 0)) {
        errors.push('Office location is required');
      }

      if (!data.dateOfJoining) {
        errors.push('Date of joining is required');
      }
    }

    // Optional field validations
    if (data.email && data.email.trim() !== '') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Please provide a valid email address');
      }
    }

    if (data.mobileNumber && data.mobileNumber.trim() !== '') {
      const cleanPhone = data.mobileNumber.replace(/\s/g, '');
      if (!/^[0-9]{10}$/.test(cleanPhone)) {
        errors.push('Mobile number must be exactly 10 digits');
      }
    }

    if (data.contact?.address?.pincode && data.contact.address.pincode.trim() !== '') {
      if (!/^[0-9]{6}$/.test(data.contact.address.pincode)) {
        errors.push('Pincode must be exactly 6 digits');
      }
    }

    if (data.adminNotes && data.adminNotes.length > 1000) {
      errors.push('Admin notes cannot exceed 1000 characters');
    }

    return errors;
  }

  // Get required fields for profile completion
  getRequiredFields() {
    return [
      'employeeId',
      'name.firstName',
      'name.lastName',
      'email',
      'mobileNumber',
      'gender',
      'role',
      'designation',
      'accessLevel',
      'officeLocation',
      'dateOfJoining'
    ];
  }

  // Calculate profile completion percentage
  calculateProfileCompletion(administratorData) {
    const requiredFields = this.getRequiredFields();
    let completedFields = 0;

    requiredFields.forEach(field => {
      const fieldValue = this.getNestedValue(administratorData, field);
      if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
        completedFields++;
      }
    });

    return Math.round((completedFields / requiredFields.length) * 100);
  }

  // Helper method to get nested object values
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  // Format date for display
  formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Format date for input fields
  formatDateForInput(date) {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }
}

// Create and export singleton instance
const administratorApi = new AdministratorApi();
export default administratorApi;
