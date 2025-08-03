import React, { createContext, useContext, useReducer, useEffect } from 'react';
import studentApi from '../api/studentApi';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  profile: null,
  isLoading: false,
  isSaving: false,
  error: null,
  activeTab: 0,
  formData: {
    studentId: '',
    registrationNumber: '',
    personalInfo: {
      fullName: '',
      dateOfBirth: '',
      gender: '',
      nationality: '',
      category: '',
      maritalStatus: '',
      differentlyAbled: false,
      careerBreak: false,
      workPermitUSA: false,
      workPermitCountries: []
    },
    contact: {
      phone: '',
      email: '',
      guardianName: '',
      guardianContact: '',
      permanentAddress: '',
      currentAddress: '',
      hometown: '',
      pincode: ''
    },
    academic: {
      department: '',
      program: '',
      specialization: '',
      courseType: '',
      university: '',
      courseDurationFrom: '',
      courseDurationTo: '',
      gradingSystem: '',
      cgpa: '',
      backlogs: '',
      yearOfStudy: '',
      currentSemester: '',
      section: ''
    },
    placement: {
      placementStatus: 'Unplaced',
      offerDetails: [],
      resumeHeadline: '',
      resumeLink: ''
    },
    careerProfile: {
      currentIndustry: '',
      department: '',
      desiredJobType: '',
      desiredEmploymentType: '',
      preferredShift: '',
      preferredLocations: [],
      expectedSalary: '',
      availableToJoinInDays: '',
      experienceStatus: 'Fresher'
    },
    skills: [],
    certifications: [],
    internships: [],
    projects: [],
    achievements: [],
    preferredJobDomains: [],
    languagesKnown: [],
    onlineProfiles: [],
    portfolioWebsite: '',
    githubProfile: '',
    linkedinProfile: '',
    accomplishments: {
      researchPapers: [],
      presentations: [],
      patents: [],
      workSamples: []
    },
    profileSummary: ''
  },
  validationErrors: {},
  hasUnsavedChanges: false
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_SAVING: 'SET_SAVING',
  SET_PROFILE: 'SET_PROFILE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  UPDATE_FORM_DATA: 'UPDATE_FORM_DATA',
  SET_VALIDATION_ERRORS: 'SET_VALIDATION_ERRORS',
  CLEAR_VALIDATION_ERRORS: 'CLEAR_VALIDATION_ERRORS',
  SET_UNSAVED_CHANGES: 'SET_UNSAVED_CHANGES',
  RESET_FORM: 'RESET_FORM'
};

// Reducer function
const studentProfileReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error
      };

    case ACTIONS.SET_SAVING:
      return {
        ...state,
        isSaving: action.payload
      };

    case ACTIONS.SET_PROFILE:
      return {
        ...state,
        profile: action.payload,
        formData: action.payload ? { ...state.formData, ...action.payload } : state.formData,
        isLoading: false,
        error: null,
        hasUnsavedChanges: false
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isSaving: false
      };

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case ACTIONS.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload
      };

    case ACTIONS.UPDATE_FORM_DATA:
      const updatedFormData = { ...state.formData };
      const { field, value } = action.payload;
      
      // Handle nested field updates
      if (field.includes('.')) {
        const fieldParts = field.split('.');
        let current = updatedFormData;
        
        for (let i = 0; i < fieldParts.length - 1; i++) {
          if (!current[fieldParts[i]]) {
            current[fieldParts[i]] = {};
          }
          current = current[fieldParts[i]];
        }
        
        current[fieldParts[fieldParts.length - 1]] = value;
      } else {
        updatedFormData[field] = value;
      }

      return {
        ...state,
        formData: updatedFormData,
        hasUnsavedChanges: true
      };

    case ACTIONS.SET_VALIDATION_ERRORS:
      return {
        ...state,
        validationErrors: action.payload
      };

    case ACTIONS.CLEAR_VALIDATION_ERRORS:
      return {
        ...state,
        validationErrors: {}
      };

    case ACTIONS.SET_UNSAVED_CHANGES:
      return {
        ...state,
        hasUnsavedChanges: action.payload
      };

    case ACTIONS.RESET_FORM:
      return {
        ...state,
        formData: state.profile ? { ...initialState.formData, ...state.profile } : initialState.formData,
        validationErrors: {},
        hasUnsavedChanges: false
      };

    default:
      return state;
  }
};

// Create context
const StudentProfileContext = createContext();

