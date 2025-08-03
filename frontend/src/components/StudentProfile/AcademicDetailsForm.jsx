import React from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';

// @mui material components
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";

// S.A. Engineering College React components
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";
import MDInput from "../MDInput";
import MDButton from "../MDButton";

function AcademicDetailsForm() {
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

  const departmentOptions = [
    'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AERO', 'CHEM', 'BIOTECH', 'OTHER'
  ];

  const programOptions = [
    'B.E', 'B.Tech', 'M.E', 'M.Tech', 'MBA', 'MCA', 'B.Sc', 'M.Sc', 'Ph.D'
  ];

  const courseTypeOptions = [
    'Full-time', 'Part-time', 'Distance Learning', 'Online'
  ];

  const gradingSystemOptions = [
    'CGPA (10 Point)', 'CGPA (4 Point)', 'GPA', 'Percentage', 'Grade'
  ];

  const yearOptions = [1, 2, 3, 4, 5];
  const semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Academic Details
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={2}>
          Please provide your academic information and current course details
        </MDTypography>
      </MDBox>

      <Grid container spacing={3}>
        {/* Department */}
        <Grid item xs={12} md={6}>
          <MDInput
            select
            label="Department"
            value={getFieldValue('academic.department') || ''}
            onChange={(e) => handleInputChange('academic.department', e.target.value)}
            fullWidth
            required
            variant="outlined"
            error={hasFieldError('academic.department')}
            helperText={getFieldError('academic.department')}
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
            {departmentOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </MDInput>
        </Grid>

        {/* Program */}
        <Grid item xs={12} md={6}>
          <MDInput
            select
            label="Program"
            value={getFieldValue('academic.program') || ''}
            onChange={(e) => handleInputChange('academic.program', e.target.value)}
            fullWidth
            required
            variant="outlined"
            error={hasFieldError('academic.program')}
            helperText={getFieldError('academic.program')}
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
            {programOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </MDInput>
        </Grid>

        {/* Specialization */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="text"
            label="Specialization"
            value={getFieldValue('academic.specialization') || ''}
            onChange={(e) => handleInputChange('academic.specialization', e.target.value)}
            fullWidth
            placeholder="e.g., Computer Science, Data Science, AI & ML"
          />
        </Grid>

        {/* Course Type */}
        <Grid item xs={12} md={6}>
          <MDInput
            select
            label="Course Type"
            value={getFieldValue('academic.courseType') || ''}
            onChange={(e) => handleInputChange('academic.courseType', e.target.value)}
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
            {courseTypeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </MDInput>
        </Grid>

        {/* University */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="text"
            label="University/Institution"
            value={getFieldValue('academic.university') || ''}
            onChange={(e) => handleInputChange('academic.university', e.target.value)}
            fullWidth
            placeholder="e.g., Anna University"
          />
        </Grid>

        {/* Course Duration From */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="date"
            label="Course Duration From"
            value={getFieldValue('academic.courseDurationFrom') ? 
              new Date(getFieldValue('academic.courseDurationFrom')).toISOString().split('T')[0] : ''}
            onChange={(e) => handleInputChange('academic.courseDurationFrom', e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        {/* Course Duration To */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="date"
            label="Course Duration To"
            value={getFieldValue('academic.courseDurationTo') ? 
              new Date(getFieldValue('academic.courseDurationTo')).toISOString().split('T')[0] : ''}
            onChange={(e) => handleInputChange('academic.courseDurationTo', e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        {/* Grading System */}
        <Grid item xs={12} md={6}>
          <MDInput
            select
            label="Grading System"
            value={getFieldValue('academic.gradingSystem') || ''}
            onChange={(e) => handleInputChange('academic.gradingSystem', e.target.value)}
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
            {gradingSystemOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </MDInput>
        </Grid>

        {/* CGPA */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="number"
            label="CGPA/GPA/Percentage"
            value={getFieldValue('academic.cgpa') || ''}
            onChange={(e) => handleInputChange('academic.cgpa', parseFloat(e.target.value) || '')}
            fullWidth
            required
            error={hasFieldError('academic.cgpa')}
            helperText={getFieldError('academic.cgpa') || "Enter your current CGPA/GPA/Percentage"}
            inputProps={{
              min: 0,
              max: 100,
              step: 0.01
            }}
          />
        </Grid>

        {/* Backlogs */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="number"
            label="Number of Backlogs"
            value={getFieldValue('academic.backlogs') || ''}
            onChange={(e) => handleInputChange('academic.backlogs', parseInt(e.target.value) || 0)}
            fullWidth
            inputProps={{
              min: 0,
              max: 50
            }}
          />
        </Grid>

        {/* Year of Study */}
        <Grid item xs={12} md={6}>
          <MDInput
            select
            label="Year of Study"
            value={getFieldValue('academic.yearOfStudy') || ''}
            onChange={(e) => handleInputChange('academic.yearOfStudy', parseInt(e.target.value))}
            fullWidth
            required
            variant="outlined"
            error={hasFieldError('academic.yearOfStudy')}
            helperText={getFieldError('academic.yearOfStudy')}
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
            {yearOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </MDInput>
        </Grid>

        {/* Current Semester */}
        <Grid item xs={12} md={6}>
          <MDInput
            select
            label="Current Semester"
            value={getFieldValue('academic.currentSemester') || ''}
            onChange={(e) => handleInputChange('academic.currentSemester', parseInt(e.target.value))}
            fullWidth
            required
            variant="outlined"
            error={hasFieldError('academic.currentSemester')}
            helperText={getFieldError('academic.currentSemester')}
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
            {semesterOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </MDInput>
        </Grid>

        {/* Section */}
        <Grid item xs={12} md={6}>
          <MDInput
            type="text"
            label="Section"
            value={getFieldValue('academic.section') || ''}
            onChange={(e) => handleInputChange('academic.section', e.target.value)}
            fullWidth
            placeholder="e.g., A, B, C"
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

export default AcademicDetailsForm;
