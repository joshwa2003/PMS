import React, { createContext, useContext, useReducer, useCallback } from 'react';
import studentManagementService from '../services/studentManagementService';

// Create context
const StudentManagementContext = createContext();

// Custom hook to use the context
export const useStudentManagement = () => {
  const context = useContext(StudentManagementContext);
  if (!context) {
    throw new Error('useStudentManagement must be used within a StudentManagementProvider');
  }
  return context;
};

// Initial state
const initialState = {
  students: [],
  loading: false,
  error: null,
  // Selection state for bulk operations
  selectedStudents: [],
  selectAll: false,
  selectAllAcrossPages: false, // New state for selecting all across pages
  allStudentIds: [], // Store all student IDs for cross-page selection
  bulkOperationLoading: false,
  stats: {
    total: 0,
    active: 0,
    verified: 0,
    recent: 0,
    placement: {
      unplaced: 0,
      placed: 0,
      multipleOffers: 0
    }
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalStudents: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  filters: {
    search: '',
    status: 'all',
    placementStatus: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    currentPage: 1
  }
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_STUDENTS: 'SET_STUDENTS',
  ADD_STUDENT: 'ADD_STUDENT',
  ADD_BULK_STUDENTS: 'ADD_BULK_STUDENTS',
  UPDATE_STUDENT: 'UPDATE_STUDENT',
  DELETE_STUDENT: 'DELETE_STUDENT',
  DELETE_BULK_STUDENTS: 'DELETE_BULK_STUDENTS',
  SET_STATS: 'SET_STATS',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_FILTERS: 'SET_FILTERS',
  RESET_FILTERS: 'RESET_FILTERS',
  // Selection actions
  TOGGLE_STUDENT_SELECTION: 'TOGGLE_STUDENT_SELECTION',
  TOGGLE_SELECT_ALL: 'TOGGLE_SELECT_ALL',
  TOGGLE_SELECT_ALL_ACROSS_PAGES: 'TOGGLE_SELECT_ALL_ACROSS_PAGES',
  SET_ALL_STUDENT_IDS: 'SET_ALL_STUDENT_IDS',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  SET_BULK_OPERATION_LOADING: 'SET_BULK_OPERATION_LOADING'
};

// Reducer function
const studentManagementReducer = (state, action) => {
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

    case actionTypes.SET_STUDENTS:
      return {
        ...state,
        students: action.payload,
        loading: false,
        error: null
      };

    case actionTypes.ADD_STUDENT:
      return {
        ...state,
        students: [action.payload, ...state.students],
        stats: {
          ...state.stats,
          total: state.stats.total + 1,
          recent: state.stats.recent + 1
        }
      };

    case actionTypes.ADD_BULK_STUDENTS:
      return {
        ...state,
        students: [...action.payload, ...state.students],
        stats: {
          ...state.stats,
          total: state.stats.total + action.payload.length,
          recent: state.stats.recent + action.payload.length
        }
      };

    case actionTypes.UPDATE_STUDENT:
      return {
        ...state,
        students: state.students.map(student =>
          student.id === action.payload.id ? action.payload : student
        )
      };

    case actionTypes.DELETE_STUDENT:
      return {
        ...state,
        students: state.students.filter(student => student.id !== action.payload),
        selectedStudents: state.selectedStudents.filter(id => id !== action.payload),
        stats: {
          ...state.stats,
          total: Math.max(0, state.stats.total - 1)
        }
      };

    case actionTypes.DELETE_BULK_STUDENTS:
      return {
        ...state,
        students: state.students.filter(student => !action.payload.includes(student.id)),
        selectedStudents: [],
        selectAll: false,
        stats: {
          ...state.stats,
          total: Math.max(0, state.stats.total - action.payload.length)
        }
      };

    case actionTypes.TOGGLE_STUDENT_SELECTION:
      const studentId = action.payload;
      const isSelected = state.selectedStudents.includes(studentId);
      const newSelectedStudents = isSelected
        ? state.selectedStudents.filter(id => id !== studentId)
        : [...state.selectedStudents, studentId];
      
      // Check if all current page students are selected
      const currentPageSelected = state.students.every(student => 
        newSelectedStudents.includes(student.id)
      );
      
      // Check if all students across pages are selected
      const allAcrossPagesCurrentlySelected = state.selectAllAcrossPages && 
        state.allStudentIds.every(id => newSelectedStudents.includes(id));
      
      return {
        ...state,
        selectedStudents: newSelectedStudents,
        selectAll: currentPageSelected && state.students.length > 0,
        selectAllAcrossPages: allAcrossPagesCurrentlySelected
      };

    case actionTypes.TOGGLE_SELECT_ALL:
      const allSelected = state.selectAll;
      return {
        ...state,
        selectedStudents: allSelected ? 
          state.selectedStudents.filter(id => !state.students.map(s => s.id).includes(id)) : 
          [...new Set([...state.selectedStudents, ...state.students.map(student => student.id)])],
        selectAll: !allSelected,
        selectAllAcrossPages: false // Reset cross-page selection when toggling current page
      };

    case actionTypes.TOGGLE_SELECT_ALL_ACROSS_PAGES:
      const allAcrossPagesSelected = state.selectAllAcrossPages;
      return {
        ...state,
        selectedStudents: allAcrossPagesSelected ? [] : [...state.allStudentIds],
        selectAll: !allAcrossPagesSelected && state.students.length > 0,
        selectAllAcrossPages: !allAcrossPagesSelected
      };

    case actionTypes.SET_ALL_STUDENT_IDS:
      return {
        ...state,
        allStudentIds: action.payload
      };

    case actionTypes.CLEAR_SELECTION:
      return {
        ...state,
        selectedStudents: [],
        selectAll: false,
        selectAllAcrossPages: false
      };

    case actionTypes.SET_BULK_OPERATION_LOADING:
      return {
        ...state,
        bulkOperationLoading: action.payload
      };

    case actionTypes.SET_STATS:
      return {
        ...state,
        stats: action.payload
      };

    case actionTypes.SET_PAGINATION:
      return {
        ...state,
        pagination: action.payload
      };

    case actionTypes.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };

    case actionTypes.RESET_FILTERS:
      return {
        ...state,
        filters: {
          ...initialState.filters,
          // Keep sortBy and sortOrder
          sortBy: state.filters.sortBy,
          sortOrder: state.filters.sortOrder
        }
      };

    default:
      return state;
  }
};

