import React from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

// @mui icons
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArticleIcon from "@mui/icons-material/Article";
import PresentToAllIcon from "@mui/icons-material/PresentToAll";
import InventoryIcon from "@mui/icons-material/Inventory";
import WorkIcon from "@mui/icons-material/Work";

// S.A. Engineering College React components
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";
import MDInput from "../MDInput";
import MDButton from "../MDButton";

function AccomplishmentsForm() {
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

  // Achievement suggestions
  const achievementSuggestions = [
    'Academic Excellence Award',
    'Dean\'s List',
    'Scholarship Recipient',
    'Hackathon Winner',
    'Coding Competition Winner',
    'Best Project Award',
    'Leadership Award',
    'Sports Achievement',
    'Cultural Event Winner',
    'Volunteer Recognition',
    'Research Paper Published',
    'Patent Filed',
    'Startup Founder',
    'Internship Excellence',
    'Technical Presentation Award',
    'Community Service Award',
    'Innovation Award',
    'Team Lead Recognition',
    'Client Appreciation',
    'Performance Excellence'
  ];

  // Job domain suggestions
  const jobDomainSuggestions = [
    'Software Development',
    'Web Development',
    'Mobile App Development',
    'Data Science',
    'Machine Learning',
    'Artificial Intelligence',
    'Cybersecurity',
    'Cloud Computing',
    'DevOps',
    'UI/UX Design',
    'Product Management',
    'Project Management',
    'Business Analysis',
    'Digital Marketing',
    'Content Writing',
    'Sales',
    'Human Resources',
    'Finance',
    'Consulting',
    'Research & Development',
    'Quality Assurance',
    'Database Administration',
    'Network Administration',
    'System Administration',
    'Technical Writing',
    'Game Development',
    'Blockchain Development',
    'IoT Development',
    'Robotics',
    'Embedded Systems'
  ];

  // Handlers for different accomplishment types
  const handleAddResearchPaper = () => {
    const newPaper = { title: '', link: '' };
    addArrayItem('accomplishments.researchPapers', newPaper);
  };

  const handleRemoveResearchPaper = (index) => {
    removeArrayItem('accomplishments.researchPapers', index);
  };

  const handleResearchPaperChange = (index, field, value) => {
    const papers = getFieldValue('accomplishments.researchPapers') || [];
    const updatedPaper = { ...papers[index], [field]: value };
    updateArrayItem('accomplishments.researchPapers', index, updatedPaper);
  };

  const handleAddPresentation = () => {
    const newPresentation = { title: '', link: '' };
    addArrayItem('accomplishments.presentations', newPresentation);
  };

  const handleRemovePresentation = (index) => {
    removeArrayItem('accomplishments.presentations', index);
  };

  const handlePresentationChange = (index, field, value) => {
    const presentations = getFieldValue('accomplishments.presentations') || [];
    const updatedPresentation = { ...presentations[index], [field]: value };
    updateArrayItem('accomplishments.presentations', index, updatedPresentation);
  };

  const handleAddPatent = () => {
    const newPatent = { title: '', details: '' };
    addArrayItem('accomplishments.patents', newPatent);
  };

  const handleRemovePatent = (index) => {
    removeArrayItem('accomplishments.patents', index);
  };

  const handlePatentChange = (index, field, value) => {
    const patents = getFieldValue('accomplishments.patents') || [];
    const updatedPatent = { ...patents[index], [field]: value };
    updateArrayItem('accomplishments.patents', index, updatedPatent);
  };

  const handleAddWorkSample = () => {
    const newSample = { title: '', link: '' };
    addArrayItem('accomplishments.workSamples', newSample);
  };

  const handleRemoveWorkSample = (index) => {
    removeArrayItem('accomplishments.workSamples', index);
  };

  const handleWorkSampleChange = (index, field, value) => {
    const samples = getFieldValue('accomplishments.workSamples') || [];
    const updatedSample = { ...samples[index], [field]: value };
    updateArrayItem('accomplishments.workSamples', index, updatedSample);
  };

  const handleAchievementsChange = (event, newValue) => {
    updateFormData('achievements', newValue);
  };

  const handleJobDomainsChange = (event, newValue) => {
    updateFormData('preferredJobDomains', newValue);
  };

  const researchPapers = getFieldValue('accomplishments.researchPapers') || [];
  const presentations = getFieldValue('accomplishments.presentations') || [];
  const patents = getFieldValue('accomplishments.patents') || [];
  const workSamples = getFieldValue('accomplishments.workSamples') || [];

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Accomplishments & Achievements
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={2}>
          Showcase your achievements, research work, and preferred job domains
        </MDTypography>
      </MDBox>

      <Grid container spacing={3}>
        {/* Achievements Section */}
        <Grid item xs={12}>
          <MDBox display="flex" alignItems="center" mb={2}>
            <EmojiEventsIcon sx={{ mr: 1, color: '#FFD700' }} />
            <MDTypography variant="h6" fontWeight="medium">
              Achievements & Awards
            </MDTypography>
          </MDBox>
          <Autocomplete
            multiple
            freeSolo
            options={achievementSuggestions}
            value={getFieldValue('achievements') || []}
            onChange={handleAchievementsChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                  size="small"
                  color="warning"
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Add your achievements and awards"
                helperText="Include academic, technical, sports, cultural, and leadership achievements"
              />
            )}
          />
        </Grid>

        {/* Preferred Job Domains */}
        <Grid item xs={12}>
          <MDBox display="flex" alignItems="center" mb={2} mt={3}>
            <WorkIcon sx={{ mr: 1, color: '#1976d2' }} />
            <MDTypography variant="h6" fontWeight="medium">
              Preferred Job Domains
            </MDTypography>
          </MDBox>
          <Autocomplete
            multiple
            freeSolo
            options={jobDomainSuggestions}
            value={getFieldValue('preferredJobDomains') || []}
            onChange={handleJobDomainsChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                  size="small"
                  color="info"
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Select your preferred job domains"
                helperText="Choose the areas where you'd like to work"
              />
            )}
          />
        </Grid>

        {/* Research Papers Section */}
        <Grid item xs={12}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2}>
            <MDBox display="flex" alignItems="center">
              <ArticleIcon sx={{ mr: 1, color: '#4caf50' }} />
              <MDTypography variant="h6" fontWeight="medium">
                Research Papers
              </MDTypography>
            </MDBox>
            <MDButton
              variant="outlined"
              color="success"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddResearchPaper}
            >
              Add Paper
            </MDButton>
          </MDBox>
        </Grid>

        {researchPapers.map((paper, index) => (
          <Grid item xs={12} key={`paper-${index}`}>
            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <MDTypography variant="h6" fontWeight="medium">
                  Research Paper {index + 1}
                </MDTypography>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleRemoveResearchPaper(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </MDBox>

              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <MDInput
                    type="text"
                    label="Paper Title"
                    value={paper.title || ''}
                    onChange={(e) => handleResearchPaperChange(index, 'title', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <MDInput
                    type="url"
                    label="Paper Link"
                    value={paper.link || ''}
                    onChange={(e) => handleResearchPaperChange(index, 'link', e.target.value)}
                    fullWidth
                    placeholder="https://..."
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        ))}

        {/* Presentations Section */}
        <Grid item xs={12}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2}>
            <MDBox display="flex" alignItems="center">
              <PresentToAllIcon sx={{ mr: 1, color: '#ff9800' }} />
              <MDTypography variant="h6" fontWeight="medium">
                Presentations
              </MDTypography>
            </MDBox>
            <MDButton
              variant="outlined"
              color="warning"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddPresentation}
            >
              Add Presentation
            </MDButton>
          </MDBox>
        </Grid>

        {presentations.map((presentation, index) => (
          <Grid item xs={12} key={`presentation-${index}`}>
            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <MDTypography variant="h6" fontWeight="medium">
                  Presentation {index + 1}
                </MDTypography>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleRemovePresentation(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </MDBox>

              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <MDInput
                    type="text"
                    label="Presentation Title"
                    value={presentation.title || ''}
                    onChange={(e) => handlePresentationChange(index, 'title', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <MDInput
                    type="url"
                    label="Presentation Link"
                    value={presentation.link || ''}
                    onChange={(e) => handlePresentationChange(index, 'link', e.target.value)}
                    fullWidth
                    placeholder="https://..."
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        ))}

        {/* Patents Section */}
        <Grid item xs={12}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2}>
            <MDBox display="flex" alignItems="center">
              <InventoryIcon sx={{ mr: 1, color: '#9c27b0' }} />
              <MDTypography variant="h6" fontWeight="medium">
                Patents
              </MDTypography>
            </MDBox>
            <MDButton
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddPatent}
            >
              Add Patent
            </MDButton>
          </MDBox>
        </Grid>

        {patents.map((patent, index) => (
          <Grid item xs={12} key={`patent-${index}`}>
            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <MDTypography variant="h6" fontWeight="medium">
                  Patent {index + 1}
                </MDTypography>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleRemovePatent(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </MDBox>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <MDInput
                    type="text"
                    label="Patent Title"
                    value={patent.title || ''}
                    onChange={(e) => handlePatentChange(index, 'title', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <MDInput
                    type="text"
                    label="Patent Details"
                    value={patent.details || ''}
                    onChange={(e) => handlePatentChange(index, 'details', e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Patent number, filing date, status, brief description"
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        ))}

        {/* Work Samples Section */}
        <Grid item xs={12}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2}>
            <MDBox display="flex" alignItems="center">
              <WorkIcon sx={{ mr: 1, color: '#795548' }} />
              <MDTypography variant="h6" fontWeight="medium">
                Work Samples
              </MDTypography>
            </MDBox>
            <MDButton
              variant="outlined"
              color="info"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddWorkSample}
            >
              Add Work Sample
            </MDButton>
          </MDBox>
        </Grid>

        {workSamples.map((sample, index) => (
          <Grid item xs={12} key={`sample-${index}`}>
            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <MDTypography variant="h6" fontWeight="medium">
                  Work Sample {index + 1}
                </MDTypography>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleRemoveWorkSample(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </MDBox>

              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <MDInput
                    type="text"
                    label="Work Sample Title"
                    value={sample.title || ''}
                    onChange={(e) => handleWorkSampleChange(index, 'title', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <MDInput
                    type="url"
                    label="Sample Link"
                    value={sample.link || ''}
                    onChange={(e) => handleWorkSampleChange(index, 'link', e.target.value)}
                    fullWidth
                    placeholder="https://..."
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        ))}

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

export default AccomplishmentsForm;
