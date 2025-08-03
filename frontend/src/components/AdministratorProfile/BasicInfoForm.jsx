import React from 'react';
import { Grid, Card, MenuItem } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import { useAdministratorProfile } from '../../context/AdministratorProfileContext';

function BasicInfoForm() {
  const {
    formData,
    updateFormData,
    saveProfile,
    isSaving,
    getFieldValue,
    hasFieldError,
    getFieldError,
    goToNextTab
  } = useAdministratorProfile();

  const handleInputChange = (field, value) => {
    updateFormData(field, value);
  };

  const handleSave = async () => {
    const basicInfoData = {
      employeeId: formData.employeeId,
      name: formData.name,
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      gender: formData.gender
    };

    const result = await saveProfile(basicInfoData);
    if (result.success) {
      goToNextTab();
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
                onChange={(e) => handleInputChange('employeeId', e.target.value.toUpperCase())}
                fullWidth
                required
                error={hasFieldError('employeeId')}
                helperText={getFieldError('employeeId')}
              />
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
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
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
