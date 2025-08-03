import React from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

// @mui icons
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// S.A. Engineering College React components
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";
import MDInput from "../MDInput";
import MDButton from "../MDButton";

function ProjectsInternshipsForm() {
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

  // Tech stack suggestions
  const techStackOptions = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'AWS', 'Azure', 'Docker',
    'HTML', 'CSS', 'Bootstrap', 'Tailwind CSS', 'Material-UI', 'Redux', 'GraphQL',
    'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'OpenCV', 'Keras',
    'React Native', 'Flutter', 'Xamarin', 'Unity', 'Unreal Engine', 'Figma', 'Adobe XD'
  ];

  const projectStatusOptions = [
    'Completed',
    'In Progress',
    'On Hold',
    'Cancelled'
  ];

  // Projects handlers
  const handleAddProject = () => {
    const newProject = {
      title: '',
      client: '',
      status: 'Completed',
      from: '',
      to: '',
      description: '',
      techStack: []
    };
    addArrayItem('projects', newProject);
  };

  const handleRemoveProject = (index) => {
    removeArrayItem('projects', index);
  };

  const handleProjectChange = (index, field, value) => {
    const projects = getFieldValue('projects') || [];
    const updatedProject = { ...projects[index], [field]: value };
    updateArrayItem('projects', index, updatedProject);
  };

  const handleProjectTechStackChange = (index, newValue) => {
    handleProjectChange(index, 'techStack', newValue);
  };

  // Internships handlers
  const handleAddInternship = () => {
    const newInternship = {
      company: '',
      role: '',
      duration: '',
      certificateLink: ''
    };
    addArrayItem('internships', newInternship);
  };

  const handleRemoveInternship = (index) => {
    removeArrayItem('internships', index);
  };

  const handleInternshipChange = (index, field, value) => {
    const internships = getFieldValue('internships') || [];
    const updatedInternship = { ...internships[index], [field]: value };
    updateArrayItem('internships', index, updatedInternship);
  };

  const projects = getFieldValue('projects') || [];
  const internships = getFieldValue('internships') || [];

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Projects & Internships
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={2}>
          Showcase your projects and internship experiences
        </MDTypography>
      </MDBox>

      <Grid container spacing={3}>
        {/* Projects Section */}
        <Grid item xs={12}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6" fontWeight="medium">
              Projects
            </MDTypography>
            <MDButton
              variant="outlined"
              color="info"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddProject}
            >
              Add Project
            </MDButton>
          </MDBox>
        </Grid>

        {projects.map((project, index) => (
          <Grid item xs={12} key={`project-${index}`}>
            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <MDTypography variant="h6" fontWeight="medium">
                  Project {index + 1}
                </MDTypography>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleRemoveProject(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </MDBox>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <MDInput
                    type="text"
                    label="Project Title"
                    value={project.title || ''}
                    onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                    fullWidth
                    required
                    placeholder="e.g., E-commerce Website, Mobile App"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <MDInput
                    type="text"
                    label="Client/Organization"
                    value={project.client || ''}
                    onChange={(e) => handleProjectChange(index, 'client', e.target.value)}
                    fullWidth
                    placeholder="e.g., Personal, College, Company Name"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <MDInput
                    select
                    label="Status"
                    value={project.status || 'Completed'}
                    onChange={(e) => handleProjectChange(index, 'status', e.target.value)}
                    fullWidth
                  >
                    {projectStatusOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </MDInput>
                </Grid>

                <Grid item xs={12} md={4}>
                  <MDInput
                    type="date"
                    label="Start Date"
                    value={project.from ? 
                      new Date(project.from).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleProjectChange(index, 'from', e.target.value)}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <MDInput
                    type="date"
                    label="End Date"
                    value={project.to ? 
                      new Date(project.to).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleProjectChange(index, 'to', e.target.value)}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    helperText="Leave empty if ongoing"
                  />
                </Grid>

                <Grid item xs={12}>
                  <MDInput
                    type="text"
                    label="Project Description"
                    value={project.description || ''}
                    onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Describe the project, your role, and key achievements"
                  />
                </Grid>

                <Grid item xs={12}>
                  <MDTypography variant="body2" fontWeight="medium" mb={1}>
                    Technology Stack
                  </MDTypography>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={techStackOptions}
                    value={project.techStack || []}
                    onChange={(event, newValue) => handleProjectTechStackChange(index, newValue)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, tagIndex) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          {...getTagProps({ index: tagIndex })}
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
                        placeholder="Select or type technologies used"
                        size="small"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        ))}

        {projects.length === 0 && (
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
                  No projects added yet
                </MDTypography>
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddProject}
                >
                  Add Your First Project
                </MDButton>
              </MDBox>
            </MDBox>
          </Grid>
        )}

        {/* Internships Section */}
        <Grid item xs={12}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2}>
            <MDTypography variant="h6" fontWeight="medium">
              Internships
            </MDTypography>
            <MDButton
              variant="outlined"
              color="info"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddInternship}
            >
              Add Internship
            </MDButton>
          </MDBox>
        </Grid>

        {internships.map((internship, index) => (
          <Grid item xs={12} key={`internship-${index}`}>
            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <MDTypography variant="h6" fontWeight="medium">
                  Internship {index + 1}
                </MDTypography>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleRemoveInternship(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </MDBox>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <MDInput
                    type="text"
                    label="Company Name"
                    value={internship.company || ''}
                    onChange={(e) => handleInternshipChange(index, 'company', e.target.value)}
                    fullWidth
                    required
                    placeholder="e.g., Google, Microsoft, TCS"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <MDInput
                    type="text"
                    label="Role/Position"
                    value={internship.role || ''}
                    onChange={(e) => handleInternshipChange(index, 'role', e.target.value)}
                    fullWidth
                    placeholder="e.g., Software Development Intern"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <MDInput
                    type="text"
                    label="Duration"
                    value={internship.duration || ''}
                    onChange={(e) => handleInternshipChange(index, 'duration', e.target.value)}
                    fullWidth
                    placeholder="e.g., 3 months, Jun 2023 - Aug 2023"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <MDInput
                    type="url"
                    label="Certificate Link"
                    value={internship.certificateLink || ''}
                    onChange={(e) => handleInternshipChange(index, 'certificateLink', e.target.value)}
                    fullWidth
                    placeholder="https://..."
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        ))}

        {internships.length === 0 && (
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
                  No internships added yet
                </MDTypography>
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddInternship}
                >
                  Add Your First Internship
                </MDButton>
              </MDBox>
            </MDBox>
          </Grid>
        )}

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

export default ProjectsInternshipsForm;
