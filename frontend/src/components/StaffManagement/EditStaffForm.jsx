import React, { useState, useEffect } from 'react';
import {
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
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Save as SaveIcon,
  Clear as ClearIcon,
  AutoFixHigh as AutoIcon
} from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDInput from 'components/MDInput';
import { useStaffManagement } from 'context/StaffManagementContext';

const EditStaffForm = ({ staff, onSuccess, onCancel }) => {
  const {
    updateStaff,
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
    department: '',
    designation: '',
    employeeId: '',
    phone: '',
    isActive: true,
    isVerified: false,
    adminNotes: ''
  });

  const [validationErrors, setValidationErrors] = useState([]);

  const availableRoles = getAvailableRoles();
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);

  // Load available departments
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        const departments = await getAvailableDepartments();
        setAvailableDepartments(departments || []);
      } catch (error) {
        console.error('Error loading departments:', error);
        // Fallback to sync method if async fails
        const fallbackDepartments = [
          { value: 'CSE', label: 'Computer Science & Engineering' },
          { value: 'ECE', label: 'Electronics & Communication Engineering' },
          { value: 'EEE', label: 'Electrical & Electronics Engineering' },
          { value: 'MECH', label: 'Mechanical Engineering' },
          { value: 'CIVIL', label: 'Civil Engineering' },
          { value: 'IT', label: 'Information Technology' },
          { value: 'ADMIN', label: 'Administration' },
          { value: 'HR', label: 'Human Resources' },
          { value: 'OTHER', label: 'Other' }
        ];
        setAvailableDepartments(fallbackDepartments);
      } finally {
        setDepartmentsLoading(false);
      }
    };

    loadDepartments();
  }, [getAvailableDepartments]);

  // Initialize form data with staff information
  useEffect(() => {
    if (staff) {
      setFormData({
        firstName: staff.firstName || '',
        lastName: staff.lastName || '',
        department: staff.department || '',
        designation: staff.designation || '',
        employeeId: staff.employeeId || '',
        phone: staff.phone || '',
        isActive: staff.isActive !== undefined ? staff.isActive : true,
        isVerified: staff.isVerified !== undefined ? staff.isVerified : false,
        adminNotes: staff.adminNotes || ''
      });
    }
  }, [staff]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Get common designations when role changes
  const commonDesignations = staff?.role ? getCommonDesignations(staff.role) : [];

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
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
    if (formData.department && staff?.role) {
      const suggestion = generateEmployeeIdSuggestion(formData.department, staff.role);
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

    // Validate form data (excluding required fields for update)
    const errors = validateStaffData(formData, true);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const response = await updateStaff(staff.id, formData);
      
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      // Error is handled by context
    }
  };

  const handleReset = () => {
    if (staff) {
      setFormData({
        firstName: staff.firstName || '',
        lastName: staff.lastName || '',
        department: staff.department || '',
        designation: staff.designation || '',
        employeeId: staff.employeeId || '',
        phone: staff.phone || '',
        isActive: staff.isActive !== undefined ? staff.isActive : true,
        isVerified: staff.isVerified !== undefined ? staff.isVerified : false,
        adminNotes: staff.adminNotes || ''
      });
    }
    setValidationErrors([]);
    clearError();
  };

  if (!staff) {
    return (
      <Alert severity="error">
        No staff member selected for editing.
      </Alert>
    );
  }

  return (
    <MDBox p={3}>
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

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Staff Information Header */}
          <Grid item xs={12}>
            <MDBox mb={2}>
              <MDTypography variant="h6" fontWeight="medium" mb={1}>
                Edit Staff Member: {staff.fullName}
              </MDTypography>
              <Typography variant="body2" color="text.secondary">
                Email: {staff.email} | Role: {staff.role}
              </Typography>
            </MDBox>
          </Grid>

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
              error={validationErrors.some(error => error.includes('First name'))}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <MDInput
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              error={validationErrors.some(error => error.includes('Last name'))}
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
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.department}
                onChange={handleInputChange('department')}
                label="Department"
                disabled={departmentsLoading}
              >
                {availableDepartments.map((dept) => (
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
              label="Designation"
              value={formData.designation}
              onChange={handleInputChange('designation')}
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
              error={validationErrors.some(error => error.includes('Employee ID'))}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <MDButton
              variant="outlined"
              color="info"
              fullWidth
              onClick={handleGenerateEmployeeId}
              disabled={!formData.department || !staff?.role}
              startIcon={<AutoIcon />}
            >
              Generate ID
            </MDButton>
          </Grid>

          {/* Status Information */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Status Information
            </MDTypography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={handleInputChange('isActive')}
                  color="success"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    Active Status
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formData.isActive ? 'Staff member is active' : 'Staff member is inactive'}
                  </Typography>
                </Box>
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isVerified}
                  onChange={handleInputChange('isVerified')}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    Verification Status
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formData.isVerified ? 'Staff member is verified' : 'Staff member needs verification'}
                  </Typography>
                </Box>
              }
            />
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
                color="info"
                disabled={loading}
                startIcon={<SaveIcon />}
              >
                {loading ? 'Updating...' : 'Update Staff Member'}
              </MDButton>
            </Box>
          </Grid>
        </Grid>
      </form>
    </MDBox>
  );
};

export default EditStaffForm;
