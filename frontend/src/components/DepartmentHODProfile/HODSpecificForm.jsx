import React, { useState } from 'react';
import { Grid, Card, CardContent, Alert, Chip, Box } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import { useDepartmentHODProfile } from '../../context/DepartmentHODProfileContext';

function HODSpecificForm() {
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
  const [subjectInput, setSubjectInput] = useState('');
  const [meetingSlotInput, setMeetingSlotInput] = useState('');

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

  // Handle adding subjects taught
  const handleAddSubject = () => {
    if (subjectInput.trim() && !getFieldValue('subjectsTaught')?.includes(subjectInput.trim())) {
      const currentSubjects = getFieldValue('subjectsTaught') || [];
      const updatedSubjects = [...currentSubjects, subjectInput.trim()];
      handleInputChange('subjectsTaught', updatedSubjects);
      setSubjectInput('');
    }
  };

  // Handle removing subjects taught
  const handleRemoveSubject = (subjectToRemove) => {
    const currentSubjects = getFieldValue('subjectsTaught') || [];
    const updatedSubjects = currentSubjects.filter(subject => subject !== subjectToRemove);
    handleInputChange('subjectsTaught', updatedSubjects);
  };

  // Handle adding meeting slots
  const handleAddMeetingSlot = () => {
    if (meetingSlotInput.trim() && !getFieldValue('meetingSlots')?.includes(meetingSlotInput.trim())) {
      const currentSlots = getFieldValue('meetingSlots') || [];
      const updatedSlots = [...currentSlots, meetingSlotInput.trim()];
      handleInputChange('meetingSlots', updatedSlots);
      setMeetingSlotInput('');
    }
  };

  // Handle removing meeting slots
  const handleRemoveMeetingSlot = (slotToRemove) => {
    const currentSlots = getFieldValue('meetingSlots') || [];
    const updatedSlots = currentSlots.filter(slot => slot !== slotToRemove);
    handleInputChange('meetingSlots', updatedSlots);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalErrors({});
    setSuccessMessage('');

    // Validate required fields
    const errors = {};
    if (!getFieldValue('departmentHeadOf')) {
      errors.departmentHeadOf = 'Department Head Of is required';
    }
    if (!getFieldValue('officeRoomNo')) {
      errors.officeRoomNo = 'Office Room Number is required';
    }
    if (!getFieldValue('academicBackground')) {
      errors.academicBackground = 'Academic Background is required';
    }
    if (!getFieldValue('responsibilities')) {
      errors.responsibilities = 'Responsibilities are required';
    }

    // Validate years as HOD
    const yearsAsHOD = getFieldValue('yearsAsHOD');
    if (yearsAsHOD !== '' && yearsAsHOD !== null && yearsAsHOD !== undefined) {
      const years = parseInt(yearsAsHOD);
      if (isNaN(years) || years < 0 || years > 50) {
        errors.yearsAsHOD = 'Years as HOD must be between 0 and 50';
      }
    }

    // Validate number of faculty managed
    const numberOfFacultyManaged = getFieldValue('numberOfFacultyManaged');
    if (numberOfFacultyManaged !== '' && numberOfFacultyManaged !== null && numberOfFacultyManaged !== undefined) {
      const faculty = parseInt(numberOfFacultyManaged);
      if (isNaN(faculty) || faculty < 0 || faculty > 200) {
        errors.numberOfFacultyManaged = 'Number of faculty managed must be between 0 and 200';
      }
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    try {
      const result = await saveProfile({
        departmentHeadOf: getFieldValue('departmentHeadOf'),
        officeRoomNo: getFieldValue('officeRoomNo'),
        yearsAsHOD: getFieldValue('yearsAsHOD') ? parseInt(getFieldValue('yearsAsHOD')) : 0,
        academicBackground: getFieldValue('academicBackground'),
        numberOfFacultyManaged: getFieldValue('numberOfFacultyManaged') ? parseInt(getFieldValue('numberOfFacultyManaged')) : 0,
        subjectsTaught: getFieldValue('subjectsTaught') || [],
        responsibilities: getFieldValue('responsibilities'),
        meetingSlots: getFieldValue('meetingSlots') || [],
        calendarLink: getFieldValue('calendarLink')
      });

      if (result.success) {
        setSuccessMessage('HOD specific details updated successfully!');
      } else {
        setLocalErrors({ general: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      setLocalErrors({ general: 'Failed to update profile' });
    }
  };

  const departmentOptions = [
    { value: 'CSE', label: 'Computer Science & Engineering' },
    { value: 'ECE', label: 'Electronics & Communication Engineering' },
    { value: 'EEE', label: 'Electrical & Electronics Engineering' },
    { value: 'MECH', label: 'Mechanical Engineering' },
    { value: 'CIVIL', label: 'Civil Engineering' },
    { value: 'IT', label: 'Information Technology' }
  ];

  const currentSubjects = getFieldValue('subjectsTaught') || [];
  const currentSlots = getFieldValue('meetingSlots') || [];

  return (
    <Card>
      <CardContent>
        <MDBox p={3}>
          <MDTypography variant="h5" fontWeight="medium" mb={3}>
            HOD Specific Information
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
              {/* Department Head Of */}
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Department Head Of"
                  select
                  value={getFieldValue('departmentHeadOf') || ''}
                  onChange={(e) => handleInputChange('departmentHeadOf', e.target.value)}
                  fullWidth
                  required
                  error={!!localErrors.departmentHeadOf || hasFieldError('departmentHeadOf')}
                  helperText={localErrors.departmentHeadOf || getFieldError('departmentHeadOf')}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </MDInput>
              </Grid>

              {/* Office Room Number */}
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Office Room Number"
                  value={getFieldValue('officeRoomNo') || ''}
                  onChange={(e) => handleInputChange('officeRoomNo', e.target.value)}
                  fullWidth
                  required
                  error={!!localErrors.officeRoomNo || hasFieldError('officeRoomNo')}
                  helperText={localErrors.officeRoomNo || getFieldError('officeRoomNo')}
                />
              </Grid>

              {/* Years as HOD */}
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Years as HOD"
                  type="number"
                  value={getFieldValue('yearsAsHOD') || ''}
                  onChange={(e) => handleInputChange('yearsAsHOD', e.target.value)}
                  fullWidth
                  error={!!localErrors.yearsAsHOD || hasFieldError('yearsAsHOD')}
                  helperText={localErrors.yearsAsHOD || getFieldError('yearsAsHOD')}
                  inputProps={{ min: 0, max: 50 }}
                />
              </Grid>

              {/* Number of Faculty Managed */}
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Number of Faculty Managed"
                  type="number"
                  value={getFieldValue('numberOfFacultyManaged') || ''}
                  onChange={(e) => handleInputChange('numberOfFacultyManaged', e.target.value)}
                  fullWidth
                  error={!!localErrors.numberOfFacultyManaged || hasFieldError('numberOfFacultyManaged')}
                  helperText={localErrors.numberOfFacultyManaged || getFieldError('numberOfFacultyManaged')}
                  inputProps={{ min: 0, max: 200 }}
                />
              </Grid>

              {/* Academic Background */}
              <Grid item xs={12}>
                <MDInput
                  label="Academic Background"
                  multiline
                  rows={3}
                  value={getFieldValue('academicBackground') || ''}
                  onChange={(e) => handleInputChange('academicBackground', e.target.value)}
                  fullWidth
                  required
                  error={!!localErrors.academicBackground || hasFieldError('academicBackground')}
                  helperText={localErrors.academicBackground || getFieldError('academicBackground') || 'Describe your educational qualifications and academic achievements (max 500 characters)'}
                  placeholder="Enter your educational qualifications, degrees, certifications, and academic achievements..."
                />
              </Grid>

              {/* Subjects Taught */}
              <Grid item xs={12}>
                <MDTypography variant="body2" fontWeight="medium" mb={1}>
                  Subjects Taught
                </MDTypography>
                <MDBox display="flex" gap={1} mb={2}>
                  <MDInput
                    label="Add Subject"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                    fullWidth
                    placeholder="Enter subject name and press Enter or click Add"
                  />
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={handleAddSubject}
                    disabled={!subjectInput.trim()}
                  >
                    Add
                  </MDButton>
                </MDBox>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {currentSubjects.map((subject, index) => (
                    <Chip
                      key={index}
                      label={subject}
                      onDelete={() => handleRemoveSubject(subject)}
                      color="primary"
                      variant="outlined"
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Grid>

              {/* Responsibilities */}
              <Grid item xs={12}>
                <MDInput
                  label="Responsibilities & Key Duties"
                  multiline
                  rows={4}
                  value={getFieldValue('responsibilities') || ''}
                  onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                  fullWidth
                  required
                  error={!!localErrors.responsibilities || hasFieldError('responsibilities')}
                  helperText={localErrors.responsibilities || getFieldError('responsibilities') || 'Describe your key responsibilities as HOD (max 1000 characters)'}
                  placeholder="Describe your key responsibilities, duties, and leadership roles as Head of Department..."
                />
              </Grid>

              {/* Meeting Slots */}
              <Grid item xs={12}>
                <MDTypography variant="body2" fontWeight="medium" mb={1}>
                  Meeting Slots
                </MDTypography>
                <MDBox display="flex" gap={1} mb={2}>
                  <MDInput
                    label="Add Meeting Slot"
                    value={meetingSlotInput}
                    onChange={(e) => setMeetingSlotInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMeetingSlot())}
                    fullWidth
                    placeholder="e.g., Mon 10:00-11:00 AM, Tue 2:00-3:00 PM"
                  />
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={handleAddMeetingSlot}
                    disabled={!meetingSlotInput.trim()}
                  >
                    Add
                  </MDButton>
                </MDBox>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {currentSlots.map((slot, index) => (
                    <Chip
                      key={index}
                      label={slot}
                      onDelete={() => handleRemoveMeetingSlot(slot)}
                      color="secondary"
                      variant="outlined"
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Grid>

              {/* Calendar Link */}
              <Grid item xs={12}>
                <MDInput
                  label="Calendar Link (Optional)"
                  type="url"
                  value={getFieldValue('calendarLink') || ''}
                  onChange={(e) => handleInputChange('calendarLink', e.target.value)}
                  fullWidth
                  error={!!localErrors.calendarLink || hasFieldError('calendarLink')}
                  helperText={localErrors.calendarLink || getFieldError('calendarLink') || 'Link to your calendar for appointment booking'}
                  placeholder="https://calendar.google.com/..."
                />
              </Grid>

              {/* Additional Information */}
              <Grid item xs={12}>
                <MDBox mt={2}>
                  <MDTypography variant="body2" color="text" fontStyle="italic">
                    Note: This information will be used to showcase your role as Head of Department and facilitate 
                    academic coordination. All information will be kept secure and used for official purposes only.
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
                    {isSaving ? 'Saving...' : 'Save HOD Details'}
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

export default HODSpecificForm;
