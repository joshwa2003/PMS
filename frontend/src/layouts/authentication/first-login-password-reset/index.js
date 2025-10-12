/**
=========================================================
* S.A. Engineering College React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 S.A. Engineering College (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState } from "react";
import { useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

// @mui icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import LockResetIcon from "@mui/icons-material/LockReset";

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
import bgImage from "assets/images/saecwall3.jpg";

function FirstLoginPasswordReset() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { user, updateFirstLoginPassword } = useAuth();
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
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 8 characters long";
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasNumbers) {
      return "Password must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validation
      if (!formData.currentPassword) {
        throw new Error("Please enter your current password");
      }

      if (!formData.newPassword) {
        throw new Error("Please enter a new password");
      }

      if (!formData.confirmPassword) {
        throw new Error("Please confirm your new password");
      }

      // Password strength validation
      const passwordError = validatePassword(formData.newPassword);
      if (passwordError) {
        throw new Error(passwordError);
      }

      // Password confirmation validation
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error("New password and confirmation password do not match");
      }

      // Check if new password is different from current
      if (formData.currentPassword === formData.newPassword) {
        throw new Error("New password must be different from current password");
      }

      // Check if new password is a default password
      const defaultPasswords = ['Admin@123', 'Director@123', 'Staff@123', 'HOD@123', 'Student@123'];
      if (defaultPasswords.includes(formData.newPassword)) {
        throw new Error("You cannot use a default password as your new password. Please choose a different password.");
      }

      const response = await updateFirstLoginPassword(
        formData.currentPassword,
        formData.newPassword
      );

      if (response.success) {
        setSuccess("Password updated successfully! Redirecting to dashboard...");
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 2000);
      } else {
        throw new Error(response.message || "Failed to update password");
      }
      
    } catch (error) {
      console.error("Password reset error:", error);
      
      let errorMessage = "Failed to update password. Please try again.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (password) => {
    if (!password) return "error";
    const score = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ].filter(Boolean).length;

    if (score < 3) return "error";
    if (score < 5) return "warning";
    return "success";
  };

  const getPasswordStrengthText = (password) => {
    if (!password) return "Enter password";
    const score = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ].filter(Boolean).length;

    if (score < 3) return "Weak";
    if (score < 5) return "Medium";
    return "Strong";
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="warning"
          borderRadius="lg"
          coloredShadow="warning"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDBox display="flex" justifyContent="center" alignItems="center" mb={1}>
            <LockResetIcon sx={{ fontSize: 40, color: "white", mr: 1 }} />
            <MDTypography variant="h4" fontWeight="medium" color="white">
              First Login Setup
            </MDTypography>
          </MDBox>
          <MDTypography variant="body2" color="white" mt={1}>
            Welcome {user?.firstName}! Please update your password to continue
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
                type={showCurrentPassword ? "text" : "password"}
                label="Current Password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                        disabled={isLoading}
                        size="small"
                      >
                        {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </MDBox>

            <MDBox mb={2}>
              <MDInput
                type={showNewPassword ? "text" : "password"}
                label="New Password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        disabled={isLoading}
                        size="small"
                      >
                        {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {formData.newPassword && (
                <MDBox mt={1}>
                  <MDTypography 
                    variant="caption" 
                    color={getPasswordStrengthColor(formData.newPassword)}
                    fontWeight="medium"
                  >
                    Password Strength: {getPasswordStrengthText(formData.newPassword)}
                  </MDTypography>
                </MDBox>
              )}
            </MDBox>

            <MDBox mb={2}>
              <MDInput
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm New Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        disabled={isLoading}
                        size="small"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {formData.confirmPassword && formData.newPassword && (
                <MDBox mt={1}>
                  <MDTypography 
                    variant="caption" 
                    color={formData.newPassword === formData.confirmPassword ? "success" : "error"}
                    fontWeight="medium"
                  >
                    {formData.newPassword === formData.confirmPassword ? "Passwords match" : "Passwords do not match"}
                  </MDTypography>
                </MDBox>
              )}
            </MDBox>

            {/* Password Requirements */}
            <MDBox mb={3}>
              <MDTypography variant="caption" color="text" fontWeight="medium" mb={1} display="block">
                Password Requirements:
              </MDTypography>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <MDTypography 
                    variant="caption" 
                    color={formData.newPassword.length >= 8 ? "success" : "text"}
                    display="block"
                  >
                    • At least 8 characters
                  </MDTypography>
                  <MDTypography 
                    variant="caption" 
                    color={/[A-Z]/.test(formData.newPassword) ? "success" : "text"}
                    display="block"
                  >
                    • One uppercase letter
                  </MDTypography>
                  <MDTypography 
                    variant="caption" 
                    color={/[a-z]/.test(formData.newPassword) ? "success" : "text"}
                    display="block"
                  >
                    • One lowercase letter
                  </MDTypography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MDTypography 
                    variant="caption" 
                    color={/\d/.test(formData.newPassword) ? "success" : "text"}
                    display="block"
                  >
                    • One number
                  </MDTypography>
                  <MDTypography 
                    variant="caption" 
                    color={/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? "success" : "text"}
                    display="block"
                  >
                    • One special character
                  </MDTypography>
                </Grid>
              </Grid>
            </MDBox>

            <MDBox mt={4} mb={1}>
              <MDButton 
                variant="gradient" 
                color="warning" 
                fullWidth
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Update Password"
                )}
              </MDButton>
            </MDBox>

            <MDBox mt={2} mb={1} textAlign="center">
              <MDTypography variant="caption" color="text">
                This is a one-time setup. You'll be redirected to the dashboard after updating your password.
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default FirstLoginPasswordReset;
