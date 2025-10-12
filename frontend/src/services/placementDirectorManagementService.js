import api from './api';

class PlacementDirectorManagementService {
  constructor() {
    this.baseURL = '/placement-directors';
  }

  // Create a new placement director
  async createPlacementDirector(directorData) {
    try {
      console.log('Creating placement director:', directorData);
      const response = await api.post(this.baseURL, directorData);
      console.log('Create placement director response:', response);
      return response;
    } catch (error) {
      console.error('Error creating placement director:', error);
      throw this.handleError(error);
    }
  }

  // Get all placement directors with pagination and filters
  async getAllPlacementDirectors(params = {}) {
    try {
      console.log('Fetching placement directors with params:', params);
      const response = await api.get(this.baseURL, { params });
      console.log('Get all placement directors response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching placement directors:', error);
      throw this.handleError(error);
    }
  }

  // Get placement director by ID
  async getPlacementDirectorById(id) {
    try {
      console.log('Fetching placement director by ID:', id);
      const response = await api.get(`${this.baseURL}/${id}`);
      console.log('Get placement director by ID response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching placement director by ID:', error);
      throw this.handleError(error);
    }
  }

  // Update placement director
  async updatePlacementDirector(id, updateData) {
    try {
      console.log('Updating placement director:', id, updateData);
      const response = await api.put(`${this.baseURL}/${id}`, updateData);
      console.log('Update placement director response:', response);
      return response;
    } catch (error) {
      console.error('Error updating placement director:', error);
      throw this.handleError(error);
    }
  }

  // Delete placement director
  async deletePlacementDirector(id) {
    try {
      console.log('Deleting placement director:', id);
      const response = await api.delete(`${this.baseURL}/${id}`);
      console.log('Delete placement director response:', response);
      return response;
    } catch (error) {
      console.error('Error deleting placement director:', error);
      throw this.handleError(error);
    }
  }

  // Resend welcome email to placement director
  async resendWelcomeEmail(id) {
    try {
      console.log('Resending welcome email to placement director:', id);
      const response = await api.post(`${this.baseURL}/${id}/resend-email`);
      console.log('Resend welcome email response:', response);
      return response;
    } catch (error) {
      console.error('Error resending welcome email:', error);
      throw this.handleError(error);
    }
  }

  // Get placement director statistics
  async getPlacementDirectorStats() {
    try {
      console.log('Fetching placement director statistics');
      const response = await api.get(`${this.baseURL}/stats`);
      console.log('Get placement director stats response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching placement director statistics:', error);
      throw this.handleError(error);
    }
  }

  // Search placement directors
  async searchPlacementDirectors(searchParams) {
    try {
      console.log('Searching placement directors:', searchParams);
      const response = await api.get(this.baseURL, { 
        params: {
          ...searchParams,
          search: searchParams.searchTerm
        }
      });
      console.log('Search placement directors response:', response);
      return response;
    } catch (error) {
      console.error('Error searching placement directors:', error);
      throw this.handleError(error);
    }
  }

  // Get available departments for dropdown
  async getAvailableDepartments() {
    try {
      console.log('Fetching available departments');
      const response = await api.get('/departments');
      console.log('Get available departments response:', response);
      
      if (response.success && response.departments) {
        return response.departments.map(dept => ({
          code: dept.code,
          name: dept.name,
          label: `${dept.name} (${dept.code})`
        }));
      }
      
      // Fallback to static departments if API fails
      return this.getStaticDepartments();
    } catch (error) {
      console.error('Error fetching departments, using static list:', error);
      return this.getStaticDepartments();
    }
  }

  // Static departments as fallback
  getStaticDepartments() {
    return [
      { code: 'CSE', name: 'Computer Science & Engineering', label: 'Computer Science & Engineering (CSE)' },
      { code: 'ECE', name: 'Electronics & Communication Engineering', label: 'Electronics & Communication Engineering (ECE)' },
      { code: 'EEE', name: 'Electrical & Electronics Engineering', label: 'Electrical & Electronics Engineering (EEE)' },
      { code: 'MECH', name: 'Mechanical Engineering', label: 'Mechanical Engineering (MECH)' },
      { code: 'CIVIL', name: 'Civil Engineering', label: 'Civil Engineering (CIVIL)' },
      { code: 'IT', name: 'Information Technology', label: 'Information Technology (IT)' },
      { code: 'ADMIN', name: 'Administration', label: 'Administration (ADMIN)' },
      { code: 'HR', name: 'Human Resources', label: 'Human Resources (HR)' },
      { code: 'OTHER', name: 'Other', label: 'Other (OTHER)' }
    ];
  }

