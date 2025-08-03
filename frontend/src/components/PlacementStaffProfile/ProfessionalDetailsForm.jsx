import React, { useState } from 'react';
import { Grid, Card, MenuItem, Chip, Box, IconButton } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import { usePlacementStaffProfile } from '../../context/PlacementStaffProfileContext';

function ProfessionalDetailsForm() {
  const {
    formData,
    updateFormData,
    saveProfile,
    isSaving,
    getFieldValue,
    hasFieldError,
    getFieldError,
    goToNextTab,
    goToPreviousTab,
    addArrayItem,
    removeArrayItem,
    departmentMapping
  } = usePlacementStaffProfile();

  const [newQualification, setNewQualification] = useState('');
  const [newTrainingProgram, setNewTrainingProgram] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('');

  const handleInputChange = (field, value) => {
    updateFormData(field, value);
  };

  const handleAddQualification = () => {
    if (newQualification.trim()) {
      addArrayItem('qualifications', newQualification.trim());
      setNewQualification('');
    }
  };

  const handleRemoveQualification = (qualification) => {
    removeArrayItem('qualifications', qualification);
  };

  const handleAddTrainingProgram = () => {
    if (newTrainingProgram.trim()) {
      addArrayItem('trainingProgramsHandled', newTrainingProgram.trim());
      setNewTrainingProgram('');
    }
  };

  const handleRemoveTrainingProgram = (program) => {
    removeArrayItem('trainingProgramsHandled', program);
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim()) {
      addArrayItem('languagesSpoken', newLanguage.trim());
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (language) => {
    removeArrayItem('languagesSpoken', language);
  };

  const handleAddTimeSlot = () => {
    if (newTimeSlot.trim()) {
      addArrayItem('availabilityTimeSlots', newTimeSlot.trim());
      setNewTimeSlot('');
    }
  };

  const handleRemoveTimeSlot = (timeSlot) => {
    removeArrayItem('availabilityTimeSlots', timeSlot);
  };

  const handleSave = async () => {
    const professionalData = {
      role: formData.role,
      department: formData.department,
      designation: formData.designation,
      dateOfJoining: formData.dateOfJoining,
      officeLocation: formData.officeLocation,
      officialEmail: formData.officialEmail,
      experienceYears: formData.experienceYears,
      qualifications: formData.qualifications,
      responsibilitiesText: formData.responsibilitiesText,
      trainingProgramsHandled: formData.trainingProgramsHandled,
      languagesSpoken: formData.languagesSpoken,
      availabilityTimeSlots: formData.availabilityTimeSlots
    };

    const result = await saveProfile(professionalData);
    if (result.success) {
      goToNextTab();
    }
  };

  return (
    <Card sx={{ overflow: 'visible' }}>
      <MDBox p={3}>
        <MDTypography variant="h5" fontWeight="medium" mb={2}>
          Professional Details
        </MDTypography>
        
        <MDBox component="form" role="form">
          <Grid container spacing={3}>
            {/* Role */}
            <Grid item xs={12} md={6}>
              <MDInput
                select
                label="Role"
                value={getFieldValue('role') || 'staff'}
                onChange={(e) => handleInputChange('role', e.target.value)}
                fullWidth
                required
                error={hasFieldError('role')}
                helperText={getFieldError('role')}
              >
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
                <MenuItem value="director">Director</MenuItem>
                <MenuItem value="hod">Head of Department</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </MDInput>
            </Grid>

            {/* Department */}
            <Grid item xs={12} md={6}>
              <MDInput
                select
                label="Department"
                value={getFieldValue('department') || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                fullWidth
                required
                error={hasFieldError('department')}
                helperText={getFieldError('department')}
              >
                <MenuItem value="">Select Department</MenuItem>
                {Object.entries(departmentMapping).map(([code, name]) => (
                  <MenuItem key={code} value={code}>{name}</MenuItem>
                ))}
              </MDInput>
            </Grid>

            {/* Designation */}
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Designation"
                value={getFieldValue('designation') || ''}
                onChange={(e) => handleInputChange('designation', e.target.value)}
                fullWidth
                required
                error={hasFieldError('designation')}
                helperText={getFieldError('designation')}
                placeholder="e.g., Staff Coordinator, Placement Assistant"
              />
            </Grid>

            {/* Date of Joining */}
            <Grid item xs={12} md={6}>
              <MDInput
                type="date"
                label="Date of Joining"
                value={getFieldValue('dateOfJoining') ? new Date(getFieldValue('dateOfJoining')).toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('dateOfJoining', e.target.value)}
                fullWidth
                required
                error={hasFieldError('dateOfJoining')}
                helperText={getFieldError('dateOfJoining')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Office Location */}
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Office Location"
                value={getFieldValue('officeLocation') || ''}
                onChange={(e) => handleInputChange('officeLocation', e.target.value)}
                fullWidth
                required
                error={hasFieldError('officeLocation')}
                helperText={getFieldError('officeLocation')}
                placeholder="e.g., Room 101, Admin Block"
              />
            </Grid>

            {/* Official Email */}
            <Grid item xs={12} md={6}>
              <MDInput
                type="email"
                label="Official Email"
                value={getFieldValue('officialEmail') || ''}
                onChange={(e) => handleInputChange('officialEmail', e.target.value)}
                fullWidth
                error={hasFieldError('officialEmail')}
                helperText={getFieldError('officialEmail')}
                placeholder="official@college.edu"
              />
            </Grid>

            {/* Experience Years */}
            <Grid item xs={12} md={6}>
              <MDInput
                type="number"
                label="Experience Years"
                value={getFieldValue('experienceYears') || ''}
                onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
                fullWidth
                error={hasFieldError('experienceYears')}
                helperText={getFieldError('experienceYears')}
                inputProps={{ min: 0, max: 50 }}
              />
            </Grid>

            {/* Qualifications */}
            <Grid item xs={12}>
              <MDTypography variant="h6" fontWeight="medium" mb={1}>
                Qualifications
              </MDTypography>
              <MDBox display="flex" alignItems="center" gap={1} mb={2}>
                <MDInput
                  type="text"
                  label="Add Qualification"
                  value={newQualification}
                  onChange={(e) => setNewQualification(e.target.value)}
                  placeholder="e.g., M.E, M.Tech, Ph.D"
                  sx={{ flexGrow: 1 }}
                />
                <IconButton 
                  onClick={handleAddQualification}
                  color="primary"
                  disabled={!newQualification.trim()}
                >
                  <AddIcon />
                </IconButton>
              </MDBox>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {(getFieldValue('qualifications') || []).map((qualification, index) => (
                  <Chip
                    key={index}
                    label={qualification}
                    onDelete={() => handleRemoveQualification(qualification)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            {/* Responsibilities */}
            <Grid item xs={12}>
              <MDInput
                multiline
                rows={4}
                label="Responsibilities"
                value={getFieldValue('responsibilitiesText') || ''}
                onChange={(e) => handleInputChange('responsibilitiesText', e.target.value)}
                fullWidth
                error={hasFieldError('responsibilitiesText')}
                helperText={getFieldError('responsibilitiesText')}
                placeholder="Describe your key responsibilities and duties..."
              />
            </Grid>

            {/* Training Programs Handled */}
            <Grid item xs={12}>
              <MDTypography variant="h6" fontWeight="medium" mb={1}>
                Training Programs Handled
              </MDTypography>
              <MDBox display="flex" alignItems="center" gap={1} mb={2}>
                <MDInput
                  type="text"
                  label="Add Training Program"
                  value={newTrainingProgram}
                  onChange={(e) => setNewTrainingProgram(e.target.value)}
                  placeholder="e.g., Interview Skills, Resume Writing"
                  sx={{ flexGrow: 1 }}
                />
                <IconButton 
                  onClick={handleAddTrainingProgram}
                  color="primary"
                  disabled={!newTrainingProgram.trim()}
                >
                  <AddIcon />
                </IconButton>
              </MDBox>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {(getFieldValue('trainingProgramsHandled') || []).map((program, index) => (
                  <Chip
                    key={index}
                    label={program}
                    onDelete={() => handleRemoveTrainingProgram(program)}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            {/* Languages Spoken */}
            <Grid item xs={12} md={6}>
              <MDTypography variant="h6" fontWeight="medium" mb={1}>
                Languages Spoken
              </MDTypography>
              <MDBox display="flex" alignItems="center" gap={1} mb={2}>
                <MDInput
                  type="text"
                  label="Add Language"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="e.g., English, Hindi, Tamil"
                  sx={{ flexGrow: 1 }}
                />
                <IconButton 
                  onClick={handleAddLanguage}
                  color="primary"
                  disabled={!newLanguage.trim()}
                >
                  <AddIcon />
                </IconButton>
              </MDBox>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {(getFieldValue('languagesSpoken') || []).map((language, index) => (
                  <Chip
                    key={index}
                    label={language}
                    onDelete={() => handleRemoveLanguage(language)}
                    color="info"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            {/* Availability Time Slots */}
            <Grid item xs={12} md={6}>
              <MDTypography variant="h6" fontWeight="medium" mb={1}>
                Availability Time Slots
              </MDTypography>
              <MDBox display="flex" alignItems="center" gap={1} mb={2}>
                <MDInput
                  type="text"
                  label="Add Time Slot"
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  placeholder="e.g., Mon-Fri 9AM-5PM"
                  sx={{ flexGrow: 1 }}
                />
                <IconButton 
                  onClick={handleAddTimeSlot}
                  color="primary"
                  disabled={!newTimeSlot.trim()}
                >
                  <AddIcon />
                </IconButton>
              </MDBox>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {(getFieldValue('availabilityTimeSlots') || []).map((timeSlot, index) => (
                  <Chip
                    key={index}
                    label={timeSlot}
                    onDelete={() => handleRemoveTimeSlot(timeSlot)}
                    color="success"
                    variant="outlined"
                  />
                ))}
              </Box>
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

export default ProfessionalDetailsForm;
