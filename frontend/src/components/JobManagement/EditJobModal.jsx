import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Alert
} from '@mui/material';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';
import { useJob } from 'context/JobContext';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const WORK_MODES = ['On-site', 'Remote', 'Hybrid'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];
const PERIODS = ['Annual', 'Monthly', 'Hourly'];
const STATUSES = ['Draft', 'Active', 'Closed', 'Expired'];

const EditJobModal = ({ open, onClose, onSuccess, job }) => {
  const { updateJob } = useJob();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    company: {
      name: '',
      website: '',
      size: ''
    },
    location: '',
    workMode: '',
    jobType: '',
    salary: {
      min: '',
      max: '',
      currency: 'INR',
      period: 'Annual'
    },
    deadline: '',
    status: '',
    description: ''
  });

  useEffect(() => {
    if (job && open) {
      setFormData({
        title: job.title || '',
        company: {
          name: job.company?.name || '',
          website: job.company?.website || '',
          size: job.company?.size || ''
        },
        location: job.location || '',
        workMode: job.workMode || 'On-site',
        jobType: job.jobType || 'Full-time',
        salary: {
          min: job.salary?.min || '',
          max: job.salary?.max || '',
          currency: job.salary?.currency || 'INR',
          period: job.salary?.period || 'Annual'
        },
        deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
        status: job.status || 'Draft',
        description: job.description || ''
      });
      setError('');
    }
  }, [job, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
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
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const updatedJob = await updateJob(job._id, formData);

      if (onSuccess) {
        onSuccess(updatedJob);
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        maxHeight: '90vh',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        overflowY: 'auto'
      }}>
        <Typography variant="h5" component="h2" mb={3} fontWeight="bold">
          Edit Job
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Info */}
          <Grid item xs={12}>
            <MDTypography variant="h6" color="text">Basic Information</MDTypography>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              size="small"
              fullWidth
              label="Job Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              size="small"
              fullWidth
              label="Company Name"
              name="company.name"
              value={formData.company.name}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              size="small"
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Work Mode</InputLabel>
              <Select
                name="workMode"
                value={formData.workMode}
                onChange={handleChange}
                label="Work Mode"
              >
                {WORK_MODES.map(mode => (
                  <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Job Type</InputLabel>
              <Select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                label="Job Type"
              >
                {JOB_TYPES.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              size="small"
              fullWidth
              label="Application Deadline"
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Salary Info */}
          <Grid item xs={12}>
            <MDTypography variant="h6" color="text" mt={2}>Compensation</MDTypography>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                name="salary.currency"
                value={formData.salary.currency}
                onChange={handleChange}
                label="Currency"
              >
                {CURRENCIES.map(curr => (
                  <MenuItem key={curr} value={curr}>{curr}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              size="small"
              fullWidth
              label="Min Salary"
              name="salary.min"
              type="number"
              value={formData.salary.min}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              size="small"
              fullWidth
              label="Max Salary"
              name="salary.max"
              type="number"
              value={formData.salary.max}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Period</InputLabel>
              <Select
                name="salary.period"
                value={formData.salary.period}
                onChange={handleChange}
                label="Period"
              >
                {PERIODS.map(period => (
                  <MenuItem key={period} value={period}>{period}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Other Info */}
          <Grid item xs={12}>
            <MDTypography variant="h6" color="text" mt={2}>Details</MDTypography>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                {STATUSES.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>

        </Grid>

        <MDBox mt={4} display="flex" justifyContent="flex-end" gap={2}>
          <MDButton
            variant="outlined"
            color="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </MDButton>
          <MDButton
            variant="gradient"
            color="info"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Job'}
          </MDButton>
        </MDBox>
      </Box>
    </Modal>
  );
};

export default EditJobModal;
