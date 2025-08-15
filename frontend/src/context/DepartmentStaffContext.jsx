import React, { createContext, useContext, useReducer, useCallback } from 'react';
import departmentStaffService from '../services/departmentStaffService';

// Initial state
const initialState = {
  // Department data
  departments: [],
  currentDepartment: null,
  
  // Staff data
  staff: [],
  selectedStaff: [],
  
  // UI state
  loading: false,
  error: null,
  
  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalStaff: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  
  // Filters
  filters: {
    role: '',
    isActive: '',
    emailSent: '',
    roleAssigned: '',
    search: ''
  },
  
  // Statistics
  stats: null,
  
  // Modals
  modals: {
    roleAssignment: false,
    bulkRoleAssignment: false,
    staffDetails: false
  }
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Department actions
  SET_DEPARTMENTS: 'SET_DEPARTMENTS',
  SET_CURRENT_DEPARTMENT: 'SET_CURRENT_DEPARTMENT',
  
  // Staff actions
  SET_STAFF: 'SET_STAFF',
  ADD_STAFF: 'ADD_STAFF',
  UPDATE_STAFF: 'UPDATE_STAFF',
  REMOVE_STAFF: 'REMOVE_STAFF',
  SET_SELECTED_STAFF: 'SET_SELECTED_STAFF',
  CLEAR_SELECTED_STAFF: 'CLEAR_SELECTED_STAFF',
  
  // Pagination actions
  SET_PAGINATION: 'SET_PAGINATION',
  
  // Filter actions
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  
  // Statistics actions
  SET_STATS: 'SET_STATS',
  
  // Modal actions
  SET_MODAL: 'SET_MODAL',
  CLOSE_ALL_MODALS: 'CLOSE_ALL_MODALS'
};

// Reducer
const departmentStaffReducer = (state, action) => {
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
      
    case actionTypes.SET_DEPARTMENTS:
      return {
        ...state,
        departments: action.payload,
        loading: false,
        error: null
      };
      
    case actionTypes.SET_CURRENT_DEPARTMENT:
      return {
        ...state,
        currentDepartment: action.payload,
        staff: [], // Clear staff when changing department
        selectedStaff: [],
        pagination: initialState.pagination,
        stats: null
      };
      
    case actionTypes.SET_STAFF:
      return {
        ...state,
        staff: action.payload,
        loading: false,
        error: null
      };
      
    case actionTypes.ADD_STAFF:
      return {
        ...state,
        staff: [...state.staff, action.payload]
      };
      
    case actionTypes.UPDATE_STAFF:
      return {
        ...state,
        staff: state.staff.map(member => 
          member.id === action.payload.id ? action.payload : member
        ),
        selectedStaff: state.selectedStaff.map(member => 
          member.id === action.payload.id ? action.payload : member
        )
      };
      
    case actionTypes.REMOVE_STAFF:
      return {
        ...state,
        staff: state.staff.filter(member => member.id !== action.payload),
        selectedStaff: state.selectedStaff.filter(member => member.id !== action.payload)
      };
      
    case actionTypes.SET_SELECTED_STAFF:
      return {
        ...state,
        selectedStaff: action.payload
      };
      
    case actionTypes.CLEAR_SELECTED_STAFF:
      return {
        ...state,
        selectedStaff: []
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
      
    case actionTypes.CLEAR_FILTERS:
      return {
        ...state,
        filters: initialState.filters
      };
      
    case actionTypes.SET_STATS:
      return {
        ...state,
        stats: action.payload
      };
      
    case actionTypes.SET_MODAL:
      return {
        ...state,
        modals: { ...state.modals, [action.payload.modal]: action.payload.open }
      };
      
    case actionTypes.CLOSE_ALL_MODALS:
      return {
        ...state,
        modals: initialState.modals
      };
      
    default:
      return state;
  }
};

// Create context
const DepartmentStaffContext = createContext();

