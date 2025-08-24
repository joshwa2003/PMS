import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Divider,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Box,
  LinearProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  AttachMoney as AttachMoneyIcon,
  Group as GroupIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';
import MDAlert from 'components/MDAlert';

// Material Dashboard 2 React example components
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';

// Context
import { useJob } from 'context/JobContext';

const steps = [
  'Basic Information',
  'Job Details',
  'Compensation',
  'Target Departments',
  'Review & Submit'
];

const StepIcon = ({ step, active }) => {
  const icons = [
    <BusinessIcon />,
    <WorkIcon />,
    <AttachMoneyIcon />,
    <GroupIcon />,
    <PreviewIcon />
  ];
  
  return (
    <MDBox
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="2.5rem"
      height="2.5rem"
      borderRadius="50%"
      sx={{
        backgroundColor: active ? 'info.main' : 'grey.300',
        color: active ? 'white' : 'grey.600'
      }}
    >
      {icons[step]}
    </MDBox>
  );
};

function CreateJobPage() {
  const navigate = useNavigate();
  const { createJob, departments, fetchDepartments } = useJob();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({
    title: '',
    company: {
      name: '',
      website: '',
      logo: null,
      about: '',
      size: '',
      industry: '',
      founded: ''
    },
    description: '',
    keyResponsibilities: [''],
    requirements: [''],
    skillsRequired: [''],
    otherRequirements: [''],
    location: '',
    workMode: 'Work from office',
    jobType: 'Full-time',
    startDate: 'Immediately',
    applicationLink: '',
    deadline: '',
    salary: {
      min: '',
      max: '',
      currency: 'INR',
      period: 'Annual'
    },
    stipend: {
      amount: '',
      currency: 'INR',
      period: 'Monthly'
    },
    probation: {
      hasProbation: false,
      duration: '',
      salary: {
        min: '',
        max: '',
        currency: 'INR',
        period: 'Monthly'
      }
    },
    numberOfOpenings: 1,
    workEnvironmentRequirements: [''],
    benefits: [''],
    educationQualifications: [''],
    eligibility: {
      minCGPA: '',
      maxBacklogs: '',
      departments: [],
      graduationYears: [],
      experience: {
        min: 0,
        max: ''
      }
    },
    postingType: 'Specific Departments',
    targetDepartments: [],
    status: 'Draft'
  });

  const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];
  const currencies = ['INR', 'USD', 'EUR', 'GBP'];
  const workModes = ['Work from office', 'Work from home', 'Hybrid'];
  const startDateOptions = ['Immediately', 'Within 1 month', 'Within 2 months', 'Within 3 months', 'Flexible'];
  const companySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
  const salaryPeriods = ['Annual', 'Monthly', 'Hourly'];
  const stipendPeriods = ['Monthly', 'Weekly', 'Daily'];

  // Helper functions for dynamic arrays
  const addArrayItem = (field, subField = null) => {
    if (subField) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [subField]: [...prev[field][subField], '']
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], '']
      }));
    }
  };

  const removeArrayItem = (field, index, subField = null) => {
    if (subField) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [subField]: prev[field][subField].filter((_, i) => i !== index)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const updateArrayItem = (field, index, value, subField = null) => {
    if (subField) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [subField]: prev[field][subField].map((item, i) => i === index ? value : item)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].map((item, i) => i === index ? value : item)
      }));
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Basic Information
        if (!formData.title.trim()) newErrors.title = 'Job title is required';
        if (!formData.company.name.trim()) newErrors['company.name'] = 'Company name is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        break;
      
      case 1: // Job Details
        if (!formData.description.trim()) newErrors.description = 'Job description is required';
        if (!formData.applicationLink.trim()) newErrors.applicationLink = 'Application link is required';
        if (!formData.deadline) newErrors.deadline = 'Application deadline is required';
        if (formData.deadline && new Date(formData.deadline) <= new Date()) {
          newErrors.deadline = 'Deadline must be in the future';
        }
        break;
      
      case 3: // Target Departments
        if (formData.postingType === 'Specific Departments' && formData.targetDepartments.length === 0) {
          newErrors.targetDepartments = 'Please select at least one department';
        }
        break;
      
      default:
        // No validation needed for other steps
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (isDraft = false) => {
    if (!validateStep(activeStep) && !isDraft) return;

    setLoading(true);
    try {
      const jobData = {
        ...formData,
        status: isDraft ? 'Draft' : formData.status,
        salary: formData.salary.min || formData.salary.max ? formData.salary : null,
        stipend: formData.stipend.amount ? formData.stipend : null
      };

      await createJob(jobData, formData.company.logo, []);
      
      setAlert({
        show: true,
        message: `Job ${isDraft ? 'saved as draft' : 'created'} successfully!`,
        type: 'success'
      });

      // Navigate back to job management after a short delay
      setTimeout(() => {
        navigate('/job-management');
      }, 2000);
    } catch (error) {
      console.error('Error creating job:', error);
      setAlert({
        show: true,
        message: error.message || 'Failed to create job',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDTypography variant="h6" mb={2} color="dark">
                <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Basic Information
              </MDTypography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Job Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={formData.company.name}
                onChange={(e) => handleInputChange('company.name', e.target.value)}
                error={!!errors['company.name']}
                helperText={errors['company.name']}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Website"
                value={formData.company.website}
                onChange={(e) => handleInputChange('company.website', e.target.value)}
                placeholder="https://company.com"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                error={!!errors.location}
                helperText={errors.location}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={formData.jobType}
                  onChange={(e) => handleInputChange('jobType', e.target.value)}
                  label="Job Type"
                >
                  {jobTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDTypography variant="h6" mb={2} color="dark">
                <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Job Details
              </MDTypography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Application Deadline"
                type="date"
                value={formData.deadline || ''}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                error={!!errors.deadline}
                helperText={errors.deadline}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Application Link"
                value={formData.applicationLink}
                onChange={(e) => handleInputChange('applicationLink', e.target.value)}
                error={!!errors.applicationLink}
                helperText={errors.applicationLink}
                placeholder="https://company.com/apply"
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Job Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Benefits"
                value={formData.benefits}
                onChange={(e) => handleInputChange('benefits', e.target.value)}
                variant="outlined"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDTypography variant="h6" mb={2} color="dark">
                <AttachMoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Compensation Details
              </MDTypography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Minimum Salary"
                type="number"
                value={formData.salary.min}
                onChange={(e) => handleInputChange('salary.min', e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Maximum Salary"
                type="number"
                value={formData.salary.max}
                onChange={(e) => handleInputChange('salary.max', e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.salary.currency}
                  onChange={(e) => handleInputChange('salary.currency', e.target.value)}
                  label="Currency"
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency} value={currency}>{currency}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <MDTypography variant="body2" color="text" mb={2}>
                For internships, you can specify stipend details:
              </MDTypography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stipend Amount"
                type="number"
                value={formData.stipend.amount}
                onChange={(e) => handleInputChange('stipend.amount', e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Stipend Currency</InputLabel>
                <Select
                  value={formData.stipend.currency}
                  onChange={(e) => handleInputChange('stipend.currency', e.target.value)}
                  label="Stipend Currency"
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency} value={currency}>{currency}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDTypography variant="h6" mb={2} color="dark">
                <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Target Departments
              </MDTypography>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Posting Type</InputLabel>
                <Select
                  value={formData.postingType}
                  onChange={(e) => handleInputChange('postingType', e.target.value)}
                  label="Posting Type"
                >
                  <MenuItem value="All Departments">All Departments</MenuItem>
                  <MenuItem value="Specific Departments">Specific Departments</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.postingType === 'Specific Departments' && (
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.targetDepartments} variant="outlined">
                  <InputLabel>Target Departments</InputLabel>
                  <Select
                    multiple
                    value={formData.targetDepartments}
                    onChange={(e) => handleInputChange('targetDepartments', e.target.value)}
                    input={<OutlinedInput label="Target Departments" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const dept = departments.find(d => d._id === value);
                          return (
                            <Chip key={value} label={dept?.name || value} size="small" />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.targetDepartments && (
                    <MDTypography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                      {errors.targetDepartments}
                    </MDTypography>
                  )}
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Job Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDTypography variant="h6" mb={3} color="dark">
                <PreviewIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Review Job Details
              </MDTypography>
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <MDBox mb={3}>
                  <MDTypography variant="h5" fontWeight="bold" color="dark">
                    {formData.title}
                  </MDTypography>
                  <MDTypography variant="body1" color="text">
                    {formData.company.name} • {formData.location}
                  </MDTypography>
                </MDBox>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="button" fontWeight="medium" color="dark">
                      Job Type:
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      {formData.jobType}
                    </MDTypography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <MDTypography variant="button" fontWeight="medium" color="dark">
                      Deadline:
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      {formData.deadline ? new Date(formData.deadline).toLocaleDateString() : 'Not set'}
                    </MDTypography>
                  </Grid>

                  <Grid item xs={12}>
                    <MDTypography variant="button" fontWeight="medium" color="dark">
                      Description:
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      {formData.description || 'No description provided'}
                    </MDTypography>
                  </Grid>

                  <Grid item xs={12}>
                    <MDTypography variant="button" fontWeight="medium" color="dark">
                      Target Departments:
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      {formData.postingType === 'All Departments' 
                        ? 'All Departments' 
                        : formData.targetDepartments.map(id => {
                            const dept = departments.find(d => d._id === id);
                            return dept?.name;
                          }).join(', ') || 'None selected'
                      }
                    </MDTypography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      
      <MDBox py={3}>
        {/* Alert */}
        {alert.show && (
          <MDBox mb={3}>
            <MDAlert 
              color={alert.type} 
              dismissible 
              onClose={() => setAlert({ ...alert, show: false })}
            >
              {alert.message}
            </MDAlert>
          </MDBox>
        )}

        {/* Header */}
        <MDBox mb={4}>
          <MDBox display="flex" alignItems="center" mb={2}>
            <MDButton
              variant="text"
              color="dark"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/job-management')}
              sx={{ mr: 2 }}
            >
              Back to Job Management
            </MDButton>
          </MDBox>
          
          <MDTypography variant="h3" fontWeight="bold" color="dark">
            Create New Job
          </MDTypography>
          <MDTypography variant="body1" color="text" mt={1}>
            Fill in the details to create a new job posting
          </MDTypography>
        </MDBox>

        {/* Progress */}
        {loading && (
          <MDBox mb={3}>
            <LinearProgress color="info" />
          </MDBox>
        )}

        {/* Stepper */}
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconComponent={() => <StepIcon step={index} active={index <= activeStep} />}
                  >
                    <MDTypography 
                      variant="caption" 
                      color={index <= activeStep ? 'dark' : 'text'}
                      fontWeight={index === activeStep ? 'bold' : 'regular'}
                    >
                      {label}
                    </MDTypography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Form Content */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {renderStepContent(activeStep)}

            {/* Navigation Buttons */}
            <MDBox display="flex" justifyContent="space-between" mt={4} pt={3}>
              <MDBox>
                {activeStep > 0 && (
                  <MDButton
                    variant="outlined"
                    color="dark"
                    onClick={handleBack}
                    disabled={loading}
                  >
                    Back
                  </MDButton>
                )}
              </MDBox>

              <MDBox display="flex" gap={2}>
                {activeStep < steps.length - 1 ? (
                  <>
                    <MDButton
                      variant="outlined"
                      color="info"
                      onClick={() => handleSubmit(true)}
                      disabled={loading}
                      startIcon={<SaveIcon />}
                    >
                      Save as Draft
                    </MDButton>
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={handleNext}
                      disabled={loading}
                    >
                      Next
                    </MDButton>
                  </>
                ) : (
                  <>
                    <MDButton
                      variant="outlined"
                      color="info"
                      onClick={() => handleSubmit(true)}
                      disabled={loading}
                      startIcon={<SaveIcon />}
                    >
                      Save as Draft
                    </MDButton>
                    <MDButton
                      variant="gradient"
                      color="success"
                      onClick={() => handleSubmit(false)}
                      disabled={loading}
                      startIcon={<SaveIcon />}
                    >
                      {loading ? 'Creating...' : 'Create Job'}
                    </MDButton>
                  </>
                )}
              </MDBox>
            </MDBox>
          </CardContent>
        </Card>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default CreateJobPage;