  // Validate placement director data
  validatePlacementDirectorData(data) {
    const errors = {};

    if (!data.firstName?.trim()) {
      errors.firstName = 'First name is required';
    } else if (data.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    } else if (data.firstName.trim().length > 50) {
      errors.firstName = 'First name cannot exceed 50 characters';
    }

    if (!data.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    } else if (data.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    } else if (data.lastName.trim().length > 50) {
      errors.lastName = 'Last name cannot exceed 50 characters';
    }

    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }


    if (data.phone && !/^[0-9]{10}$/.test(data.phone.toString().trim())) {
      errors.phone = 'Phone number must be 10 digits';
    }

    if (data.employeeId && (data.employeeId.trim().length < 3 || data.employeeId.trim().length > 20)) {
      errors.employeeId = 'Employee ID must be between 3 and 20 characters';
    }


    if (data.adminNotes && data.adminNotes.trim().length > 1000) {
      errors.adminNotes = 'Admin notes cannot exceed 1000 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Format placement director data for display
  formatPlacementDirectorForDisplay(director) {
    if (!director) return null;

    return {
      ...director,
      fullName: `${director.firstName} ${director.lastName}`,
      departmentDisplay: this.getDepartmentDisplayName(director.departmentCode),
      statusDisplay: director.isActive ? 'Active' : 'Inactive',
      verificationDisplay: director.isVerified ? 'Verified' : 'Unverified',
      createdAtFormatted: director.createdAt ? new Date(director.createdAt).toLocaleDateString() : 'N/A',
      lastLoginFormatted: director.lastLogin ? new Date(director.lastLogin).toLocaleDateString() : 'Never',
      roleAssignedAtFormatted: director.roleAssignedAt ? new Date(director.roleAssignedAt).toLocaleDateString() : 'N/A',
      emailSentAtFormatted: director.emailSentAt ? new Date(director.emailSentAt).toLocaleDateString() : 'N/A'
    };
  }

  // Get department display name
  getDepartmentDisplayName(departmentCode) {
    const departments = {
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
    return departments[departmentCode] || departmentCode;
  }

  // Handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        return new Error('Unauthorized access. Please login again.');
      } else if (status === 403) {
        return new Error('Access denied. Admin privileges required.');
      } else if (status === 404) {
        return new Error('Placement director not found.');
      } else if (status === 400 && data.errors) {
        // Validation errors
        const errorMessages = data.errors.map(err => err.msg).join(', ');
        return new Error(errorMessages);
      } else if (data.message) {
        return new Error(data.message);
      }
      
      return new Error(`Server error: ${status}`);
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection.');
    } else {
      // Other error
      return new Error(error.message || 'An unexpected error occurred.');
    }
  }

  // Get role permissions for placement directors
  getRolePermissions() {
    return [
      'read',
      'write', 
      'manage_jobs',
      'view_reports'
    ];
  }

  // Export placement directors data to CSV
  exportToCSV(directors) {
    if (!directors || directors.length === 0) {
      throw new Error('No placement directors data to export');
    }

    const headers = [
      'Name',
      'Email',
      'Department',
      'Designation',
      'Employee ID',
      'Phone',
      'Status',
      'Verified',
      'Created Date',
      'Last Login',
      'Email Sent'
    ];

    const csvContent = [
      headers.join(','),
      ...directors.map(director => [
        `"${director.fullName || `${director.firstName} ${director.lastName}`}"`,
        `"${director.email}"`,
        `"${this.getDepartmentDisplayName(director.departmentCode)}"`,
        `"${director.designation || ''}"`,
        `"${director.employeeId || ''}"`,
        `"${director.phone || ''}"`,
        `"${director.isActive ? 'Active' : 'Inactive'}"`,
        `"${director.isVerified ? 'Verified' : 'Unverified'}"`,
        `"${director.createdAt ? new Date(director.createdAt).toLocaleDateString() : ''}"`,
        `"${director.lastLogin ? new Date(director.lastLogin).toLocaleDateString() : 'Never'}"`,
        `"${director.emailSent ? 'Yes' : 'No'}"`
      ].join(','))
    ].join('\n');

    return csvContent;
  }
}

// Create and export singleton instance
const placementDirectorManagementService = new PlacementDirectorManagementService();
export default placementDirectorManagementService;
