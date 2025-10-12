import React, { useState, useEffect } from 'react';
import { Card, CardContent, Alert, Avatar, Box, Divider, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { PhotoCamera, CloudUpload, Visibility, Share, CheckCircle, Info } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import { useAuth } from '../../context/AuthContext';
import { useOtherStaffProfile } from '../../context/OtherStaffProfileContext';
import { getGoogleDriveThumbnail, validateGoogleDriveUrl } from '../../utils/googleDriveUtils';

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
  } = useOtherStaffProfile();

  console.log('ProfileImageForm - Context data:', {
    formData: formData ? 'exists' : 'null',
    updateProfileImage: typeof updateProfileImage,
    isSaving,
    error,
    user: user ? 'exists' : 'null'
  });

  const [googleDriveUrl, setGoogleDriveUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());

  // Get current profile image
  const currentProfileImage = formData?.profilePhotoUrl || profile?.profilePhotoUrl || user?.profilePicture || '';
  const processedCurrentImage = getGoogleDriveThumbnail(currentProfileImage);

  console.log('ProfileImageForm - Image URLs:', {
    currentProfileImage,
    processedCurrentImage,
    formDataImage: formData?.profilePhotoUrl,
    profileImage: profile?.profilePhotoUrl,
    userImage: user?.profilePicture
  });

  // Test the Google Drive URL processing
  if (googleDriveUrl) {
    console.log('Google Drive URL processing:', {
      original: googleDriveUrl,
      processed: getGoogleDriveThumbnail(googleDriveUrl)
    });
  }

  // Local validation function using the working utility
  const validateGoogleDriveUrlLocal = (url) => {
    const result = validateGoogleDriveUrl(url);
    return result.isValid ? null : result.error;
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setGoogleDriveUrl(url);
    setValidationError('');
    setSuccessMessage('');
    
    // Validate URL and show preview if valid
    if (url.trim()) {
      const validation = validateGoogleDriveUrlLocal(url);
      if (!validation) {
        setShowPreview(true);
      } else {
        setShowPreview(false);
        setValidationError(validation);
      }
    } else {
      setShowPreview(false);
    }
  };

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
        
        // Profile image updated successfully - no need to navigate further
        // setTimeout(() => {
        //   setActiveTab(4); // Staff Specific tab removed
        // }, 1000);
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
    '2. Right-click on the image and select "Share"',
    '3. Click "Change to anyone with the link"',
    '4. Set permission to "Viewer"',
    '5. Click "Copy link" and paste it below'
  ];

  // Get tips for better images
  const getImageTips = () => [
    'Use a professional headshot photo',
    'Ensure good lighting and clear visibility',
    'Keep the background simple and clean',
    'Image should be at least 400x400 pixels',
    'Supported formats: JPG, PNG, GIF'
  ];

  return (
    <Card>
      <CardContent>
        <MDBox p={3}>
          <MDBox display="flex" alignItems="center" mb={3}>
            <PhotoCamera sx={{ mr: 1, color: 'primary.main' }} />
            <MDTypography variant="h5" fontWeight="medium">
              Profile Image
            </MDTypography>
          </MDBox>

          {/* Current Profile Image */}
          <MDBox mb={4}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Current Profile Image
            </MDTypography>
            
            <MDBox display="flex" justifyContent="center" mb={2}>
              <Avatar
                key={imageKey}
                src={processedCurrentImage}
                sx={{
                  width: 120,
                  height: 120,
                  border: '3px solid',
                  borderColor: 'info.main',
                  cursor: processedCurrentImage ? 'pointer' : 'default'
                }}
                onClick={() => {
                  if (processedCurrentImage) {
                    window.open(processedCurrentImage, '_blank');
                  }
                }}
              >
                {!processedCurrentImage && (
                  <PhotoCamera sx={{ fontSize: '3rem' }} />
                )}
              </Avatar>
            </MDBox>
            
            {!processedCurrentImage && (
              <MDTypography variant="body2" color="text" textAlign="center">
                No profile image uploaded yet
              </MDTypography>
            )}
          </MDBox>

          <Divider sx={{ my: 3 }} />

          {/* Success Message */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {successMessage}
            </Alert>
          )}

          {/* Error Message */}
          {(validationError || error) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {validationError || error}
            </Alert>
          )}

          {/* Upload Section */}
          <MDBox mb={4}>
            <MDBox display="flex" alignItems="center" mb={2}>
              <CloudUpload sx={{ mr: 1, color: 'info.main' }} />
              <MDTypography variant="h6" fontWeight="medium">
                Upload New Image
              </MDTypography>
            </MDBox>

            <MDBox mb={3}>
              <MDInput
                type="url"
                label="Google Drive Image URL"
                value={googleDriveUrl}
                onChange={handleUrlChange}
                fullWidth
                placeholder="https://drive.google.com/file/d/your-file-id/view?usp=sharing"
                error={!!validationError}
                helperText={validationError || 'Paste your Google Drive sharing link here'}
              />
            </MDBox>

            {/* Preview */}
            {showPreview && googleDriveUrl && (
              <MDBox mb={3}>
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
              </MDBox>
            )}

            <MDBox display="flex" justifyContent="space-between" alignItems="center">
              <MDButton variant="outlined" color="secondary" onClick={() => setActiveTab(2)}>
                Previous
              </MDButton>
              <MDButton
                variant="gradient"
                color="info"
                onClick={handleUpdateProfileImage}
                disabled={isUpdating || !googleDriveUrl || !!validationError}
                startIcon={<CloudUpload />}
              >
                {isUpdating ? 'Updating...' : 'Update Profile Image'}
              </MDButton>
            </MDBox>
          </MDBox>

          <Divider sx={{ my: 3 }} />

          {/* Instructions */}
          <MDBox mb={3}>
            <MDBox display="flex" alignItems="center" mb={2}>
              <Share sx={{ mr: 1, color: 'warning.main' }} />
              <MDTypography variant="h6" fontWeight="medium">
                How to Share from Google Drive
              </MDTypography>
            </MDBox>
            <List dense>
              {getSharingInstructions().map((instruction, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <CheckCircle sx={{ fontSize: '1rem', color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        {instruction}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </MDBox>

          {/* Tips */}
          <MDBox>
            <MDBox display="flex" alignItems="center" mb={2}>
              <Info sx={{ mr: 1, color: 'info.main' }} />
              <MDTypography variant="h6" fontWeight="medium">
                Tips for Better Profile Images
              </MDTypography>
            </MDBox>
            <List dense>
              {getImageTips().map((tip, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <Visibility sx={{ fontSize: '1rem', color: 'info.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        {tip}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </MDBox>
        </MDBox>
      </CardContent>
    </Card>
  );
}

export default ProfileImageForm;