// Provider component
export const DepartmentStaffProvider = ({ children }) => {
  const [state, dispatch] = useReducer(departmentStaffReducer, initialState);

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

  // Department actions
  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await departmentStaffService.getDepartmentsWithStaffCounts();
      dispatch({ type: actionTypes.SET_DEPARTMENTS, payload: response.departments });
    } catch (error) {
      setError(error.message);
    }
  }, [setLoading, setError]);

  const setCurrentDepartment = useCallback((department) => {
    dispatch({ type: actionTypes.SET_CURRENT_DEPARTMENT, payload: department });
  }, []);

  // Staff actions
  const fetchStaffByDepartment = useCallback(async (departmentId, params = {}) => {
    try {
      setLoading(true);
      const response = await departmentStaffService.getStaffByDepartment(departmentId, {
        ...params,
        ...state.filters
      });
      
      dispatch({ type: actionTypes.SET_STAFF, payload: response.staff });
      dispatch({ type: actionTypes.SET_PAGINATION, payload: response.pagination });
    } catch (error) {
      setError(error.message);
    }
  }, [setLoading, setError, state.filters]);

  const assignStaffRole = useCallback(async (staffId, role) => {
    try {
      setLoading(true);
      const response = await departmentStaffService.assignStaffRole(staffId, role);
      
      if (response.success) {
        dispatch({ type: actionTypes.UPDATE_STAFF, payload: response.staff });
        return response;
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const bulkAssignRoles = useCallback(async (assignments) => {
    try {
      setLoading(true);
      const response = await departmentStaffService.bulkAssignRoles(assignments);
      
      if (response.success) {
        // Update successful assignments
        response.results.successful.forEach(result => {
          dispatch({ type: actionTypes.UPDATE_STAFF, payload: result.staff });
        });
        return response;
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Statistics actions
  const fetchStaffStats = useCallback(async (departmentId) => {
    try {
      const response = await departmentStaffService.getStaffStatsByDepartment(departmentId);
      dispatch({ type: actionTypes.SET_STATS, payload: response.stats });
    } catch (error) {
      console.error('Error fetching staff stats:', error);
    }
  }, []);

  // Selection actions
  const setSelectedStaff = useCallback((staff) => {
    dispatch({ type: actionTypes.SET_SELECTED_STAFF, payload: staff });
  }, []);

  const clearSelectedStaff = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_SELECTED_STAFF });
  }, []);

  const toggleStaffSelection = useCallback((staffMember) => {
    const isSelected = state.selectedStaff.some(s => s.id === staffMember.id);
    
    if (isSelected) {
      const newSelection = state.selectedStaff.filter(s => s.id !== staffMember.id);
      setSelectedStaff(newSelection);
    } else {
      setSelectedStaff([...state.selectedStaff, staffMember]);
    }
  }, [state.selectedStaff, setSelectedStaff]);

  const selectAllStaff = useCallback(() => {
    setSelectedStaff([...state.staff]);
  }, [state.staff, setSelectedStaff]);

  // Filter actions
  const setFilters = useCallback((filters) => {
    dispatch({ type: actionTypes.SET_FILTERS, payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_FILTERS });
  }, []);

  // Modal actions
  const openModal = useCallback((modal) => {
    dispatch({ type: actionTypes.SET_MODAL, payload: { modal, open: true } });
  }, []);

  const closeModal = useCallback((modal) => {
    dispatch({ type: actionTypes.SET_MODAL, payload: { modal, open: false } });
  }, []);

  const closeAllModals = useCallback(() => {
    dispatch({ type: actionTypes.CLOSE_ALL_MODALS });
  }, []);

  // Utility functions
  const refreshCurrentDepartmentData = useCallback(async () => {
    if (state.currentDepartment) {
      await Promise.all([
        fetchStaffByDepartment(state.currentDepartment.id),
        fetchStaffStats(state.currentDepartment.id)
      ]);
    }
  }, [state.currentDepartment, fetchStaffByDepartment, fetchStaffStats]);

  const getStaffById = useCallback((staffId) => {
    return state.staff.find(member => member.id === staffId);
  }, [state.staff]);

  const isStaffSelected = useCallback((staffId) => {
    return state.selectedStaff.some(member => member.id === staffId);
  }, [state.selectedStaff]);

  // Context value
  const contextValue = {
    // State
    ...state,
    
    // Actions
    setLoading,
    setError,
    clearError,
    
    // Department actions
    fetchDepartments,
    setCurrentDepartment,
    
    // Staff actions
    fetchStaffByDepartment,
    assignStaffRole,
    bulkAssignRoles,
    
    // Statistics actions
    fetchStaffStats,
    
    // Selection actions
    setSelectedStaff,
    clearSelectedStaff,
    toggleStaffSelection,
    selectAllStaff,
    
    // Filter actions
    setFilters,
    clearFilters,
    
    // Modal actions
    openModal,
    closeModal,
    closeAllModals,
    
    // Utility functions
    refreshCurrentDepartmentData,
    getStaffById,
    isStaffSelected
  };

  return (
    <DepartmentStaffContext.Provider value={contextValue}>
      {children}
    </DepartmentStaffContext.Provider>
  );
};

// Hook to use the context
export const useDepartmentStaff = () => {
  const context = useContext(DepartmentStaffContext);
  
  if (!context) {
    throw new Error('useDepartmentStaff must be used within a DepartmentStaffProvider');
  }
  
  return context;
};

export default DepartmentStaffContext;
