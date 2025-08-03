import React from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// @mui icons
import PersonIcon from "@mui/icons-material/Person";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";

// S.A. Engineering College React components
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";
import MDInput from "../MDInput";
import MDButton from "../MDButton";

function ProfileSummaryForm() {
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
    getProfileCompletion
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

  const profileSummary = getFieldValue('profileSummary') || '';
  const wordCount = profileSummary.trim().split(/\s+/).filter(word => word.length > 0).length;
  const maxWords = 200;
  const minWords = 50;

  const getWordCountColor = () => {
    if (wordCount < minWords) return 'error';
    if (wordCount > maxWords) return 'warning';
    return 'success';
  };

  const generateSampleSummary = () => {
    const personalInfo = getFieldValue('personalInfo') || {};
    const academic = getFieldValue('academic') || {};
    const skills = getFieldValue('skills') || [];
    const careerProfile = getFieldValue('careerProfile') || {};

    const name = personalInfo.fullName || 'Student';
    const program = academic.program || 'Engineering';
    const department = academic.department || 'Computer Science';
    const topSkills = skills.slice(0, 3).join(', ') || 'Programming, Problem Solving, Team Work';
    const desiredRole = careerProfile.desiredJobType || 'Software Developer';

    const sampleSummary = `I am ${name}, a dedicated ${program} student specializing in ${department}. With strong skills in ${topSkills}, I am passionate about technology and innovation. I have demonstrated academic excellence and practical experience through various projects and internships. I am seeking opportunities as a ${desiredRole} where I can contribute to meaningful projects while continuing to learn and grow professionally. My goal is to leverage my technical skills and collaborative mindset to drive impactful solutions in a dynamic work environment.`;

    updateFormData('profileSummary', sampleSummary);
  };

  const profileCompletion = getProfileCompletion();

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDBox display="flex" alignItems="center" mb={2}>
          <PersonIcon sx={{ mr: 1, color: '#1976d2' }} />
          <MDTypography variant="h6" fontWeight="medium">
            Profile Summary
          </MDTypography>
        </MDBox>
        <MDTypography variant="body2" color="text" mb={2}>
          Write a compelling summary that highlights your key strengths, experiences, and career objectives
        </MDTypography>
      </MDBox>

      <Grid container spacing={3}>
        {/* Profile Completion Status */}
        <Grid item xs={12}>
          <Card sx={{ 
            p: 2, 
            mb: 2, 
            bgcolor: 'light.main',
            border: '1px solid',
            borderColor: 'info.main',
            backgroundColor: 'rgba(26, 115, 232, 0.08)'
          }}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center">
              <MDTypography variant="h6" color="info" fontWeight="medium">
                Profile Completion: {profileCompletion}%
              </MDTypography>
              <MDTypography variant="body2" color="text">
                {profileCompletion >= 80 ? 'Excellent!' : 
                 profileCompletion >= 60 ? 'Good progress!' : 
                 'Keep going!'}
              </MDTypography>
            </MDBox>
          </Card>
        </Grid>

        {/* Profile Summary Input */}
        <Grid item xs={12}>
          <MDBox mb={2}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <MDTypography variant="body2" fontWeight="medium">
                Professional Summary
              </MDTypography>
              <MDBox display="flex" alignItems="center">
                <MDTypography 
                  variant="body2" 
                  color={getWordCountColor()}
                  fontWeight="medium"
                  mr={2}
                >
                  {wordCount}/{maxWords} words
                </MDTypography>
                <MDButton
                  variant="text"
                  color="info"
                  size="small"
                  onClick={generateSampleSummary}
                >
                  Generate Sample
                </MDButton>
              </MDBox>
            </MDBox>
            
            <MDInput
              type="text"
              value={profileSummary}
              onChange={(e) => handleInputChange('profileSummary', e.target.value)}
              fullWidth
              multiline
              rows={8}
              placeholder="Write a professional summary that showcases your skills, experiences, and career goals..."
              error={hasFieldError('profileSummary') || wordCount > maxWords}
              helperText={
                hasFieldError('profileSummary') ? getFieldError('profileSummary') :
                wordCount < minWords ? `Write at least ${minWords} words for a comprehensive summary` :
                wordCount > maxWords ? `Please reduce to ${maxWords} words or less` :
                `${minWords}-${maxWords} words recommended`
              }
            />
          </MDBox>
        </Grid>

        {/* Writing Tips */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <MDBox display="flex" alignItems="center" mb={2}>
              <TipsAndUpdatesIcon sx={{ mr: 1, color: '#ff9800' }} />
              <MDTypography variant="h6" fontWeight="medium">
                Writing Tips for Your Profile Summary
              </MDTypography>
            </MDBox>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <MDTypography variant="body2" fontWeight="medium" mb={1} color="success">
                  ✅ Do Include:
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  • Your current academic status and major
                  <br />
                  • Key technical and soft skills
                  <br />
                  • Relevant projects or internship experience
                  <br />
                  • Career objectives and goals
                  <br />
                  • What makes you unique
                  <br />
                  • Your passion and motivation
                </MDTypography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <MDTypography variant="body2" fontWeight="medium" mb={1} color="error">
                  ❌ Avoid:
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  • Generic or cliché statements
                  <br />
                  • Overly personal information
                  <br />
                  • Negative language or weaknesses
                  <br />
                  • Spelling and grammar errors
                  <br />
                  • Excessive technical jargon
                  <br />
                  • Making it too long or too short
                </MDTypography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Sample Summary Examples */}
        <Grid item xs={12}>
          <MDBox mt={2}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Sample Summary Examples
            </MDTypography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <MDTypography variant="body2" fontWeight="medium" mb={1} color="info">
                    For Software Development:
                  </MDTypography>
                  <MDTypography variant="body2" color="text" sx={{ fontSize: '0.875rem' }}>
                    "I am a passionate Computer Science student with strong programming skills in Java, Python, and JavaScript. Through academic projects and internships, I have gained experience in full-stack development, database management, and agile methodologies. I am seeking a software developer role where I can contribute to innovative solutions while expanding my technical expertise in a collaborative environment."
                  </MDTypography>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <MDTypography variant="body2" fontWeight="medium" mb={1} color="warning">
                    For Data Science:
                  </MDTypography>
                  <MDTypography variant="body2" color="text" sx={{ fontSize: '0.875rem' }}>
                    "I am an analytical-minded Engineering student with expertise in Python, R, and machine learning algorithms. My academic projects in data analysis and predictive modeling have strengthened my problem-solving abilities. I am eager to apply my statistical knowledge and programming skills in a data scientist role to derive meaningful insights from complex datasets."
                  </MDTypography>
                </Card>
              </Grid>
            </Grid>
          </MDBox>
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
              disabled={isSaving || wordCount < minWords || wordCount > maxWords}
            >
              {isSaving ? "Saving..." : "Save & Continue"}
            </MDButton>
          </MDBox>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default ProfileSummaryForm;
