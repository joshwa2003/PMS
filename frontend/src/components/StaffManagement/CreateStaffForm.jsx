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
    getAvailableDepartments,
    validateStaffData
  } = useStaffManagement();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    role: 'placement_staff', // Default role
    designation: 'Staff Member', // Default designation
    employeeId: '',
    phone: '',
    adminNotes: ''
  });

  const [departments, setDepartments] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const depts = await getAvailableDepartments();
        if (Array.isArray(depts)) {
          setDepartments(depts);
        } else {
          setDepartments([]);
        }
      } catch (err) {
        console.error('Failed to fetch departments', err);
        setDepartments([]);
      }
    };
    fetchDepartments();
    clearError();
  }, [getAvailableDepartments, clearError]);

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
    const errors = validateStaffData(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      // Create a copy of formData and remove empty optional fields
      const payload = { ...formData };

      // Remove empty strings for optional fields to avoid backend validation errors
      if (!payload.employeeId) delete payload.employeeId;
      if (!payload.phone) delete payload.phone;
      if (!payload.adminNotes) delete payload.adminNotes;

      const response = await createStaff(payload);
      setGeneratedPassword(response.defaultPassword);

      // Reset form (keep defaults)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        role: 'placement_staff',
        designation: 'Staff Member',
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
      department: '',
      role: 'placement_staff',
      designation: 'Staff Member',
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
            Add a new staff member to the system.
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
            {/* Simplified Fields */}
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
              <FormControl fullWidth required error={validationErrors.some(error => error.includes('Department'))}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  onChange={handleInputChange('department')}
                  label="Department"
                  sx={{ height: 44.13 }}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
