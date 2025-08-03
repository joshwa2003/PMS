import React from 'react';
import { Grid, Card, MenuItem } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import { useAdministratorProfile } from '../../context/AdministratorProfileContext';

function ProfessionalDetailsForm() {
  const {
    formData,
    updateFormData,
    saveProfile,
    isSaving,
    getFieldValue,
    hasFieldError,
    getFieldError,
    goToNextTab,
    goToPreviousTab
  } = useAdministratorProfile();

  // Department mapping between backend codes and frontend display names
  const departmentMapping = {
    'CSE': 'Computer Science & Engineering',
    'ECE': 'Electronics & Communication Engineering',
    'EEE': 'Electrical & Electronics Engineering',
    'MECH': 'Mechanical Engineering',
    'CIVIL': 'Civil Engineering',
    'IT': 'Information Technology',
    'ADMIN': 'Administration',
    'HR': 'Human Resources',
    'OTHER': 'Other'
  };

  // Reverse mapping for saving to backend
  const reverseDepartmentMapping = Object.fromEntries(
    Object.entries(departmentMapping).map(([key, value]) => [value, key])
  );

  const handleInputChange = (field, value) => {
    updateFormData(field, value);
  };

  const handleSave = async () => {
    const professionalData = {
      role: formData.role,
      department: formData.department,
      designation: formData.designation,
      dateOfJoining: formData.dateOfJoining,
      accessLevel: formData.accessLevel,
      officeLocation: formData.officeLocation
    };

    const result = await saveProfile(professionalData);
    if (result.success) {
      goToNextTab();
    }
  };

  // Get display value for department (convert backend code to display name)
  const getDepartmentDisplayValue = (value) => {
    if (!value) return '';
    return departmentMapping[value] || value;
  };

  // Get backend value for department (convert display name to backend code)
  const getDepartmentBackendValue = (displayValue) => {
    if (!displayValue) return '';
    return reverseDepartmentMapping[displayValue] || displayValue;
  };

  const departmentOptions = [
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

  const designationOptions = [
    'Principal',
    'Vice Principal',
    'Dean',
    'Head of Department',
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Placement Director',
    'Placement Officer',
    'Training & Placement Officer',
    'Administrative Officer',
    'Registrar',
    'Controller of Examinations',
    'Librarian',
    'System Administrator',
    'Other'
  ];

  return (
    <Card sx={{ overflow: 'visible' }}>
      <MDBox p={3}>
        <MDTypography variant="h5" fontWeight="medium" mb={2}>
          Professional Details
        </MDTypography>
        
        <MDBox component="form" role="form">
          <Grid container spacing={3}>
            {/* Role */}
            <Grid item xs={12} md={6}>
              <MDInput
                select
                label="Role"
                value={getFieldValue('role') || ''}
                onChange={(e) => handleInputChange('role', e.target.value)}
                fullWidth
                required
                error={hasFieldError('role')}
                helperText={getFieldError('role')}
              >
                <MenuItem value="">Select Role</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
                <MenuItem value="director">Director</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="hod">Head of Department</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </MDInput>
            </Grid>

            {/* Department */}
            <Grid item xs={12} md={6}>
              <MDInput
                select
                label="Department"
                value={getFieldValue('department') || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                fullWidth
                required={['director', 'staff', 'hod'].includes(getFieldValue('role'))}
                error={hasFieldError('department')}
                helperText={getFieldError('department')}
              >
                <MenuItem value="">Select Department</MenuItem>
                {departmentOptions.map((dept) => (
                  <MenuItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </MenuItem>
                ))}
              </MDInput>
            </Grid>

            {/* Designation */}
            <Grid item xs={12} md={6}>
              <MDInput
                select
                label="Designation/Title"
                value={getFieldValue('designation') || ''}
                onChange={(e) => handleInputChange('designation', e.target.value)}
                fullWidth
                required
                error={hasFieldError('designation')}
                helperText={getFieldError('designation')}
              >
                <MenuItem value="">Select Designation</MenuItem>
                {designationOptions.map((designation) => (
                  <MenuItem key={designation} value={designation}>
                    {designation}
                  </MenuItem>
                ))}
              </MDInput>
            </Grid>

            {/* Date of Joining */}
            <Grid item xs={12} md={6}>
              <MDInput
                type="date"
                label="Date of Joining"
                value={getFieldValue('dateOfJoining') ? new Date(getFieldValue('dateOfJoining')).toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('dateOfJoining', e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                error={hasFieldError('dateOfJoining')}
                helperText={getFieldError('dateOfJoining')}
              />
            </Grid>

            {/* Access Level */}
            <Grid item xs={12} md={6}>
              <MDInput
                select
                label="Access Level"
                value={getFieldValue('accessLevel') || ''}
                onChange={(e) => handleInputChange('accessLevel', e.target.value)}
                fullWidth
                required
                error={hasFieldError('accessLevel')}
                helperText={getFieldError('accessLevel')}
              >
                <MenuItem value="">Select Access Level</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="limited">Limited</MenuItem>
                <MenuItem value="read_only">Read Only</MenuItem>
              </MDInput>
            </Grid>

            {/* Office Location */}
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Office Location"
                value={getFieldValue('officeLocation') || ''}
                onChange={(e) => handleInputChange('officeLocation', e.target.value)}
                fullWidth
                required
                error={hasFieldError('officeLocation')}
                helperText={getFieldError('officeLocation') || 'e.g., Admin Block - Room 101'}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <MDInput
                select
                label="Status"
                value={getFieldValue('status') || 'active'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                fullWidth
                error={hasFieldError('status')}
                helperText={getFieldError('status')}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </MDInput>
            </Grid>

            {/* Auth Provider */}
            <Grid item xs={12} md={6}>
              <MDInput
                select
                label="Authentication Provider"
                value={getFieldValue('authProvider') || 'local'}
                onChange={(e) => handleInputChange('authProvider', e.target.value)}
                fullWidth
                error={hasFieldError('authProvider')}
                helperText={getFieldError('authProvider')}
              >
                <MenuItem value="local">Local</MenuItem>
                <MenuItem value="google">Google</MenuItem>
                <MenuItem value="microsoft">Microsoft</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </MDInput>
            </Grid>
          </Grid>

          <MDBox mt={3} display="flex" justifyContent="space-between">
            <MDButton
              variant="outlined"
              color="info"
              onClick={goToPreviousTab}
            >
              Previous
            </MDButton>
            <MDButton
              variant="gradient"
              color="info"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save & Continue'}
            </MDButton>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default ProfessionalDetailsForm;
