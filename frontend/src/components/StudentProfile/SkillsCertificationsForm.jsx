import React, { useState } from 'react';
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

// S.A. Engineering College React components
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";
import MDInput from "../MDInput";
import MDButton from "../MDButton";

function SkillsCertificationsForm() {
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

  const [newSkill, setNewSkill] = useState('');

  const handleInputChange = (field, value) => {
    updateFormData(field, value);
  };

  const handleSave = async () => {
    const result = await saveProfile();
    if (result.success) {
      goToNextTab();
    }
  };

  // Predefined skills for suggestions
  const skillSuggestions = [
    // Programming Languages
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
    'Kotlin', 'TypeScript', 'Scala', 'R', 'MATLAB', 'SQL', 'HTML', 'CSS',
    
    // Frameworks & Libraries
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask',
    'Spring Boot', 'Laravel', 'Ruby on Rails', 'ASP.NET', 'jQuery', 'Bootstrap',
    'Tailwind CSS', 'Material-UI', 'Redux', 'Next.js', 'Nuxt.js',
    
    // Databases
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQLite', 'Cassandra',
    'DynamoDB', 'Firebase', 'Elasticsearch',
    
    // Cloud & DevOps
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git',
    'GitHub', 'GitLab', 'CI/CD', 'Terraform', 'Ansible',
    
    // Data Science & AI
    'Machine Learning', 'Deep Learning', 'Data Analysis', 'Data Visualization',
    'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Tableau',
    'Power BI', 'Apache Spark', 'Hadoop',
    
    // Mobile Development
    'React Native', 'Flutter', 'iOS Development', 'Android Development',
    'Xamarin', 'Ionic',
    
    // Other Technical Skills
    'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'JIRA',
    'Linux', 'Windows Server', 'Networking', 'Cybersecurity', 'Blockchain',
    'IoT', 'AR/VR', 'Game Development', 'UI/UX Design', 'Figma', 'Adobe Creative Suite',
    
    // Soft Skills
    'Leadership', 'Communication', 'Team Management', 'Problem Solving',
    'Critical Thinking', 'Project Management', 'Time Management', 'Presentation Skills'
  ];

  const handleSkillsChange = (event, newValue) => {
    updateFormData('skills', newValue);
  };

  const handleAddCertification = () => {
    const newCertification = {
      name: '',
      authority: '',
      link: '',
      validFrom: '',
      validTo: ''
    };
    addArrayItem('certifications', newCertification);
  };

  const handleRemoveCertification = (index) => {
    removeArrayItem('certifications', index);
  };

  const handleCertificationChange = (index, field, value) => {
    const certifications = getFieldValue('certifications') || [];
    const updatedCertification = { ...certifications[index], [field]: value };
    updateArrayItem('certifications', index, updatedCertification);
  };

  const certifications = getFieldValue('certifications') || [];

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Skills & Certifications
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={2}>
          Add your technical and soft skills, along with any certifications you have earned
        </MDTypography>
      </MDBox>

      <Grid container spacing={3}>
        {/* Skills Section */}
        <Grid item xs={12}>
          <MDTypography variant="h6" fontWeight="medium" mb={2}>
            Skills
          </MDTypography>
          <Autocomplete
            multiple
            freeSolo
            options={skillSuggestions}
            value={getFieldValue('skills') || []}
            onChange={handleSkillsChange}
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
                placeholder="Type or select skills (e.g., JavaScript, Python, React)"
                helperText="You can type custom skills or select from suggestions"
              />
            )}
          />
        </Grid>

        {/* Certifications Section */}
        <Grid item xs={12}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2}>
            <MDTypography variant="h6" fontWeight="medium">
              Certifications
            </MDTypography>
            <MDButton
              variant="outlined"
              color="info"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddCertification}
            >
              Add Certification
            </MDButton>
          </MDBox>
        </Grid>

        {certifications.map((certification, index) => (
          <Grid item xs={12} key={index}>
            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <MDTypography variant="h6" fontWeight="medium">
                  Certification {index + 1}
                </MDTypography>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleRemoveCertification(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </MDBox>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <MDInput
                    type="text"
                    label="Certification Name"
                    value={certification.name || ''}
                    onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                    fullWidth
                    required
                    placeholder="e.g., AWS Certified Solutions Architect"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <MDInput
                    type="text"
                    label="Issuing Authority"
                    value={certification.authority || ''}
                    onChange={(e) => handleCertificationChange(index, 'authority', e.target.value)}
                    fullWidth
                    placeholder="e.g., Amazon Web Services, Microsoft, Google"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <MDInput
                    type="date"
                    label="Valid From"
                    value={certification.validFrom ? 
                      new Date(certification.validFrom).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleCertificationChange(index, 'validFrom', e.target.value)}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <MDInput
                    type="date"
                    label="Valid To"
                    value={certification.validTo ? 
                      new Date(certification.validTo).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleCertificationChange(index, 'validTo', e.target.value)}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    helperText="Leave empty if no expiry"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <MDInput
                    type="url"
                    label="Certificate Link"
                    value={certification.link || ''}
                    onChange={(e) => handleCertificationChange(index, 'link', e.target.value)}
                    fullWidth
                    placeholder="https://..."
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        ))}

        {certifications.length === 0 && (
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
                  No certifications added yet
                </MDTypography>
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddCertification}
                >
                  Add Your First Certification
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
              💡 Tips for Skills & Certifications:
            </MDTypography>
            <MDTypography variant="body2" color="text">
              • Include both technical and soft skills relevant to your career goals
              <br />
              • Add industry-recognized certifications to stand out
              <br />
              • Keep your skills updated with current market trends
              <br />
              • Provide certificate links for verification when possible
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

export default SkillsCertificationsForm;
