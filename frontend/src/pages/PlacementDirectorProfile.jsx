import React from 'react';
import { Grid } from '@mui/material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';

// Material Dashboard 2 React example components
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';
import PlacementDirectorProfileLayout from "../examples/LayoutContainers/PlacementDirectorProfileLayout";

// Placement Director Profile components
import ProfileTabs from "../components/PlacementDirectorProfile/ProfileTabs";

// Context
import { PlacementDirectorProfileProvider } from '../context/PlacementDirectorProfileContext';
import { useAuth } from '../context/AuthContext';

function PlacementDirectorProfile() {
  const { user } = useAuth();

  // Check if user has placement director access
  if (!user || user.role !== 'placement_director') {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="error"
                borderRadius="lg"
                coloredShadow="error"
              >
                <MDTypography variant="h6" color="white">
                  Access Denied
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2}>
                <MDTypography variant="body2">
                  You don't have permission to access the Placement Director Profile. 
                  This section is only available for placement directors.
                </MDTypography>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <PlacementDirectorProfileProvider>
      <PlacementDirectorProfileLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Placement Director Profile Management
                </MDTypography>
              </MDBox>
            </Grid>
          </Grid>
          
          <MDBox mt={4}>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <ProfileTabs />
              </Grid>
            </Grid>
          </MDBox>
        </MDBox>
        <Footer />
      </PlacementDirectorProfileLayout>
    </PlacementDirectorProfileProvider>
  );
}

export default PlacementDirectorProfile;