// Student Profile Provider component
export const StudentProfileProvider = ({ children }) => {
  const [state, dispatch] = useReducer(studentProfileReducer, initialState);
  const { user, isStudent } = useAuth();

  // Load student profile on mount
  useEffect(() => {
    if (user && isStudent()) {
      loadProfile();
    }
  }, [user]);

  // Load profile function
  const loadProfile = async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const profile = await studentApi.getProfile();
      dispatch({ type: ACTIONS.SET_PROFILE, payload: profile });
    } catch (error) {
      // If profile doesn't exist, that's okay - user can create one
      if (error.message.includes('not found')) {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      } else {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      }
    }
  };

  // Save profile function
  const saveProfile = async (sectionData = null) => {
    dispatch({ type: ACTIONS.SET_SAVING, payload: true });
    dispatch({ type: ACTIONS.CLEAR_VALIDATION_ERRORS });

    try {
      const dataToSave = sectionData || state.formData;
      
      // Validate data
      const errors = studentApi.validateStudentData(dataToSave);
      if (errors.length > 0) {
        dispatch({ type: ACTIONS.SET_VALIDATION_ERRORS, payload: { general: errors } });
        dispatch({ type: ACTIONS.SET_SAVING, payload: false });
        return { success: false, errors };
      }

      const updatedProfile = await studentApi.updateProfile(dataToSave);
      dispatch({ type: ACTIONS.SET_PROFILE, payload: updatedProfile });
      
      return { success: true, profile: updatedProfile };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_SAVING, payload: false });
    }
  };

  // Update form data function
  const updateFormData = (field, value) => {
    dispatch({ type: ACTIONS.UPDATE_FORM_DATA, payload: { field, value } });
  };

  // Update multiple fields at once
  const updateMultipleFields = (updates) => {
    Object.entries(updates).forEach(([field, value]) => {
      dispatch({ type: ACTIONS.UPDATE_FORM_DATA, payload: { field, value } });
    });
  };

  // Set active tab function
  const setActiveTab = (tabIndex) => {
    dispatch({ type: ACTIONS.SET_ACTIVE_TAB, payload: tabIndex });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  };

  // Reset form function
  const resetForm = () => {
    dispatch({ type: ACTIONS.RESET_FORM });
  };

  // Upload resume function
  const uploadResume = async (file) => {
    dispatch({ type: ACTIONS.SET_SAVING, payload: true });

    try {
      const response = await studentApi.uploadResume(file);
      
      // Update form data with new resume link
      updateFormData('placement.resumeLink', response.resumeLink);
      updateFormData('placement.resumeLastUpdated', new Date().toISOString());
      
      return { success: true, resumeLink: response.resumeLink };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_SAVING, payload: false });
    }
  };

  // Add array item functions
  const addArrayItem = (arrayField, item) => {
    const currentArray = getNestedValue(state.formData, arrayField) || [];
    const newArray = [...currentArray, item];
    updateFormData(arrayField, newArray);
  };

  const removeArrayItem = (arrayField, index) => {
    const currentArray = getNestedValue(state.formData, arrayField) || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    updateFormData(arrayField, newArray);
  };

  const updateArrayItem = (arrayField, index, updatedItem) => {
    const currentArray = getNestedValue(state.formData, arrayField) || [];
    const newArray = [...currentArray];
    newArray[index] = updatedItem;
    updateFormData(arrayField, newArray);
  };

  // Helper function to get nested values
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  };

  // Get form field value
  const getFieldValue = (field) => {
    return getNestedValue(state.formData, field);
  };

  // Check if field has error
  const hasFieldError = (field) => {
    return state.validationErrors[field] !== undefined;
  };

  // Get field error message
  const getFieldError = (field) => {
    return state.validationErrors[field];
  };

  // Calculate profile completion
  const getProfileCompletion = () => {
    return studentApi.calculateProfileCompletion(state.formData);
  };

  // Navigation helpers
  const goToNextTab = () => {
    if (state.activeTab < 11) { // 12 tabs total (0-11)
      setActiveTab(state.activeTab + 1);
    }
  };

  const goToPreviousTab = () => {
    if (state.activeTab > 0) {
      setActiveTab(state.activeTab - 1);
    }
  };

  // Context value
  const value = {
    // State
    profile: state.profile,
    formData: state.formData,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    error: state.error,
    activeTab: state.activeTab,
    validationErrors: state.validationErrors,
    hasUnsavedChanges: state.hasUnsavedChanges,

    // Actions
    loadProfile,
    saveProfile,
    updateFormData,
    updateMultipleFields,
    setActiveTab,
    clearError,
    resetForm,
    uploadResume,

    // Array operations
    addArrayItem,
    removeArrayItem,
    updateArrayItem,

    // Helpers
    getFieldValue,
    hasFieldError,
    getFieldError,
    getProfileCompletion,
    goToNextTab,
    goToPreviousTab
  };

  return (
    <StudentProfileContext.Provider value={value}>
      {children}
    </StudentProfileContext.Provider>
  );
};

// Custom hook to use student profile context
export const useStudentProfile = () => {
  const context = useContext(StudentProfileContext);
  if (!context) {
    throw new Error('useStudentProfile must be used within a StudentProfileProvider');
  }
  return context;
};

export default StudentProfileContext;
