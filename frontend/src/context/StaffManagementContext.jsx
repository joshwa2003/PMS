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
  sortOrder: 'desc',
  displayMode: 'all', // 'all' or 'paginated'
  itemsPerPage: 10, // Used when displayMode is 'paginated'
  // Selection state for bulk operations
  selectedStaff: [], // Array of selected staff IDs
  selectAll: false, // Whether all staff are selected
  bulkOperationLoading: false // Loading state for bulk operations
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
  DELETE_BULK_STAFF: 'DELETE_BULK_STAFF',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_FILTERS: 'SET_FILTERS',
  SET_SORT: 'SET_SORT',
  SET_DISPLAY_MODE: 'SET_DISPLAY_MODE',
  SET_ITEMS_PER_PAGE: 'SET_ITEMS_PER_PAGE',
  SET_SELECTED_STAFF: 'SET_SELECTED_STAFF',
  SET_SELECT_ALL: 'SET_SELECT_ALL',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  SET_BULK_OPERATION_LOADING: 'SET_BULK_OPERATION_LOADING',
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
        selectedStaff: state.selectedStaff.filter(id => id !== action.payload),
        loading: false,
        error: null
      };

    case actionTypes.DELETE_BULK_STAFF:
      return {
        ...state,
        staff: state.staff.filter(member => !action.payload.includes(member.id)),
        selectedStaff: [],
        selectAll: false,
        bulkOperationLoading: false,
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

    case actionTypes.SET_DISPLAY_MODE:
      return {
        ...state,
        displayMode: action.payload
      };

    case actionTypes.SET_ITEMS_PER_PAGE:
      return {
        ...state,
        itemsPerPage: action.payload
      };

    case actionTypes.SET_SELECTED_STAFF:
      return {
        ...state,
        selectedStaff: action.payload
      };

    case actionTypes.SET_SELECT_ALL:
      return {
        ...state,
        selectAll: action.payload,
        // Only modify selectedStaff when explicitly selecting all, not when deselecting all
        selectedStaff: action.payload ? state.staff.map(member => member.id) : state.selectedStaff
      };

    case actionTypes.CLEAR_SELECTION:
      return {
        ...state,
        selectedStaff: [],
        selectAll: false
      };

    case actionTypes.SET_BULK_OPERATION_LOADING:
      return {
        ...state,
        bulkOperationLoading: action.payload
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

  const setDisplayMode = useCallback((mode) => {
    dispatch({ type: actionTypes.SET_DISPLAY_MODE, payload: mode });
  }, []);

  const setItemsPerPage = useCallback((itemsPerPage) => {
    dispatch({ type: actionTypes.SET_ITEMS_PER_PAGE, payload: itemsPerPage });
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
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        ...state.filters,
        ...params
      };

      // Add pagination parameters based on display mode
      if (state.displayMode === 'paginated') {
        queryParams.page = params.page || state.pagination.currentPage;
        queryParams.limit = params.limit || state.itemsPerPage;
      } else {
        // For 'all' mode, use a very high limit to get all records
        queryParams.page = 1;
        queryParams.limit = 1000; // High limit to get all staff
      }

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
  }, [state.sortBy, state.sortOrder, state.filters, state.displayMode, state.pagination.currentPage, state.itemsPerPage]);

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

  const createBulkStaff = useCallback(async (staffDataArray) => {
    try {
      setLoading(true);
      clearError();

      const response = await staffService.createBulkStaff(staffDataArray);
      
      // Add all created staff to the state
      if (response.results && response.results.createdStaff) {
        response.results.createdStaff.forEach(staff => {
          dispatch({ type: actionTypes.ADD_STAFF, payload: staff });
        });
      }
      
      return response;
    } catch (error) {
      setError(error.message || 'Failed to create bulk staff members');
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

  const deleteBulkStaff = useCallback(async (staffIds) => {
    try {
      dispatch({ type: actionTypes.SET_BULK_OPERATION_LOADING, payload: true });
      clearError();

      const response = await staffService.deleteBulkStaff(staffIds);
      
      dispatch({ type: actionTypes.DELETE_BULK_STAFF, payload: staffIds });
      
      return response;
    } catch (error) {
      dispatch({ type: actionTypes.SET_BULK_OPERATION_LOADING, payload: false });
      setError(error.message || 'Failed to delete staff members');
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
    if (state.displayMode === 'paginated') {
      setPagination({ ...state.pagination, currentPage: 1 });
      fetchStaff({ ...newFilters, page: 1 });
    } else {
      fetchStaff({ ...newFilters });
    }
  }, [state.pagination, state.displayMode, fetchStaff]);

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

  // Toggle between display modes
  const toggleDisplayMode = useCallback(() => {
    const newMode = state.displayMode === 'all' ? 'paginated' : 'all';
    setDisplayMode(newMode);
    // Reset to first page when switching to paginated mode
    if (newMode === 'paginated') {
      setPagination({ ...state.pagination, currentPage: 1 });
      // Fetch with pagination parameters
      setTimeout(() => {
        fetchStaff({ page: 1, limit: state.itemsPerPage });
      }, 0);
    } else {
      // Fetch all records
      setTimeout(() => {
        fetchStaff();
      }, 0);
    }
  }, [state.displayMode, state.pagination, state.itemsPerPage, fetchStaff]);

  // Change items per page (for paginated mode)
  const changeItemsPerPage = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setPagination({ ...state.pagination, currentPage: 1 });
    setTimeout(() => {
      fetchStaff({ page: 1, limit: newItemsPerPage });
    }, 0);
  }, [state.pagination, fetchStaff]);

  // Selection management functions
  const setSelectedStaff = useCallback((selectedIds) => {
    dispatch({ type: actionTypes.SET_SELECTED_STAFF, payload: selectedIds });
  }, []);

  const setSelectAll = useCallback((selectAll) => {
    dispatch({ type: actionTypes.SET_SELECT_ALL, payload: selectAll });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_SELECTION });
  }, []);

  const toggleStaffSelection = useCallback((staffId) => {
    const isSelected = state.selectedStaff.includes(staffId);
    let newSelectedStaff;
    
    if (isSelected) {
      newSelectedStaff = state.selectedStaff.filter(id => id !== staffId);
    } else {
      newSelectedStaff = [...state.selectedStaff, staffId];
    }
    
    setSelectedStaff(newSelectedStaff);
    
    // Update selectAll state based on whether all staff are selected
    const allSelected = newSelectedStaff.length === state.staff.length && state.staff.length > 0;
    
    // Update selectAll state without affecting the selectedStaff array
    if (allSelected && !state.selectAll) {
      // If all items are now selected and selectAll was false, set it to true
      dispatch({ type: actionTypes.SET_SELECT_ALL, payload: true });
    } else if (!allSelected && state.selectAll) {
      // If not all items are selected and selectAll was true, set it to false
      // But don't clear the selectedStaff array - that's handled above
      dispatch({ 
        type: actionTypes.SET_SELECT_ALL, 
        payload: false 
      });
    }
  }, [state.selectedStaff, state.staff.length, state.selectAll]);

  const toggleSelectAll = useCallback(() => {
    const newSelectAll = !state.selectAll;
    if (newSelectAll) {
      // Select all items
      setSelectAll(true);
    } else {
      // Deselect all items
      dispatch({ type: actionTypes.CLEAR_SELECTION });
    }
  }, [state.selectAll]);

  const getSelectedStaffData = useCallback(() => {
    return state.staff.filter(member => state.selectedStaff.includes(member.id));
  }, [state.staff, state.selectedStaff]);

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
    createBulkStaff,
    updateStaff,
    updateStaffStatus,
    deleteStaff,
    deleteBulkStaff,
    getStaffByRole,
    getStaffByDepartment,
    
    // Utility functions
    handlePageChange,
    handleFilterChange,
    handleSortChange,
    searchStaff,
    clearFilters,
    toggleDisplayMode,
    changeItemsPerPage,
    setDisplayMode,
    setItemsPerPage,
    
    // Selection functions
    setSelectedStaff,
    setSelectAll,
    clearSelection,
    toggleStaffSelection,
    toggleSelectAll,
    getSelectedStaffData,
    
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
