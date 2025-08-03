import React from 'react';
import { Grid } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDAlert from 'components/MDAlert';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';

// Placement Staff Profile Components
import ProfileHeader from 'components/PlacementStaffProfile/ProfileHeader';
import ProfileTabs from 'components/PlacementStaffProfile/ProfileTabs';

// Context
import { PlacementStaffProfileProvider, usePlacementStaffProfile } from 'context/PlacementStaffProfileContext';

// Main Profile Content Component
function PlacementStaffProfileContent() {
  const { isLoading, error, clearError } = usePlacementStaffProfile();

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <MDTypography variant="h6" color="text">
              Loading placement staff profile...
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
              <MDBox display="flex" justifyContent="space-between" alignItems="center">
                <MDBox>
                  <MDTypography variant="h3" fontWeight="medium">
                    Placement Staff Profile
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    Manage your placement staff profile information and settings
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Error Alert */}
        {error && (
          <MDBox mb={3}>
            <MDAlert color="error" dismissible onClose={clearError}>
              <MDTypography variant="body2">
                {error}
              </MDTypography>
            </MDAlert>
          </MDBox>
        )}

        {/* Profile Header */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ProfileHeader />
            </Grid>
          </Grid>
        </MDBox>

        {/* Profile Tabs */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ProfileTabs />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

// Main Component with Provider
function PlacementStaffProfile() {
  return (
    <PlacementStaffProfileProvider>
      <PlacementStaffProfileContent />
    </PlacementStaffProfileProvider>
  );
}

export default PlacementStaffProfile;
