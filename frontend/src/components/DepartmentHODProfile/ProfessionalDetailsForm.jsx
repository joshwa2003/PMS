import React, { useState } from 'react';
import { Grid, Card, CardContent, Alert, MenuItem } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import { useDepartmentHODProfile } from '../../context/DepartmentHODProfileContext';

function ProfessionalDetailsForm() {
  const {
    formData,
    updateFormData,
    saveProfile,
    isSaving,
    hasFieldError,
    getFieldError,
    getFieldValue
  } = useDepartmentHODProfile();

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
        adminNotes: getFieldValue('adminNotes')
      });

      if (result.success) {
        setSuccessMessage('Professional details updated successfully!');
      } else {
        setLocalErrors({ general: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      setLocalErrors({ general: 'Failed to update profile' });
    }
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

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const authProviderOptions = [
    { value: 'local', label: 'Local' },
    { value: 'google', label: 'Google' },
    { value: 'microsoft', label: 'Microsoft' },
    { value: 'other', label: 'Other' }
  ];

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

          {/* General Error */}
          {localErrors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localErrors.general}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Department */}
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Department"
                  select
                  value={getFieldValue('department') || ''}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  fullWidth
                  required
                  error={!!localErrors.department || hasFieldError('department')}
                  helperText={localErrors.department || getFieldError('department')}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </MDInput>
              </Grid>

              {/* Date of Joining */}
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Date of Joining"
                  type="date"
                  value={getFieldValue('dateOfJoining') ? new Date(getFieldValue('dateOfJoining')).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleInputChange('dateOfJoining', e.target.value)}
                  fullWidth
                  required
                  error={!!localErrors.dateOfJoining || hasFieldError('dateOfJoining')}
                  helperText={localErrors.dateOfJoining || getFieldError('dateOfJoining')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Status"
                  select
                  value={getFieldValue('status') || 'active'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  fullWidth
                  error={!!localErrors.status || hasFieldError('status')}
                  helperText={localErrors.status || getFieldError('status')}
                  SelectProps={{
                    native: true,
                  }}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </MDInput>
              </Grid>

              {/* Auth Provider */}
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Authentication Provider"
                  select
                  value={getFieldValue('authProvider') || 'local'}
                  onChange={(e) => handleInputChange('authProvider', e.target.value)}
                  fullWidth
                  error={!!localErrors.authProvider || hasFieldError('authProvider')}
                  helperText={localErrors.authProvider || getFieldError('authProvider')}
                  SelectProps={{
                    native: true,
                  }}
                >
                  {authProviderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </MDInput>
              </Grid>

              {/* Administrative Notes */}
              <Grid item xs={12}>
                <MDInput
                  label="Administrative Notes"
                  multiline
                  rows={4}
                  value={getFieldValue('adminNotes') || ''}
                  onChange={(e) => handleInputChange('adminNotes', e.target.value)}
                  fullWidth
                  error={!!localErrors.adminNotes || hasFieldError('adminNotes')}
                  helperText={localErrors.adminNotes || getFieldError('adminNotes') || 'Optional notes for administrative purposes (max 1000 characters)'}
                  placeholder="Enter any administrative notes or special instructions..."
                />
              </Grid>

              {/* Additional Information */}
              <Grid item xs={12}>
                <MDBox mt={2}>
                  <MDTypography variant="body2" color="text" fontStyle="italic">
                    Note: Your professional information will be used for official communications and administrative purposes.
                    This information will be kept confidential and secure.
                  </MDTypography>
                </MDBox>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <MDBox display="flex" justifyContent="flex-end" mt={3}>
                  <MDButton
                    type="submit"
                    variant="gradient"
                    color="info"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Professional Details'}
                  </MDButton>
                </MDBox>
              </Grid>
            </Grid>
          </form>
        </MDBox>
      </CardContent>
    </Card>
  );
}

export default ProfessionalDetailsForm;
