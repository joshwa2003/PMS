/**
=========================================================
* S.A. Engineering College React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";

// S.A. Engineering College React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// S.A. Engineering College React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Profile components
import ProfileForm from "layouts/profile/ProfileForm";

// Auth context
import { useAuth } from "context/AuthContext";

function ProfilePage() {
  const { user } = useAuth();

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Administrator',
      placement_director: 'Placement Director',
      placement_staff: 'Placement Staff',
      department_hod: 'Department HOD',
      other_staff: 'Other Staff',
      student: 'Student',
      alumni: 'Alumni',
      company_hr: 'Company HR',
    };
    return roleNames[role] || role;
  };

  return (
    <DashboardLayout>
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
                Profile Management
              </MDTypography>
              <MDTypography variant="body2" color="white" opacity={0.8}>
                {user && `Manage your ${getRoleDisplayName(user.role)} profile information`}
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>

      {/* Profile Form */}
      <MDBox mb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ProfileForm />
          </Grid>
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default ProfilePage;
