import React, { useState } from 'react';
import { Grid, Card, CardContent, Alert } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import { useDepartmentHODProfile } from '../../context/DepartmentHODProfileContext';

function ContactDetailsForm() {
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

          {/* General Error */}
          {localErrors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localErrors.general}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Contact Information Section */}
              <Grid item xs={12}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Contact Information
                </MDTypography>
              </Grid>

              {/* Alternate Phone */}
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Alternate Phone Number"
                  value={getFieldValue('contact.alternatePhone') || ''}
                  onChange={(e) => handleInputChange('contact.alternatePhone', e.target.value.replace(/\D/g, ''))}
                  fullWidth
                  inputProps={{ maxLength: 10 }}
                  error={!!localErrors.alternatePhone || hasFieldError('contact.alternatePhone')}
                  helperText={localErrors.alternatePhone || getFieldError('contact.alternatePhone') || 'Optional 10-digit phone number'}
                />
              </Grid>

              {/* Emergency Contact */}
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Emergency Contact Number"
                  value={getFieldValue('contact.emergencyContact') || ''}
                  onChange={(e) => handleInputChange('contact.emergencyContact', e.target.value.replace(/\D/g, ''))}
                  fullWidth
                  inputProps={{ maxLength: 10 }}
                  error={!!localErrors.emergencyContact || hasFieldError('contact.emergencyContact')}
                  helperText={localErrors.emergencyContact || getFieldError('contact.emergencyContact') || 'Optional 10-digit emergency contact'}
                />
              </Grid>

              {/* Address Section */}
              <Grid item xs={12}>
                <MDTypography variant="h6" fontWeight="medium" mb={2} mt={3}>
                  Address Information
                </MDTypography>
              </Grid>

              {/* Street Address */}
              <Grid item xs={12}>
                <MDInput
                  label="Street Address"
                  multiline
                  rows={2}
                  value={getFieldValue('contact.address.street') || ''}
                  onChange={(e) => handleInputChange('contact.address.street', e.target.value)}
                  fullWidth
                  error={!!localErrors.street || hasFieldError('contact.address.street')}
                  helperText={localErrors.street || getFieldError('contact.address.street')}
                  placeholder="Enter your complete street address"
                />
              </Grid>

              {/* City */}
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="City"
                  value={getFieldValue('contact.address.city') || ''}
                  onChange={(e) => handleInputChange('contact.address.city', e.target.value)}
                  fullWidth
                  error={!!localErrors.city || hasFieldError('contact.address.city')}
                  helperText={localErrors.city || getFieldError('contact.address.city')}
                />
              </Grid>

              {/* State */}
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="State"
                  select
                  value={getFieldValue('contact.address.state') || ''}
                  onChange={(e) => handleInputChange('contact.address.state', e.target.value)}
                  fullWidth
                  error={!!localErrors.state || hasFieldError('contact.address.state')}
                  helperText={localErrors.state || getFieldError('contact.address.state')}
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
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Pincode"
                  value={getFieldValue('contact.address.pincode') || ''}
                  onChange={(e) => handleInputChange('contact.address.pincode', e.target.value)}
                  fullWidth
                  error={!!localErrors.pincode || hasFieldError('contact.address.pincode')}
                  helperText={localErrors.pincode || getFieldError('contact.address.pincode')}
                  inputProps={{ maxLength: 6, pattern: '[0-9]{6}' }}
                  placeholder="6-digit pincode"
                />
              </Grid>

              {/* Country */}
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Country"
                  value={getFieldValue('contact.address.country') || 'India'}
                  onChange={(e) => handleInputChange('contact.address.country', e.target.value)}
                  fullWidth
                  error={!!localErrors.country || hasFieldError('contact.address.country')}
                  helperText={localErrors.country || getFieldError('contact.address.country')}
                />
              </Grid>

              {/* Additional Information */}
              <Grid item xs={12}>
                <MDBox mt={2}>
                  <MDTypography variant="body2" color="text" fontStyle="italic">
                    Note: Your contact information will be used for official communications and emergency purposes only.
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
                    {isSaving ? 'Saving...' : 'Save Contact Details'}
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

export default ContactDetailsForm;
