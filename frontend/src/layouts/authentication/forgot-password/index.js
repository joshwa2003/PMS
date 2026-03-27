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
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";

// S.A. Engineering College React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/saecwall3.jpg";

// Services
import authService from "services/authService";

function ForgotPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "info" });

  const showAlert = (message, type = "info") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "info" }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      showAlert("Please enter your email address", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.forgotPassword(formData.email);
      
      if (response.success) {
        showAlert("OTP has been sent to your email address", "success");
        setStep(2);
      } else {
        showAlert(response.message || "Failed to send OTP", "error");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      if (error.response?.data?.message) {
        showAlert(error.response.data.message, "error");
      } else {
        showAlert("Failed to send OTP. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.otp) {
      showAlert("Please enter the OTP", "error");
      return;
    }

    if (formData.otp.length !== 6) {
      showAlert("OTP must be 6 digits", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyResetOTP(formData.email, formData.otp);
      
      if (response.success) {
        showAlert("OTP verified successfully", "success");
        setStep(3);
      } else {
        showAlert(response.message || "Invalid OTP", "error");
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      if (error.response?.data?.message) {
        showAlert(error.response.data.message, "error");
      } else {
        showAlert("Invalid OTP. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!formData.newPassword || !formData.confirmPassword) {
      showAlert("Please fill in all password fields", "error");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showAlert("Passwords do not match", "error");
      return;
    }

    if (formData.newPassword.length < 6) {
      showAlert("Password must be at least 6 characters long", "error");
      return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.newPassword)) {
      showAlert("Password must contain at least one uppercase letter, one lowercase letter, and one number", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword(
        formData.email,
        formData.otp,
        formData.newPassword,
        formData.confirmPassword
      );
      
      if (response.success) {
        showAlert("Password reset successfully! Redirecting to sign in...", "success");
        setTimeout(() => {
          navigate("/authentication/sign-in");
        }, 2000);
      } else {
        showAlert(response.message || "Failed to reset password", "error");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      if (error.response?.data?.message) {
        showAlert(error.response.data.message, "error");
      } else {
        showAlert("Failed to reset password. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
              Placement Management System
            </MDTypography>
            <MDTypography variant="body2" color="white" mt={1}>
              Enter your email address to receive an OTP
            </MDTypography>
          </>
        );

      case 2:
        return (
          <>
            <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
              Placement Management System
            </MDTypography>
            <MDTypography variant="body2" color="white" mt={1}>
              Enter the 6-digit OTP sent to {formData.email}
            </MDTypography>
          </>
        );

      case 3:
        return (
          <>
            <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
              Placement Management System
            </MDTypography>
            <MDTypography variant="body2" color="white" mt={1}>
              Enter your new password
            </MDTypography>
          </>
        );

      default:
        return null;
    }
  };

  const renderFormContent = () => {
    switch (step) {
      case 1:
        return (
          <MDBox component="form" role="form" onSubmit={handleSendOTP}>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={loading}
              />
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton 
                variant="gradient" 
                color="info" 
                fullWidth 
                type="submit"
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : "Send OTP"}
              </MDButton>
            </MDBox>
          </MDBox>
        );

      case 2:
        return (
          <MDBox component="form" role="form" onSubmit={handleVerifyOTP}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="OTP"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={loading}
                inputProps={{ maxLength: 6, pattern: "[0-9]{6}" }}
              />
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton 
                variant="gradient" 
                color="info" 
                fullWidth 
                type="submit"
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : "Verify OTP"}
              </MDButton>
            </MDBox>
            <MDBox mt={2} mb={1}>
              <MDButton 
                variant="text" 
                color="info" 
                fullWidth 
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back to Email
              </MDButton>
            </MDBox>
          </MDBox>
        );

      case 3:
        return (
          <MDBox component="form" role="form" onSubmit={handleResetPassword}>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="New Password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={loading}
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
                disabled={loading}
              />
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton 
                variant="gradient" 
                color="info" 
                fullWidth 
                type="submit"
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : "Reset Password"}
              </MDButton>
            </MDBox>
          </MDBox>
        );

      default:
        return null;
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
          {renderStepContent()}
        </MDBox>
        
        <MDBox pt={4} pb={3} px={3}>
          {alert.show && (
            <MDBox mb={2}>
              <MDAlert color={alert.type} dismissible>
                {alert.message}
              </MDAlert>
            </MDBox>
          )}

          {renderFormContent()}

          {/* Sign In Link */}
          <MDBox mt={2} mb={1} textAlign="center">
            <MDTypography variant="button" color="text">
              Remember your password?{" "}
              <MDTypography
                component={Link}
                to="/authentication/sign-in"
                variant="button"
                color="info"
                fontWeight="medium"
                textGradient
              >
                Sign In
              </MDTypography>
            </MDTypography>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default ForgotPassword;
