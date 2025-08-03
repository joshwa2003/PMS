import React from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';

// @mui material components
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

// S.A. Engineering College React components
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";
import MDInput from "../MDInput";
import MDButton from "../MDButton";

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

  const genderOptions = ['Male', 'Female', 'Other'];
  const categoryOptions = ['GEN', 'SC', 'ST', 'OBC', 'Others'];
  const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'];

  // Common countries for work permit
  const countryOptions = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'Australia',
    'New Zealand', 'Singapore', 'UAE', 'Netherlands', 'Sweden', 'Norway',
    'Denmark', 'Switzerland', 'France', 'Ireland', 'Japan', 'South Korea'
  ];

  const handleWorkPermitCountriesChange = (event, newValue) => {
    updateFormData('personalInfo.workPermitCountries', newValue);
  };

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Personal Information
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={2}>
          Please provide your basic personal details
        </MDTypography>
      </MDBox>

      <Grid container spacing={3}>
        {/* Student ID */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="text"
            label="Student ID / Roll Number"
            value={getFieldValue('studentId') || ''}
            onChange={(e) => handleInputChange('studentId', e.target.value)}
            fullWidth
            required
            error={hasFieldError('studentId')}
            helperText={getFieldError('studentId')}
          />
        </Grid>

        {/* Registration Number */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="text"
            label="Registration Number"
            value={getFieldValue('registrationNumber') || ''}
            onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
            fullWidth
            required
            error={hasFieldError('registrationNumber')}
            helperText={getFieldError('registrationNumber')}
          />
        </Grid>

        {/* Full Name */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="text"
            label="Full Name"
            value={getFieldValue('personalInfo.fullName') || ''}
            onChange={(e) => handleInputChange('personalInfo.fullName', e.target.value)}
            fullWidth
            required
            error={hasFieldError('personalInfo.fullName')}
            helperText={getFieldError('personalInfo.fullName')}
          />
        </Grid>

        {/* Date of Birth */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="date"
            label="Date of Birth"
            value={getFieldValue('personalInfo.dateOfBirth') ? 
              new Date(getFieldValue('personalInfo.dateOfBirth')).toISOString().split('T')[0] : ''}
            onChange={(e) => handleInputChange('personalInfo.dateOfBirth', e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        {/* Gender */}
        <Grid item xs={12} md={6}>
          <MDInput
            select
            label="Gender"
            value={getFieldValue('personalInfo.gender') || ''}
            onChange={(e) => handleInputChange('personalInfo.gender', e.target.value)}
            fullWidth
            variant="outlined"
            SelectProps={{
              native: false,
              MenuProps: {
                PaperProps: {
                  style: {
                    maxHeight: 200,
                  },
                },
              },
            }}
          >
            {genderOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </MDInput>
        </Grid>

        {/* Nationality */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="text"
            label="Nationality"
            value={getFieldValue('personalInfo.nationality') || ''}
            onChange={(e) => handleInputChange('personalInfo.nationality', e.target.value)}
            fullWidth
            placeholder="e.g., Indian"
          />
        </Grid>

        {/* Category */}
        <Grid item xs={12} md={6}>
          <MDInput
            select
            label="Category"
            value={getFieldValue('personalInfo.category') || ''}
            onChange={(e) => handleInputChange('personalInfo.category', e.target.value)}
            fullWidth
            variant="outlined"
            SelectProps={{
              native: false,
              MenuProps: {
                PaperProps: {
                  style: {
                    maxHeight: 200,
                  },
                },
              },
            }}
          >
            {categoryOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </MDInput>
        </Grid>

        {/* Marital Status */}
        <Grid item xs={12} md={6}>
          <MDInput
            select
            label="Marital Status"
            value={getFieldValue('personalInfo.maritalStatus') || ''}
            onChange={(e) => handleInputChange('personalInfo.maritalStatus', e.target.value)}
            fullWidth
            variant="outlined"
            SelectProps={{
              native: false,
              MenuProps: {
                PaperProps: {
                  style: {
                    maxHeight: 200,
                  },
                },
              },
            }}
          >
            {maritalStatusOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </MDInput>
        </Grid>

        {/* Checkboxes Section */}
        <Grid item xs={12}>
          <MDTypography variant="h6" fontWeight="medium" mt={2} mb={2}>
            Additional Information
          </MDTypography>
        </Grid>

        {/* Differently Abled */}
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={getFieldValue('personalInfo.differentlyAbled') || false}
                onChange={(e) => handleInputChange('personalInfo.differentlyAbled', e.target.checked)}
                color="info"
              />
            }
            label="Differently Abled"
          />
        </Grid>

        {/* Career Break */}
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={getFieldValue('personalInfo.careerBreak') || false}
                onChange={(e) => handleInputChange('personalInfo.careerBreak', e.target.checked)}
                color="info"
              />
            }
            label="Had Career Break"
          />
        </Grid>

        {/* Work Permit USA */}
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={getFieldValue('personalInfo.workPermitUSA') || false}
                onChange={(e) => handleInputChange('personalInfo.workPermitUSA', e.target.checked)}
                color="info"
              />
            }
            label="Have Work Permit for USA"
          />
        </Grid>

        {/* Work Permit Countries */}
        <Grid item xs={12}>
          <MDTypography variant="body2" fontWeight="medium" mb={1}>
            Work Permit for Other Countries
          </MDTypography>
          <Autocomplete
            multiple
            options={countryOptions}
            value={getFieldValue('personalInfo.workPermitCountries') || []}
            onChange={handleWorkPermitCountriesChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                  size="small"
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Select countries where you have work permit"
                size="small"
              />
            )}
          />
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <MDBox mt={3} display="flex" justifyContent="space-between">
            <MDBox />
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

export default BasicInfoForm;