// Provider component
export const StudentManagementProvider = ({ children }) => {
  const [state, dispatch] = useReducer(studentManagementReducer, initialState);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  }, []);

  // Fetch all students
  const fetchStudents = useCallback(async (queryParams = {}) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      clearError();

      // Use currentPage from filters if not provided in queryParams
      const finalParams = {
        page: state.filters.currentPage,
        ...queryParams
      };

      const response = await studentManagementService.getAllStudents(finalParams);

      dispatch({ type: actionTypes.SET_STUDENTS, payload: response.students });
      dispatch({ type: actionTypes.SET_PAGINATION, payload: response.pagination });

      return response;
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, [clearError, state.filters.currentPage]);

  // Create single student
  const createStudent = useCallback(async (studentData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      clearError();

      const response = await studentManagementService.createStudent(studentData);

      dispatch({ type: actionTypes.SET_LOADING, payload: false });

      return response;
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, [clearError]);

  // Create bulk students
  const createBulkStudents = useCallback(async (studentDataArray) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      clearError();

      const response = await studentManagementService.createBulkStudents(studentDataArray);

      dispatch({ type: actionTypes.SET_LOADING, payload: false });

      return response;
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, [clearError]);

  // Update student status
  const updateStudentStatus = useCallback(async (studentId, statusData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      clearError();

      const response = await studentManagementService.updateStudentStatus(studentId, statusData);

      // Update the student in the local state
      dispatch({ type: actionTypes.UPDATE_STUDENT, payload: response.student });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });

      return response;
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, [clearError]);

  // Delete student
  const deleteStudent = useCallback(async (studentId) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      clearError();

      const response = await studentManagementService.deleteStudent(studentId);

      // Remove the student from the local state
      dispatch({ type: actionTypes.DELETE_STUDENT, payload: studentId });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });

      return response;
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, [clearError]);

  // Delete multiple students
  const deleteBulkStudents = useCallback(async (studentIds) => {
    try {
      dispatch({ type: actionTypes.SET_BULK_OPERATION_LOADING, payload: true });
      clearError();

      const response = await studentManagementService.deleteBulkStudents(studentIds);

      // Remove the students from the local state
      dispatch({ type: actionTypes.DELETE_BULK_STUDENTS, payload: studentIds });
      dispatch({ type: actionTypes.SET_BULK_OPERATION_LOADING, payload: false });

      return response;
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: actionTypes.SET_BULK_OPERATION_LOADING, payload: false });
      throw error;
    }
  }, [clearError]);

  // Fetch all student IDs for cross-page selection
  const fetchAllStudentIds = useCallback(async () => {
    try {
      // Fetch all students with a high limit to get all IDs
      const response = await studentManagementService.getAllStudents({
        limit: 10000, // High limit to get all students
        search: state.filters.search,
        status: state.filters.status !== 'all' ? state.filters.status : '',
        placementStatus: state.filters.placementStatus !== 'all' ? state.filters.placementStatus : ''
      });
      
      const allIds = response.students.map(student => student.id);
      dispatch({ type: actionTypes.SET_ALL_STUDENT_IDS, payload: allIds });
      return allIds;
    } catch (error) {
      console.error('Error fetching all student IDs:', error);
      return [];
    }
  }, [state.filters.search, state.filters.status, state.filters.placementStatus]);

  // Selection functions
  const toggleStudentSelection = useCallback((studentId) => {
    dispatch({ type: actionTypes.TOGGLE_STUDENT_SELECTION, payload: studentId });
  }, []);

  const toggleSelectAll = useCallback(() => {
    dispatch({ type: actionTypes.TOGGLE_SELECT_ALL });
  }, []);

  const toggleSelectAllAcrossPages = useCallback(async () => {
    // Fetch all student IDs if not already loaded
    if (state.allStudentIds.length === 0) {
      await fetchAllStudentIds();
    }
    dispatch({ type: actionTypes.TOGGLE_SELECT_ALL_ACROSS_PAGES });
  }, [state.allStudentIds.length, fetchAllStudentIds]);

  const clearSelection = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_SELECTION });
  }, []);

  const getSelectedStudentData = useCallback(() => {
    return state.students.filter(student => state.selectedStudents.includes(student.id));
  }, [state.students, state.selectedStudents]);

  // Fetch student statistics
  const fetchStudentStats = useCallback(async () => {
    try {
      const response = await studentManagementService.getStudentStats();
      dispatch({ type: actionTypes.SET_STATS, payload: response.stats });
      return response;
    } catch (error) {
      console.error('Error fetching student stats:', error);
      // Don't set error for stats as it's not critical
      return null;
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    dispatch({ type: actionTypes.SET_FILTERS, payload: newFilters });
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    dispatch({ type: actionTypes.RESET_FILTERS });
  }, []);

  // Handle search
  const handleSearch = useCallback((searchTerm) => {
    updateFilters({ search: searchTerm });
  }, [updateFilters]);

  // Handle filter change
  const handleFilterChange = useCallback((filterType, value) => {
    if (filterType === 'page' || filterType === 'currentPage') {
      // For page changes, don't reset to page 1
      updateFilters({ currentPage: value });
    } else {
      // For other filter changes, reset to page 1
      updateFilters({ [filterType]: value, currentPage: 1 });
    }
  }, [updateFilters]);

  // Handle sort change
  const handleSortChange = useCallback((sortBy, sortOrder = 'asc') => {
    updateFilters({ sortBy, sortOrder });
  }, [updateFilters]);

  // Service utilities
  const serviceUtils = {
    formatStudentData: studentManagementService.formatStudentData,
    getPlacementStatusDisplayName: studentManagementService.getPlacementStatusDisplayName,
    getPlacementStatusColor: studentManagementService.getPlacementStatusColor,
    getStudentStatusColor: studentManagementService.getStudentStatusColor,
    getStudentStatusText: studentManagementService.getStudentStatusText,
    formatLastLogin: studentManagementService.formatLastLogin,
    validateStudentData: studentManagementService.validateStudentData,
    generateStudentIdSuggestion: studentManagementService.generateStudentIdSuggestion,
    getDepartmentDisplayName: studentManagementService.getDepartmentDisplayName,
    getProgramDisplayName: studentManagementService.getProgramDisplayName,
    calculateProfileCompletion: studentManagementService.calculateProfileCompletion,
    formatCreationDate: studentManagementService.formatCreationDate,
    filterStudents: studentManagementService.filterStudents,
    sortStudents: studentManagementService.sortStudents
  };

  // Context value
  const contextValue = {
    // State
    students: state.students,
    loading: state.loading,
    error: state.error,
    stats: state.stats,
    pagination: state.pagination,
    filters: state.filters,
    // Selection state
    selectedStudents: state.selectedStudents,
    selectAll: state.selectAll,
    selectAllAcrossPages: state.selectAllAcrossPages,
    allStudentIds: state.allStudentIds,
    bulkOperationLoading: state.bulkOperationLoading,

    // Actions
    fetchStudents,
    createStudent,
    createBulkStudents,
    updateStudentStatus,
    deleteStudent,
    deleteBulkStudents,
    fetchStudentStats,
    updateFilters,
    resetFilters,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    clearError,
    // Selection actions
    toggleStudentSelection,
    toggleSelectAll,
    toggleSelectAllAcrossPages,
    fetchAllStudentIds,
    clearSelection,
    getSelectedStudentData,

    // Service utilities
    ...serviceUtils
  };

  return (
    <StudentManagementContext.Provider value={contextValue}>
      {children}
    </StudentManagementContext.Provider>
  );
};

export default StudentManagementContext;
