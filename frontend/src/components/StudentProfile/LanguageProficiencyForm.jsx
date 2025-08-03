import React from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";

// @mui icons
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// S.A. Engineering College React components
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";
import MDInput from "../MDInput";
import MDButton from "../MDButton";

function LanguageProficiencyForm() {
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

  const proficiencyLevels = [
    'Basic',
    'Intermediate',
    'Fluent'
  ];

  const commonLanguages = [
    'English',
    'Hindi',
    'Tamil',
    'Telugu',
    'Kannada',
    'Malayalam',
    'Marathi',
    'Bengali',
    'Gujarati',
    'Punjabi',
    'Urdu',
    'Odia',
    'Assamese',
    'Sanskrit',
    'French',
    'German',
    'Spanish',
    'Japanese',
    'Chinese (Mandarin)',
    'Korean',
    'Arabic',
    'Russian',
    'Italian',
    'Portuguese',
    'Dutch',
    'Other'
  ];

  // Language handlers
  const handleAddLanguage = () => {
    const newLanguage = {
      language: '',
      proficiency: 'Basic'
    };
    addArrayItem('languagesKnown', newLanguage);
  };

  const handleRemoveLanguage = (index) => {
    removeArrayItem('languagesKnown', index);
  };

  const handleLanguageChange = (index, field, value) => {
    const languages = getFieldValue('languagesKnown') || [];
    const updatedLanguage = { ...languages[index], [field]: value };
    updateArrayItem('languagesKnown', index, updatedLanguage);
  };

  const languagesKnown = getFieldValue('languagesKnown') || [];

  const getProficiencyColor = (proficiency) => {
    switch (proficiency) {
      case 'Basic':
        return 'warning';
      case 'Intermediate':
        return 'info';
      case 'Fluent':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getProficiencyDescription = (proficiency) => {
    switch (proficiency) {
      case 'Basic':
        return 'Can understand and use familiar everyday expressions';
      case 'Intermediate':
        return 'Can communicate effectively in most situations';
      case 'Fluent':
        return 'Can express ideas fluently and spontaneously';
      default:
        return '';
    }
  };

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Language Proficiency
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={2}>
          Add the languages you know and your proficiency level in each
        </MDTypography>
      </MDBox>

      <Grid container spacing={3}>
        {/* Languages Section */}
        <Grid item xs={12}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6" fontWeight="medium">
              Languages Known
            </MDTypography>
            <MDButton
              variant="outlined"
              color="info"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddLanguage}
            >
              Add Language
            </MDButton>
          </MDBox>
        </Grid>

        {languagesKnown.map((language, index) => (
          <Grid item xs={12} key={index}>
            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <MDTypography variant="h6" fontWeight="medium">
                  Language {index + 1}
                </MDTypography>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleRemoveLanguage(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </MDBox>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <MDInput
                    type="text"
                    label="Language"
                    value={language.language || ''}
                    onChange={(e) => handleLanguageChange(index, 'language', e.target.value)}
                    fullWidth
                    required
                    placeholder="e.g., English, Hindi, Tamil"
                    list={`language-suggestions-${index}`}
                  />
                  <datalist id={`language-suggestions-${index}`}>
                    {commonLanguages.map((lang) => (
                      <option key={lang} value={lang} />
                    ))}
                  </datalist>
                </Grid>

                <Grid item xs={12} md={6}>
                  <MDInput
                    select
                    label="Proficiency Level"
                    value={language.proficiency || 'Basic'}
                    onChange={(e) => handleLanguageChange(index, 'proficiency', e.target.value)}
                    fullWidth
                    required
                  >
                    {proficiencyLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </MDInput>
                </Grid>

                {language.proficiency && (
                  <Grid item xs={12}>
                    <MDBox
                      p={1.5}
                      bgcolor="light.main"
                      borderRadius="lg"
                      sx={{ 
                        border: '1px solid',
                        borderColor: `${getProficiencyColor(language.proficiency)}.main`,
                        backgroundColor: `rgba(26, 115, 232, 0.08)`
                      }}
                    >
                      <MDTypography 
                        variant="body2" 
                        color="text"
                        fontWeight="medium"
                      >
                        {getProficiencyDescription(language.proficiency)}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                )}
              </Grid>
            </Card>
          </Grid>
        ))}

        {languagesKnown.length === 0 && (
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
                  No languages added yet
                </MDTypography>
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddLanguage}
                >
                  Add Your First Language
                </MDButton>
              </MDBox>
            </MDBox>
          </Grid>
        )}

        {/* Proficiency Level Guide */}
        <Grid item xs={12}>
          <MDBox mt={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Proficiency Level Guide
            </MDTypography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <MDBox
                  p={2}
                  bgcolor="light.main"
                  borderRadius="lg"
                  sx={{ 
                    border: '1px solid',
                    borderColor: 'warning.main',
                    backgroundColor: 'rgba(251, 140, 0, 0.08)'
                  }}
                >
                  <MDTypography variant="body2" color="warning" fontWeight="medium" mb={1}>
                    Basic Level
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    • Can understand and use familiar everyday expressions
                    <br />
                    • Can introduce yourself and ask basic questions
                    <br />
                    • Can interact in a simple way
                  </MDTypography>
                </MDBox>
              </Grid>

              <Grid item xs={12} md={4}>
                <MDBox
                  p={2}
                  bgcolor="light.main"
                  borderRadius="lg"
                  sx={{ 
                    border: '1px solid',
                    borderColor: 'info.main',
                    backgroundColor: 'rgba(26, 115, 232, 0.08)'
                  }}
                >
                  <MDTypography variant="body2" color="info" fontWeight="medium" mb={1}>
                    Intermediate Level
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    • Can communicate effectively in most situations
                    <br />
                    • Can describe experiences and explain opinions
                    <br />
                    • Can handle most travel situations
                  </MDTypography>
                </MDBox>
              </Grid>

              <Grid item xs={12} md={4}>
                <MDBox
                  p={2}
                  bgcolor="light.main"
                  borderRadius="lg"
                  sx={{ 
                    border: '1px solid',
                    borderColor: 'success.main',
                    backgroundColor: 'rgba(76, 175, 80, 0.08)'
                  }}
                >
                  <MDTypography variant="body2" color="success" fontWeight="medium" mb={1}>
                    Fluent Level
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    • Can express ideas fluently and spontaneously
                    <br />
                    • Can use language effectively for professional purposes
                    <br />
                    • Can understand complex texts and conversations
                  </MDTypography>
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>
        </Grid>

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
              💡 Tips for Language Proficiency:
            </MDTypography>
            <MDTypography variant="body2" color="text">
              • Be honest about your proficiency level - employers may test your language skills
              <br />
              • Include your native language(s) as fluent
              <br />
              • Consider adding languages relevant to your target job market
              <br />
              • If you have language certifications (IELTS, TOEFL, etc.), mention them in certifications section
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

export default LanguageProficiencyForm;
