import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import otherStaffProfileService from '../services/otherStaffProfileService';

// Initial state
const initialState = {
  profile: null,
  formData: {
    employeeId: '',
    name: {
      firstName: '',
      lastName: ''
    },
    email: '',
    mobileNumber: '',
    gender: '',
    profilePhotoUrl: '',
    role: 'other_staff',
    department: '',
    designation: 'Other Staff',
    status: 'active',
    dateOfJoining: '',
    registrationDate: '',
    lastLoginAt: '',
    authProvider: 'local',
    staffCategory: '',
    officeLocation: '',
    workShift: 'Morning',
    yearsOfExperience: 0,
    qualifications: '',
    skills: [],
    certifications: [],
    responsibilities: '',
    reportingManager: '',
    workingHours: {
      startTime: '09:00',
      endTime: '17:00'
    },
    contact: {
      alternatePhone: '',
      emergencyContact: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      }
    },
    adminNotes: ''
  },
  isLoading: false,
  isSaving: false,
  error: null,
  validationErrors: {},
  hasUnsavedChanges: false,
  activeTab: 0
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
const otherStaffProfileReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case ACTIONS.SET_SAVING:
      return {
        ...state,
        isSaving: action.payload,
      };
    case ACTIONS.SET_PROFILE:
      return {
        ...state,
        profile: action.payload,
        formData: action.payload ? { ...state.formData, ...action.payload } : state.formData,
        isLoading: false,
        error: null,
        hasUnsavedChanges: false,
      };
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isSaving: false,
      };
    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case ACTIONS.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload,
      };
    case ACTIONS.UPDATE_FORM_DATA:
      const updatedFormData = { ...state.formData };
      const { field, value } = action.payload;

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
        hasUnsavedChanges: true,
      };
    case ACTIONS.SET_VALIDATION_ERRORS:
      return {
        ...state,
        validationErrors: action.payload,
      };
    case ACTIONS.CLEAR_VALIDATION_ERRORS:
      return {
        ...state,
        validationErrors: {},
      };
    case ACTIONS.SET_UNSAVED_CHANGES:
      return {
        ...state,
        hasUnsavedChanges: action.payload,
      };
    case ACTIONS.RESET_FORM:
      return {
        ...state,
        formData: { ...initialState.formData },
        validationErrors: {},
        hasUnsavedChanges: false,
      };
    default:
      return state;
  }
};

// Create context
const OtherStaffProfileContext = createContext();

