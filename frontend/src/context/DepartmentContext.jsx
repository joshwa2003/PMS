import React, { createContext, useContext, useReducer, useCallback } from 'react';
import departmentService from '../services/departmentService';

// Create context
const DepartmentContext = createContext();

// Custom hook to use the context
export const useDepartment = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error('useDepartment must be used within a DepartmentProvider');
  }
  return context;
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_DEPARTMENTS: 'SET_DEPARTMENTS',
  ADD_DEPARTMENT: 'ADD_DEPARTMENT',
  UPDATE_DEPARTMENT: 'UPDATE_DEPARTMENT',
  DELETE_DEPARTMENT: 'DELETE_DEPARTMENT',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_FILTERS: 'SET_FILTERS',
  SET_PLACEMENT_STAFF_OPTIONS: 'SET_PLACEMENT_STAFF_OPTIONS'
};

// Initial state
const initialState = {
  departments: [],
  placementStaffOptions: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalDepartments: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  filters: {
    search: '',
    isActive: ''
  }
};

// Reducer function
const departmentReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case actionTypes.SET_DEPARTMENTS:
      return { ...state, departments: action.payload, loading: false, error: null };
    
    case actionTypes.ADD_DEPARTMENT:
      return { 
        ...state, 
        departments: [action.payload, ...state.departments],
        loading: false,
        error: null
      };
    
    case actionTypes.UPDATE_DEPARTMENT:
      return {
        ...state,
        departments: state.departments.map(department =>
          department.id === action.payload.id ? action.payload : department
        ),
        loading: false,
        error: null
      };
    
    case actionTypes.DELETE_DEPARTMENT:
      return {
        ...state,
        departments: state.departments.filter(department => department.id !== action.payload),
        loading: false,
        error: null
      };
    
    case actionTypes.SET_PAGINATION:
      return { ...state, pagination: action.payload };
    
    case actionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case actionTypes.SET_PLACEMENT_STAFF_OPTIONS:
      return { ...state, placementStaffOptions: action.payload };
    
    default:
      return state;
  }
};

