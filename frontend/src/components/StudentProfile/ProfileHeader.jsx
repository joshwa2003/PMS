import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { getGoogleDriveThumbnail, isGoogleDriveUrl } from '../../utils/googleDriveUtils';

// @mui material components
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// @mui icons
import PhotoCamera from "@mui/icons-material/PhotoCamera";

// S.A. Engineering College React components
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";
import MDInput from "../MDInput";
import MDButton from "../MDButton";

function ProfileHeader() {
  const { user, updateProfilePicture } = useAuth();
  const { formData, updateProfileImage, isSaving } = useStudentProfile();
  const [uploadStatus, setUploadStatus] = useState({ open: false, message: '', severity: 'success' });
  const [googleDriveUrl, setGoogleDriveUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Helper function to get role display name
  const getRoleDisplayName = (role) => {
    const roleMap = {
      'student': 'Student',
  
      'admin': 'Administrator',
      'placement_director': 'Placement Director',
      'placement_staff': 'Placement Staff',
      'department_hod': 'Department HOD',
      'other_staff': 'Staff Member'
    };
    return roleMap[role] || 'User';
  };

  // Handle profile picture update with Google Drive URL
  const handleProfilePictureUpdate = () => {
    console.log('Profile picture update clicked');
    setShowUrlInput(!showUrlInput);
  };

  // Handle Google Drive URL update
  const handleImageUpdate = async () => {
    if (!googleDriveUrl.trim()) {
      setUploadStatus({
        open: true,
        message: 'Please enter a Google Drive URL',
        severity: 'error'
      });
      return;
    }

    try {
      console.log('Updating profile image with Google Drive URL:', googleDriveUrl);
      const result = await updateProfileImage(googleDriveUrl);
      
      if (result.success) {
        // Update the user's profile picture in AuthContext so it shows in navbar and sidebar
        updateProfilePicture(result.profileImageUrl);
        
        setUploadStatus({
          open: true,
          message: 'Profile image updated successfully!',
          severity: 'success'
        });
        setGoogleDriveUrl('');
        setShowUrlInput(false);
        console.log('Profile image updated successfully:', result.profileImageUrl);
      } else {
        setUploadStatus({
          open: true,
          message: result.error || 'Failed to update profile image',
          severity: 'error'
        });
        console.error('Profile image update failed:', result.error);
      }
    } catch (error) {
      setUploadStatus({
        open: true,
        message: 'An error occurred while updating the image',
        severity: 'error'
      });
      console.error('Profile image update error:', error);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setUploadStatus({ ...uploadStatus, open: false });
  };

  if (!user) {
    return null;
  }


  // Get profile image URL from formData or user data
  const profileImageUrl = formData?.profileImageUrl || user.profilePicture;
  const processedImageUrl = getGoogleDriveThumbnail(profileImageUrl);

  return (
    <>
      <MDBox display="flex" alignItems="center" mb={3}>
        <MDBox position="relative">
          {profileImageUrl && isGoogleDriveUrl(profileImageUrl) ? (
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                mr: 3
              }}
              onClick={() => window.open(profileImageUrl, '_blank')}
            >
              <Typography sx={{ fontSize: 40, color: 'white', fontWeight: 'bold' }}>
                {(user.firstName?.[0] || user.fullName?.[0] || user.email?.[0])?.toUpperCase()}
              </Typography>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  textAlign: 'center',
                  py: 0.5
                }}
              >
                <Typography variant="caption" fontSize="10px">
                  Google Drive
                </Typography>
              </Box>
            </Box>
          ) : (
            <Avatar
              src={processedImageUrl}
              alt={user.fullName || user.firstName + ' ' + user.lastName}
              sx={{ width: 100, height: 100, mr: 3 }}
            >
              {!profileImageUrl && (user.firstName?.[0] || user.fullName?.[0] || user.email?.[0])}
            </Avatar>
          )}
          <IconButton
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 20,
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': { backgroundColor: 'primary.dark' },
              '&:disabled': { backgroundColor: 'grey.400' }
            }}
            size="small"
            onClick={handleProfilePictureUpdate}
            disabled={isSaving}
            title="Update profile image with Google Drive link"
          >
            {isSaving ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <PhotoCamera fontSize="small" />
            )}
          </IconButton>
        </MDBox>
        {/* Intentionally removed student name, role, and email display */}

        {/* Google Drive URL Input */}
        {showUrlInput && (
          <MDBox mt={2}>
            <MDInput
              fullWidth
              label="Google Drive Image URL"
              value={googleDriveUrl}
              onChange={(e) => setGoogleDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/your-file-id/view?usp=sharing"
              helperText="Share your image on Google Drive and paste the link here"
            />
            <MDBox mt={1} display="flex" gap={1}>
              <MDButton
                variant="contained"
                color="info"
                size="small"
                onClick={handleImageUpdate}
                disabled={isSaving || !googleDriveUrl.trim()}
              >
                {isSaving ? 'Updating...' : 'Update Image'}
              </MDButton>
              <MDButton
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => {
                  setShowUrlInput(false);
                  setGoogleDriveUrl('');
                }}
              >
                Cancel
              </MDButton>
            </MDBox>
          </MDBox>
        )}
      </MDBox>

      {/* Upload status snackbar */}
      <Snackbar
        open={uploadStatus.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={uploadStatus.severity}
          sx={{ width: '100%' }}
        >
          {uploadStatus.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ProfileHeader;
