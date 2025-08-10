import React, { useState, useEffect } from 'react';
import {
  Card,
  Grid,
  Button,
  Typography,
  Alert,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDInput from 'components/MDInput';
import { useStudentManagement } from 'context/StudentManagementContext';

const CreateStudentForm = ({ onSuccess, onCancel }) => {
  const {
    createStudent,
    loading,
    error,
    clearError,
    validateStudentData
  } = useStudentManagement();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const [validationErrors, setValidationErrors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate form data
    const errors = validateStudentData(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const response = await createStudent(formData);
      setGeneratedPassword(response.defaultPassword);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: ''
      });
      
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      // Error is handled by context
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: ''
    });
    setValidationErrors([]);
    setGeneratedPassword('');
    clearError();
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDBox mb={2}>
          <MDTypography variant="h5" fontWeight="medium">
            Add New Student
          </MDTypography>
          <MDTypography variant="body2" color="text" mt={1}>
            Add a new student to the system. They will receive login credentials via email.
          </MDTypography>
        </MDBox>

        {/* Display validation errors */}
        {validationErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="medium" mb={1}>
              Please fix the following errors:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {validationErrors.map((error, index) => (
                <li key={index}>
                  <Typography variant="body2">{error}</Typography>
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Display API error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Display generated password */}
        {generatedPassword && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="medium" mb={1}>
              Student created successfully!
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">
                Generated Password: 
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight="bold" 
                sx={{ 
                  fontFamily: 'monospace',
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  padding: '2px 6px',
                  borderRadius: 1
                }}
              >
                {showPassword ? generatedPassword : '••••••••••'}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </Box>
            <Typography variant="body2" color="text" mt={1}>
              The student will receive an email with their login credentials.
            </Typography>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Student Information
              </MDTypography>
            </Grid>

            <Grid item xs={12} md={6}>
              <MDInput
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                required
                error={validationErrors.some(error => error.includes('First name'))}
                placeholder="Enter student's first name"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <MDInput
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                required
                error={validationErrors.some(error => error.includes('Last name'))}
                placeholder="Enter student's last name"
              />
            </Grid>

            <Grid item xs={12}>
              <MDInput
                fullWidth
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                error={validationErrors.some(error => error.includes('email'))}
                placeholder="Enter student's email address"
              />
            </Grid>

            {/* Information Note */}
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight="medium" mb={1}>
                  What happens next:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>
                    <Typography variant="body2">A student account will be created with a unique Student ID</Typography>
                  </li>
                  <li>
                    <Typography variant="body2">A temporary password will be generated automatically</Typography>
                  </li>
                  <li>
                    <Typography variant="body2">The student will receive a welcome email with login credentials</Typography>
                  </li>
                  <li>
                    <Typography variant="body2">The student can then login and complete their profile</Typography>
                  </li>
                </ul>
              </Alert>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                <MDButton
                  variant="outlined"
                  color="secondary"
                  onClick={onCancel || handleReset}
                  startIcon={<ClearIcon />}
                >
                  {onCancel ? 'Cancel' : 'Reset'}
                </MDButton>
                
                <MDButton
                  type="submit"
                  variant="gradient"
                  color="success"
                  disabled={loading}
                  startIcon={<SaveIcon />}
                >
                  {loading ? 'Creating...' : 'Create Student'}
                </MDButton>
              </Box>
            </Grid>
          </Grid>
        </form>
      </MDBox>
    </Card>
  );
};

export default CreateStudentForm;
