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

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";

// S.A. Engineering College React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Auth context
import { useAuth } from "context/AuthContext";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

function Basic() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState("");

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Demo credentials for different roles
  const demoCredentials = {
    admin: { email: "admin@saec.edu.in", password: "Admin@123" },
    placement_director: { email: "priya.director@saec.edu.in", password: "Director@123" },
    placement_staff: { email: "meera.cse@saec.edu.in", password: "Staff@123" },
    department_hod: { email: "ramesh.hod.cse@saec.edu.in", password: "HOD@123" },
    other_staff: { email: "anita.staff@saec.edu.in", password: "Staff@123" },
    student: { email: "arjun.2021cse001@saec.edu.in", password: "Student@123" },
    alumni: { email: "deepak.alumni@gmail.com", password: "Alumni@123" },
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!formData.email || !formData.password) {
        throw new Error("Please fill in all fields");
      }

      await login(formData.email, formData.password);
      
      // Navigation will be handled by useEffect when isAuthenticated changes
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    const credentials = demoCredentials[role];
    setFormData({
      email: credentials.email,
      password: credentials.password
    });
    setSelectedDemoRole(role);
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: "Administrator",
      placement_director: "Placement Director",
      placement_staff: "Placement Staff",
      department_hod: "Department HOD",
      other_staff: "Other Staff",
      student: "Student",
      alumni: "Alumni",
    };
    return roleNames[role] || role;
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Placement Management System
          </MDTypography>
          <MDTypography variant="body2" color="white" mt={1}>
            Sign in to access your account
          </MDTypography>
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 1, mb: 2 }}>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <FacebookIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GitHubIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GoogleIcon color="inherit" />
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>
        
        <MDBox pt={4} pb={3} px={3}>
          {error && (
            <MDBox mb={2}>
              <Alert severity="error">{error}</Alert>
            </MDBox>
          )}

          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={isLoading}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={isLoading}
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch 
                checked={rememberMe} 
                onChange={handleSetRememberMe}
                disabled={isLoading}
              />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Remember me
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton 
                variant="gradient" 
                color="info" 
                fullWidth
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Sign In"
                )}
              </MDButton>
            </MDBox>

            {/* Demo Credentials Section */}
            <MDBox mt={3} mb={2}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <MDTypography variant="button" color="text">
                  Demo Credentials
                </MDTypography>
                <MDButton
                  variant="text"
                  color="info"
                  size="small"
                  onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                >
                  {showDemoCredentials ? "Hide" : "Show"}
                </MDButton>
              </MDBox>

              {showDemoCredentials && (
                <MDBox>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Select Role</InputLabel>
                    <Select
                      value={selectedDemoRole}
                      label="Select Role"
                      onChange={(e) => handleDemoLogin(e.target.value)}
                      disabled={isLoading}
                    >
                      {Object.keys(demoCredentials).map((role) => (
                        <MenuItem key={role} value={role}>
                          {getRoleDisplayName(role)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <MDTypography variant="caption" color="text" display="block" textAlign="center">
                    Select a role to auto-fill login credentials
                  </MDTypography>
                </MDBox>
              )}
            </MDBox>

            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Don&apos;t have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign up
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
