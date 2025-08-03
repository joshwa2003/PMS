import React from 'react';
import { useAuth } from '../context/AuthContext';
import { StudentProfileProvider } from '../context/StudentProfileContext';

// @mui material components
import Grid from "@mui/material/Grid";

// S.A. Engineering College React components
import MDBox from "../components/MDBox";
import MDTypography from "../components/MDTypography";

// S.A. Engineering College React example components
import StudentProfileLayout from "../examples/LayoutContainers/StudentProfileLayout";
import DashboardNavbar from "../examples/Navbars/DashboardNavbar";
import Footer from "../examples/Footer";

// Student Profile components
import ProfileTabs from "../components/StudentProfile/ProfileTabs";

function StudentProfile() {
  const { user, isStudent } = useAuth();

  // Check if user is a student
  if (!isStudent()) {
    return (
      <StudentProfileLayout>
        <DashboardNavbar />
        <MDBox mb={2} />
        
        <MDBox mb={3}>
          <Grid container spacing={3}>
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
                <MDTypography variant="body2" color="white" opacity={0.8}>
                  This page is only accessible to students.
                </MDTypography>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        <Footer />
      </StudentProfileLayout>
    );
  }

  return (
    <StudentProfileProvider>
      <StudentProfileLayout>
        <DashboardNavbar />
        <MDBox mb={2} />
        
        {/* Page Header */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
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
                  Student Profile Management
                </MDTypography>
                <MDTypography variant="body2" color="white" opacity={0.8}>
                  Complete your profile to enhance your placement opportunities
                </MDTypography>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Profile Content */}
        <MDBox mb={3}>
          <ProfileTabs />
        </MDBox>

        <Footer />
      </StudentProfileLayout>
    </StudentProfileProvider>
  );
}

export default StudentProfile;
