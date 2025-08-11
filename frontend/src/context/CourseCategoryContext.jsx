import React, { createContext, useContext, useReducer, useCallback } from 'react';
import courseCategoryService from '../services/courseCategoryService';

// Create context
const CourseCategoryContext = createContext();

// Custom hook to use the context
export const useCourseCategory = () => {
  const context = useContext(CourseCategoryContext);
  if (!context) {
    throw new Error('useCourseCategory must be used within a CourseCategoryProvider');
  }
  return context;
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_CATEGORIES: 'SET_CATEGORIES',
  ADD_CATEGORY: 'ADD_CATEGORY',
  UPDATE_CATEGORY: 'UPDATE_CATEGORY',
  DELETE_CATEGORY: 'DELETE_CATEGORY',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_FILTERS: 'SET_FILTERS',
  SET_STATS: 'SET_STATS'
};

// Initial state
const initialState = {
  categories: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCategories: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  filters: {
    search: '',
    isActive: ''
  },
  stats: {
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
    recentlyAdded: 0
  }
};

// Reducer function
const courseCategoryReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case actionTypes.SET_CATEGORIES:
      return { ...state, categories: action.payload, loading: false, error: null };
    
    case actionTypes.ADD_CATEGORY:
      return { 
        ...state, 
        categories: [action.payload, ...state.categories],
        loading: false,
        error: null
      };
    
    case actionTypes.UPDATE_CATEGORY:
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id ? action.payload : category
        ),
        loading: false,
        error: null
      };
    
    case actionTypes.DELETE_CATEGORY:
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload),
        loading: false,
        error: null
      };
    
    case actionTypes.SET_PAGINATION:
      return { ...state, pagination: action.payload };
    
    case actionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case actionTypes.SET_STATS:
      return { ...state, stats: action.payload };
    
    default:
      return state;
  }
};

