import React from 'react';
import { Grid, Card } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import { useAdministratorProfile } from '../../context/AdministratorProfileContext';

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
  } = useAdministratorProfile();

  const handleInputChange = (field, value) => {
    updateFormData(field, value);
  };

  const handleSave = async () => {
    const notesData = {
      adminNotes: formData.adminNotes
    };

    const result = await saveProfile(notesData);
    if (result.success) {
      // This is the last tab, so we don't navigate further
      console.log('Administrator profile completed successfully!');
    }
  };

  const remainingChars = 1000 - (getFieldValue('adminNotes') || '').length;

  return (
    <Card sx={{ overflow: 'visible' }}>
      <MDBox p={3}>
        <MDTypography variant="h5" fontWeight="medium" mb={2}>
          Administrative Notes
        </MDTypography>
        
        <MDBox component="form" role="form">
          <Grid container spacing={3}>
            {/* Admin Notes */}
            <Grid item xs={12}>
              <MDInput
                type="text"
                label="Administrative Notes"
                value={getFieldValue('adminNotes') || ''}
                onChange={(e) => handleInputChange('adminNotes', e.target.value)}
                fullWidth
                multiline
                rows={6}
                inputProps={{ maxLength: 1000 }}
                error={hasFieldError('adminNotes')}
                helperText={
                  getFieldError('adminNotes') || 
                  `Optional notes for administrative purposes. ${remainingChars} characters remaining.`
                }
              />
            </Grid>

            {/* Profile Summary Section */}
            <Grid item xs={12}>
              <MDBox mt={2}>
                <MDTypography variant="h6" fontWeight="medium" mb={1}>
                  Profile Summary
                </MDTypography>
                <MDBox p={2} bgcolor="grey.100" borderRadius="lg">
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="body2" fontWeight="medium">
                        Employee ID: {getFieldValue('employeeId') || 'Not provided'}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="body2" fontWeight="medium">
                        Full Name: {`${getFieldValue('name.firstName') || ''} ${getFieldValue('name.lastName') || ''}`.trim() || 'Not provided'}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="body2" fontWeight="medium">
                        Email: {getFieldValue('email') || 'Not provided'}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="body2" fontWeight="medium">
                        Mobile: {getFieldValue('mobileNumber') || 'Not provided'}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="body2" fontWeight="medium">
                        Role: {getFieldValue('role') || 'Not provided'}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="body2" fontWeight="medium">
                        Department: {getFieldValue('department') || 'Not provided'}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="body2" fontWeight="medium">
                        Designation: {getFieldValue('designation') || 'Not provided'}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="body2" fontWeight="medium">
                        Access Level: {getFieldValue('accessLevel') || 'Not provided'}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="body2" fontWeight="medium">
                        Office Location: {getFieldValue('officeLocation') || 'Not provided'}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="body2" fontWeight="medium">
                        Date of Joining: {
                          getFieldValue('dateOfJoining') 
                            ? new Date(getFieldValue('dateOfJoining')).toLocaleDateString('en-IN')
                            : 'Not provided'
                        }
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12}>
                      <MDTypography variant="body2" fontWeight="medium">
                        Address: {
                          [
                            getFieldValue('contact.address.street'),
                            getFieldValue('contact.address.city'),
                            getFieldValue('contact.address.state'),
                            getFieldValue('contact.address.pincode'),
                            getFieldValue('contact.address.country')
                          ].filter(Boolean).join(', ') || 'Not provided'
                        }
                      </MDTypography>
                    </Grid>
                  </Grid>
                </MDBox>
              </MDBox>
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
              color="success"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Complete Profile'}
            </MDButton>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default AdministrativeNotesForm;
