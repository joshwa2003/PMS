import React from 'react';
import { Grid, Card } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import { useAdministratorProfile } from '../../context/AdministratorProfileContext';

function ContactDetailsForm() {
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

  const handleInputChange = (field, value) => {
    updateFormData(field, value);
  };

  const handleSave = async () => {
    const contactData = {
      contact: formData.contact
    };

    const result = await saveProfile(contactData);
    if (result.success) {
      goToNextTab();
    }
  };

  return (
    <Card sx={{ overflow: 'visible' }}>
      <MDBox p={3}>
        <MDTypography variant="h5" fontWeight="medium" mb={2}>
          Contact Details
        </MDTypography>
        
        <MDBox component="form" role="form">
          <Grid container spacing={3}>
            {/* Alternate Phone */}
            <Grid item xs={12} md={6}>
              <MDInput
                type="tel"
                label="Alternate Phone Number"
                value={getFieldValue('contact.alternatePhone') || ''}
                onChange={(e) => handleInputChange('contact.alternatePhone', e.target.value.replace(/\D/g, ''))}
                fullWidth
                inputProps={{ maxLength: 10 }}
                error={hasFieldError('contact.alternatePhone')}
                helperText={getFieldError('contact.alternatePhone') || 'Optional - 10-digit number'}
              />
            </Grid>

            {/* Emergency Contact */}
            <Grid item xs={12} md={6}>
              <MDInput
                type="tel"
                label="Emergency Contact Number"
                value={getFieldValue('contact.emergencyContact') || ''}
                onChange={(e) => handleInputChange('contact.emergencyContact', e.target.value.replace(/\D/g, ''))}
                fullWidth
                inputProps={{ maxLength: 10 }}
                error={hasFieldError('contact.emergencyContact')}
                helperText={getFieldError('contact.emergencyContact') || 'Optional - 10-digit number'}
              />
            </Grid>

            {/* Street Address */}
            <Grid item xs={12}>
              <MDInput
                type="text"
                label="Street Address"
                value={getFieldValue('contact.address.street') || ''}
                onChange={(e) => handleInputChange('contact.address.street', e.target.value)}
                fullWidth
                multiline
                rows={2}
                error={hasFieldError('contact.address.street')}
                helperText={getFieldError('contact.address.street') || 'House/Flat number, Street name, Area'}
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
              />
            </Grid>

            {/* State */}
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="State"
                value={getFieldValue('contact.address.state') || ''}
                onChange={(e) => handleInputChange('contact.address.state', e.target.value)}
                fullWidth
                error={hasFieldError('contact.address.state')}
                helperText={getFieldError('contact.address.state')}
              />
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
                error={hasFieldError('contact.address.pincode')}
                helperText={getFieldError('contact.address.pincode') || '6-digit pincode'}
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

export default ContactDetailsForm;
