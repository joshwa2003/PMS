import React from 'react';
import { Grid } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDAlert from 'components/MDAlert';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';

// Other Staff Profile Components
import ProfileHeader from 'components/OtherStaffProfile/ProfileHeader';
import ProfileTabs from 'components/OtherStaffProfile/ProfileTabs';

// Context
import { OtherStaffProfileProvider, useOtherStaffProfile } from 'context/OtherStaffProfileContext';

// Main Profile Content Component
function OtherStaffProfileContent() {
  const { isLoading, error, clearError } = useOtherStaffProfile();

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <MDTypography variant="h6" color="text">
              Loading other staff profile...
            </MDTypography>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDBox display="flex" alignItems="center" mb={2}>
                <MDTypography variant="h3" fontWeight="medium" color="text">
                  Other Staff Profile
                </MDTypography>
              </MDBox>
              <MDTypography variant="body2" color="text" mb={3}>
                Manage your other staff profile information and settings
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>

        {/* Error Alert */}
        {error && (
          <MDBox mb={3}>
            <MDAlert color="error" dismissible onClose={clearError}>
              <MDTypography variant="body2" color="white">
                {error}
              </MDTypography>
            </MDAlert>
          </MDBox>
        )}

        {/* Profile Header */}
        <MDBox mb={3}>
          <ProfileHeader />
        </MDBox>

        {/* Profile Tabs */}
        <MDBox>
          <ProfileTabs />
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

// Main Component with Provider
function OtherStaffProfile() {
  return (
    <OtherStaffProfileProvider>
      <OtherStaffProfileContent />
    </OtherStaffProfileProvider>
  );
}

export default OtherStaffProfile;
