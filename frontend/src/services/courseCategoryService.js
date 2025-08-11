import api from './api';

const API_BASE_URL = '/course-categories';

const courseCategoryService = {
  // Get all course categories
  getAllCourseCategories: async (params = {}) => {
    try {
      const response = await api.get(API_BASE_URL, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single course category
  getCourseCategory: async (id) => {
    try {
      const response = await api.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new course category
  createCourseCategory: async (categoryData) => {
    try {
      const response = await api.post(API_BASE_URL, categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update course category
  updateCourseCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`${API_BASE_URL}/${id}`, categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete course category
  deleteCourseCategory: async (id) => {
    try {
      const response = await api.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Toggle course category status
  toggleCourseCategoryStatus: async (id) => {
    try {
      const response = await api.patch(`${API_BASE_URL}/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Utility functions
  formatCategoryData: (category) => {
    return {
      id: category._id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      createdBy: category.createdBy,
      updatedBy: category.updatedBy,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      formattedCreatedAt: category.formattedCreatedAt
    };
  },

  validateCategoryData: (categoryData) => {
    const errors = {};

    if (!categoryData.name || categoryData.name.trim().length === 0) {
      errors.name = 'Course category name is required';
    } else if (categoryData.name.trim().length > 100) {
      errors.name = 'Course category name cannot exceed 100 characters';
    }

    if (categoryData.description && categoryData.description.trim().length > 500) {
      errors.description = 'Description cannot exceed 500 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  getCategoryStatusColor: (category) => {
    if (!category.isActive) return 'error';
    return 'success';
  },

  getCategoryStatusText: (category) => {
    if (!category.isActive) return 'Inactive';
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

  // Filter and sort utilities
  filterCategories: (categories, filters) => {
    return categories.filter(category => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          category.name.toLowerCase().includes(searchLower) ||
          (category.description && category.description.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.isActive !== '') {
        if (filters.isActive !== category.isActive) return false;
      }

      return true;
    });
  },

  sortCategories: (categories, sortBy = 'createdAt', sortOrder = 'desc') => {
    return [...categories].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date sorting
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
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
  }
};

export default courseCategoryService;
