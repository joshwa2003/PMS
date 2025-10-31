import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import placementStaffProfileService from '../services/placementStaffProfileService';
import departmentService from '../services/departmentService';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  profile: null,
  isLoading: false,
  isSaving: false,
  error: null,
  activeTab: 0,
  departments: [],
  isDepartmentsLoading: false,
  formData: {
    name: {
      firstName: '',
      lastName: ''
    },
    email: '',
    mobileNumber: '',
    gender: '',
    profilePhotoUrl: '',
    role: 'staff',
    department: '',
    designation: 'Staff Coordinator',
    status: 'active',
    dateOfJoining: '',
    registrationDate: '',
    lastLoginAt: '',
    authProvider: 'local',
    employeeId: '',
    officeLocation: '',
    officialEmail: '',
    experienceYears: 0,
    qualifications: [],
    assignedStudents: [],
    responsibilitiesText: '',
    trainingProgramsHandled: [],
    languagesSpoken: [],
    availabilityTimeSlots: [],
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
  RESET_FORM: 'RESET_FORM',
  SET_DEPARTMENTS: 'SET_DEPARTMENTS',
  SET_DEPARTMENTS_LOADING: 'SET_DEPARTMENTS_LOADING'
};

// Reducer function
const placementStaffProfileReducer = (state, action) => {
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

    case ACTIONS.SET_DEPARTMENTS:
      return {
        ...state,
        departments: action.payload,
        isDepartmentsLoading: false
      };

    case ACTIONS.SET_DEPARTMENTS_LOADING:
      return {
        ...state,
        isDepartmentsLoading: action.payload
      };

    default:
      return state;
  }
};

// Create context
const PlacementStaffProfileContext = createContext();

