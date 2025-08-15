import { useState } from "react";
import { useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

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

function FirstLoginPasswordReset() {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { setInitialPassword } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
    setSuccess("");
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!formData.newPassword || !formData.confirmPassword) {
        throw new Error("Please fill in all fields");
      }

      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const passwordError = validatePassword(formData.newPassword);
      if (passwordError) {
        throw new Error(passwordError);
      }

      const result = await setInitialPassword(formData.newPassword, formData.confirmPassword);
      
      console.log("Password reset result:", result); // Debug log
      
      setSuccess("Password set successfully! Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (error) {
      setError(error.message || "Failed to set password. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            Set Your Password
          </MDTypography>
          <MDTypography variant="body2" color="white" mt={1}>
            Please set a new password for your account
          </MDTypography>
        </MDBox>
        
        <MDBox pt={4} pb={3} px={3}>
          {error && (
            <MDBox mb={2}>
              <Alert severity="error">{error}</Alert>
            </MDBox>
          )}

          {success && (
            <MDBox mb={2}>
              <Alert severity="success">{success}</Alert>
            </MDBox>
          )}

          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="New Password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={isLoading}
              />
            </MDBox>
            
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={isLoading}
              />
            </MDBox>

            <MDBox mb={2}>
              <MDTypography variant="caption" color="text">
                Password Requirements:
              </MDTypography>
              <MDBox component="ul" pl={2} mt={1}>
                <MDTypography component="li" variant="caption" color="text">
                  At least 6 characters long
                </MDTypography>
                <MDTypography component="li" variant="caption" color="text">
                  Contains uppercase and lowercase letters
                </MDTypography>
                <MDTypography component="li" variant="caption" color="text">
                  Contains at least one number
                </MDTypography>
              </MDBox>
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
                  "Set Password"
                )}
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default FirstLoginPasswordReset;
