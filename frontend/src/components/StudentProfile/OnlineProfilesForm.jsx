import React from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";

// @mui icons
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import LanguageIcon from "@mui/icons-material/Language";

// S.A. Engineering College React components
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";
import MDInput from "../MDInput";
import MDButton from "../MDButton";

function OnlineProfilesForm() {
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
    updateArrayItem
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

  // Online profiles handlers
  const handleAddOnlineProfile = () => {
    const newProfile = {
      platform: '',
      url: '',
      description: ''
    };
    addArrayItem('onlineProfiles', newProfile);
  };

  const handleRemoveOnlineProfile = (index) => {
    removeArrayItem('onlineProfiles', index);
  };

  const handleOnlineProfileChange = (index, field, value) => {
    const profiles = getFieldValue('onlineProfiles') || [];
    const updatedProfile = { ...profiles[index], [field]: value };
    updateArrayItem('onlineProfiles', index, updatedProfile);
  };

  const onlineProfiles = getFieldValue('onlineProfiles') || [];

  const platformSuggestions = [
    'LinkedIn',
    'GitHub',
    'Stack Overflow',
    'Behance',
    'Dribbble',
    'Medium',
    'Dev.to',
    'CodePen',
    'Kaggle',
    'HackerRank',
    'LeetCode',
    'GeeksforGeeks',
    'Twitter',
    'Instagram',
    'YouTube',
    'Personal Blog',
    'Other'
  ];

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Online Profiles
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={2}>
          Add your professional and social media profiles to showcase your online presence
        </MDTypography>
      </MDBox>

      <Grid container spacing={3}>
        {/* Main Profile Links */}
        <Grid item xs={12}>
          <MDTypography variant="h6" fontWeight="medium" mb={2}>
            Primary Profiles
          </MDTypography>
        </Grid>

        {/* LinkedIn Profile */}
        <Grid item xs={12} md={6}>
          <MDBox display="flex" alignItems="center" mb={1}>
            <LinkedInIcon sx={{ mr: 1, color: '#0077B5' }} />
            <MDTypography variant="body2" fontWeight="medium">
              LinkedIn Profile
            </MDTypography>
          </MDBox>
          <MDInput
            type="url"
            value={getFieldValue('linkedinProfile') || ''}
            onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
            fullWidth
            placeholder="https://linkedin.com/in/your-profile"
          />
        </Grid>

        {/* GitHub Profile */}
        <Grid item xs={12} md={6}>
          <MDBox display="flex" alignItems="center" mb={1}>
            <GitHubIcon sx={{ mr: 1, color: '#333' }} />
            <MDTypography variant="body2" fontWeight="medium">
              GitHub Profile
            </MDTypography>
          </MDBox>
          <MDInput
            type="url"
            value={getFieldValue('githubProfile') || ''}
            onChange={(e) => handleInputChange('githubProfile', e.target.value)}
            fullWidth
            placeholder="https://github.com/your-username"
          />
        </Grid>

        {/* Portfolio Website */}
        <Grid item xs={12}>
          <MDBox display="flex" alignItems="center" mb={1}>
            <LanguageIcon sx={{ mr: 1, color: '#FF6B35' }} />
            <MDTypography variant="body2" fontWeight="medium">
              Portfolio Website
            </MDTypography>
          </MDBox>
          <MDInput
            type="url"
            value={getFieldValue('portfolioWebsite') || ''}
            onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
            fullWidth
            placeholder="https://your-portfolio.com"
          />
        </Grid>

        {/* Additional Online Profiles */}
        <Grid item xs={12}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2}>
            <MDTypography variant="h6" fontWeight="medium">
              Additional Online Profiles
            </MDTypography>
            <MDButton
              variant="outlined"
              color="info"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddOnlineProfile}
            >
              Add Profile
            </MDButton>
          </MDBox>
        </Grid>

        {onlineProfiles.map((profile, index) => (
          <Grid item xs={12} key={index}>
            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <MDTypography variant="h6" fontWeight="medium">
                  Profile {index + 1}
                </MDTypography>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleRemoveOnlineProfile(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </MDBox>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <MDInput
                    type="text"
                    label="Platform"
                    value={profile.platform || ''}
                    onChange={(e) => handleOnlineProfileChange(index, 'platform', e.target.value)}
                    fullWidth
                    required
                    placeholder="e.g., Stack Overflow, Behance"
                    list={`platform-suggestions-${index}`}
                  />
                  <datalist id={`platform-suggestions-${index}`}>
                    {platformSuggestions.map((suggestion) => (
                      <option key={suggestion} value={suggestion} />
                    ))}
                  </datalist>
                </Grid>

                <Grid item xs={12} md={8}>
                  <MDInput
                    type="url"
                    label="Profile URL"
                    value={profile.url || ''}
                    onChange={(e) => handleOnlineProfileChange(index, 'url', e.target.value)}
                    fullWidth
                    required
                    placeholder="https://..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <MDInput
                    type="text"
                    label="Description (Optional)"
                    value={profile.description || ''}
                    onChange={(e) => handleOnlineProfileChange(index, 'description', e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Brief description of your profile or achievements on this platform"
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        ))}

        {onlineProfiles.length === 0 && (
          <Grid item xs={12}>
            <MDBox
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="100px"
              border="2px dashed"
              borderColor="grey.300"
              borderRadius="lg"
              bgcolor="grey.50"
            >
              <MDBox textAlign="center">
                <MDTypography variant="body2" color="text" mb={1}>
                  No additional profiles added yet
                </MDTypography>
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddOnlineProfile}
                >
                  Add Your First Profile
                </MDButton>
              </MDBox>
            </MDBox>
          </Grid>
        )}

        {/* Tips Section */}
        <Grid item xs={12}>
          <MDBox
            p={2}
            bgcolor="light.main"
            borderRadius="lg"
            sx={{ 
              border: '1px solid',
              borderColor: 'info.main',
              backgroundColor: 'rgba(26, 115, 232, 0.08)'
            }}
            mt={2}
          >
            <MDTypography variant="body2" color="info" fontWeight="medium" mb={1}>
              💡 Tips for Online Profiles:
            </MDTypography>
            <MDTypography variant="body2" color="text">
              • Keep your LinkedIn profile updated with latest experiences
              <br />
              • Showcase your best projects on GitHub with proper documentation
              <br />
              • Create a professional portfolio website to stand out
              <br />
              • Include profiles relevant to your field (e.g., Behance for designers, Kaggle for data scientists)
              <br />
              • Ensure all profile links are working and publicly accessible
            </MDTypography>
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

export default OnlineProfilesForm;
