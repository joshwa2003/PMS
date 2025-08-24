import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Divider
} from '@mui/material';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';
import { useJob } from 'context/JobContext';

const CreateJobModal = ({ open, onClose, onSuccess }) => {
  const { createJob, departments, fetchDepartments } = useJob();
  
  const [formData, setFormData] = useState({
    title: '',
    company: {
      name: '',
      website: '',
      logo: null
    },
    description: '',
    location: '',
    jobType: 'Full-time',
    applicationLink: '',
    deadline: '',
    salary: {
      min: '',
      max: '',
      currency: 'INR'
    },
    stipend: {
      amount: '',
      currency: 'INR'
    },
    eligibility: {
      minCGPA: '',
      maxBacklogs: '',
      departments: [],
      graduationYears: []
    },
    postingType: 'Specific Departments',
    targetDepartments: [],
    requirements: '',
    benefits: '',
    status: 'Draft'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];
  const currencies = ['INR', 'USD', 'EUR', 'GBP'];

  useEffect(() => {
    if (open) {
      fetchDepartments();
    }
  }, [open, fetchDepartments]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.company.name.trim()) newErrors['company.name'] = 'Company name is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.applicationLink.trim()) newErrors.applicationLink = 'Application link is required';
    if (!formData.deadline) newErrors.deadline = 'Application deadline is required';
    
    if (formData.deadline && new Date(formData.deadline) <= new Date()) {
      newErrors.deadline = 'Deadline must be in the future';
    }

    if (formData.postingType === 'Specific Departments' && formData.targetDepartments.length === 0) {
      newErrors.targetDepartments = 'Please select at least one department';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const jobData = {
        ...formData,
        salary: formData.salary.min || formData.salary.max ? formData.salary : null,
        stipend: formData.stipend.amount ? formData.stipend : null
      };

      await createJob(jobData, formData.company.logo, []);
      
      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (error) {
      console.error('Error creating job:', error);
      setErrors({ submit: error.message || 'Failed to create job' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      company: {
        name: '',
        website: '',
        logo: null
      },
      description: '',
      location: '',
      jobType: 'Full-time',
      applicationLink: '',
      deadline: '',
      salary: {
        min: '',
        max: '',
        currency: 'INR'
      },
      stipend: {
        amount: '',
        currency: 'INR'
      },
      eligibility: {
        minCGPA: '',
        maxBacklogs: '',
        departments: [],
        graduationYears: []
      },
      postingType: 'Specific Departments',
      targetDepartments: [],
      requirements: '',
      benefits: '',
      status: 'Draft'
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 800,
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: '8px',
          overflow: 'auto'
        }}>
          <MDTypography variant="h4" mb={3}>
            Create New Job
          </MDTypography>

          {errors.submit && (
            <MDBox mb={2} p={2} bgcolor="error.main" borderRadius="4px">
              <MDTypography variant="body2" color="white">
                {errors.submit}
              </MDTypography>
            </MDBox>
          )}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <MDTypography variant="h6" mb={2}>Basic Information</MDTypography>
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
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Website"
                value={formData.company.website}
                onChange={(e) => handleInputChange('company.website', e.target.value)}
                placeholder="https://company.com"
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
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
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
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
              <MDTypography variant="h6" mt={2} mb={2}>Compensation</MDTypography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Minimum Salary"
                type="number"
                value={formData.salary.min}
                onChange={(e) => handleInputChange('salary.min', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Maximum Salary"
                type="number"
                value={formData.salary.max}
                onChange={(e) => handleInputChange('salary.max', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
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
              <Divider />
              <MDTypography variant="h6" mt={2} mb={2}>Target Departments</MDTypography>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
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
                <FormControl fullWidth error={!!errors.targetDepartments}>
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
                    <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                      {errors.targetDepartments}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider />
              <MDTypography variant="h6" mt={2} mb={2}>Job Status</MDTypography>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
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

          <MDBox mt={4} display="flex" justifyContent="flex-end" gap={2}>
            <MDButton variant="outlined" color="secondary" onClick={handleClose}>
              Cancel
            </MDButton>
            <MDButton 
              variant="gradient" 
              color="info" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Job'}
            </MDButton>
          </MDBox>
        </Box>
      </Modal>
  );
};

export default CreateJobModal;
