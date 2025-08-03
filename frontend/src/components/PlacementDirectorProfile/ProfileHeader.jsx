import React, { useState, useRef } from 'react';
import { Card, Avatar, IconButton, CircularProgress } from '@mui/material';
import { PhotoCamera, Person } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDProgress from 'components/MDProgress';
import { usePlacementDirectorProfile } from '../../context/PlacementDirectorProfileContext';
import { useAuth } from '../../context/AuthContext';

function ProfileHeader() {
  const { user, updateProfilePicture } = useAuth();
  const { formData, uploadProfileImage, isSaving, getProfileCompletion } = usePlacementDirectorProfile();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadProfileImage(file);
      if (result.success) {
        // Update the profile picture in AuthContext as well
        updateProfilePicture(result.profilePhotoUrl);
        console.log('Profile image uploaded successfully');
      } else {
        alert(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const profileCompletion = getProfileCompletion();
  const profileImage = formData.profilePhotoUrl || user?.profilePicture;

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 40) return 'warning';
    return 'error';
  };

  const fullName = `${formData.name?.firstName || ''} ${formData.name?.lastName || ''}`.trim();
  const displayName = fullName || user?.firstName + ' ' + user?.lastName || 'Placement Director';

  return (
    <Card sx={{ overflow: 'visible' }}>
      <MDBox p={3}>
        <MDBox display="flex" alignItems="center" mb={2}>
          {/* Profile Image */}
          <MDBox position="relative" mr={3}>
            <Avatar
              src={profileImage}
              sx={{
                width: 80,
                height: 80,
                cursor: 'pointer',
                border: '3px solid',
                borderColor: 'info.main',
                '&:hover': {
                  opacity: 0.8
                }
              }}
              onClick={handleImageClick}
            >
              {!profileImage && <Person sx={{ fontSize: 40 }} />}
            </Avatar>
            
            {/* Upload Button Overlay */}
            <IconButton
              sx={{
                position: 'absolute',
                bottom: -5,
                right: -5,
                backgroundColor: 'info.main',
                color: 'white',
                width: 30,
                height: 30,
                '&:hover': {
                  backgroundColor: 'info.dark'
                }
              }}
              onClick={handleImageClick}
              disabled={isUploading || isSaving}
            >
              {isUploading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PhotoCamera sx={{ fontSize: 16 }} />
              )}
            </IconButton>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
            />
          </MDBox>

          {/* Profile Info */}
          <MDBox flex={1}>
            <MDTypography variant="h4" fontWeight="medium" mb={0.5}>
              {displayName}
            </MDTypography>
            
            <MDTypography variant="body2" color="text" mb={1}>
              {formData.designation || 'Placement Director'} 
              {formData.department && ` • ${formData.department}`}
            </MDTypography>
            
            <MDTypography variant="body2" color="text" mb={1}>
              {formData.email || user?.email}
            </MDTypography>

            {formData.employeeId && (
              <MDTypography variant="body2" color="text" mb={1}>
                Employee ID: {formData.employeeId}
              </MDTypography>
            )}

            {formData.officeRoomNo && (
              <MDTypography variant="body2" color="text">
                📍 {formData.officeRoomNo}
              </MDTypography>
            )}
          </MDBox>
        </MDBox>

        {/* Profile Completion */}
        <MDBox>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <MDTypography variant="body2" fontWeight="medium">
              Profile Completion
            </MDTypography>
            <MDTypography variant="body2" fontWeight="medium" color={getCompletionColor(profileCompletion)}>
              {profileCompletion}%
            </MDTypography>
          </MDBox>
          
          <MDProgress
            variant="gradient"
            color={getCompletionColor(profileCompletion)}
            value={profileCompletion}
            sx={{ height: 8 }}
          />
          
          <MDTypography variant="caption" color="text" mt={0.5}>
            {profileCompletion < 100 
              ? `Complete your profile to unlock all features`
              : `Your profile is complete!`
            }
          </MDTypography>
        </MDBox>

        {/* Quick Stats */}
        <MDBox mt={3} display="flex" justifyContent="space-around">
          <MDBox textAlign="center">
            <MDTypography variant="h6" fontWeight="medium" color={formData.status === 'active' ? 'success' : 'warning'}>
              {formData.status || 'Active'}
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Status
            </MDTypography>
          </MDBox>
          
          <MDBox textAlign="center">
            <MDTypography variant="h6" fontWeight="medium" color="info">
              {formData.role || 'placement_director'}
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Access Level
            </MDTypography>
          </MDBox>
          
          <MDBox textAlign="center">
            <MDTypography variant="h6" fontWeight="medium" color="dark">
              {formData.dateOfJoining 
                ? new Date(formData.dateOfJoining).getFullYear()
                : new Date().getFullYear()
              }
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Joined
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default ProfileHeader;
