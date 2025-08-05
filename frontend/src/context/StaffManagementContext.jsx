import React, { createContext, useContext, useReducer, useCallback } from 'react';
import staffService from '../services/staffService';

// Initial state
const initialState = {
  staff: [],
  currentStaff: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalStaff: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  filters: {
    role: '',
    department: '',
    isActive: '',
    isVerified: '',
    searchTerm: ''
  },
  sortBy: 'createdAt',
  sortOrder: 'desc'
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_STAFF: 'SET_STAFF',
  SET_CURRENT_STAFF: 'SET_CURRENT_STAFF',
  ADD_STAFF: 'ADD_STAFF',
  UPDATE_STAFF: 'UPDATE_STAFF',
  DELETE_STAFF: 'DELETE_STAFF',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_FILTERS: 'SET_FILTERS',
  SET_SORT: 'SET_SORT',
  RESET_STATE: 'RESET_STATE'
};

// Reducer function
const staffManagementReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case actionTypes.SET_STAFF:
      return {
        ...state,
        staff: action.payload,
        loading: false,
        error: null
      };

    case actionTypes.SET_CURRENT_STAFF:
      return {
        ...state,
        currentStaff: action.payload
      };

    case actionTypes.ADD_STAFF:
      return {
        ...state,
        staff: [action.payload, ...state.staff],
        loading: false,
        error: null
      };

    case actionTypes.UPDATE_STAFF:
      return {
        ...state,
        staff: state.staff.map(member =>
          member.id === action.payload.id ? action.payload : member
        ),
        currentStaff: state.currentStaff?.id === action.payload.id ? action.payload : state.currentStaff,
        loading: false,
        error: null
      };

    case actionTypes.DELETE_STAFF:
      return {
        ...state,
        staff: state.staff.filter(member => member.id !== action.payload),
        currentStaff: state.currentStaff?.id === action.payload ? null : state.currentStaff,
        loading: false,
        error: null
      };

    case actionTypes.SET_PAGINATION:
      return {
        ...state,
        pagination: action.payload
      };

    case actionTypes.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };

    case actionTypes.SET_SORT:
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder
      };

    case actionTypes.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

// Create context
const StaffManagementContext = createContext();

// Custom hook to use the context
export const useStaffManagement = () => {
  const context = useContext(StaffManagementContext);
  if (!context) {
    throw new Error('useStaffManagement must be used within a StaffManagementProvider');
  }
  return context;
};