// Provider component
export const CourseCategoryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(courseCategoryReducer, initialState);

  // Fetch all course categories
  const fetchCategories = useCallback(async (params = {}) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    dispatch({ type: actionTypes.CLEAR_ERROR });

    try {
      const finalParams = {
        page: state.pagination.currentPage,
        limit: 10,
        search: state.filters.search,
        isActive: state.filters.isActive,
        ...params
      };

      console.log('Fetching course categories with params:', finalParams);
      const response = await courseCategoryService.getAllCourseCategories(finalParams);
      console.log('Course categories response:', response);
      
      // Handle different response structures
      let courseCategories = null;
      let pagination = null;
      
      if (response && response.data && response.data.courseCategories) {
        // Structure: { data: { courseCategories: [...], pagination: {...} } }
        courseCategories = response.data.courseCategories;
        pagination = response.data.pagination;
      } else if (response && response.courseCategories) {
        // Structure: { courseCategories: [...], pagination: {...} }
        courseCategories = response.courseCategories;
        pagination = response.pagination;
      }
      
      if (courseCategories && Array.isArray(courseCategories)) {
        const formattedCategories = courseCategories.map(
          courseCategoryService.formatCategoryData
        );

        console.log('Formatted categories:', formattedCategories);
        dispatch({ type: actionTypes.SET_CATEGORIES, payload: formattedCategories });
        dispatch({ type: actionTypes.SET_PAGINATION, payload: pagination || initialState.pagination });
      } else {
        console.log('No course categories data found in response');
        // If no data, set empty array
        dispatch({ type: actionTypes.SET_CATEGORIES, payload: [] });
        dispatch({ type: actionTypes.SET_PAGINATION, payload: initialState.pagination });
      }
    } catch (error) {
      console.error('Error fetching course categories:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message || 'Failed to fetch course categories' });
    }
  }, [state.pagination.currentPage, state.filters.search, state.filters.isActive]);

  // Create new course category
  const createCategory = useCallback(async (categoryData) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    dispatch({ type: actionTypes.CLEAR_ERROR });

    try {
      const response = await courseCategoryService.createCourseCategory(categoryData);
      
      // Handle different response structures
      let courseCategory = null;
      
      if (response && response.data && response.data.courseCategory) {
        // Structure: { data: { courseCategory: {...} } }
        courseCategory = response.data.courseCategory;
      } else if (response && response.courseCategory) {
        // Structure: { courseCategory: {...} }
        courseCategory = response.courseCategory;
      }
      
      if (courseCategory) {
        const formattedCategory = courseCategoryService.formatCategoryData(courseCategory);
        dispatch({ type: actionTypes.ADD_CATEGORY, payload: formattedCategory });
      }
      
      return response;
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message || 'Failed to create course category' });
      throw error;
    }
  }, []);

  // Update course category
  const updateCategory = useCallback(async (id, categoryData) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    dispatch({ type: actionTypes.CLEAR_ERROR });

    try {
      const response = await courseCategoryService.updateCourseCategory(id, categoryData);
      
      // Handle different response structures
      let courseCategory = null;
      
      if (response && response.data && response.data.courseCategory) {
        // Structure: { data: { courseCategory: {...} } }
        courseCategory = response.data.courseCategory;
      } else if (response && response.courseCategory) {
        // Structure: { courseCategory: {...} }
        courseCategory = response.courseCategory;
      }
      
      if (courseCategory) {
        const formattedCategory = courseCategoryService.formatCategoryData(courseCategory);
        dispatch({ type: actionTypes.UPDATE_CATEGORY, payload: formattedCategory });
      }
      
      return response;
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message || 'Failed to update course category' });
      throw error;
    }
  }, []);

  // Delete course category
  const deleteCategory = useCallback(async (id) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    dispatch({ type: actionTypes.CLEAR_ERROR });

    try {
      await courseCategoryService.deleteCourseCategory(id);
      dispatch({ type: actionTypes.DELETE_CATEGORY, payload: id });
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message || 'Failed to delete course category' });
      throw error;
    }
  }, []);

  // Toggle category status
  const toggleCategoryStatus = useCallback(async (id) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    dispatch({ type: actionTypes.CLEAR_ERROR });

    try {
      const response = await courseCategoryService.toggleCourseCategoryStatus(id);
      
      // Handle different response structures
      let courseCategory = null;
      
      if (response && response.data && response.data.courseCategory) {
        // Structure: { data: { courseCategory: {...} } }
        courseCategory = response.data.courseCategory;
      } else if (response && response.courseCategory) {
        // Structure: { courseCategory: {...} }
        courseCategory = response.courseCategory;
      }
      
      if (courseCategory) {
        const formattedCategory = courseCategoryService.formatCategoryData(courseCategory);
        dispatch({ type: actionTypes.UPDATE_CATEGORY, payload: formattedCategory });
      }
      
      return response;
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message || 'Failed to update category status' });
      throw error;
    }
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    dispatch({ type: actionTypes.SET_FILTERS, payload: newFilters });
    // Reset to first page when filters change
    dispatch({ type: actionTypes.SET_PAGINATION, payload: { ...state.pagination, currentPage: 1 } });
  }, [state.pagination]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    dispatch({ type: actionTypes.SET_PAGINATION, payload: { ...state.pagination, currentPage: newPage } });
  }, [state.pagination]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      // Calculate stats from current categories
      const totalCategories = state.categories.length;
      const activeCategories = state.categories.filter(cat => cat.isActive).length;
      const inactiveCategories = totalCategories - activeCategories;
      
      // Calculate recently added (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentlyAdded = state.categories.filter(cat => 
        new Date(cat.createdAt) >= sevenDaysAgo
      ).length;

      const stats = {
        totalCategories,
        activeCategories,
        inactiveCategories,
        recentlyAdded
      };

      dispatch({ type: actionTypes.SET_STATS, payload: stats });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  }, [state.categories]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  }, []);

  // Service utilities
  const serviceUtils = {
    formatCategoryData: courseCategoryService.formatCategoryData,
    validateCategoryData: courseCategoryService.validateCategoryData,
    getCategoryStatusColor: courseCategoryService.getCategoryStatusColor,
    getCategoryStatusText: courseCategoryService.getCategoryStatusText,
    formatCreationDate: courseCategoryService.formatCreationDate,
    filterCategories: courseCategoryService.filterCategories,
    sortCategories: courseCategoryService.sortCategories
  };

  const contextValue = {
    // State
    categories: state.categories,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    filters: state.filters,
    stats: state.stats,

    // Actions
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    handleFilterChange,
    handlePageChange,
    fetchStats,
    clearError,

    // Utilities
    ...serviceUtils
  };

  return (
    <CourseCategoryContext.Provider value={contextValue}>
      {children}
    </CourseCategoryContext.Provider>
  );
};

export default CourseCategoryContext;
