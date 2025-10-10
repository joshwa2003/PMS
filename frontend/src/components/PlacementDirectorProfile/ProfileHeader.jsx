import React, { useState, useEffect } from 'react';
import { Card, Avatar, Box, Typography } from '@mui/material';
import { Person } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDProgress from 'components/MDProgress';
import { usePlacementDirectorProfile } from '../../context/PlacementDirectorProfileContext';
import { useAuth } from '../../context/AuthContext';
import { getGoogleDriveDirectImageUrl, isGoogleDriveUrl, extractGoogleDriveFileId } from '../../utils/googleDriveUtils';

function ProfileHeader() {
  const { user } = useAuth();
  const { formData, profile, getProfileCompletion } = usePlacementDirectorProfile();
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const profileCompletion = getProfileCompletion();
  
  // Get profile image with priority: formData > profile > user
  const profileImage = formData.profilePhotoUrl || profile?.profilePhotoUrl || user?.profilePicture;
  
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
  
  const imageUrls = getImageUrls(profileImage);
  const currentImageUrl = imageUrls[currentImageIndex];
  
  // Create a unique key to force re-render when image changes
  const imageKey = `${profileImage}-${currentImageIndex}-${Date.now()}`;
  
  // Reset image index when profile image changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setImageError(false);
  }, [profileImage]);

  // Debug logging
  console.log('ProfileHeader Debug:', {
    profileImage,
    currentImageUrl,
    imageUrls,
    currentImageIndex,
    isGoogleDrive: isGoogleDriveUrl(profileImage),
    formDataUrl: formData.profilePhotoUrl,
    profileUrl: profile?.profilePhotoUrl,
    userPicture: user?.profilePicture
  });

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
            {profileImage && isGoogleDriveUrl(profileImage) ? (
              <Box
                key={imageKey}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '3px solid',
                  borderColor: 'info.main',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
                onClick={() => window.open(profileImage, '_blank')}
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
                  <Person sx={{ fontSize: 40, color: 'white' }} />
                </Box>
              </Box>
            ) : (
              <Avatar
                key={imageKey}
                src={currentImageUrl}
                sx={{
                  width: 80,
                  height: 80,
                  border: '3px solid',
                  borderColor: 'info.main',
                  '&:hover': {
                    opacity: 0.8
                  }
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
