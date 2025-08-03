import React, { useState } from 'react';
import { Grid, Card, CardContent, Alert, Chip, Box } from '@mui/material';
import { Upload, Description } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import { usePlacementDirectorProfile } from '../../context/PlacementDirectorProfileContext';
import placementDirectorProfileService from '../../services/placementDirectorProfileService';

function ProfessionalDetailsForm() {
  const {
    formData,
    updateFormData,
    saveProfile,
    uploadResume,
    isSaving,
    hasFieldError,
    getFieldError,
    getFieldValue
  } = usePlacementDirectorProfile();

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

  // Handle communication preferences change
  const handleCommunicationPreferencesChange = (value) => {
    const currentPreferences = getFieldValue('communicationPreferences') || [];
    let newPreferences;
    
    if (currentPreferences.includes(value)) {
      newPreferences = currentPreferences.filter(pref => pref !== value);
    } else {
      newPreferences = [...currentPreferences, value];
    }
    
    handleInputChange('communicationPreferences', newPreferences);
  };

  // Handle resume upload
  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setLocalErrors(prev => ({ 
        ...prev, 
        resume: 'Please select a valid document file (PDF, DOC, DOCX)' 
      }));
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setLocalErrors(prev => ({ 
        ...prev, 
        resume: 'Resume size should be less than 10MB' 
      }));
      return;
    }

    try {
      const result = await uploadResume(file);
      if (result.success) {
        setSuccessMessage('Resume uploaded successfully!');
        setLocalErrors(prev => ({ ...prev, resume: undefined }));
      } else {
        setLocalErrors(prev => ({ 
          ...prev, 
          resume: result.error || 'Failed to upload resume' 
        }));
      }
    } catch (error) {
      setLocalErrors(prev => ({ 
        ...prev, 
        resume: 'Failed to upload resume' 
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalErrors({});
    setSuccessMessage('');

    // Validate required fields
    const errors = {};
    if (!getFieldValue('designation')) {
      errors.designation = 'Designation is required';
    }
    if (!getFieldValue('dateOfJoining')) {
      errors.dateOfJoining = 'Date of joining is required';
    }

    // Validate years of experience if provided
    const yearsOfExperience = getFieldValue('yearsOfExperience');
    if (yearsOfExperience !== '' && yearsOfExperience !== null && yearsOfExperience !== undefined) {
      const experience = parseInt(yearsOfExperience);
      if (isNaN(experience) || experience < 0 || experience > 50) {
        errors.yearsOfExperience = 'Years of experience must be between 0 and 50';
      }
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    try {
      const result = await saveProfile({
        department: getFieldValue('department'),
        designation: getFieldValue('designation'),
        dateOfJoining: getFieldValue('dateOfJoining'),
        officeRoomNo: getFieldValue('officeRoomNo'),
        officialEmail: getFieldValue('officialEmail'),
        alternateMobile: getFieldValue('alternateMobile'),
        yearsOfExperience: getFieldValue('yearsOfExperience') ? parseInt(getFieldValue('yearsOfExperience')) : null,
        resumeUrl: getFieldValue('resumeUrl'),
        responsibilitiesText: getFieldValue('responsibilitiesText'),
        communicationPreferences: getFieldValue('communicationPreferences')
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

  const departmentOptions = placementDirectorProfileService.getDepartmentOptions();
  const designationOptions = placementDirectorProfileService.getDesignationOptions();
  const communicationOptions = placementDirectorProfileService.getCommunicationPreferenceOptions();
  const currentPreferences = getFieldValue('communicationPreferences') || [];

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
                  value={getFieldValue('department') || 'Placement Cell'}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  fullWidth
                  SelectProps={{
                    native: true,
                  }}
                >
                  {departmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </MDInput>
              </Grid>

              {/* Designation */}
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Designation"
                  select
                  value={getFieldValue('designation') || ''}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  fullWidth
                  required
                  error={!!localErrors.designation || hasFieldError('designation')}
                  helperText={localErrors.designation || getFieldError('designation')}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select Designation</option>
                  {designationOptions.map((option) => (
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

              {/* Years of Experience */}
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Years of Experience"
                  type="number"
                  value={getFieldValue('yearsOfExperience') || ''}
                  onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                  fullWidth
                  error={!!localErrors.yearsOfExperience || hasFieldError('yearsOfExperience')}
                  helperText={localErrors.yearsOfExperience || getFieldError('yearsOfExperience')}
                  inputProps={{ min: 0, max: 50 }}
                />
              </Grid>

              {/* Office Room Number */}
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Office Room Number"
                  value={getFieldValue('officeRoomNo') || ''}
                  onChange={(e) => handleInputChange('officeRoomNo', e.target.value)}
                  fullWidth
                  error={!!localErrors.officeRoomNo || hasFieldError('officeRoomNo')}
                  helperText={localErrors.officeRoomNo || getFieldError('officeRoomNo')}
                />
              </Grid>

              {/* Official Email */}
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Official Email"
                  type="email"
                  value={getFieldValue('officialEmail') || ''}
                  onChange={(e) => handleInputChange('officialEmail', e.target.value)}
                  fullWidth
                  error={!!localErrors.officialEmail || hasFieldError('officialEmail')}
                  helperText={localErrors.officialEmail || getFieldError('officialEmail')}
                />
              </Grid>

              {/* Alternate Mobile */}
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Alternate Mobile Number"
                  value={getFieldValue('alternateMobile') || ''}
                  onChange={(e) => handleInputChange('alternateMobile', e.target.value)}
                  fullWidth
                  error={!!localErrors.alternateMobile || hasFieldError('alternateMobile')}
                  helperText={localErrors.alternateMobile || getFieldError('alternateMobile')}
                />
              </Grid>

              {/* Communication Preferences */}
              <Grid item xs={12}>
                <MDTypography variant="body2" fontWeight="medium" mb={1}>
                  Communication Preferences
                </MDTypography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {communicationOptions.map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      onClick={() => handleCommunicationPreferencesChange(option.value)}
                      color={currentPreferences.includes(option.value) ? 'primary' : 'default'}
                      variant={currentPreferences.includes(option.value) ? 'filled' : 'outlined'}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Grid>

              {/* Responsibilities */}
              <Grid item xs={12}>
                <MDInput
                  label="Responsibilities & Job Description"
                  multiline
                  rows={4}
                  value={getFieldValue('responsibilitiesText') || ''}
                  onChange={(e) => handleInputChange('responsibilitiesText', e.target.value)}
                  fullWidth
                  error={!!localErrors.responsibilitiesText || hasFieldError('responsibilitiesText')}
                  helperText={localErrors.responsibilitiesText || getFieldError('responsibilitiesText')}
                  placeholder="Describe your key responsibilities and job duties..."
                />
              </Grid>

              {/* Resume Upload */}
              <Grid item xs={12}>
                <MDBox>
                  <MDTypography variant="body2" fontWeight="medium" mb={1}>
                    Resume/CV
                  </MDTypography>
                  <MDBox display="flex" alignItems="center" gap={2}>
                    <MDButton
                      component="label"
                      variant="outlined"
                      color="info"
                      startIcon={<Upload />}
                      disabled={isSaving}
                    >
                      Upload Resume
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                      />
                    </MDButton>
                    {getFieldValue('resumeUrl') && (
                      <MDButton
                        component="a"
                        href={getFieldValue('resumeUrl')}
                        target="_blank"
                        variant="text"
                        color="info"
                        startIcon={<Description />}
                      >
                        View Current Resume
                      </MDButton>
                    )}
                  </MDBox>
                  {localErrors.resume && (
                    <MDTypography variant="caption" color="error" mt={1}>
                      {localErrors.resume}
                    </MDTypography>
                  )}
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