// Provider component
export const StaffManagementProvider = ({ children }) => {
  const [state, dispatch] = useReducer(staffManagementReducer, initialState);

  // Action creators
  const setLoading = useCallback((loading) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: actionTypes.SET_ERROR, payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  }, []);

  const setStaff = useCallback((staff) => {
    dispatch({ type: actionTypes.SET_STAFF, payload: staff });
  }, []);

  const setCurrentStaff = useCallback((staff) => {
    dispatch({ type: actionTypes.SET_CURRENT_STAFF, payload: staff });
  }, []);

  const setPagination = useCallback((pagination) => {
    dispatch({ type: actionTypes.SET_PAGINATION, payload: pagination });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: actionTypes.SET_FILTERS, payload: filters });
  }, []);

  const setSort = useCallback((sortBy, sortOrder) => {
    dispatch({ type: actionTypes.SET_SORT, payload: { sortBy, sortOrder } });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: actionTypes.RESET_STATE });
  }, []);

  // API functions
  const fetchStaff = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      clearError();

      const queryParams = {
        page: state.pagination.currentPage,
        limit: 10,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        ...state.filters,
        ...params
      };

      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response = await staffService.getAllStaff(queryParams);
      
      setStaff(response.staff);
      setPagination(response.pagination);
    } catch (error) {
      setError(error.message || 'Failed to fetch staff members');
    }
  }, [state.pagination.currentPage, state.sortBy, state.sortOrder, state.filters]);

  const createStaff = useCallback(async (staffData) => {
    try {
      setLoading(true);
      clearError();

      const response = await staffService.createStaff(staffData);
      
      dispatch({ type: actionTypes.ADD_STAFF, payload: response.staff });
      
      return response;
    } catch (error) {
      setError(error.message || 'Failed to create staff member');
      throw error;
    }
  }, []);

  const updateStaff = useCallback(async (staffId, staffData) => {
    try {
      setLoading(true);
      clearError();

      const response = await staffService.updateStaff(staffId, staffData);
      
      dispatch({ type: actionTypes.UPDATE_STAFF, payload: response.staff });
      
      return response;
    } catch (error) {
      setError(error.message || 'Failed to update staff member');
      throw error;
    }
  }, []);

  const deleteStaff = useCallback(async (staffId) => {
    try {
      setLoading(true);
      clearError();

      await staffService.deleteStaff(staffId);
      
      dispatch({ type: actionTypes.DELETE_STAFF, payload: staffId });
    } catch (error) {
      setError(error.message || 'Failed to delete staff member');
      throw error;
    }
  }, []);

  const updateStaffStatus = useCallback(async (staffId, isActive) => {
    try {
      setLoading(true);
      clearError();

      const response = await staffService.updateStaffStatus(staffId, isActive);
      
      dispatch({ type: actionTypes.UPDATE_STAFF, payload: response.staff });
      
      return response;
    } catch (error) {
      setError(error.message || 'Failed to update staff status');
      throw error;
    }
  }, []);

  const getStaffByRole = useCallback(async (role, params = {}) => {
    try {
      setLoading(true);
      clearError();

      const response = await staffService.getStaffByRole(role, params);
      
      setStaff(response.staff);
      setPagination(response.pagination);
    } catch (error) {
      setError(error.message || 'Failed to fetch staff by role');
    }
  }, []);

  const getStaffByDepartment = useCallback(async (department, params = {}) => {
    try {
      setLoading(true);
      clearError();

      const response = await staffService.getStaffByDepartment(department, params);
      
      setStaff(response.staff);
      setPagination(response.pagination);
    } catch (error) {
      setError(error.message || 'Failed to fetch staff by department');
    }
  }, []);

  // Utility functions
  const handlePageChange = useCallback((page) => {
    setPagination({ ...state.pagination, currentPage: page });
    fetchStaff({ page });
  }, [state.pagination, fetchStaff]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPagination({ ...state.pagination, currentPage: 1 });
    fetchStaff({ ...newFilters, page: 1 });
  }, [state.pagination, fetchStaff]);

  const handleSortChange = useCallback((sortBy, sortOrder) => {
    setSort(sortBy, sortOrder);
    fetchStaff({ sortBy, sortOrder });
  }, [fetchStaff]);

  const searchStaff = useCallback((searchTerm) => {
    const newFilters = { ...state.filters, searchTerm };
    handleFilterChange(newFilters);
  }, [state.filters, handleFilterChange]);

  const clearFilters = useCallback(() => {
    const clearedFilters = {
      role: '',
      department: '',
      isActive: '',
      isVerified: '',
      searchTerm: ''
    };
    handleFilterChange(clearedFilters);
  }, [handleFilterChange]);

  // Context value
  const contextValue = {
    // State
    ...state,
    
    // Actions
    setLoading,
    setError,
    clearError,
    setCurrentStaff,
    resetState,
    
    // API functions
    fetchStaff,
    createStaff,
    updateStaff,
    updateStaffStatus,
    deleteStaff,
    getStaffByRole,
    getStaffByDepartment,
    
    // Utility functions
    handlePageChange,
    handleFilterChange,
    handleSortChange,
    searchStaff,
    clearFilters,
    
    // Service utilities
    formatStaffData: staffService.formatStaffData,
    getRoleDisplayName: staffService.getRoleDisplayName,
    getDepartmentDisplayName: staffService.getDepartmentDisplayName,
    getStaffStatusColor: staffService.getStaffStatusColor,
    getStaffStatusText: staffService.getStaffStatusText,
    formatLastLogin: staffService.formatLastLogin,
    validateStaffData: staffService.validateStaffData,
    generateEmployeeIdSuggestion: staffService.generateEmployeeIdSuggestion,
    getAvailableRoles: staffService.getAvailableRoles,
    getAvailableDepartments: staffService.getAvailableDepartments,
    getCommonDesignations: staffService.getCommonDesignations
  };

  return (
    <StaffManagementContext.Provider value={contextValue}>
      {children}
    </StaffManagementContext.Provider>
  );
};

export default StaffManagementContext;
