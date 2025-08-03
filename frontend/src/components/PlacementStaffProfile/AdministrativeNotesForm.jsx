import React from 'react';
import { Grid, Card } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import { usePlacementStaffProfile } from '../../context/PlacementStaffProfileContext';

function AdministrativeNotesForm() {
  const {
    formData,
    updateFormData,
    saveProfile,
    isSaving,
    getFieldValue,
    hasFieldError,
    getFieldError,
    goToPreviousTab
  } = usePlacementStaffProfile();

  const handleInputChange = (field, value) => {
    updateFormData(field, value);
  };

  const handleSave = async () => {
    const adminData = {
      adminNotes: formData.adminNotes
    };

    const result = await saveProfile(adminData);
    if (result.success) {
      // This is the final tab, so we don't navigate to next
      console.log('Profile saved successfully!');
    }
  };

  return (
    <Card sx={{ overflow: 'visible' }}>
      <MDBox p={3}>
        <MDTypography variant="h5" fontWeight="medium" mb={2}>
          Administrative Notes
        </MDTypography>
        
        <MDBox component="form" role="form">
          <Grid container spacing={3}>
            {/* Administrative Notes */}
            <Grid item xs={12}>
              <MDInput
                multiline
                rows={6}
                label="Administrative Notes"
                value={getFieldValue('adminNotes') || ''}
                onChange={(e) => handleInputChange('adminNotes', e.target.value)}
                fullWidth
                error={hasFieldError('adminNotes')}
                helperText={getFieldError('adminNotes') || 'Add any administrative notes, special instructions, or additional information'}
                placeholder="Enter any administrative notes, special instructions, performance remarks, or additional information that may be relevant for administrative purposes..."
              />
            </Grid>

            {/* Information Note */}
            <Grid item xs={12}>
              <MDBox 
                p={2} 
                borderRadius="lg" 
                sx={{ 
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  border: '1px solid rgba(25, 118, 210, 0.2)'
                }}
              >
                <MDTypography variant="body2" color="info" fontWeight="medium">
                  Note: Administrative notes are for internal use only and may be used for:
                </MDTypography>
                <MDBox component="ul" mt={1} pl={2}>
                  <MDTypography component="li" variant="body2" color="text">
                    Performance evaluations and feedback
                  </MDTypography>
                  <MDTypography component="li" variant="body2" color="text">
                    Special assignments or responsibilities
                  </MDTypography>
                  <MDTypography component="li" variant="body2" color="text">
                    Training requirements or certifications
                  </MDTypography>
                  <MDTypography component="li" variant="body2" color="text">
                    Administrative reminders or instructions
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Grid>
          </Grid>

          <MDBox mt={3} display="flex" justifyContent="space-between">
            <MDButton
              variant="outlined"
              color="secondary"
              onClick={goToPreviousTab}
            >
              Previous
            </MDButton>
            <MDButton
              variant="gradient"
              color="success"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </MDButton>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default AdministrativeNotesForm;
