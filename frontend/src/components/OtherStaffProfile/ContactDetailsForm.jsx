import React, { useState } from 'react';
import { Grid, Card, CardContent, Alert } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import { useOtherStaffProfile } from '../../context/OtherStaffProfileContext';

function ContactDetailsForm() {
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

    // Validate pincode if provided
    const errors = {};
    const pincode = getFieldValue('contact.address.pincode');
    if (pincode && !/^[0-9]{6}$/.test(pincode)) {
      errors.pincode = 'Please enter a valid 6-digit pincode';
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    try {
      const result = await saveProfile({
        contact: {
          alternatePhone: getFieldValue('contact.alternatePhone') || '',
          emergencyContact: getFieldValue('contact.emergencyContact') || '',
          address: {
            street: getFieldValue('contact.address.street') || '',
            city: getFieldValue('contact.address.city') || '',
            state: getFieldValue('contact.address.state') || '',
            pincode: getFieldValue('contact.address.pincode') || '',
            country: getFieldValue('contact.address.country') || 'India'
          }
        }
      });

      if (result.success) {
        setSuccessMessage('Contact details updated successfully!');
        // Automatically move to the next tab (Profile Image) after successful save
        setTimeout(() => {
          setActiveTab(3); // Profile Image tab (now the last tab)
        }, 1000); // Wait 1 second to show success message
      } else {
        setLocalErrors({ general: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      setLocalErrors({ general: 'Failed to update profile' });
    }
  };

  // Indian states for dropdown
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  return (
    <Card>
      <CardContent>
        <MDBox p={3}>
          <MDTypography variant="h5" fontWeight="medium" mb={3}>
            Contact Details
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
            {/* Contact Information */}
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Contact Information
            </MDTypography>

            <Grid container spacing={3} mb={4}>
              {/* Alternate Phone Number */}
              <Grid item xs={12} md={6}>
                <MDInput
                  type="tel"
                  label="Alternate Phone Number"
                  value={getFieldValue('contact.alternatePhone') || ''}
                  onChange={(e) => handleInputChange('contact.alternatePhone', e.target.value.replace(/\D/g, ''))}
                  fullWidth
                  inputProps={{ maxLength: 10 }}
                  error={hasFieldError('contact.alternatePhone')}
                  helperText={getFieldError('contact.alternatePhone') || 'Optional 10-digit phone number'}
                />
              </Grid>

              {/* Emergency Contact Number */}
              <Grid item xs={12} md={6}>
                <MDInput
                  type="tel"
                  label="Emergency Contact Number"
                  value={getFieldValue('contact.emergencyContact') || ''}
                  onChange={(e) => handleInputChange('contact.emergencyContact', e.target.value.replace(/\D/g, ''))}
                  fullWidth
                  inputProps={{ maxLength: 10 }}
                  error={hasFieldError('contact.emergencyContact')}
                  helperText={getFieldError('contact.emergencyContact') || 'Optional 10-digit emergency contact'}
                />
              </Grid>
            </Grid>

            {/* Address Information */}
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Address Information
            </MDTypography>

            <Grid container spacing={3}>
              {/* Street Address */}
              <Grid item xs={12}>
                <MDInput
                  multiline
                  rows={3}
                  label="Street Address"
                  value={getFieldValue('contact.address.street') || ''}
                  onChange={(e) => handleInputChange('contact.address.street', e.target.value)}
                  fullWidth
                  error={hasFieldError('contact.address.street')}
                  helperText={getFieldError('contact.address.street') || 'Enter your complete street address'}
                  placeholder="No.1, Flat No.53, Raja Street, Jothi Nagar"
                />
              </Grid>

              {/* City */}
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="City"
                  value={getFieldValue('contact.address.city') || ''}
                  onChange={(e) => handleInputChange('contact.address.city', e.target.value)}
                  fullWidth
                  error={hasFieldError('contact.address.city')}
                  helperText={getFieldError('contact.address.city')}
                  placeholder="Chennai"
                />
              </Grid>

              {/* State */}
              <Grid item xs={12} md={6}>
                <MDInput
                  select
                  label="State"
                  value={getFieldValue('contact.address.state') || ''}
                  onChange={(e) => handleInputChange('contact.address.state', e.target.value)}
                  fullWidth
                  error={hasFieldError('contact.address.state')}
                  helperText={getFieldError('contact.address.state')}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select State</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </MDInput>
              </Grid>

              {/* Pincode */}
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="Pincode"
                  value={getFieldValue('contact.address.pincode') || ''}
                  onChange={(e) => handleInputChange('contact.address.pincode', e.target.value.replace(/\D/g, ''))}
                  fullWidth
                  inputProps={{ maxLength: 6 }}
                  error={hasFieldError('contact.address.pincode') || !!localErrors.pincode}
                  helperText={getFieldError('contact.address.pincode') || localErrors.pincode || 'Enter 6-digit pincode'}
                  placeholder="600062"
                />
              </Grid>

              {/* Country */}
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="Country"
                  value={getFieldValue('contact.address.country') || 'India'}
                  onChange={(e) => handleInputChange('contact.address.country', e.target.value)}
                  fullWidth
                  error={hasFieldError('contact.address.country')}
                  helperText={getFieldError('contact.address.country')}
                />
              </Grid>
            </Grid>

            <MDBox mt={4}>
              <MDTypography variant="body2" color="text" fontStyle="italic">
                Note: Your contact information will be used for official communications and emergency purposes only. 
                This information will be kept confidential and secure.
              </MDTypography>
            </MDBox>

            <MDBox mt={3} display="flex" justifyContent="space-between">
              <MDButton variant="outlined" color="secondary" onClick={() => setActiveTab(1)}>
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

export default ContactDetailsForm;
