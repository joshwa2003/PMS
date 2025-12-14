import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepIcon,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Divider,
  Typography,
  FormControlLabel,
  Checkbox,
  IconButton,
  Button,
  Box
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  AttachMoney as AttachMoneyIcon,
  Group as GroupIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';
import GoogleDrivePreview from 'components/GoogleDrivePreview';

// Custom components
import BatchSelector from 'components/BatchSelector';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';

// Context
import { useJob } from 'context/JobContext';

const CreateJobPageEnhanced = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { createJob, updateJob, fetchJobById, departments, fetchDepartments } = useJob();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [documents, setDocuments] = useState([]);
  const [companyLogo, setCompanyLogo] = useState(null);

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
    deadlineDate: '',
    deadlineTime: '23:59',
    googleDriveLink: '',
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
    targetBatches: [],
    status: 'Draft'
  });

  const steps = [
    { label: 'Basic Info', icon: <BusinessIcon /> },
    { label: 'Job Details', icon: <WorkIcon /> },
    { label: 'Requirements & Skills', icon: <WorkIcon /> },
    { label: 'Compensation', icon: <AttachMoneyIcon /> },
    { label: 'Target Departments', icon: <GroupIcon /> },
    { label: 'Review', icon: <PreviewIcon /> }
  ];

  const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];
  const currencies = ['INR', 'USD', 'EUR', 'GBP'];
  const workModes = ['Work from office', 'Work from home', 'Hybrid'];
  const startDateOptions = ['Immediately', 'Within 1 month', 'Within 2 months', 'Within 3 months', 'Flexible'];
  const companySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
  const salaryPeriods = ['Annual', 'Monthly', 'Hourly'];
  const stipendPeriods = ['Monthly', 'Weekly', 'Daily'];

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    const loadJobDetails = async () => {
      if (jobId) {
        try {
          const job = await fetchJobById(jobId);
          if (job) {
            setFormData({
              title: job.title || '',
              company: {
                name: job.company?.name || '',
                website: job.company?.website || '',
                logo: job.company?.logo || null,
                about: job.company?.about || '',
                size: job.company?.size || '',
                industry: job.company?.industry || '',
                founded: job.company?.founded || ''
              },
              description: job.description || '',
              keyResponsibilities: job.keyResponsibilities?.length ? job.keyResponsibilities : [''],
              requirements: job.requirements?.length ? job.requirements : [''],
              skillsRequired: job.skillsRequired?.length ? job.skillsRequired : [''],
              otherRequirements: job.otherRequirements?.length ? job.otherRequirements : [''],
              location: job.location || '',
              workMode: job.workMode || 'Work from office',
              jobType: job.jobType || 'Full-time',
              startDate: job.startDate || 'Immediately',
              applicationLink: job.applicationLink || '',
              deadline: '', // Will be set by deadlineDate + deadlineTime
              deadlineDate: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
              deadlineTime: job.deadline ? new Date(job.deadline).toTimeString().substring(0, 5) : '23:59',
              googleDriveLink: job.googleDriveLink || '',
              salary: {
                min: job.salary?.min || '',
                max: job.salary?.max || '',
                currency: job.salary?.currency || 'INR',
                period: job.salary?.period || 'Annual'
              },
              stipend: {
                amount: job.stipend?.amount || '',
                currency: job.stipend?.currency || 'INR',
                period: job.stipend?.period || 'Monthly'
              },
              probation: {
                hasProbation: job.probation?.hasProbation || false,
                duration: job.probation?.duration || '',
                salary: {
                  min: job.probation?.salary?.min || '',
                  max: job.probation?.salary?.max || '',
                  currency: job.probation?.salary?.currency || 'INR',
                  period: job.probation?.salary?.period || 'Monthly'
                }
              },
              numberOfOpenings: job.numberOfOpenings || 1,
              workEnvironmentRequirements: job.workEnvironmentRequirements?.length ? job.workEnvironmentRequirements : [''],
              benefits: job.benefits?.length ? job.benefits : [''],
              educationQualifications: job.educationQualifications?.length ? job.educationQualifications : [''],
              eligibility: {
                minCGPA: job.eligibility?.minCGPA || '',
                maxBacklogs: job.eligibility?.maxBacklogs || '',
                departments: job.eligibility?.departments || [],
                graduationYears: job.eligibility?.graduationYears || [],
                experience: {
                  min: job.eligibility?.experience?.min || 0,
                  max: job.eligibility?.experience?.max || ''
                }
              },
              postingType: job.postingType || 'Specific Departments',
              targetDepartments: job.targetDepartments || [],
              targetBatches: job.targetBatches || [],
              status: job.status || 'Draft'
            });
          }
        } catch (error) {
          console.error("Failed to fetch job details:", error);
          setErrors({ submit: "Failed to load job details" });
        }
      }
    };
    loadJobDetails();
  }, [jobId, fetchJobById]);

  // Helper function to combine date and time into ISO string
  const combineDateAndTime = (date, time) => {
    if (!date || !time) return '';
    const dateTimeString = `${date}T${time}:00`;
    return new Date(dateTimeString).toISOString();
  };

  // Helper function to format time in 12-hour format for display
  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

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

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const keys = field.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData(prev => {
        const newData = {
          ...prev,
          [field]: value
        };

        // If updating deadlineDate or deadlineTime, combine them to create deadline
        if (field === 'deadlineDate' || field === 'deadlineTime') {
          const date = field === 'deadlineDate' ? value : prev.deadlineDate;
          const time = field === 'deadlineTime' ? value : prev.deadlineTime;
          newData.deadline = combineDateAndTime(date, time);
        }

        return newData;
      });
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
      case 0: // Basic Info
        if (!formData.title.trim()) newErrors.title = 'Job title is required';
        if (!formData.company.name.trim()) newErrors['company.name'] = 'Company name is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.applicationLink.trim()) newErrors.applicationLink = 'Application link is required';
        if (!formData.deadlineDate) newErrors.deadlineDate = 'Application deadline date is required';
        if (!formData.deadlineTime) newErrors.deadlineTime = 'Application deadline time is required';
        if (formData.deadlineDate && formData.deadlineTime) {
          const combinedDeadline = combineDateAndTime(formData.deadlineDate, formData.deadlineTime);
          if (new Date(combinedDeadline) <= new Date()) {
            newErrors.deadline = 'Deadline must be in the future';
          }
        }
        break;

      case 1: // Job Details
        if (!formData.description.trim()) newErrors.description = 'Job description is required';
        if (formData.numberOfOpenings < 1) newErrors.numberOfOpenings = 'Number of openings must be at least 1';
        break;

      case 2: // Requirements & Skills
        // Optional validation for requirements
        break;

      case 3: // Compensation
        if (formData.probation.hasProbation && !formData.probation.duration) {
          newErrors['probation.duration'] = 'Probation duration is required';
        }
        break;

      case 4: // Target Departments
        if (formData.postingType === 'Specific Departments' && formData.targetDepartments.length === 0) {
          newErrors.targetDepartments = 'Please select at least one department';
        }
        if (formData.postingType === 'Specific Batches') {
          if (formData.targetDepartments.length === 0) {
            newErrors.targetDepartments = 'Please select at least one department first';
          }
          if (formData.targetBatches.length === 0) {
            newErrors.targetBatches = 'Please select at least one batch';
          }
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
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async (isDraft = false) => {
    if (!validateStep(activeStep) && !isDraft) return;

    setLoading(true);
    try {
      // Helper to clean values (empty strings, null, undefined -> undefined)
      const cleanValue = (val) => (val === '' || val === null || val === undefined) ? undefined : val;

      const combinedDeadline = (formData.deadlineDate && formData.deadlineTime)
        ? combineDateAndTime(formData.deadlineDate, formData.deadlineTime)
        : undefined;

      const jobData = {
        ...formData,
        status: isDraft ? 'Draft' : formData.status,
        deadline: combinedDeadline,
        company: {
          ...formData.company,
          founded: cleanValue(formData.company.founded),
          size: cleanValue(formData.company.size),
          industry: cleanValue(formData.company.industry)
        },
        salary: {
          ...formData.salary,
          min: cleanValue(formData.salary.min),
          max: cleanValue(formData.salary.max)
        },
        stipend: {
          ...formData.stipend,
          amount: cleanValue(formData.stipend.amount)
        },
        probation: {
          ...formData.probation,
          duration: cleanValue(formData.probation.duration),
          salary: {
            ...formData.probation.salary,
            min: cleanValue(formData.probation.salary.min),
            max: cleanValue(formData.probation.salary.max)
          }
        },
        eligibility: {
          ...formData.eligibility,
          minCGPA: cleanValue(formData.eligibility.minCGPA),
          maxBacklogs: cleanValue(formData.eligibility.maxBacklogs),
          experience: {
            min: cleanValue(formData.eligibility.experience.min),
            max: cleanValue(formData.eligibility.experience.max)
          }
        },
        numberOfOpenings: cleanValue(formData.numberOfOpenings) || 1,
        // Filter out empty array items
        keyResponsibilities: formData.keyResponsibilities.filter(item => item.trim()),
        requirements: formData.requirements.filter(item => item.trim()),
        skillsRequired: formData.skillsRequired.filter(item => item.trim()),
        otherRequirements: formData.otherRequirements.filter(item => item.trim()),
        workEnvironmentRequirements: formData.workEnvironmentRequirements.filter(item => item.trim()),
        benefits: formData.benefits.filter(item => item.trim()),
        educationQualifications: formData.educationQualifications.filter(item => item.trim())
      };

      await (jobId ? updateJob(jobId, jobData) : createJob(jobData, companyLogo, documents));
      navigate('/job-management');
    } catch (error) {
      console.error(jobId ? 'Error updating job:' : 'Error creating job:', error);
      setErrors({ submit: error.message || (jobId ? 'Failed to update job' : 'Failed to create job') });
    } finally {
      setLoading(false);
    }
  };

  const renderArrayField = (field, label, placeholder, subField = null) => (
    <MDBox mb={2}>
      <MDTypography variant="h6" mb={1}>{label}</MDTypography>
      {(subField ? formData[field][subField] : formData[field]).map((item, index) => (
        <MDBox key={index} display="flex" alignItems="center" mb={1}>
          <TextField
            fullWidth
            placeholder={placeholder}
            value={item}
            onChange={(e) => updateArrayItem(field, index, e.target.value, subField)}
            size="small"
          />
          <IconButton
            onClick={() => removeArrayItem(field, index, subField)}
            disabled={(subField ? formData[field][subField] : formData[field]).length === 1}
            color="error"
            size="small"
          >
            <RemoveIcon />
          </IconButton>
        </MDBox>
      ))}
      <MDButton
        startIcon={<AddIcon />}
        onClick={() => addArrayItem(field, subField)}
        variant="gradient"
        color="info"
        size="small"
      >
        Add {label.slice(0, -1)}
      </MDButton>
    </MDBox>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Basic Info
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDTypography variant="h5" mb={2}>Basic Job Information</MDTypography>
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
              <FormControl fullWidth>
                <InputLabel>Company Size</InputLabel>
                <Select
                  value={formData.company.size}
                  onChange={(e) => handleInputChange('company.size', e.target.value)}
                  label="Company Size"
                  sx={{ height: 45 }}
                >
                  {companySizes.map((size) => (
                    <MenuItem key={size} value={size}>{size} employees</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Industry"
                value={formData.company.industry}
                onChange={(e) => handleInputChange('company.industry', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Founded Year"
                type="number"
                value={formData.company.founded}
                onChange={(e) => handleInputChange('company.founded', e.target.value)}
                inputProps={{ min: 1800, max: new Date().getFullYear() }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="About Company"
                value={formData.company.about}
                onChange={(e) => handleInputChange('company.about', e.target.value)}
                placeholder="Brief description about the company..."
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
                <InputLabel>Work Mode</InputLabel>
                <Select
                  value={formData.workMode}
                  onChange={(e) => handleInputChange('workMode', e.target.value)}
                  label="Work Mode"
                  sx={{ height: 45 }}
                >
                  {workModes.map((mode) => (
                    <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={formData.jobType}
                  onChange={(e) => handleInputChange('jobType', e.target.value)}
                  label="Job Type"
                  sx={{ height: 45 }}
                >
                  {jobTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Start Date</InputLabel>
                <Select
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  label="Start Date"
                  sx={{ height: 45 }}
                >
                  {startDateOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Application Deadline Date"
                type="date"
                value={formData.deadlineDate || ''}
                onChange={(e) => handleInputChange('deadlineDate', e.target.value)}
                error={!!errors.deadlineDate}
                helperText={errors.deadlineDate}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                InputProps={{ sx: { height: 45 } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Application Deadline Time"
                type="time"
                value={formData.deadlineTime || '23:59'}
                onChange={(e) => handleInputChange('deadlineTime', e.target.value)}
                error={!!errors.deadlineTime}
                helperText={errors.deadlineTime || `Time in 12-hour format: ${formatTime12Hour(formData.deadlineTime)}`}
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{ sx: { height: 45 } }}
              />
            </Grid>

            {errors.deadline && (
              <Grid item xs={12}>
                <MDTypography variant="caption" color="error">
                  {errors.deadline}
                </MDTypography>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Number of Openings"
                type="number"
                value={formData.numberOfOpenings}
                onChange={(e) => handleInputChange('numberOfOpenings', parseInt(e.target.value) || 1)}
                error={!!errors.numberOfOpenings}
                helperText={errors.numberOfOpenings}
                inputProps={{ min: 1 }}
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
          </Grid>
        );

      case 1: // Job Details
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDTypography variant="h5" mb={2}>Job Details</MDTypography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Job Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                placeholder="Detailed description about the job role..."
                required
              />
            </Grid>

            {/* Google Drive Link Input */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Google Drive Link (optional)"
                value={formData.googleDriveLink || ''}
                onChange={(e) => handleInputChange('googleDriveLink', e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                variant="outlined"
              />
            </Grid>

            {/* File Upload Input Removed */}

            <Grid item xs={12}>
              {renderArrayField('keyResponsibilities', 'Key Responsibilities', 'Enter a key responsibility...')}
            </Grid>

            <Grid item xs={12}>
              {renderArrayField('workEnvironmentRequirements', 'Work Environment Requirements', 'Enter a work environment requirement...')}
            </Grid>

            <Grid item xs={12}>
              {renderArrayField('benefits', 'Benefits/Perks', 'Enter a benefit or perk...')}
            </Grid>
          </Grid>
        );

      case 2: // Requirements & Skills
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDTypography variant="h5" mb={2}>Requirements & Skills</MDTypography>
            </Grid>

            <Grid item xs={12}>
              {renderArrayField('requirements', 'Requirements', 'Enter a requirement...')}
            </Grid>

            <Grid item xs={12}>
              {renderArrayField('skillsRequired', 'Skills Required', 'Enter a required skill...')}
            </Grid>

            <Grid item xs={12}>
              {renderArrayField('otherRequirements', 'Other Requirements', 'Enter other requirement...')}
            </Grid>

            <Grid item xs={12}>
              {renderArrayField('educationQualifications', 'Education Qualifications', 'Enter education qualification...')}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Experience (Years)"
                type="number"
                value={formData.eligibility.experience.min}
                onChange={(e) => handleInputChange('eligibility.experience.min', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Experience (Years)"
                type="number"
                value={formData.eligibility.experience.max}
                onChange={(e) => handleInputChange('eligibility.experience.max', parseInt(e.target.value) || '')}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum CGPA"
                type="number"
                value={formData.eligibility.minCGPA}
                onChange={(e) => handleInputChange('eligibility.minCGPA', parseFloat(e.target.value) || '')}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Backlogs Allowed"
                type="number"
                value={formData.eligibility.maxBacklogs}
                onChange={(e) => handleInputChange('eligibility.maxBacklogs', parseInt(e.target.value) || '')}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        );

      case 3: // Compensation
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDTypography variant="h5" mb={2}>Compensation Details</MDTypography>
            </Grid>

            <Grid item xs={12}>
              <MDTypography variant="h6" mb={2}>Salary</MDTypography>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Minimum Salary"
                type="number"
                value={formData.salary.min}
                onChange={(e) => handleInputChange('salary.min', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Maximum Salary"
                type="number"
                value={formData.salary.max}
                onChange={(e) => handleInputChange('salary.max', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.salary.currency}
                  onChange={(e) => handleInputChange('salary.currency', e.target.value)}
                  label="Currency"
                  sx={{ height: 45 }}
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency} value={currency}>{currency}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Period</InputLabel>
                <Select
                  value={formData.salary.period}
                  onChange={(e) => handleInputChange('salary.period', e.target.value)}
                  label="Period"
                  sx={{ height: 45 }}
                >
                  {salaryPeriods.map((period) => (
                    <MenuItem key={period} value={period}>{period}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider />
              <MDTypography variant="h6" mt={2} mb={2}>Stipend (for Internships)</MDTypography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stipend Amount"
                type="number"
                value={formData.stipend.amount}
                onChange={(e) => handleInputChange('stipend.amount', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.stipend.currency}
                  onChange={(e) => handleInputChange('stipend.currency', e.target.value)}
                  label="Currency"
                  sx={{ height: 45 }}
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency} value={currency}>{currency}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Period</InputLabel>
                <Select
                  value={formData.stipend.period}
                  onChange={(e) => handleInputChange('stipend.period', e.target.value)}
                  label="Period"
                  sx={{ height: 45 }}
                >
                  {stipendPeriods.map((period) => (
                    <MenuItem key={period} value={period}>{period}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider />
              <MDTypography variant="h6" mt={2} mb={2}>Probation Period</MDTypography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.probation.hasProbation}
                    onChange={(e) => handleInputChange('probation.hasProbation', e.target.checked)}
                  />
                }
                label="Has Probation Period"
              />
            </Grid>

            {formData.probation.hasProbation && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Probation Duration (Months)"
                    type="number"
                    value={formData.probation.duration}
                    onChange={(e) => handleInputChange('probation.duration', e.target.value)}
                    error={!!errors['probation.duration']}
                    helperText={errors['probation.duration']}
                    inputProps={{ min: 1, max: 12 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <MDTypography variant="subtitle1" mb={1}>Probation Salary</MDTypography>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Min Probation Salary"
                    type="number"
                    value={formData.probation.salary.min}
                    onChange={(e) => handleInputChange('probation.salary.min', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Max Probation Salary"
                    type="number"
                    value={formData.probation.salary.max}
                    onChange={(e) => handleInputChange('probation.salary.max', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={formData.probation.salary.currency}
                      onChange={(e) => handleInputChange('probation.salary.currency', e.target.value)}
                      label="Currency"
                      sx={{ height: 45 }}
                    >
                      {currencies.map((currency) => (
                        <MenuItem key={currency} value={currency}>{currency}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Period</InputLabel>
                    <Select
                      value={formData.probation.salary.period}
                      onChange={(e) => handleInputChange('probation.salary.period', e.target.value)}
                      label="Period"
                      sx={{ height: 45 }}
                    >
                      {stipendPeriods.map((period) => (
                        <MenuItem key={period} value={period}>{period}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
        );

      case 4: // Target Departments
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDTypography variant="h5" mb={2}>Target Departments</MDTypography>
              <MDTypography variant="caption" color="text" mb={1}>
                Current Posting Type: {formData.postingType}
              </MDTypography>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Posting Type</InputLabel>
                <Select
                  value={formData.postingType}
                  onChange={(e) => {
                    console.log('Posting type changed to:', e.target.value);
                    handleInputChange('postingType', e.target.value);
                  }}
                  label="Posting Type"
                  sx={{ height: 45 }}
                >
                  <MenuItem value="All Departments">All Departments</MenuItem>
                  <MenuItem value="Specific Departments">Specific Departments</MenuItem>
                  <MenuItem value="Specific Batches">Specific Batches</MenuItem>
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
                    input={<OutlinedInput label="Target Departments" sx={{ height: 45 }} />}
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
                    sx={{ height: 45 }}
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

            {formData.postingType === 'Specific Batches' && (
              <>
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.targetDepartments}>
                    <InputLabel>Select Departments First</InputLabel>
                    <Select
                      multiple
                      value={formData.targetDepartments}
                      onChange={(e) => {
                        handleInputChange('targetDepartments', e.target.value);
                        // Clear selected batches when departments change
                        handleInputChange('targetBatches', []);
                      }}
                      input={<OutlinedInput label="Select Departments First" sx={{ height: 45 }} />}
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
                      sx={{ height: 45 }}
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

                <Grid item xs={12}>
                  <MDTypography variant="subtitle2" fontWeight="medium" color="dark" mb={1}>
                    Select Specific Batches:
                  </MDTypography>
                  <BatchSelector
                    selectedDepartments={formData.targetDepartments}
                    selectedBatches={formData.targetBatches}
                    onBatchChange={(batches) => handleInputChange('targetBatches', batches)}
                    error={errors.targetBatches}
                  />
                  {errors.targetBatches && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                      {errors.targetBatches}
                    </Typography>
                  )}
                </Grid>
              </>
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
                  sx={{ height: 45 }}
                >
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 5: // Review
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDTypography variant="h5" mb={2}>Review Job Details</MDTypography>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <MDTypography variant="h4" mb={1}>{formData.title}</MDTypography>
                  <MDTypography variant="h6" color="text.secondary" mb={2}>
                    {formData.company.name}
                  </MDTypography>
                  <MDTypography variant="body2" mb={2}>
                    📍 {formData.location} • {formData.workMode}
                  </MDTypography>

                  <Divider sx={{ my: 2 }} />

                  <MDTypography variant="h6" mb={1}>Job Details</MDTypography>
                  <MDTypography variant="body2" mb={2}>
                    <strong>Type:</strong> {formData.jobType} • <strong>Start Date:</strong> {formData.startDate}
                  </MDTypography>
                  <MDTypography variant="body2" mb={2}>
                    <strong>Openings:</strong> {formData.numberOfOpenings} • <strong>Deadline:</strong> {formData.deadlineDate && formData.deadlineTime
                      ? `${new Date(formData.deadlineDate).toLocaleDateString()} at ${formatTime12Hour(formData.deadlineTime)}`
                      : 'Not set'
                    }
                  </MDTypography>

                  {formData.description && (
                    <>
                      <MDTypography variant="h6" mb={1}>Description</MDTypography>
                      <MDTypography variant="body2" mb={2}>
                        {formData.description}
                      </MDTypography>
                    </>
                  )}

                  {formData.keyResponsibilities.filter(item => item.trim()).length > 0 && (
                    <>
                      <MDTypography variant="h6" mb={1}>Key Responsibilities</MDTypography>
                      <ul>
                        {formData.keyResponsibilities.filter(item => item.trim()).map((item, index) => (
                          <li key={index}>
                            <MDTypography variant="body2">{item}</MDTypography>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {formData.requirements.filter(item => item.trim()).length > 0 && (
                    <>
                      <MDTypography variant="h6" mb={1}>Requirements</MDTypography>
                      <ul>
                        {formData.requirements.filter(item => item.trim()).map((item, index) => (
                          <li key={index}>
                            <MDTypography variant="body2">{item}</MDTypography>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {formData.skillsRequired.filter(item => item.trim()).length > 0 && (
                    <>
                      <MDTypography variant="h6" mb={1}>Skills Required</MDTypography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {formData.skillsRequired.filter(item => item.trim()).map((skill, index) => (
                          <Chip key={index} label={skill} size="small" />
                        ))}
                      </Box>
                    </>
                  )}

                  {(formData.salary.min || formData.salary.max) && (
                    <>
                      <MDTypography variant="h6" mb={1}>Compensation</MDTypography>
                      <MDTypography variant="body2" mb={2}>
                        {formData.salary.min && formData.salary.max
                          ? `₹${formData.salary.min} - ₹${formData.salary.max} ${formData.salary.period}`
                          : formData.salary.min
                            ? `₹${formData.salary.min}+ ${formData.salary.period}`
                            : `Up to ₹${formData.salary.max} ${formData.salary.period}`
                        }
                      </MDTypography>
                    </>
                  )}

                  {formData.probation.hasProbation && (
                    <>
                      <MDTypography variant="h6" mb={1}>Probation Period</MDTypography>
                      <MDTypography variant="body2" mb={2}>
                        Duration: {formData.probation.duration} months
                        {(formData.probation.salary.min || formData.probation.salary.max) && (
                          <span>
                            {' • Salary: '}
                            {formData.probation.salary.min && formData.probation.salary.max
                              ? `₹${formData.probation.salary.min} - ₹${formData.probation.salary.max} ${formData.probation.salary.period}`
                              : formData.probation.salary.min
                                ? `₹${formData.probation.salary.min}+ ${formData.probation.salary.period}`
                                : `Up to ₹${formData.probation.salary.max} ${formData.probation.salary.period}`
                            }
                          </span>
                        )}
                      </MDTypography>
                    </>
                  )}

                  {formData.benefits.filter(item => item.trim()).length > 0 && (
                    <>
                      <MDTypography variant="h6" mb={1}>Benefits</MDTypography>
                      <ul>
                        {formData.benefits.filter(item => item.trim()).map((benefit, index) => (
                          <li key={index}>
                            <MDTypography variant="body2">{benefit}</MDTypography>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {/* Documents and Google Drive Link Preview in Review */}
                  {(documents && documents.length > 0) || formData.googleDriveLink ? (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <MDTypography variant="h6" mb={1}>Documents & Links</MDTypography>
                      {documents && documents.length > 0 && (
                        <MDBox mb={2}>
                          <MDTypography variant="body2" mb={1}>
                            Uploaded Documents:
                          </MDTypography>
                          <ul>
                            {documents.map((file, index) => (
                              <li key={index}>
                                <MDTypography variant="body2">
                                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                </MDTypography>
                              </li>
                            ))}
                          </ul>
                        </MDBox>
                      )}
                      {formData.googleDriveLink && (
                        <MDBox mb={2}>
                          <MDTypography variant="body2">
                            Google Drive Document Preview:
                          </MDTypography>
                          <GoogleDrivePreview
                            link={formData.googleDriveLink}
                            title={`${formData.title} - Document Preview`}
                            showPreview={true}
                          />
                        </MDBox>
                      )}
                    </>
                  ) : null}

                  {formData.company.about && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <MDTypography variant="h6" mb={1}>About {formData.company.name}</MDTypography>
                      <MDTypography variant="body2" mb={2}>
                        {formData.company.about}
                      </MDTypography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {errors.submit && (
              <Grid item xs={12}>
                <MDBox p={2} bgcolor="error.main" borderRadius="4px">
                  <MDTypography variant="body2" color="white">
                    {errors.submit}
                  </MDTypography>
                </MDBox>
              </Grid>
            )}
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox mb={3}>
          <Card>
            <MDBox p={3}>
              <MDBox display="flex" alignItems="center" mb={3}>
                <IconButton onClick={() => navigate('/job-management')} sx={{ mr: 2 }}>
                  <ArrowBackIcon />
                </IconButton>
                <MDTypography variant="h4">{jobId ? 'Edit Job' : 'Create New Job'}</MDTypography>
              </MDBox>

              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      StepIconComponent={() => (
                        <StepIcon
                          icon={step.icon}
                          active={index === activeStep}
                          completed={index < activeStep}
                        />
                      )}
                    >
                      {step.label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              <MDBox>
                {renderStepContent(activeStep)}
              </MDBox>

              <MDBox mt={4} display="flex" justifyContent="space-between">
                <MDButton
                  variant="outlined"
                  color="secondary"
                  onClick={handleBack}
                  disabled={activeStep === 0}
                >
                  Back
                </MDButton>

                <MDBox display="flex" gap={2}>
                  <MDButton
                    variant="outlined"
                    color="info"
                    onClick={() => handleSubmit(true)}
                    disabled={loading}
                    startIcon={<SaveIcon />}
                  >
                    Save as Draft
                  </MDButton>

                  {activeStep === steps.length - 1 ? (
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={() => handleSubmit(false)}
                      disabled={loading}
                      startIcon={<PreviewIcon />}
                    >
                      {loading ? (jobId ? 'Updating...' : 'Creating...') : (jobId ? 'Update Job' : 'Create Job')}
                    </MDButton>
                  ) : (
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={handleNext}
                    >
                      Next
                    </MDButton>
                  )}
                </MDBox>
              </MDBox>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
};

export default CreateJobPageEnhanced;
