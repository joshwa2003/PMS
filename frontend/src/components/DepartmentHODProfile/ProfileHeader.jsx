import React from 'react';
import { Card, Avatar, Box, Typography } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDProgress from 'components/MDProgress';
import { useDepartmentHODProfile } from '../../context/DepartmentHODProfileContext';
import { useAuth } from '../../context/AuthContext';
import { getGoogleDriveThumbnail, isGoogleDriveUrl } from '../../utils/googleDriveUtils';

function ProfileHeader() {
  const { user } = useAuth();
  const { formData, profile, getProfileCompletion } = useDepartmentHODProfile();

  const profileCompletion = getProfileCompletion();
  
  const profileImage = formData?.profilePhotoUrl || profile?.profilePhotoUrl || user?.profilePicture;
  const processedImageUrl = getGoogleDriveThumbnail(profileImage);

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 40) return 'warning';
    return 'error';
  };

  const fullName = `${formData?.name?.firstName || ''} ${formData?.name?.lastName || ''}`.trim();
  const displayName = fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Department HOD';

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
                  borderColor: 'info.main',
                  backgroundImage: processedImageUrl ? `url(${processedImageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
                onClick={() => window.open(profileImage, '_blank')}
              >
                {!processedImageUrl && (
                  <Typography sx={{ fontSize: '2rem', color: 'white', fontWeight: 'bold' }}>
                    {displayName.charAt(0).toUpperCase()}
                  </Typography>
                )}
              </Box>
            ) : (
              <Avatar
                src={processedImageUrl}
                sx={{
                  width: 80,
                  height: 80,
                  border: '3px solid',
                  borderColor: 'info.main',
                  fontSize: '2rem',
                  bgcolor: 'grey.300',
                  color: 'grey.700'
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
            )}
          </MDBox>

          {/* Profile Info */}
          <MDBox flex={1}>
            <MDTypography variant="h4" fontWeight="medium" mb={0.5}>
              {displayName}
            </MDTypography>
            
            <MDTypography variant="body2" color="text" mb={1}>
              {formData.designation || 'Head of Department'} 
              {formData.departmentHeadOf && ` • ${formData.departmentHeadOf}`}
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
              {formData.yearsAsHOD || 0}
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Years as HOD
            </MDTypography>
          </MDBox>
          
          <MDBox textAlign="center">
            <MDTypography variant="h6" fontWeight="medium" color="dark">
              {formData.numberOfFacultyManaged || 0}
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Faculty Managed
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default ProfileHeader;
