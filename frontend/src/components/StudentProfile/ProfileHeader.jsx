import React from 'react';
import { useAuth } from '../../context/AuthContext';

// @mui material components
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";

// @mui icons
import PhotoCamera from "@mui/icons-material/PhotoCamera";

// S.A. Engineering College React components
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";

function ProfileHeader() {
  const { user } = useAuth();

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

  // Handle profile picture upload (placeholder for now)
  const handleProfilePictureUpload = () => {
    // TODO: Implement profile picture upload functionality
    console.log('Profile picture upload clicked');
  };

  if (!user) {
    return null;
  }

  return (
    <MDBox display="flex" alignItems="center" mb={3}>
      <MDBox position="relative">
        <Avatar
          src={user.profilePicture}
          alt={user.fullName || user.firstName + ' ' + user.lastName}
          sx={{ width: 100, height: 100, mr: 3 }}
        >
          {!user.profilePicture && (user.firstName?.[0] || user.fullName?.[0] || user.email?.[0])}
        </Avatar>
        <IconButton
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 20,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': { backgroundColor: 'primary.dark' }
          }}
          size="small"
          onClick={handleProfilePictureUpload}
        >
          <PhotoCamera fontSize="small" />
        </IconButton>
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
  );
}

export default ProfileHeader;
