import api from './api';

const API_BASE_URL = '/departments';

const departmentService = {
  // Get all departments
  getAllDepartments: async (params = {}) => {
    try {
      const response = await api.get(API_BASE_URL, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single department
  getDepartment: async (id) => {
    try {
      const response = await api.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get placement staff options
  getPlacementStaffOptions: async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/placement-staff-options`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new department
  createDepartment: async (departmentData) => {
    try {
      const response = await api.post(API_BASE_URL, departmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update department
  updateDepartment: async (id, departmentData) => {
    try {
      const response = await api.put(`${API_BASE_URL}/${id}`, departmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete department
  deleteDepartment: async (id) => {
    try {
      const response = await api.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Toggle department status
  toggleDepartmentStatus: async (id) => {
    try {
      const response = await api.patch(`${API_BASE_URL}/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Utility functions
  formatDepartmentData: (department) => {
    return {
      id: department._id,
      name: department.name,
      code: department.code,
      description: department.description,
      courseCategory: department.courseCategory,
      placementStaff: department.placementStaff,
      isActive: department.isActive,
      createdBy: department.createdBy,
      updatedBy: department.updatedBy,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
      formattedCreatedAt: department.formattedCreatedAt,
      displayName: department.displayName
    };
  },

  validateDepartmentData: (departmentData) => {
    const errors = {};

    if (!departmentData.name || departmentData.name.trim().length === 0) {
      errors.name = 'Department name is required';
    } else if (departmentData.name.trim().length > 100) {
      errors.name = 'Department name cannot exceed 100 characters';
    }

    if (!departmentData.code || departmentData.code.trim().length === 0) {
      errors.code = 'Department code is required';
    } else if (departmentData.code.trim().length > 10) {
      errors.code = 'Department code cannot exceed 10 characters';
    }

    if (!departmentData.courseCategory) {
      errors.courseCategory = 'Course category is required';
    }

    if (departmentData.description && departmentData.description.trim().length > 500) {
      errors.description = 'Description cannot exceed 500 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  getDepartmentStatusColor: (department) => {
    if (!department.isActive) return 'error';
    return 'success';
  },

  getDepartmentStatusText: (department) => {
    if (!department.isActive) return 'Inactive';
    return 'Active';
  },

  formatCreationDate: (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  },

  getPlacementStaffDisplayName: (placementStaff) => {
    if (!placementStaff) return 'Not Assigned';
    
    if (typeof placementStaff === 'object') {
      return `${placementStaff.firstName} ${placementStaff.lastName}`;
    }
    
    return placementStaff;
  },

  getRoleDisplayName: (role) => {
    const roleMap = {
      'placement_staff': 'Placement Staff',
      'placement_director': 'Placement Director',
      'admin': 'Administrator'
    };
    
    return roleMap[role] || role;
  },

  // Filter and sort utilities
  filterDepartments: (departments, filters) => {
    return departments.filter(department => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          department.name.toLowerCase().includes(searchLower) ||
          department.code.toLowerCase().includes(searchLower) ||
          (department.description && department.description.toLowerCase().includes(searchLower)) ||
          (department.placementStaff && 
           typeof department.placementStaff === 'object' &&
           `${department.placementStaff.firstName} ${department.placementStaff.lastName}`.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.isActive !== '') {
        if (filters.isActive !== department.isActive) return false;
      }

      return true;
    });
  },

  sortDepartments: (departments, sortBy = 'createdAt', sortOrder = 'desc') => {
    return [...departments].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date sorting
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle placement staff sorting
      if (sortBy === 'placementStaff') {
        aValue = departmentService.getPlacementStaffDisplayName(aValue).toLowerCase();
        bValue = departmentService.getPlacementStaffDisplayName(bValue).toLowerCase();
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  },

  // Generate department code suggestion
  generateDepartmentCodeSuggestion: (name) => {
    if (!name) return '';
    
    // Take first 3-4 characters of each word, uppercase
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 4).toUpperCase();
    } else {
      return words.map(word => word.substring(0, 2)).join('').toUpperCase();
    }
  }
};

export default departmentService;
