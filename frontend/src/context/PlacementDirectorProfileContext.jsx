import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import placementDirectorProfileService from '../services/placementDirectorProfileService';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  profile: null,
  isLoading: false,
  isSaving: false,
  error: null,
  activeTab: 0,
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
    role: 'placement_director',
    department: 'Placement Cell',
    designation: 'Director',
    status: 'active',
    dateOfJoining: '',
    registrationDate: '',
    lastLoginAt: '',
    authProvider: 'local',
    officeRoomNo: '',
    officialEmail: '',
    alternateMobile: '',
    reportingTo: '',
    yearsOfExperience: '',
    resumeUrl: '',
    responsibilitiesText: '',
    communicationPreferences: ['email', 'portal'],
    contact: {
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      }
    }
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
const placementDirectorProfileReducer = (state, action) => {
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
const PlacementDirectorProfileContext = createContext();

// Placement Director Profile Provider component
export const PlacementDirectorProfileProvider = ({ children }) => {
  const [state, dispatch] = useReducer(placementDirectorProfileReducer, initialState);
  const { user, updateProfilePicture } = useAuth();
  const hasLoadedRef = useRef(false);

  // Load profile function
  const loadProfile = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (state.isLoading || hasLoadedRef.current) return;
    
    hasLoadedRef.current = true;
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      // Try to get existing placement director profile first
      const profile = await placementDirectorProfileService.getProfile();
      
      dispatch({ type: ACTIONS.SET_PROFILE, payload: profile });
      
      // Sync profile image with AuthContext if it exists
      if (profile?.profilePhotoUrl) {
        updateProfilePicture(profile.profilePhotoUrl);
      }
    } catch (error) {
      console.error('Load placement director profile error:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  }, [updateProfilePicture, state.isLoading]);

  // Load placement director profile on mount
  useEffect(() => {
    if (user?.role === 'placement_director' && user?.id && !hasLoadedRef.current) {
      loadProfile();
    }
  }, [user?.id, user?.role, loadProfile]);

  // Save profile function
  const saveProfile = async (sectionData = null) => {
    dispatch({ type: ACTIONS.SET_SAVING, payload: true });
    dispatch({ type: ACTIONS.CLEAR_VALIDATION_ERRORS });

    try {
      const dataToSave = sectionData || state.formData;
      
      // Clean the data before sending - remove empty strings and null values
      const cleanedData = cleanFormData(dataToSave);
      
      console.log('Saving placement director profile data:', cleanedData);
      
      // Validate data using the service
      const validationErrors = placementDirectorProfileService.validateProfileData(cleanedData, true);
      
      if (validationErrors.length > 0) {
        dispatch({ type: ACTIONS.SET_VALIDATION_ERRORS, payload: { general: validationErrors } });
        dispatch({ type: ACTIONS.SET_SAVING, payload: false });
        return { success: false, errors: validationErrors };
      }

      // Use placementDirectorProfileService to update profile
      const updatedProfile = await placementDirectorProfileService.updateProfile(cleanedData);
      
      dispatch({ type: ACTIONS.SET_PROFILE, payload: updatedProfile });
      
      return { success: true, profile: updatedProfile };
    } catch (error) {
      console.error('Save placement director profile error:', error);
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
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
          // Handle nested objects
          const cleanedNested = {};
          Object.keys(data[key]).forEach(nestedKey => {
            const value = data[key][nestedKey];
            if (value !== undefined && value !== null && value !== '') {
              if (typeof value === 'object' && !Array.isArray(value)) {
                // Handle deeply nested objects
                const deepCleanedNested = {};
                Object.keys(value).forEach(deepKey => {
                  const deepValue = value[deepKey];
                  if (deepValue !== undefined && deepValue !== null && deepValue !== '') {
                    deepCleanedNested[deepKey] = deepValue;
                  }
                });
                if (Object.keys(deepCleanedNested).length > 0) {
                  cleanedNested[nestedKey] = deepCleanedNested;
                }
              } else {
                cleanedNested[nestedKey] = value;
              }
            }
          });
          if (Object.keys(cleanedNested).length > 0) {
            cleaned[key] = cleanedNested;
          }
        } else if (Array.isArray(data[key])) {
          // Handle arrays - only include non-empty arrays
          if (data[key].length > 0) {
            cleaned[key] = data[key].filter(item => 
              item !== undefined && item !== null && item !== ''
            );
          }
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

  // Upload profile image function
  const uploadProfileImage = async (file) => {
    dispatch({ type: ACTIONS.SET_SAVING, payload: true });

    try {
      // Use the placementDirectorProfileService to upload the image
      const result = await placementDirectorProfileService.uploadProfileImage(file);
      
      const profilePhotoUrl = result.profilePhotoUrl;
      
      // Update form data with new profile image URL
      updateFormData('profilePhotoUrl', profilePhotoUrl);
      
      // Also save the profile to persist the image URL
      await saveProfile({ profilePhotoUrl });
      
      return { success: true, profilePhotoUrl };
    } catch (error) {
      console.error('Upload profile image error:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_SAVING, payload: false });
    }
  };

  // Upload resume function
  const uploadResume = async (file) => {
    dispatch({ type: ACTIONS.SET_SAVING, payload: true });

    try {
      // Use the placementDirectorProfileService to upload the resume
      const result = await placementDirectorProfileService.uploadResume(file);
      
      const resumeUrl = result.resumeUrl;
      
      // Update form data with new resume URL
      updateFormData('resumeUrl', resumeUrl);
      
      // Also save the profile to persist the resume URL
      await saveProfile({ resumeUrl });
      
      return { success: true, resumeUrl };
    } catch (error) {
      console.error('Upload resume error:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_SAVING, payload: false });
    }
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
    return placementDirectorProfileService.calculateProfileCompletion(state.formData);
  };

  // Navigation helpers
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
    uploadProfileImage,
    uploadResume,

    // Helpers
    getFieldValue,
    hasFieldError,
    getFieldError,
    getProfileCompletion,
    goToNextTab,
    goToPreviousTab
  };

  return (
    <PlacementDirectorProfileContext.Provider value={value}>
      {children}
    </PlacementDirectorProfileContext.Provider>
  );
};

// Custom hook to use placement director profile context
export const usePlacementDirectorProfile = () => {
  const context = useContext(PlacementDirectorProfileContext);
  if (!context) {
    throw new Error('usePlacementDirectorProfile must be used within a PlacementDirectorProfileProvider');
  }
  return context;
};

export default PlacementDirectorProfileContext;
