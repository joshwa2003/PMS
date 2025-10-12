import React from 'react';
import { Grid, Card, MenuItem } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import { useOtherStaffProfile } from '../../context/OtherStaffProfileContext';

function BasicInfoForm() {
  const {
    formData,
    updateFormData,
    saveProfile,
    isSaving,
    hasFieldError,
    getFieldError,
    getFieldValue,
    setActiveTab
  } = useOtherStaffProfile();

  const handleInputChange = (field, value) => {
    updateFormData(field, value);
  };

  const handleSave = async () => {
    const basicInfoData = {
      employeeId: formData.employeeId,
      name: formData.name,
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      gender: formData.gender,
      role: formData.role
    };

    try {
      const result = await saveProfile(basicInfoData);
      
      if (result && result.success) {
        // Automatically move to the next tab (Professional Details) after successful save
        setTimeout(() => {
          setActiveTab(1); // Professional Details tab
        }, 1000); // Wait 1 second to show success message
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <Card sx={{ overflow: 'visible' }}>
      <MDBox p={3}>
        <MDTypography variant="h5" fontWeight="medium" mb={2}>
          Basic Information
        </MDTypography>
        
        <MDBox component="form" role="form">
          <Grid container spacing={3}>
            {/* Employee ID */}
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Employee ID"
                value={getFieldValue('employeeId') || ''}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                fullWidth
                required
                error={hasFieldError('employeeId')}
                helperText={getFieldError('employeeId')}
              />
            </Grid>

            {/* Role */}
            <Grid item xs={12} md={6}>
              <MDInput
                select
                label="Role"
                value={getFieldValue('role') || 'other_staff'}
                onChange={(e) => handleInputChange('role', e.target.value)}
                fullWidth
                required
                error={hasFieldError('role')}
                helperText={getFieldError('role')}
              >
                <MenuItem value="other_staff">Other Staff</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
                <MenuItem value="placement_director">Placement Director</MenuItem>
                <MenuItem value="placement_staff">Placement Staff</MenuItem>
                <MenuItem value="department_hod">Department HOD</MenuItem>
              </MDInput>
            </Grid>

            {/* First Name */}
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="First Name"
                value={getFieldValue('name.firstName') || ''}
                onChange={(e) => handleInputChange('name.firstName', e.target.value)}
                fullWidth
                required
                error={hasFieldError('name.firstName')}
                helperText={getFieldError('name.firstName')}
              />
            </Grid>

            {/* Last Name */}
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Last Name"
                value={getFieldValue('name.lastName') || ''}
                onChange={(e) => handleInputChange('name.lastName', e.target.value)}
                fullWidth
                required
                error={hasFieldError('name.lastName')}
                helperText={getFieldError('name.lastName')}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <MDInput
                type="email"
                label="Email Address"
                value={getFieldValue('email') || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                fullWidth
                required
                error={hasFieldError('email')}
                helperText={getFieldError('email')}
              />
            </Grid>

            {/* Mobile Number */}
            <Grid item xs={12} md={6}>
              <MDInput
                type="tel"
                label="Mobile Number"
                value={getFieldValue('mobileNumber') || ''}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
                fullWidth
                required
                inputProps={{ maxLength: 10 }}
                error={hasFieldError('mobileNumber')}
                helperText={getFieldError('mobileNumber') || 'Enter 10-digit mobile number'}
              />
            </Grid>

            {/* Gender */}
            <Grid item xs={12} md={6}>
              <MDInput
                select
                label="Gender"
                value={getFieldValue('gender') || ''}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                fullWidth
                required
                error={hasFieldError('gender')}
                helperText={getFieldError('gender')}
              >
                <MenuItem value="">Select Gender</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
                <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
              </MDInput>
            </Grid>

          </Grid>

          <MDBox mt={3} display="flex" justifyContent="space-between">
            <MDBox />
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

export default BasicInfoForm;
