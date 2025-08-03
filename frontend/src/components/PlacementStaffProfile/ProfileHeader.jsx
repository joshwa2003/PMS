import React, { useRef } from 'react';
import { Card, Avatar, IconButton, CircularProgress, Box } from '@mui/material';
import { PhotoCamera, Edit } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDProgress from 'components/MDProgress';
import MDBadge from 'components/MDBadge';
import { usePlacementStaffProfile } from '../../context/PlacementStaffProfileContext';

function ProfileHeader() {
  const {
    profile,
    formData,
    uploadProfileImage,
    isSaving,
    getProfileCompletion
  } = usePlacementStaffProfile();

  const fileInputRef = useRef(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      await uploadProfileImage(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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

  return (
    <Card sx={{ overflow: 'visible' }}>
      <MDBox p={3}>
        <MDBox display="flex" alignItems="center" justifyContent="space-between">
          {/* Profile Image and Basic Info */}
          <MDBox display="flex" alignItems="center">
            <MDBox position="relative" mr={3}>
              <Avatar
                src={formData?.profilePhotoUrl || profile?.profilePhotoUrl}
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
              
              {/* Upload Button Overlay */}
              <IconButton
                onClick={triggerFileInput}
                disabled={isSaving}
                sx={{
                  position: 'absolute',
                  bottom: -5,
                  right: -5,
                  bgcolor: 'primary.main',
                  color: 'white',
                  width: 30,
                  height: 30,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                {isSaving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <PhotoCamera sx={{ fontSize: 16 }} />
                )}
              </IconButton>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
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
