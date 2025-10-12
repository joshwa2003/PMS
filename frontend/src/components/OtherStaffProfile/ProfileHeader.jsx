import React from 'react';
import { Card, Avatar, Box, Typography, Chip, LinearProgress } from '@mui/material';
import { Person, Work, LocationOn, Schedule, Category } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import { useOtherStaffProfile } from '../../context/OtherStaffProfileContext';
import { getGoogleDriveThumbnail } from '../../utils/googleDriveUtils';

function ProfileHeader() {
  const { 
    profile, 
    formData, 
    getDepartmentDisplayName, 
    getStaffCategoryDisplayName,
    getWorkShiftDisplayName,
    calculateProfileCompletion 
  } = useOtherStaffProfile();

  // Get profile data with fallback to formData
  const profileData = profile || formData;
  const profileImageUrl = profileData?.profilePhotoUrl || '';
  const processedImageUrl = getGoogleDriveThumbnail(profileImageUrl);
  
  // Calculate profile completion
  const completionPercentage = calculateProfileCompletion(profileData);
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get completion color
  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  return (
    <Card sx={{ mb: 3, overflow: 'visible' }}>
      <MDBox p={3}>
        <MDBox display="flex" alignItems="center" mb={2}>
          {/* Profile Avatar */}
          <MDBox mr={3}>
            <Avatar
              src={processedImageUrl}
              sx={{
                width: 100,
                height: 100,
                fontSize: '2rem',
                fontWeight: 'bold',
                '&:hover': {
                  transform: 'scale(1.05)',
                  transition: 'transform 0.2s ease-in-out'
                }
              }}
              onError={(e) => {
                console.error('Header avatar failed to load:', e.target.src);
              }}
            >
              {!processedImageUrl && (
                <Person sx={{ fontSize: '3rem' }} />
              )}
            </Avatar>
          </MDBox>

          {/* Profile Info */}
          <MDBox flex={1}>
            <MDBox display="flex" alignItems="center" mb={1}>
              <MDTypography variant="h4" fontWeight="medium" mr={2}>
                {profileData?.name?.firstName} {profileData?.name?.lastName}
              </MDTypography>
              <Chip
                label={profileData?.status || 'Active'}
                color={getStatusColor(profileData?.status)}
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
            </MDBox>

            <MDTypography variant="h6" color="text" mb={1}>
              {profileData?.designation || 'Other Staff'}
            </MDTypography>

            <MDBox display="flex" alignItems="center" flexWrap="wrap" gap={2}>
              {profileData?.employeeId && (
                <MDBox display="flex" alignItems="center">
                  <Work fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <MDTypography variant="body2" color="text">
                    {profileData.employeeId}
                  </MDTypography>
                </MDBox>
              )}

              {profileData?.department && (
                <MDBox display="flex" alignItems="center">
                  <LocationOn fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <MDTypography variant="body2" color="text">
                    {getDepartmentDisplayName(profileData.department)}
                  </MDTypography>
                </MDBox>
              )}

              {profileData?.staffCategory && (
                <MDBox display="flex" alignItems="center">
                  <Category fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <MDTypography variant="body2" color="text">
                    {getStaffCategoryDisplayName(profileData.staffCategory)}
                  </MDTypography>
                </MDBox>
              )}

              {profileData?.workShift && (
                <MDBox display="flex" alignItems="center">
                  <Schedule fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <MDTypography variant="body2" color="text">
                    {getWorkShiftDisplayName(profileData.workShift)}
                  </MDTypography>
                </MDBox>
              )}
            </MDBox>
          </MDBox>
        </MDBox>

        {/* Profile Completion */}
        <MDBox>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <MDTypography variant="body2" fontWeight="medium">
              Profile Completion
            </MDTypography>
            <MDTypography variant="body2" fontWeight="medium" color={getCompletionColor(completionPercentage)}>
              {completionPercentage}%
            </MDTypography>
          </MDBox>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            color={getCompletionColor(completionPercentage)}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
              },
            }}
          />
          <MDTypography variant="caption" color="text" mt={0.5}>
            Complete your profile to unlock all features
          </MDTypography>
        </MDBox>

        {/* Additional Info */}
        {(profileData?.yearsOfExperience !== undefined || profileData?.officeLocation) && (
          <MDBox mt={2} pt={2} borderTop="1px solid" borderColor="grey.200">
            <MDBox display="flex" flexWrap="wrap" gap={3}>
              {profileData?.yearsOfExperience !== undefined && (
                <MDBox>
                  <MDTypography variant="caption" color="text" display="block">
                    Experience
                  </MDTypography>
                  <MDTypography variant="body2" fontWeight="medium">
                    {profileData.yearsOfExperience} {profileData.yearsOfExperience === 1 ? 'year' : 'years'}
                  </MDTypography>
                </MDBox>
              )}

              {profileData?.officeLocation && (
                <MDBox>
                  <MDTypography variant="caption" color="text" display="block">
                    Office Location
                  </MDTypography>
                  <MDTypography variant="body2" fontWeight="medium">
                    {profileData.officeLocation}
                  </MDTypography>
                </MDBox>
              )}

              {profileData?.workingHours?.startTime && profileData?.workingHours?.endTime && (
                <MDBox>
                  <MDTypography variant="caption" color="text" display="block">
                    Working Hours
                  </MDTypography>
                  <MDTypography variant="body2" fontWeight="medium">
                    {profileData.workingHours.startTime} - {profileData.workingHours.endTime}
                  </MDTypography>
                </MDBox>
              )}
            </MDBox>
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

export default ProfileHeader;