// Provider component
export const DepartmentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(departmentReducer, initialState);

  // Fetch all departments
  const fetchDepartments = useCallback(async (params = {}) => {
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

      const response = await departmentService.getAllDepartments(finalParams);
      
      // Handle different response structures
      let departments = [];
      let pagination = null;
      
      if (response && response.data && response.data.departments) {
        // Structure: { data: { departments: [...], pagination: {...} } }
        departments = response.data.departments;
        pagination = response.data.pagination;
      } else if (response && response.departments) {
        // Structure: { departments: [...], pagination: {...} }
        departments = response.departments;
        pagination = response.pagination;
      }
      
      const formattedDepartments = departments.map(
        departmentService.formatDepartmentData
      );

      dispatch({ type: actionTypes.SET_DEPARTMENTS, payload: formattedDepartments });
      
      if (pagination) {
        dispatch({ type: actionTypes.SET_PAGINATION, payload: pagination });
      }
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message || 'Failed to fetch departments' });
    }
  }, [state.pagination.currentPage, state.filters.search, state.filters.isActive]);


  // Create new department
  const createDepartment = useCallback(async (departmentData) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    dispatch({ type: actionTypes.CLEAR_ERROR });

    try {
      const response = await departmentService.createDepartment(departmentData);
      
      // Handle different response structures
      let department = null;
      
      if (response && response.data && response.data.department) {
        // Structure: { data: { department: {...} } }
        department = response.data.department;
      } else if (response && response.department) {
        // Structure: { department: {...} }
        department = response.department;
      }
      
      if (department) {
        const formattedDepartment = departmentService.formatDepartmentData(department);
        dispatch({ type: actionTypes.ADD_DEPARTMENT, payload: formattedDepartment });
      }
      
      // Refresh the departments list to ensure UI is up to date
      // This helps in case there were any issues with the response but the department was created
      setTimeout(() => {
        fetchDepartments();
      }, 500);
      
      return response;
    } catch (error) {
      console.error('Error creating department:', error);
      
      // Even if there's an error, the department might have been created successfully
      // So we refresh the list to check
      setTimeout(() => {
        fetchDepartments();
      }, 1000);
      
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message || 'Failed to create department' });
      throw error;
    }
  }, [fetchDepartments]);

  // Update department
  const updateDepartment = useCallback(async (id, departmentData) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    dispatch({ type: actionTypes.CLEAR_ERROR });

    try {
      const response = await departmentService.updateDepartment(id, departmentData);
      
      // Handle different response structures
      let department = null;
      
      if (response && response.data && response.data.department) {
        // Structure: { data: { department: {...} } }
        department = response.data.department;
      } else if (response && response.department) {
        // Structure: { department: {...} }
        department = response.department;
      }
      
      if (department) {
        const formattedDepartment = departmentService.formatDepartmentData(department);
        dispatch({ type: actionTypes.UPDATE_DEPARTMENT, payload: formattedDepartment });
      }
      
      // Refresh the departments list to ensure UI is up to date
      // This helps in case there were any issues with the response but the department was updated
      setTimeout(() => {
        fetchDepartments();
      }, 500);
      
      return response;
    } catch (error) {
      console.error('Error updating department:', error);
      
      // Even if there's an error, the department might have been updated successfully
      // So we refresh the list to check
      setTimeout(() => {
        fetchDepartments();
      }, 1000);
      
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message || 'Failed to update department' });
      throw error;
    }
  }, [fetchDepartments]);

  // Delete department
  const deleteDepartment = useCallback(async (id) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    dispatch({ type: actionTypes.CLEAR_ERROR });

    try {
      await departmentService.deleteDepartment(id);
      dispatch({ type: actionTypes.DELETE_DEPARTMENT, payload: id });
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message || 'Failed to delete department' });
      throw error;
    }
  }, []);

  // Toggle department status
  const toggleDepartmentStatus = useCallback(async (id) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    dispatch({ type: actionTypes.CLEAR_ERROR });

    try {
      const response = await departmentService.toggleDepartmentStatus(id);
      
      // Handle different response structures
      let department = null;
      
      if (response && response.data && response.data.department) {
        // Structure: { data: { department: {...} } }
        department = response.data.department;
      } else if (response && response.department) {
        // Structure: { department: {...} }
        department = response.department;
      }
      
      if (department) {
        const formattedDepartment = departmentService.formatDepartmentData(department);
        dispatch({ type: actionTypes.UPDATE_DEPARTMENT, payload: formattedDepartment });
      }
      
      return response;
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message || 'Failed to update department status' });
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

  // Fetch placement staff options
  const fetchPlacementStaffOptions = useCallback(async () => {
    // Don't fetch if already loading or if we already have data
    if (state.loading || state.placementStaffOptions.length > 0) {
      return;
    }

    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    dispatch({ type: actionTypes.CLEAR_ERROR });

    try {
      const response = await departmentService.getPlacementStaffOptions();
      
      // Handle different response structures
      let placementStaff = [];
      
      if (response && response.data && response.data.placementStaff) {
        // Structure: { data: { placementStaff: [...] } }
        placementStaff = response.data.placementStaff;
      } else if (response && response.placementStaff) {
        // Structure: { placementStaff: [...] }
        placementStaff = response.placementStaff;
      }
      
      dispatch({ type: actionTypes.SET_PLACEMENT_STAFF_OPTIONS, payload: placementStaff });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      
      return response;
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message || 'Failed to fetch placement staff options' });
      throw error;
    }
  }, [state.loading, state.placementStaffOptions.length]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  }, []);

  // Service utilities
  const serviceUtils = {
    formatDepartmentData: departmentService.formatDepartmentData,
    validateDepartmentData: departmentService.validateDepartmentData,
    getDepartmentStatusColor: departmentService.getDepartmentStatusColor,
    getDepartmentStatusText: departmentService.getDepartmentStatusText,
    formatCreationDate: departmentService.formatCreationDate,
    getPlacementStaffDisplayName: departmentService.getPlacementStaffDisplayName,
    getRoleDisplayName: departmentService.getRoleDisplayName,
    filterDepartments: departmentService.filterDepartments,
    sortDepartments: departmentService.sortDepartments,
    generateDepartmentCodeSuggestion: departmentService.generateDepartmentCodeSuggestion
  };

  const contextValue = {
    // State
    departments: state.departments,
    placementStaffOptions: state.placementStaffOptions,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    filters: state.filters,

    // Actions
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    toggleDepartmentStatus,
    fetchPlacementStaffOptions,
    handleFilterChange,
    handlePageChange,
    clearError,

    // Utilities
    ...serviceUtils
  };

  return (
    <DepartmentContext.Provider value={contextValue}>
      {children}
    </DepartmentContext.Provider>
  );
};

export default DepartmentContext;
