import React, { useState, useEffect } from 'react';
import { Card, Grid, Alert, CircularProgress, Avatar, Box, Typography } from '@mui/material';
import { PhotoCamera, Link as LinkIcon, Visibility, Info } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import { useDepartmentHODProfile } from '../../context/DepartmentHODProfileContext';
import { useAuth } from '../../context/AuthContext';
import { getGoogleDriveThumbnail, getGoogleDriveDirectImageUrl, validateGoogleDriveUrl } from '../../utils/googleDriveUtils';

function ProfileImageForm() {
  console.log('ProfileImageForm component rendering...');
  
  const { user } = useAuth();
  const { 
    formData, 
    updateFormData, 
    updateProfileImage, 
    isSaving, 
    error,
    profile,
    setActiveTab
  } = useDepartmentHODProfile();

  console.log('ProfileImageForm - Context data:', {
    formData: formData ? 'exists' : 'null',
    updateProfileImage: typeof updateProfileImage,
    isSaving,
    error,
    user: user ? 'exists' : 'null'
  });

  const [googleDriveUrl, setGoogleDriveUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now()); // Force image refresh

  // Get current profile image with priority order - check all possible sources
  const currentProfileImage = formData?.profilePhotoUrl || 
                              profile?.profilePhotoUrl || 
                              user?.profilePicture || 
                              user?.profilePhotoUrl ||
                              formData?.profilePicture;
  
  console.log('🔍 ProfileImageForm - Current image sources:', {
    formDataProfilePhotoUrl: formData?.profilePhotoUrl,
    profilePhotoUrl: profile?.profilePhotoUrl,
    userProfilePicture: user?.profilePicture,
    userProfilePhotoUrl: user?.profilePhotoUrl,
    formDataProfilePicture: formData?.profilePicture,
    currentProfileImage
  });

  // Get processed image URL for display
  const processedImageUrl = getGoogleDriveThumbnail(currentProfileImage);
  const directImageUrl = getGoogleDriveDirectImageUrl(currentProfileImage);

  console.log('ProfileImageForm - Current state:', {
    googleDriveUrl,
    isUpdating,
    successMessage,
    validationError,
    showPreview,
    processedImageUrl,
    directImageUrl
  });

  // Local validation function
  const validateGoogleDriveUrlLocal = (url) => {
    if (!url || !url.trim()) {
      return 'Please enter a Google Drive URL';
    }

    const trimmedUrl = url.trim();
    
    // Check if it's a Google Drive URL
    if (!trimmedUrl.includes('drive.google.com')) {
      return 'Please enter a valid Google Drive URL';
    }

    // Check if it's a file URL (contains /file/d/)
    if (!trimmedUrl.includes('/file/d/')) {
      return 'Please enter a direct Google Drive file URL (should contain /file/d/)';
    }

    return null;
  };

  // Handle URL change and show preview
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setGoogleDriveUrl(url);
    setValidationError('');
    setSuccessMessage('');

    // Show preview if URL looks valid
    if (url && !validateGoogleDriveUrlLocal(url)) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  };

  // Handle profile image update
  const handleUpdateProfileImage = async () => {
    // Clear previous messages
    setValidationError('');
    setSuccessMessage('');

    // Validate URL
    const error = validateGoogleDriveUrlLocal(googleDriveUrl);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsUpdating(true);

    try {
      const result = await updateProfileImage(googleDriveUrl.trim());
      
      if (result.success) {
        setSuccessMessage('Profile image updated successfully!');
        setGoogleDriveUrl('');
        setShowPreview(false);
        
        // Force image refresh
        setImageKey(Date.now());
        
        // Automatically move to the next tab (HOD Specific) after successful save
        setTimeout(() => {
          setActiveTab(4); // HOD Specific tab
        }, 1000); // Wait 1 second to show success message
      } else {
        setValidationError(result.error || 'Failed to update profile image');
      }
    } catch (error) {
      console.error('Profile image update error:', error);
      setValidationError(error.message || 'An error occurred while updating profile image');
    } finally {
      setIsUpdating(false);
    }
  };

  // Get sharing instructions
  const getSharingInstructions = () => [
    '1. Open your image file in Google Drive',
    '2. Right-click and select "Share"',
    '3. Change access to "Anyone with the link can view"',
    '4. Copy the shareable link',
    '5. Paste the link below'
  ];

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h5" fontWeight="medium" mb={3}>
          Profile Image Management
        </MDTypography>

        {/* Current Profile Image */}
        <MDBox mb={4}>
          <MDTypography variant="h6" fontWeight="medium" mb={2}>
            Current Profile Image
          </MDTypography>
          
          <MDBox display="flex" justifyContent="center" mb={2}>
            <Avatar
              key={imageKey}
              src={processedImageUrl}
              sx={{
                width: 120,
                height: 120,
                border: '3px solid',
                borderColor: 'info.main',
                cursor: currentProfileImage ? 'pointer' : 'default'
              }}
              onClick={() => currentProfileImage && window.open(currentProfileImage, '_blank')}
            >
              <PhotoCamera sx={{ fontSize: 40 }} />
            </Avatar>
          </MDBox>
          
          {currentProfileImage ? (
            <MDTypography variant="caption" color="text" textAlign="center" display="block">
              Current image from Google Drive
            </MDTypography>
          ) : (
            <MDTypography variant="caption" color="text" textAlign="center" display="block">
              No profile image uploaded
            </MDTypography>
          )}
        </MDBox>

        {/* Update with Google Drive Link */}
        <MDBox>
          <MDTypography variant="h6" fontWeight="medium" mb={2}>
            Update with Google Drive Link
          </MDTypography>

          {/* Instructions */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <MDTypography variant="body2" fontWeight="medium" mb={1}>
              <Info sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
              How to share your image from Google Drive:
            </MDTypography>
            <MDBox component="ol" sx={{ pl: 2, mb: 0 }}>
              {getSharingInstructions().map((instruction, index) => (
                <MDTypography key={index} variant="caption" component="li" sx={{ mb: 0.5 }}>
                  {instruction}
                </MDTypography>
              ))}
            </MDBox>
          </Alert>

          {/* Success Message */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {/* Error Message */}
          {(validationError || error) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {validationError || error}
            </Alert>
          )}

          {/* URL Input */}
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={8}>
              <MDInput
                label="Google Drive Image URL"
                placeholder="https://drive.google.com/file/d/your-file-id/view?usp=sharing"
                value={googleDriveUrl}
                onChange={handleUrlChange}
                fullWidth
                error={!!validationError}
                disabled={isUpdating || isSaving}
                InputProps={{
                  startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                onClick={handleUpdateProfileImage}
                disabled={!googleDriveUrl || isUpdating || isSaving || !!validateGoogleDriveUrlLocal(googleDriveUrl)}
                startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : <PhotoCamera />}
              >
                {isUpdating ? 'Updating...' : 'Update Image'}
              </MDButton>
            </Grid>
          </Grid>

          {/* Preview */}
          {showPreview && googleDriveUrl && !validateGoogleDriveUrlLocal(googleDriveUrl) && (
            <MDBox mt={3}>
              <MDTypography variant="body2" fontWeight="medium" mb={1}>
                Preview:
              </MDTypography>
              <MDBox display="flex" justifyContent="center">
                <Avatar
                  src={getGoogleDriveThumbnail(googleDriveUrl)}
                  sx={{
                    width: 80,
                    height: 80,
                    border: '2px solid',
                    borderColor: 'info.main'
                  }}
                >
                  <PhotoCamera />
                </Avatar>
              </MDBox>
              <MDBox display="flex" justifyContent="center" mt={1}>
                <MDButton
                  variant="text"
                  color="info"
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => window.open(googleDriveUrl, '_blank')}
                >
                  View Original
                </MDButton>
              </MDBox>
            </MDBox>
          )}

          {/* Tips */}
          <MDBox mt={3}>
            <Alert severity="warning">
              <MDTypography variant="body2" fontWeight="medium" mb={1}>
                💡 Tips for best results:
              </MDTypography>
              <MDBox component="ul" sx={{ pl: 2, mb: 0 }}>
                <MDTypography variant="caption" component="li">
                  Use square images (1:1 ratio) for best appearance
                </MDTypography>
                <MDTypography variant="caption" component="li">
                  Recommended size: 400x400 pixels or larger
                </MDTypography>
                <MDTypography variant="caption" component="li">
                  Ensure the image is set to "Anyone with the link can view"
                </MDTypography>
                <MDTypography variant="caption" component="li">
                  Supported formats: JPG, PNG, GIF
                </MDTypography>
              </MDBox>
            </Alert>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default ProfileImageForm;
