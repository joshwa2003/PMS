import React, { useEffect, useState } from 'react';
import { Card, Avatar, Box, Typography } from '@mui/material';
import { Person } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDProgress from 'components/MDProgress';
import { useAdministratorProfile } from '../../context/AdministratorProfileContext';
import { useAuth } from '../../context/AuthContext';
import { getGoogleDriveThumbnail, isGoogleDriveUrl } from '../../utils/googleDriveUtils';

function ProfileHeader() {
  const { user } = useAuth();
  const { formData, getProfileCompletion, profile } = useAdministratorProfile();
  const [imageKey, setImageKey] = useState(Date.now()); // Force image refresh


  // Update image key when profile image changes to force refresh
  useEffect(() => {
    console.log('ProfileHeader - Profile data changed:', {
      formDataProfilePhotoUrl: formData.profilePhotoUrl,
      userProfilePicture: user?.profilePicture,
      profilePhotoUrl: profile?.profilePhotoUrl
    });
    setImageKey(Date.now());
  }, [formData.profilePhotoUrl, user?.profilePicture, profile?.profilePhotoUrl]);

  const profileCompletion = getProfileCompletion();
  
  // Priority order: formData > profile > user
  const profileImageUrl = formData.profilePhotoUrl || profile?.profilePhotoUrl || user?.profilePicture;
  const profileImage = getGoogleDriveThumbnail(profileImageUrl);
  
  console.log('ProfileHeader - Rendering with image:', {
    profileImageUrl,
    profileImage,
    imageKey
  });

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 40) return 'warning';
    return 'error';
  };

  const fullName = `${formData.name?.firstName || ''} ${formData.name?.lastName || ''}`.trim();
  const displayName = fullName || user?.firstName + ' ' + user?.lastName || 'Administrator';

  return (
    <Card sx={{ overflow: 'visible' }}>
      <MDBox p={3}>
        <MDBox display="flex" alignItems="center" mb={2}>
          {/* Profile Image */}
          <MDBox position="relative" mr={3}>
            {profileImage && isGoogleDriveUrl(profileImage) ? (
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '3px solid',
                  borderColor: 'info.main'
                }}
                onClick={() => window.open(profileImage, '_blank')}
              >
                <Person sx={{ fontSize: 40, color: 'white' }} />
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
                src={profileImage}
                sx={{
                  width: 80,
                  height: 80,
                  border: '3px solid',
                  borderColor: 'info.main'
                }}
              >
                {!profileImage && <Person sx={{ fontSize: 40 }} />}
              </Avatar>
            )}
          </MDBox>

          {/* Profile Info */}
          <MDBox flex={1}>
            <MDTypography variant="h4" fontWeight="medium" mb={0.5}>
              {displayName}
            </MDTypography>
            
            <MDTypography variant="body2" color="text" mb={1}>
              {formData.designation || 'Administrator'} 
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

            {formData.officeLocation && (
              <MDTypography variant="body2" color="text">
                📍 {formData.officeLocation}
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
              {formData.accessLevel || 'Limited'}
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
