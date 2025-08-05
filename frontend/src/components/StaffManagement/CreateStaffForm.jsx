import React, { useState, useEffect } from 'react';
import {
  Card,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Alert,
  Box,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Clear as ClearIcon,
  AutoFixHigh as AutoIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDInput from 'components/MDInput';
import { useStaffManagement } from 'context/StaffManagementContext';

const CreateStaffForm = ({ onSuccess, onCancel }) => {
  const {
    createStaff,
    loading,
    error,
    clearError,
    getAvailableRoles,
    getAvailableDepartments,
    getCommonDesignations,
    generateEmployeeIdSuggestion,
    validateStaffData
  } = useStaffManagement();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    department: '',
    designation: '',
    employeeId: '',
    phone: '',
    adminNotes: ''
  });

  const [validationErrors, setValidationErrors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const availableRoles = getAvailableRoles();
  const availableDepartments = getAvailableDepartments();

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Get common designations when role changes
  const commonDesignations = formData.role ? getCommonDesignations(formData.role) : [];

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

  const handleGenerateEmployeeId = () => {
    if (formData.department && formData.role) {
      const suggestion = generateEmployeeIdSuggestion(formData.department, formData.role);
      setFormData(prev => ({
        ...prev,
        employeeId: suggestion
      }));
    }
  };

  const handleDesignationSelect = (designation) => {
    setFormData(prev => ({
      ...prev,
      designation
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate form data
    const errors = validateStaffData(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const response = await createStaff(formData);
      setGeneratedPassword(response.defaultPassword);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        department: '',
        designation: '',
        employeeId: '',
        phone: '',
        adminNotes: ''
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
      email: '',
      role: '',
      department: '',
      designation: '',
      employeeId: '',
      phone: '',
      adminNotes: ''
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
            Create New Staff Member
          </MDTypography>
          <MDTypography variant="body2" color="text" mt={1}>
            Add a new staff member to the system. They will receive login credentials via email.
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
              Staff member created successfully!
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
              Please share this password with the staff member securely.
            </Typography>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Basic Information
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
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <MDInput
                fullWidth
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                error={validationErrors.some(error => error.includes('email'))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <MDInput
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                placeholder="10-digit phone number"
                error={validationErrors.some(error => error.includes('Phone'))}
              />
            </Grid>

            {/* Professional Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Professional Information
              </MDTypography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={handleInputChange('role')}
                  label="Role"
                >
                  {availableRoles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  onChange={handleInputChange('department')}
                  label="Department"
                >
                  {availableDepartments.map((dept) => (
                    <MenuItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <MDInput
                fullWidth
                label="Designation"
                value={formData.designation}
                onChange={handleInputChange('designation')}
                required
                error={validationErrors.some(error => error.includes('Designation'))}
              />
              
              {/* Common designations chips */}
              {commonDesignations.length > 0 && (
                <Box mt={1}>
                  <Typography variant="caption" color="text">
                    Common designations:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                    {commonDesignations.map((designation, index) => (
                      <Chip
                        key={index}
                        label={designation}
                        size="small"
                        variant="outlined"
                        onClick={() => handleDesignationSelect(designation)}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={8}>
              <MDInput
                fullWidth
                label="Employee ID"
                value={formData.employeeId}
                onChange={handleInputChange('employeeId')}
                placeholder="Optional - will be auto-generated if empty"
                error={validationErrors.some(error => error.includes('Employee ID'))}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Tooltip title="Generate Employee ID">
                <MDButton
                  variant="outlined"
                  color="info"
                  fullWidth
                  onClick={handleGenerateEmployeeId}
                  disabled={!formData.department || !formData.role}
                  startIcon={<AutoIcon />}
                >
                  Generate ID
                </MDButton>
              </Tooltip>
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Additional Information
              </MDTypography>
            </Grid>

            <Grid item xs={12}>
              <MDInput
                fullWidth
                multiline
                rows={3}
                label="Admin Notes"
                value={formData.adminNotes}
                onChange={handleInputChange('adminNotes')}
                placeholder="Optional notes about the staff member..."
              />
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
                  {loading ? 'Creating...' : 'Create Staff Member'}
                </MDButton>
              </Box>
            </Grid>
          </Grid>
        </form>
      </MDBox>
    </Card>
  );
};

export default CreateStaffForm;
