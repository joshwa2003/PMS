import React, { useState } from 'react';
import { Grid, Card, CardContent, Alert, MenuItem } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import { useOtherStaffProfile } from '../../context/OtherStaffProfileContext';

function ProfessionalDetailsForm() {
  const {
    formData,
    updateFormData,
    saveProfile,
    isSaving,
    hasFieldError,
    getFieldError,
    getFieldValue,
    setActiveTab,
    getDepartmentOptions,
    getStaffCategoryOptions,
    getWorkShiftOptions,
    getStatusOptions,
    getAuthProviderOptions
  } = useOtherStaffProfile();

  const [localErrors, setLocalErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Handle input changes
  const handleInputChange = (field, value) => {
    updateFormData(field, value);
    // Clear local error when user starts typing
    if (localErrors[field]) {
      setLocalErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalErrors({});
    setSuccessMessage('');

    // Validate required fields
    const errors = {};
    if (!getFieldValue('department')) {
      errors.department = 'Department is required';
    }
    if (!getFieldValue('dateOfJoining')) {
      errors.dateOfJoining = 'Date of joining is required';
    }
    if (!getFieldValue('staffCategory')) {
      errors.staffCategory = 'Staff category is required';
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    try {
      const result = await saveProfile({
        department: getFieldValue('department'),
        dateOfJoining: getFieldValue('dateOfJoining'),
        status: getFieldValue('status'),
        authProvider: getFieldValue('authProvider'),
        staffCategory: getFieldValue('staffCategory'),
        workShift: getFieldValue('workShift'),
        yearsOfExperience: getFieldValue('yearsOfExperience'),
        officeLocation: getFieldValue('officeLocation'),
        adminNotes: getFieldValue('adminNotes')
      });

      if (result.success) {
        setSuccessMessage('Professional details updated successfully!');
        // Automatically move to the next tab (Contact Details) after successful save
        setTimeout(() => {
          setActiveTab(2); // Contact Details tab
        }, 1000); // Wait 1 second to show success message
      } else {
        setLocalErrors({ general: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      setLocalErrors({ general: 'Failed to update profile' });
    }
  };

  const departmentOptions = getDepartmentOptions();
  const staffCategoryOptions = getStaffCategoryOptions();
  const workShiftOptions = getWorkShiftOptions();
  const statusOptions = getStatusOptions();
  const authProviderOptions = getAuthProviderOptions();

  return (
    <Card>
      <CardContent>
        <MDBox p={3}>
          <MDTypography variant="h5" fontWeight="medium" mb={3}>
            Professional Details
          </MDTypography>

          {/* Success Message */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {/* Error Message */}
          {localErrors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localErrors.general}
            </Alert>
          )}

          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Department */}
              <Grid item xs={12} md={6}>
                <MDInput
                  select
                  label="Department"
                  value={getFieldValue('department') || ''}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  fullWidth
                  required
                  error={hasFieldError('department') || !!localErrors.department}
                  helperText={getFieldError('department') || localErrors.department}
                >
                  <MenuItem value="">Select Department</MenuItem>
                  {departmentOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </MDInput>
              </Grid>

              {/* Staff Category */}
              <Grid item xs={12} md={6}>
                <MDInput
                  select
                  label="Staff Category"
                  value={getFieldValue('staffCategory') || ''}
                  onChange={(e) => handleInputChange('staffCategory', e.target.value)}
                  fullWidth
                  required
                  error={hasFieldError('staffCategory') || !!localErrors.staffCategory}
                  helperText={getFieldError('staffCategory') || localErrors.staffCategory}
                >
                  <MenuItem value="">Select Staff Category</MenuItem>
                  {staffCategoryOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </MDInput>
              </Grid>

              {/* Date of Joining */}
              <Grid item xs={12} md={6}>
                <MDInput
                  type="date"
                  label="Date of Joining"
                  value={getFieldValue('dateOfJoining') ? getFieldValue('dateOfJoining').split('T')[0] : ''}
                  onChange={(e) => handleInputChange('dateOfJoining', e.target.value)}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  error={hasFieldError('dateOfJoining') || !!localErrors.dateOfJoining}
                  helperText={getFieldError('dateOfJoining') || localErrors.dateOfJoining}
                />
              </Grid>

              {/* Work Shift */}
              <Grid item xs={12} md={6}>
                <MDInput
                  select
                  label="Work Shift"
                  value={getFieldValue('workShift') || 'Morning'}
                  onChange={(e) => handleInputChange('workShift', e.target.value)}
                  fullWidth
                  error={hasFieldError('workShift')}
                  helperText={getFieldError('workShift')}
                >
                  {workShiftOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </MDInput>
              </Grid>

              {/* Years of Experience */}
              <Grid item xs={12} md={6}>
                <MDInput
                  type="number"
                  label="Years of Experience"
                  value={getFieldValue('yearsOfExperience') || 0}
                  onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value) || 0)}
                  fullWidth
                  inputProps={{ min: 0, max: 50 }}
                  error={hasFieldError('yearsOfExperience')}
                  helperText={getFieldError('yearsOfExperience') || 'Enter total years of work experience'}
                />
              </Grid>

              {/* Office Location */}
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="Office/Room Location"
                  value={getFieldValue('officeLocation') || ''}
                  onChange={(e) => handleInputChange('officeLocation', e.target.value)}
                  fullWidth
                  error={hasFieldError('officeLocation')}
                  helperText={getFieldError('officeLocation') || 'Enter your office/room location (e.g., Room 201, Admin Block)'}
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
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
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
                  {authProviderOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </MDInput>
              </Grid>

              {/* Admin Notes */}
              <Grid item xs={12}>
                <MDInput
                  multiline
                  rows={4}
                  label="Administrative Notes"
                  value={getFieldValue('adminNotes') || ''}
                  onChange={(e) => handleInputChange('adminNotes', e.target.value)}
                  fullWidth
                  error={hasFieldError('adminNotes')}
                  helperText={getFieldError('adminNotes') || 'Optional notes for administrative purposes (max 1000 characters)'}
                  inputProps={{ maxLength: 1000 }}
                />
              </Grid>
            </Grid>

            <MDBox mt={3} display="flex" justifyContent="space-between">
              <MDButton variant="outlined" color="secondary" onClick={() => setActiveTab(0)}>
                Previous
              </MDButton>
              <MDButton
                type="submit"
                variant="gradient"
                color="info"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save & Continue'}
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </CardContent>
    </Card>
  );
}

export default ProfessionalDetailsForm;
