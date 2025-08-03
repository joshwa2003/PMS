import React from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';

// @mui material components
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

// S.A. Engineering College React components
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";
import MDInput from "../MDInput";
import MDButton from "../MDButton";

function CareerProfileForm() {
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

  const industryOptions = [
    'Information Technology',
    'Software Development',
    'Banking & Financial Services',
    'Consulting',
    'Manufacturing',
    'Healthcare',
    'Education',
    'E-commerce',
    'Telecommunications',
    'Automotive',
    'Aerospace',
    'Energy & Utilities',
    'Government',
    'Non-Profit',
    'Media & Entertainment',
    'Real Estate',
    'Retail',
    'Transportation',
    'Other'
  ];

  const jobTypeOptions = [
    'Software Developer',
    'Data Scientist',
    'Business Analyst',
    'Product Manager',
    'Marketing Executive',
    'Sales Executive',
    'HR Executive',
    'Finance Analyst',
    'Operations Manager',
    'Quality Assurance',
    'Research & Development',
    'Consultant',
    'Other'
  ];

  const employmentTypeOptions = [
    'Full-time',
    'Part-time',
    'Contract',
    'Internship',
    'Freelance',
    'Remote'
  ];

  const shiftOptions = [
    'Day Shift',
    'Night Shift',
    'Rotational Shift',
    'Flexible Hours',
    'No Preference'
  ];

  const experienceStatusOptions = [
    'Fresher',
    'Experienced'
  ];

  // Indian cities for preferred locations
  const locationOptions = [
    'Bangalore', 'Chennai', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Kolkata',
    'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore',
    'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
    'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot',
    'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad',
    'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah',
    'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai',
    'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli-Dharwad',
    'Tiruchirappalli', 'Bareilly', 'Mysore', 'Tiruppur', 'Gurgaon', 'Aligarh',
    'Jalandhar', 'Bhubaneswar', 'Salem', 'Mira-Bhayandar', 'Warangal', 'Guntur',
    'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Bikaner', 'Amravati', 'Noida',
    'Jamshedpur', 'Bhilai Nagar', 'Cuttack', 'Firozabad', 'Kochi', 'Nellore',
    'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela', 'Nanded',
    'Kolhapur', 'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni',
    'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu', 'Sangli-Miraj & Kupwad',
    'Mangalore', 'Erode', 'Belgaum', 'Ambattur', 'Tirunelveli', 'Malegaon',
    'Gaya', 'Jalgaon', 'Udaipur', 'Maheshtala'
  ];

  const handlePreferredLocationsChange = (event, newValue) => {
    updateFormData('careerProfile.preferredLocations', newValue);
  };

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Career Profile
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={2}>
          Tell us about your career preferences and expectations
        </MDTypography>
      </MDBox>

      <Grid container spacing={3}>
        {/* Current Industry */}
        <Grid item xs={12} md={6}>
          <MDInput
            select
            label="Current/Preferred Industry"
            value={getFieldValue('careerProfile.currentIndustry') || ''}
            onChange={(e) => handleInputChange('careerProfile.currentIndustry', e.target.value)}
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
            {industryOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </MDInput>
        </Grid>

        {/* Department */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="text"
            label="Preferred Department/Function"
            value={getFieldValue('careerProfile.department') || ''}
            onChange={(e) => handleInputChange('careerProfile.department', e.target.value)}
            fullWidth
            placeholder="e.g., Software Development, Marketing, HR"
          />
        </Grid>

        {/* Desired Job Type */}
        <Grid item xs={12} md={6}>
          <MDInput
            select
            label="Desired Job Type"
            value={getFieldValue('careerProfile.desiredJobType') || ''}
            onChange={(e) => handleInputChange('careerProfile.desiredJobType', e.target.value)}
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
            {jobTypeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </MDInput>
        </Grid>

        {/* Desired Employment Type */}
        <Grid item xs={12} md={6}>
          <MDInput
            select
            label="Desired Employment Type"
            value={getFieldValue('careerProfile.desiredEmploymentType') || ''}
            onChange={(e) => handleInputChange('careerProfile.desiredEmploymentType', e.target.value)}
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
            {employmentTypeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </MDInput>
        </Grid>

        {/* Preferred Shift */}
        <Grid item xs={12} md={6}>
          <MDInput
            select
            label="Preferred Shift"
            value={getFieldValue('careerProfile.preferredShift') || ''}
            onChange={(e) => handleInputChange('careerProfile.preferredShift', e.target.value)}
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
            {shiftOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </MDInput>
        </Grid>

        {/* Experience Status */}
        <Grid item xs={12} md={6}>
          <MDInput
            select
            label="Experience Status"
            value={getFieldValue('careerProfile.experienceStatus') || 'Fresher'}
            onChange={(e) => handleInputChange('careerProfile.experienceStatus', e.target.value)}
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
            {experienceStatusOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </MDInput>
        </Grid>

        {/* Preferred Locations */}
        <Grid item xs={12}>
          <MDTypography variant="body2" fontWeight="medium" mb={1}>
            Preferred Work Locations
          </MDTypography>
          <Autocomplete
            multiple
            options={locationOptions}
            value={getFieldValue('careerProfile.preferredLocations') || []}
            onChange={handlePreferredLocationsChange}
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
                placeholder="Select preferred work locations"
                size="small"
              />
            )}
          />
        </Grid>

        {/* Expected Salary */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="text"
            label="Expected Salary (Annual)"
            value={getFieldValue('careerProfile.expectedSalary') || ''}
            onChange={(e) => handleInputChange('careerProfile.expectedSalary', e.target.value)}
            fullWidth
            placeholder="e.g., 3-5 LPA, 6-8 LPA"
          />
        </Grid>

        {/* Available to Join */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="number"
            label="Available to Join (in days)"
            value={getFieldValue('careerProfile.availableToJoinInDays') || ''}
            onChange={(e) => handleInputChange('careerProfile.availableToJoinInDays', parseInt(e.target.value) || '')}
            fullWidth
            inputProps={{
              min: 0,
              max: 365
            }}
            helperText="Number of days from offer acceptance"
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

export default CareerProfileForm;
