import React, { useState, useEffect } from 'react';
import { Card, Grid, Alert, CircularProgress, Avatar, Box, Typography } from '@mui/material';
import { PhotoCamera, Link as LinkIcon, Visibility, Info } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import { usePlacementStaffProfile } from '../../context/PlacementStaffProfileContext';
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
    profile
  } = usePlacementStaffProfile();

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
    finalCurrentProfileImage: currentProfileImage,
    formDataKeys: formData ? Object.keys(formData) : 'no formData',
    profileKeys: profile ? Object.keys(profile) : 'no profile'
  });

  // Update image key when profile image changes
  useEffect(() => {
    console.log('ProfileImageForm - Profile image changed:', {
      formDataProfilePhotoUrl: formData?.profilePhotoUrl,
      profilePhotoUrl: profile?.profilePhotoUrl,
      userProfilePicture: user?.profilePicture,
      userProfilePhotoUrl: user?.profilePhotoUrl,
      currentProfileImage,
      userFullObject: user
    });
    setImageKey(Date.now());
  }, [formData?.profilePhotoUrl, profile?.profilePhotoUrl, user?.profilePicture, user?.profilePhotoUrl, currentProfileImage]);

  // Additional effect to force refresh when user data changes
  useEffect(() => {
    if (user) {
      console.log('🔍 User data updated:', {
        userId: user.id,
        profilePicture: user.profilePicture,
        profilePhotoUrl: user.profilePhotoUrl,
        allUserKeys: Object.keys(user)
      });
      setImageKey(Date.now());
    }
  }, [user]);

  // Validate Google Drive URL using utility function
  const validateGoogleDriveUrlLocal = (url) => {
    const result = validateGoogleDriveUrl(url);
    return result.isValid ? null : result.error;
  };

  // Handle URL input change
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setGoogleDriveUrl(url);
    setValidationError('');
    setSuccessMessage('');
    
    // Show preview if URL looks valid
    if (url && validateGoogleDriveUrlLocal(url) === null) {
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
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
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
    '3. Click "Change to anyone with the link"',
    '4. Set permission to "Viewer"',
    '5. Click "Copy link" and paste it below'
  ];

  console.log('ProfileImageForm - Current state:', {
    googleDriveUrl,
    isUpdating,
    successMessage,
    validationError,
    showPreview,
    currentProfileImage
  });

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h5" fontWeight="medium" mb={3}>
          Profile Image Management
        </MDTypography>
        
        <Grid container spacing={3}>
          {/* Google Drive URL Input */}
          <Grid item xs={12}>
            <MDBox>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Update with Google Drive Link
              </MDTypography>

              <MDBox mb={2}>
                <MDInput
                  type="url"
                  label="Google Drive Image URL"
                  value={googleDriveUrl}
                  onChange={handleUrlChange}
                  fullWidth
                  placeholder="https://drive.google.com/file/d/..."
                  InputProps={{
                    startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  error={!!validationError}
                  helperText={validationError}
                />
              </MDBox>

              <MDBox display="flex" gap={1} mb={2}>
                <MDButton
                  variant="gradient"
                  color="info"
                  onClick={handleUpdateProfileImage}
                  disabled={!googleDriveUrl || isUpdating || isSaving}
                  startIcon={isUpdating ? <CircularProgress size={16} /> : <PhotoCamera />}
                  fullWidth
                >
                  {isUpdating ? 'Updating...' : 'Update Profile Image'}
                </MDButton>
                
                {googleDriveUrl && (
                  <MDButton
                    variant="outlined"
                    color="info"
                    onClick={() => setShowPreview(!showPreview)}
                    startIcon={<Visibility />}
                  >
                    {showPreview ? 'Hide' : 'Preview'}
                  </MDButton>
                )}
              </MDBox>

              {/* Success Message */}
              {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {successMessage}
                </Alert>
              )}

              {/* Error Message */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
            </MDBox>
          </Grid>

          {/* Preview Section */}
          {showPreview && googleDriveUrl && !validationError && (
            <Grid item xs={12}>
              <MDBox>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Preview
                </MDTypography>
                <MDBox 
                  sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    mb: 2,
                    textAlign: 'center',
                    p: 2
                  }}
                >
                  {getGoogleDriveThumbnail(googleDriveUrl) ? (
                    <img
                      src={getGoogleDriveThumbnail(googleDriveUrl)}
                      alt="Profile Image Preview"
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: 400, 
                        display: 'inline-block',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 400,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100',
                        borderRadius: '8px',
                        border: '2px dashed',
                        borderColor: 'grey.300',
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(googleDriveUrl, '_blank')}
                    >
                      <PhotoCamera sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" mb={1}>
                        Google Drive Image
                      </Typography>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        Click to view in Google Drive
                      </Typography>
                    </Box>
                  )}
                </MDBox>
              </MDBox>
            </Grid>
          )}

          {/* Instructions */}
          <Grid item xs={12}>
            <Alert severity="info" icon={<Info />}>
              <MDTypography variant="h6" fontWeight="medium" mb={1}>
                How to share your Google Drive image:
              </MDTypography>
              <MDBox component="ol" pl={2}>
                {getSharingInstructions().map((instruction, index) => (
                  <MDBox component="li" key={index} mb={0.5}>
                    <MDTypography variant="body2">
                      {instruction}
                    </MDTypography>
                  </MDBox>
                ))}
              </MDBox>
              <MDTypography variant="body2" mt={1} fontWeight="medium" color="warning.main">
                Note: Make sure your image file is accessible to anyone with the link for it to display properly.
              </MDTypography>
            </Alert>
          </Grid>
        </Grid>
      </MDBox>
    </Card>
  );
}

export default ProfileImageForm;