// Placement Staff Profile Provider component
export const PlacementStaffProfileProvider = ({ children }) => {
  const [state, dispatch] = useReducer(placementStaffProfileReducer, initialState);
  const { user, updateProfilePicture } = useAuth();
  const hasLoadedRef = useRef(false);

  // Load departments function
  const loadDepartments = useCallback(async (forceReload = false) => {
    if (!forceReload && (state.isDepartmentsLoading || state.departments.length > 0)) return;
    
    dispatch({ type: ACTIONS.SET_DEPARTMENTS_LOADING, payload: true });

    try {
      const response = await departmentService.getAllDepartmentsNoPagination({ isActive: true });
      
      // Handle the response structure from the backend
      let departments = [];
      if (response.success && response.data?.departments) {
        departments = response.data.departments;
      } else if (response.departments) {
        departments = response.departments;
      }
      
      if (departments.length > 0) {
        const formattedDepartments = departments.map(dept => ({
          code: dept.code,
          name: dept.name,
          id: dept._id
        }));
        
        dispatch({ type: ACTIONS.SET_DEPARTMENTS, payload: formattedDepartments });
      } else {
        console.error('Failed to load departments:', response);
        // Fallback to hardcoded departments if API fails
        const fallbackDepartments = [
          { code: 'CSE', name: 'Computer Science & Engineering' },
          { code: 'ECE', name: 'Electronics & Communication Engineering' },
          { code: 'EEE', name: 'Electrical & Electronics Engineering' },
          { code: 'MECH', name: 'Mechanical Engineering' },
          { code: 'CIVIL', name: 'Civil Engineering' },
          { code: 'IT', name: 'Information Technology' },
          { code: 'ADMIN', name: 'Administration' },
          { code: 'HR', name: 'Human Resources' },
          { code: 'OTHER', name: 'Other' }
        ];
        dispatch({ type: ACTIONS.SET_DEPARTMENTS, payload: fallbackDepartments });
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      // Fallback to hardcoded departments if API fails
      const fallbackDepartments = [
        { code: 'CSE', name: 'Computer Science & Engineering' },
        { code: 'ECE', name: 'Electronics & Communication Engineering' },
        { code: 'EEE', name: 'Electrical & Electronics Engineering' },
        { code: 'MECH', name: 'Mechanical Engineering' },
        { code: 'CIVIL', name: 'Civil Engineering' },
        { code: 'IT', name: 'Information Technology' },
        { code: 'ADMIN', name: 'Administration' },
        { code: 'HR', name: 'Human Resources' },
        { code: 'OTHER', name: 'Other' }
      ];
      dispatch({ type: ACTIONS.SET_DEPARTMENTS, payload: fallbackDepartments });
    }
  }, [state.isDepartmentsLoading, state.departments.length]);

  // Create department mapping from loaded departments
  const departmentMapping = state.departments.reduce((acc, dept) => {
    acc[dept.code] = dept.name;
    return acc;
  }, {});

  // Reverse mapping for saving to backend
  const reverseDepartmentMapping = state.departments.reduce((acc, dept) => {
    acc[dept.name] = dept.code;
    return acc;
  }, {});

  // Load profile function
  const loadProfile = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (state.isLoading || hasLoadedRef.current) return;
    
    hasLoadedRef.current = true;
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      // Try to get existing placement staff profile first
      const profile = await placementStaffProfileService.getProfile();
      
      dispatch({ type: ACTIONS.SET_PROFILE, payload: profile });
      
      // Sync profile image with AuthContext if it exists
      if (profile?.profilePhotoUrl) {
        updateProfilePicture(profile.profilePhotoUrl);
      }
    } catch (error) {
      console.error('Load placement staff profile error:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  }, [updateProfilePicture, state.isLoading]);

  // Load departments on mount
  useEffect(() => {
    loadDepartments(true); // Force reload
  }, [loadDepartments]);

  // Load placement staff profile on mount
  useEffect(() => {
    const allowedRoles = ['placement_staff', 'staff', 'admin', 'director', 'hod'];
    if (user?.role && allowedRoles.includes(user.role) && user?.id && !hasLoadedRef.current) {
      loadProfile();
    }
  }, [user?.id, user?.role, loadProfile]);

  // Save profile function
  const saveProfile = async (sectionData = null) => {
    console.log('🔄 saveProfile called with:', sectionData);
    console.log('🔄 Current state.formData:', state.formData);
    
    dispatch({ type: ACTIONS.SET_SAVING, payload: true });
    dispatch({ type: ACTIONS.CLEAR_VALIDATION_ERRORS });

    try {
      const dataToSave = sectionData || state.formData;
      
      // Clean the data before sending - remove empty strings and null values
      const cleanedData = cleanFormData(dataToSave);
      
      console.log('💾 Saving placement staff profile data:', cleanedData);
      
      // Validate data using the service (skip department validation since we have dynamic departments)
      const validationErrors = placementStaffProfileService.validateProfileData(cleanedData, true);
      
      // Filter out department validation errors since we now have dynamic departments
      const filteredErrors = validationErrors.filter(error => 
        !error.includes('Please select a valid department')
      );
      
      console.log('🔍 Validation errors (before filtering):', validationErrors);
      console.log('🔍 Validation errors (after filtering):', filteredErrors);
      
      if (filteredErrors.length > 0) {
        console.log('❌ Validation failed:', filteredErrors);
        dispatch({ type: ACTIONS.SET_VALIDATION_ERRORS, payload: { general: filteredErrors } });
        dispatch({ type: ACTIONS.SET_SAVING, payload: false });
        return { success: false, errors: filteredErrors };
      }

      // Use placementStaffProfileService to update profile
      console.log('📡 Making API call to update profile...');
      const updatedProfile = await placementStaffProfileService.updateProfile(cleanedData);
      
      console.log('✅ Profile updated successfully:', updatedProfile);
      dispatch({ type: ACTIONS.SET_PROFILE, payload: updatedProfile });
      
      return { success: true, profile: updatedProfile };
    } catch (error) {
      console.error('❌ Save placement staff profile error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
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
    dispatch({ type: ACTIONS.CLEAR_ERROR });

    try {
      console.log('Starting profile image upload process...');
      
      // Use the placementStaffProfileService to upload the image
      const result = await placementStaffProfileService.uploadProfileImage(file);
      
      if (!result.success) {
        throw new Error(result.message || 'Upload failed');
      }
      
      const profilePhotoUrl = result.profilePhotoUrl;
      console.log('Image uploaded successfully, URL:', profilePhotoUrl);
      
      // Update form data with new profile image URL
      updateFormData('profilePhotoUrl', profilePhotoUrl);
      
      // The backend upload function already updates the profile, so we don't need to call saveProfile again
      // This avoids the secondary error we were seeing
      
      console.log('Profile image upload completed successfully');
      return { success: true, profilePhotoUrl };
    } catch (error) {
      console.error('Upload profile image error:', error);
      
      // Set user-friendly error message
      let errorMessage = error.message;
      
      // Handle specific error cases
      if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('Authentication')) {
        errorMessage = 'Session expired. Please refresh the page and try again.';
      } else if (error.message.includes('Server error')) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (error.message.includes('File size')) {
        errorMessage = 'Image file is too large. Please select a smaller image (max 5MB).';
      } else if (error.message.includes('Invalid file type')) {
        errorMessage = 'Invalid file format. Please select a JPEG, PNG, or GIF image.';
      } else if (!errorMessage || errorMessage === 'Upload failed') {
        errorMessage = 'Failed to upload image. Please try again.';
      }
      
      dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: ACTIONS.SET_SAVING, payload: false });
    }
  };

  // Update profile image with Google Drive URL function
  const updateProfileImage = async (googleDriveUrl) => {
    dispatch({ type: ACTIONS.SET_SAVING, payload: true });

    try {
      // Use the placementStaffProfileService to update the image URL
      const result = await placementStaffProfileService.updateProfileImageUrl(googleDriveUrl);
      
      const profilePhotoUrl = result.profilePhotoUrl;
      
      // Update form data with new profile image URL
      updateFormData('profilePhotoUrl', profilePhotoUrl);
      
      // Update the profile state
      dispatch({ 
        type: ACTIONS.SET_PROFILE, 
        payload: { ...state.profile, profilePhotoUrl } 
      });
      
      // Sync with AuthContext
      if (updateProfilePicture) {
        updateProfilePicture(profilePhotoUrl);
      }
      
      // Force reload the profile to ensure all data is fresh
      setTimeout(async () => {
        hasLoadedRef.current = false;
        await loadProfile();
      }, 500);
      
      return { success: true, profilePhotoUrl };
    } catch (error) {
      console.error('Update profile image error:', error);
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
    return placementStaffProfileService.calculateProfileCompletion(state.formData);
  };

  // Navigation helpers
  const goToNextTab = () => {
    if (state.activeTab < 4) { // 5 tabs total (0-4)
      setActiveTab(state.activeTab + 1);
    }
  };

  const goToPreviousTab = () => {
    if (state.activeTab > 0) {
      setActiveTab(state.activeTab - 1);
    }
  };

  // Array field helpers
  const addArrayItem = (field, item) => {
    const currentArray = getFieldValue(field) || [];
    const newArray = placementStaffProfileService.addArrayItem(currentArray, item);
    updateFormData(field, newArray);
  };

  const removeArrayItem = (field, item) => {
    const currentArray = getFieldValue(field) || [];
    const newArray = placementStaffProfileService.removeArrayItem(currentArray, item);
    updateFormData(field, newArray);
  };

  const updateArrayItem = (field, index, newItem) => {
    const currentArray = getFieldValue(field) || [];
    const newArray = placementStaffProfileService.updateArrayItem(currentArray, index, newItem);
    updateFormData(field, newArray);
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
    departments: state.departments,
    isDepartmentsLoading: state.isDepartmentsLoading,

    // Actions
    loadProfile,
    saveProfile,
    updateFormData,
    updateMultipleFields,
    setActiveTab,
    clearError,
    resetForm,
    uploadProfileImage,
    updateProfileImage,
    loadDepartments,

    // Helpers
    getFieldValue,
    hasFieldError,
    getFieldError,
    getProfileCompletion,
    goToNextTab,
    goToPreviousTab,
    addArrayItem,
    removeArrayItem,
    updateArrayItem,

    // Constants
    departmentMapping,
    reverseDepartmentMapping
  };

  return (
    <PlacementStaffProfileContext.Provider value={value}>
      {children}
    </PlacementStaffProfileContext.Provider>
  );
};

// Custom hook to use placement staff profile context
export const usePlacementStaffProfile = () => {
  const context = useContext(PlacementStaffProfileContext);
  if (!context) {
    throw new Error('usePlacementStaffProfile must be used within a PlacementStaffProfileProvider');
  }
  return context;
};

export default PlacementStaffProfileContext;
