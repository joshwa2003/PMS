import React from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';

// @mui material components
import Grid from "@mui/material/Grid";

// S.A. Engineering College React components
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";
import MDInput from "../MDInput";
import MDButton from "../MDButton";

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
  } = useStudentProfile();

  const handleInputChange = (field, value) => {
    updateFormData(field, value);
  };

  const handleSave = async () => {
    const result = await saveProfile();
    if (result.success) {
      goToNextTab();
    }
  };

  const handleCopyAddress = () => {
    const permanentAddress = getFieldValue('contact.permanentAddress');
    if (permanentAddress) {
      updateFormData('contact.currentAddress', permanentAddress);
    }
  };

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Contact Details
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={2}>
          Please provide your contact information and addresses
        </MDTypography>
      </MDBox>

      <Grid container spacing={3}>
        {/* Phone Number */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="tel"
            label="Phone Number"
            value={getFieldValue('contact.phone') || ''}
            onChange={(e) => handleInputChange('contact.phone', e.target.value)}
            fullWidth
            required
            error={hasFieldError('contact.phone')}
            helperText={getFieldError('contact.phone') || "Enter 10-digit mobile number"}
            inputProps={{
              maxLength: 10,
              pattern: "[0-9]{10}"
            }}
          />
        </Grid>

        {/* Email */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="email"
            label="Email Address"
            value={getFieldValue('contact.email') || ''}
            onChange={(e) => handleInputChange('contact.email', e.target.value)}
            fullWidth
            required
            error={hasFieldError('contact.email')}
            helperText={getFieldError('contact.email')}
          />
        </Grid>

        {/* Guardian Name */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="text"
            label="Guardian/Parent Name"
            value={getFieldValue('contact.guardianName') || ''}
            onChange={(e) => handleInputChange('contact.guardianName', e.target.value)}
            fullWidth
          />
        </Grid>

        {/* Guardian Contact */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="tel"
            label="Guardian/Parent Contact"
            value={getFieldValue('contact.guardianContact') || ''}
            onChange={(e) => handleInputChange('contact.guardianContact', e.target.value)}
            fullWidth
            inputProps={{
              maxLength: 10,
              pattern: "[0-9]{10}"
            }}
          />
        </Grid>

        {/* Permanent Address */}
        <Grid item xs={12}>
          <MDInput
            type="text"
            label="Permanent Address"
            value={getFieldValue('contact.permanentAddress') || ''}
            onChange={(e) => handleInputChange('contact.permanentAddress', e.target.value)}
            fullWidth
            multiline
            rows={3}
            required
            error={hasFieldError('contact.permanentAddress')}
            helperText={getFieldError('contact.permanentAddress')}
          />
        </Grid>

        {/* Current Address */}
        <Grid item xs={12}>
          <MDBox display="flex" alignItems="center" mb={1}>
            <MDTypography variant="body2" fontWeight="medium" mr={2}>
              Current Address
            </MDTypography>
            <MDButton
              variant="text"
              color="info"
              size="small"
              onClick={handleCopyAddress}
            >
              Same as Permanent Address
            </MDButton>
          </MDBox>
          <MDInput
            type="text"
            value={getFieldValue('contact.currentAddress') || ''}
            onChange={(e) => handleInputChange('contact.currentAddress', e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Enter current address or use 'Same as Permanent Address' button"
          />
        </Grid>

        {/* Hometown */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="text"
            label="Hometown"
            value={getFieldValue('contact.hometown') || ''}
            onChange={(e) => handleInputChange('contact.hometown', e.target.value)}
            fullWidth
          />
        </Grid>

        {/* Pincode */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="text"
            label="Pincode"
            value={getFieldValue('contact.pincode') || ''}
            onChange={(e) => handleInputChange('contact.pincode', e.target.value)}
            fullWidth
            error={hasFieldError('contact.pincode')}
            helperText={getFieldError('contact.pincode') || "Enter 6-digit pincode"}
            inputProps={{
              maxLength: 6,
              pattern: "[0-9]{6}"
            }}
          />
        </Grid>

        {/* Navigation Buttons */}
        <Grid item xs={12}>
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
              {isSaving ? "Saving..." : "Save & Continue"}
            </MDButton>
          </MDBox>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default ContactDetailsForm;
