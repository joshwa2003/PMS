import React, { useRef, useState, useEffect } from 'react';
import { Card, Avatar, IconButton, CircularProgress, Box, Snackbar, Alert, Typography } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDProgress from 'components/MDProgress';
import MDBadge from 'components/MDBadge';
import { usePlacementStaffProfile } from '../../context/PlacementStaffProfileContext';
import { getGoogleDriveDirectImageUrl, isGoogleDriveUrl, extractGoogleDriveFileId } from '../../utils/googleDriveUtils';

function ProfileHeader() {
  const {
    profile,
    formData,
    uploadProfileImage,
    isSaving,
    error,
    clearError,
    getProfileCompletion
  } = usePlacementStaffProfile();

  const fileInputRef = useRef(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected for upload:', file.name);
      
      const result = await uploadProfileImage(file);
      
      if (result.success) {
        setUploadSuccess(true);
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
      // Error handling is done in the context, no need to handle here
    }
  };

  const handleCloseSuccess = () => {
    setUploadSuccess(false);
  };

  const handleCloseError = () => {
    clearError();
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
  
  // Get profile image with priority: formData > profile
  const profileImageUrl = formData?.profilePhotoUrl || profile?.profilePhotoUrl;
  
  // Create multiple fallback URLs for Google Drive images
  const getImageUrls = (url) => {
    if (!url || !isGoogleDriveUrl(url)) return [url];
    
    const fileId = extractGoogleDriveFileId(url);
    if (!fileId) return [url];
    
    return [
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w200-h200`,
      `https://drive.google.com/uc?export=view&id=${fileId}`,
      `https://lh3.googleusercontent.com/d/${fileId}`,
      getGoogleDriveDirectImageUrl(url) // Backend proxy as last resort
    ];
  };
  
  const imageUrls = getImageUrls(profileImageUrl);
  const currentImageUrl = imageUrls[currentImageIndex];
  
  // Reset image index when profile image changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setImageError(false);
  }, [profileImageUrl]);
  
  // Create a unique key to force re-render when image changes
  const imageKey = `${profileImageUrl}-${currentImageIndex}-${Date.now()}`;

  return (
    <>
      <Card sx={{ overflow: 'visible' }}>
        <MDBox p={3}>
          <MDBox display="flex" alignItems="center" justifyContent="space-between">
            {/* Profile Image and Basic Info */}
            <MDBox display="flex" alignItems="center">
              <MDBox position="relative" mr={3}>
                {profileImageUrl && isGoogleDriveUrl(profileImageUrl) ? (
                  <Box
                    key={imageKey}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      position: 'relative',
                      overflow: 'hidden',
                      border: '2px solid',
                      borderColor: 'primary.main',
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8
                      }
                    }}
                    onClick={() => window.open(profileImageUrl, '_blank')}
                  >
                    {currentImageUrl ? (
                      <img
                        key={imageKey}
                        src={currentImageUrl}
                        alt="Profile"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }}
                        onError={(e) => {
                          console.error('Image failed to load:', currentImageUrl);
                          // Try next URL in fallback list
                          if (currentImageIndex < imageUrls.length - 1) {
                            setCurrentImageIndex(prev => prev + 1);
                          } else {
                            // All URLs failed, show fallback
                            setImageError(true);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', currentImageUrl);
                          setImageError(false);
                        }}
                      />
                    ) : null}
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: (currentImageUrl && !imageError) ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: (currentImageUrl && !imageError) ? 'absolute' : 'static',
                        top: 0,
                        left: 0
                      }}
                    >
                      <Typography sx={{ fontSize: '2rem', color: 'white', fontWeight: 'bold' }}>
                        {displayName.charAt(0).toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Avatar
                    key={imageKey}
                    src={currentImageUrl}
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
                
                {/* Upload Button Overlay */}
                <IconButton
                  onClick={triggerFileInput}
                  disabled={isSaving}
                  title={isSaving ? 'Uploading...' : 'Upload profile image'}
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
                    },
                    '&:disabled': {
                      bgcolor: 'grey.400',
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
                  accept="image/jpeg,image/jpg,image/png,image/gif"
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

    {/* Success Snackbar */}
    <Snackbar
      open={uploadSuccess}
      autoHideDuration={4000}
      onClose={handleCloseSuccess}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
        Profile image uploaded successfully!
      </Alert>
    </Snackbar>

    {/* Error Snackbar */}
    <Snackbar
      open={!!error}
      autoHideDuration={6000}
      onClose={handleCloseError}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
        {error}
      </Alert>
    </Snackbar>
  </>
  );
}

export default ProfileHeader;
