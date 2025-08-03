import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudentProfile } from '../../context/StudentProfileContext';

// @mui material components
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// @mui icons
import PhotoCamera from "@mui/icons-material/PhotoCamera";

// S.A. Engineering College React components
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";

function ProfileHeader() {
  const { user, updateProfilePicture } = useAuth();
  const { formData, uploadProfileImage, isSaving } = useStudentProfile();
  const fileInputRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState({ open: false, message: '', severity: 'success' });

  // Helper function to get role display name
  const getRoleDisplayName = (role) => {
    const roleMap = {
      'student': 'Student',
      'alumni': 'Alumni',
      'admin': 'Administrator',
      'placement_director': 'Placement Director',
      'placement_staff': 'Placement Staff',
      'department_hod': 'Department HOD',
      'other_staff': 'Staff Member'
    };
    return roleMap[role] || 'User';
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = () => {
    console.log('Profile picture upload clicked');
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus({
        open: true,
        message: 'Please select a valid image file (JPEG, PNG, or WebP)',
        severity: 'error'
      });
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadStatus({
        open: true,
        message: 'File size must be less than 5MB',
        severity: 'error'
      });
      return;
    }

    try {
      console.log('Uploading profile image:', file.name);
      const result = await uploadProfileImage(file);
      
      if (result.success) {
        // Update the user's profile picture in AuthContext so it shows in navbar and sidebar
        updateProfilePicture(result.profileImageUrl);
        
        setUploadStatus({
          open: true,
          message: 'Profile image uploaded successfully!',
          severity: 'success'
        });
        console.log('Profile image uploaded successfully:', result.profileImageUrl);
      } else {
        setUploadStatus({
          open: true,
          message: result.error || 'Failed to upload profile image',
          severity: 'error'
        });
        console.error('Profile image upload failed:', result.error);
      }
    } catch (error) {
      setUploadStatus({
        open: true,
        message: 'An error occurred while uploading the image',
        severity: 'error'
      });
      console.error('Profile image upload error:', error);
    }

    // Clear the file input
    event.target.value = '';
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

  return (
    <>
      <MDBox display="flex" alignItems="center" mb={3}>
        <MDBox position="relative">
          <Avatar
            src={profileImageUrl}
            alt={user.fullName || user.firstName + ' ' + user.lastName}
            sx={{ width: 100, height: 100, mr: 3 }}
          >
            {!profileImageUrl && (user.firstName?.[0] || user.fullName?.[0] || user.email?.[0])}
          </Avatar>
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
            onClick={handleProfilePictureUpload}
            disabled={isSaving}
          >
            {isSaving ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <PhotoCamera fontSize="small" />
            )}
          </IconButton>
          
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            style={{ display: 'none' }}
          />
        </MDBox>
        <MDBox>
          <MDTypography variant="h4" fontWeight="medium">
            {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
          </MDTypography>
          <MDTypography variant="body2" color="text">
            {getRoleDisplayName(user.role)}
          </MDTypography>
          <MDTypography variant="body2" color="text">
            {user.email}
          </MDTypography>
        </MDBox>
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
