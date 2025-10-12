import React from 'react';
import { Card, Avatar, Box, Typography } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDProgress from 'components/MDProgress';
import MDBadge from 'components/MDBadge';
import { usePlacementStaffProfile } from '../../context/PlacementStaffProfileContext';
import { getGoogleDriveThumbnail, isGoogleDriveUrl } from '../../utils/googleDriveUtils';

function ProfileHeader() {
  const {
    profile,
    formData,
    getProfileCompletion
  } = usePlacementStaffProfile();

  const getStatusColor = () => {
    if (profile?.status === 'inactive') return 'error';
    if (!profile?.isProfileComplete) return 'warning';
    return 'success';
  };

  const getStatusText = () => {
    if (profile?.status === 'inactive') return 'Inactive';
    if (!profile?.isProfileComplete) return 'Incomplete';
    return 'Active';
  };

  const profileCompletion = getProfileCompletion();

  const displayName = formData?.name ? `${formData.name.firstName} ${formData.name.lastName}`.trim() : 'Placement Staff';
  const displayDesignation = formData?.designation || 'Staff Coordinator';
  const displayDepartment = formData?.department || 'Department';
  const displayEmployeeId = formData?.employeeId || 'Employee ID';
  
  const profileImageUrl = formData?.profilePhotoUrl || profile?.profilePhotoUrl;
  const processedImageUrl = getGoogleDriveThumbnail(profileImageUrl);

  return (
    <Card sx={{ overflow: 'visible' }}>
        <MDBox p={3}>
          <MDBox display="flex" alignItems="center" justifyContent="space-between">
            {/* Profile Image and Basic Info */}
            <MDBox display="flex" alignItems="center">
              <MDBox position="relative" mr={3}>
                {profileImageUrl && isGoogleDriveUrl(profileImageUrl) ? (
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
                      border: '2px solid',
                      borderColor: 'primary.main',
                      backgroundImage: processedImageUrl ? `url(${processedImageUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      '&:hover': {
                        opacity: 0.8
                      }
                    }}
                    onClick={() => window.open(profileImageUrl, '_blank')}
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
                      fontSize: '2rem',
                      bgcolor: 'grey.300',
                      color: 'grey.700',
                      border: '2px solid',
                      borderColor: 'primary.main'
                    }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                )}
              </MDBox>

            <MDBox>
              <MDTypography variant="h4" fontWeight="medium">
                {displayName}
              </MDTypography>
              <MDTypography variant="body1" color="text" mb={0.5}>
                {displayDesignation}
              </MDTypography>
              <MDTypography variant="body2" color="secondary">
                {displayDepartment} • {displayEmployeeId}
              </MDTypography>
            </MDBox>
          </MDBox>

          {/* Status Badge */}
          <MDBox>
            <MDBadge
              badgeContent={getStatusText()}
              color={getStatusColor()}
              variant="gradient"
              size="lg"
            />
          </MDBox>
        </MDBox>

        {/* Profile Completion Section */}
        <MDBox mt={3}>
          <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <MDTypography variant="body2" color="text">
              Profile Completion
            </MDTypography>
            <MDTypography variant="body2" fontWeight="medium" color="text">
              {profileCompletion}%
            </MDTypography>
          </MDBox>
          
          <MDProgress 
            value={profileCompletion} 
            color={profileCompletion >= 90 ? 'success' : profileCompletion >= 70 ? 'info' : 'warning'}
            variant="gradient"
          />
          
          {profileCompletion < 100 && (
            <MDTypography variant="caption" color="text" mt={0.5} display="block">
              Complete your profile to unlock all features and improve visibility
            </MDTypography>
          )}
        </MDBox>

        {/* Quick Stats */}
        <MDBox mt={3} display="flex" justifyContent="space-around">
          <MDBox textAlign="center">
            <MDTypography variant="h6" fontWeight="medium" color="info">
              {formData?.assignedStudents?.length || 0}
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Assigned Students
            </MDTypography>
          </MDBox>
          
          <MDBox textAlign="center">
            <MDTypography variant="h6" fontWeight="medium" color="success">
              {formData?.trainingProgramsHandled?.length || 0}
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Training Programs
            </MDTypography>
          </MDBox>
          
          <MDBox textAlign="center">
            <MDTypography variant="h6" fontWeight="medium" color="warning">
              {formData?.experienceYears || 0}
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Years Experience
            </MDTypography>
          </MDBox>
          
          <MDBox textAlign="center">
            <MDTypography variant="h6" fontWeight="medium" color="error">
              {formData?.languagesSpoken?.length || 0}
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Languages
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default ProfileHeader;
