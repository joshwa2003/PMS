import React, { useState, useEffect } from 'react';
import { Card, Grid, Alert, CircularProgress, Avatar } from '@mui/material';
import { PhotoCamera, Link as LinkIcon, Visibility, Info } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import GoogleDrivePreview from 'components/GoogleDrivePreview';
import { useAdministratorProfile } from '../../context/AdministratorProfileContext';
import { useAuth } from '../../context/AuthContext';

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
  } = useAdministratorProfile();

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

  // Get current profile image with priority order
  const currentProfileImage = formData.profilePhotoUrl || profile?.profilePhotoUrl || user?.profilePicture;

  // Update image key when profile image changes
  useEffect(() => {
    console.log('ProfileImageForm - Profile image changed:', {
      formDataProfilePhotoUrl: formData.profilePhotoUrl,
      profilePhotoUrl: profile?.profilePhotoUrl,
      userProfilePicture: user?.profilePicture,
      currentProfileImage
    });
    setImageKey(Date.now());
  }, [formData.profilePhotoUrl, profile?.profilePhotoUrl, user?.profilePicture, currentProfileImage]);

  // Validate Google Drive URL
  const validateGoogleDriveUrl = (url) => {
    if (!url || !url.trim()) {
      return 'Please enter a Google Drive URL';
    }

    const googleDrivePatterns = [
      /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/,
      /^https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9-_]+)/
    ];

    const isValid = googleDrivePatterns.some(pattern => pattern.test(url.trim()));
    
    if (!isValid) {
      return 'Please provide a valid Google Drive share link';
    }

    return null;
  };

  // Handle URL input change
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setGoogleDriveUrl(url);
    setValidationError('');
    setSuccessMessage('');
    
    // Show preview if URL looks valid
    if (url && validateGoogleDriveUrl(url) === null) {
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
    const error = validateGoogleDriveUrl(googleDriveUrl);
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

  // Convert Google Drive URL to thumbnail for display using backend proxy
  const getGoogleDriveThumbnail = (url) => {
    if (!url) return null;

    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      // Use backend proxy to avoid CORS issues
      return `/api/google-drive-image?id=${fileIdMatch[1]}`;
    }
    return url;
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
        
        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <MDBox mb={2} p={2} bgcolor="grey.100" borderRadius={1}>
            <MDTypography variant="caption" color="text">
              Debug: ProfileImageForm loaded successfully
            </MDTypography>
          </MDBox>
        )}

        <Grid container spacing={3}>
          {/* Current Profile Image */}
          <Grid item xs={12} md={6}>
            <MDBox>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Current Profile Image
              </MDTypography>
              
              <MDBox display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Avatar
                  src={currentProfileImage ? `${getGoogleDriveThumbnail(currentProfileImage)}?t=${imageKey}` : null}
                  key={imageKey}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    border: '3px solid',
                    borderColor: 'info.main'
                  }}
                >
                  {!currentProfileImage && <PhotoCamera sx={{ fontSize: 40 }} />}
                </Avatar>
                
                <MDTypography variant="body2" color="text" textAlign="center">
                  {currentProfileImage ? 'Current profile image' : 'No profile image set'}
                </MDTypography>
              </MDBox>
            </MDBox>
          </Grid>

          {/* Google Drive URL Input */}
          <Grid item xs={12} md={6}>
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
                <GoogleDrivePreview 
                  link={googleDriveUrl} 
                  title="Profile Image Preview"
                  showPreview={true}
                />
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