// Provider component
export const OtherStaffProfileProvider = ({ children }) => {
  const [state, dispatch] = useReducer(otherStaffProfileReducer, initialState);
  const { user, updateProfilePicture } = useAuth();
  const hasLoadedRef = useRef(false);

  // Load profile function
  const loadProfile = useCallback(async () => {
    if (state.isLoading || hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const profile = await otherStaffProfileService.getProfile();
      dispatch({ type: ACTIONS.SET_PROFILE, payload: profile });
      
      // Sync profile image with AuthContext if it exists
      if (profile?.profilePhotoUrl) {
        updateProfilePicture(profile.profilePhotoUrl);
      }
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  }, [state.isLoading, updateProfilePicture]);

  // Load profile on mount if user role is other_staff
  useEffect(() => {
    if (user?.role === 'other_staff' && user?.id && !hasLoadedRef.current) {
      loadProfile();
    }
  }, [user?.id, user?.role, loadProfile]);

  // Save profile function
  const saveProfile = async (sectionData = null) => {
    dispatch({ type: ACTIONS.SET_SAVING, payload: true });
    dispatch({ type: ACTIONS.CLEAR_VALIDATION_ERRORS });
    try {
      const dataToSave = sectionData || state.formData;
      const cleanedData = cleanFormData(dataToSave);
      const validationErrors = otherStaffProfileService.validateProfileData(cleanedData, true);
      
      if (validationErrors.length > 0) {
        dispatch({ type: ACTIONS.SET_VALIDATION_ERRORS, payload: { general: validationErrors } });
        dispatch({ type: ACTIONS.SET_SAVING, payload: false });
        return { success: false, errors: validationErrors };
      }
      
      const updatedProfile = await otherStaffProfileService.updateProfile(cleanedData);
      dispatch({ type: ACTIONS.SET_PROFILE, payload: updatedProfile });
      return { success: true, profile: updatedProfile };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_SAVING, payload: false });
    }
  };

  // Helper function to clean form data
  const cleanFormData = (data) => {
    const cleaned = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
          cleaned[key] = cleanFormData(data[key]);
        } else {
          cleaned[key] = data[key];
        }
      }
    });
    return cleaned;
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

  // Set active tab
  const setActiveTab = (tabIndex) => {
    dispatch({ type: ACTIONS.SET_ACTIVE_TAB, payload: tabIndex });
  };

  // Navigation helper functions
  const goToNextTab = () => {
    if (state.activeTab < 3) { // 4 tabs total (0-3)
      setActiveTab(state.activeTab + 1);
    }
  };

  const goToPreviousTab = () => {
    if (state.activeTab > 0) {
      setActiveTab(state.activeTab - 1);
    }
  };

  // Update profile image function
  const updateProfileImage = async (googleDriveUrl) => {
    try {
      const result = await otherStaffProfileService.updateProfileImageUrl(googleDriveUrl);
      
      if (result.success) {
        const profilePhotoUrl = result.profilePhotoUrl;
        
        // Update the profile state
        dispatch({ 
          type: ACTIONS.SET_PROFILE, 
          payload: { ...state.profile, profilePhotoUrl } 
        });
        
        // Update form data
        dispatch({
          type: ACTIONS.UPDATE_FORM_DATA,
          payload: { field: 'profilePhotoUrl', value: profilePhotoUrl }
        });
        
        // Sync with AuthContext
        updateProfilePicture(profilePhotoUrl);
        
        // Force profile reload to get fresh data
        setTimeout(() => {
          hasLoadedRef.current = false;
          loadProfile();
        }, 500);
        
        return { success: true, profilePhotoUrl };
      } else {
        return { success: false, error: result.message || 'Failed to update profile image' };
      }
    } catch (error) {
      console.error('Update profile image error:', error);
      return { success: false, error: error.message || 'Failed to update profile image' };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  };

  // Reset form
  const resetForm = () => {
    dispatch({ type: ACTIONS.RESET_FORM });
  };

  // Validation helper functions
  const hasFieldError = (fieldPath) => {
    const fieldParts = fieldPath.split('.');
    let current = state.validationErrors;
    for (const part of fieldParts) {
      if (current && current[part]) {
        current = current[part];
      } else {
        return false;
      }
    }
    return Array.isArray(current) ? current.length > 0 : !!current;
  };

  const getFieldError = (fieldPath) => {
    const fieldParts = fieldPath.split('.');
    let current = state.validationErrors;
    for (const part of fieldParts) {
      if (current && current[part]) {
        current = current[part];
      } else {
        return null;
      }
    }
    return Array.isArray(current) ? current[0] : current;
  };

  const getFieldValue = (fieldPath) => {
    const fieldParts = fieldPath.split('.');
    let current = state.formData;
    for (const part of fieldParts) {
      if (current && current[part] !== undefined) {
        current = current[part];
      } else {
        return '';
      }
    }
    return current;
  };

  // Context value
  const contextValue = {
    // State
    profile: state.profile,
    formData: state.formData,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    error: state.error,
    validationErrors: state.validationErrors,
    hasUnsavedChanges: state.hasUnsavedChanges,
    activeTab: state.activeTab,

    // Actions
    loadProfile,
    saveProfile,
    updateFormData,
    updateMultipleFields,
    setActiveTab,
    goToNextTab,
    goToPreviousTab,
    updateProfileImage,
    clearError,
    resetForm,

    // Helper functions
    hasFieldError,
    getFieldError,
    getFieldValue,

    // Service functions
    getDepartmentOptions: otherStaffProfileService.getDepartmentOptions,
    getStaffCategoryOptions: otherStaffProfileService.getStaffCategoryOptions,
    getWorkShiftOptions: otherStaffProfileService.getWorkShiftOptions,
    getStatusOptions: otherStaffProfileService.getStatusOptions,
    getAuthProviderOptions: otherStaffProfileService.getAuthProviderOptions,
    getRoleDisplayName: otherStaffProfileService.getRoleDisplayName,
    getDepartmentDisplayName: otherStaffProfileService.getDepartmentDisplayName,
    getStaffCategoryDisplayName: otherStaffProfileService.getStaffCategoryDisplayName,
    getWorkShiftDisplayName: otherStaffProfileService.getWorkShiftDisplayName,
    getStatusDisplayName: otherStaffProfileService.getStatusDisplayName,
    getAuthProviderDisplayName: otherStaffProfileService.getAuthProviderDisplayName,
    validateGoogleDriveUrl: otherStaffProfileService.validateGoogleDriveUrl,
    processGoogleDriveUrl: otherStaffProfileService.processGoogleDriveUrl,
    calculateProfileCompletion: otherStaffProfileService.calculateProfileCompletion
  };

  return (
    <OtherStaffProfileContext.Provider value={contextValue}>
      {children}
    </OtherStaffProfileContext.Provider>
  );
};

// Custom hook to use the context
export const useOtherStaffProfile = () => {
  const context = useContext(OtherStaffProfileContext);
  if (!context) {
    throw new Error('useOtherStaffProfile must be used within an OtherStaffProfileProvider');
  }
  return context;
};

export default OtherStaffProfileContext;
