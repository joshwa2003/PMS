import React from 'react';
import { Modal, Box, Typography, Grid, Chip, Divider } from '@mui/material';
import {
  Business as CompanyIcon,
  LocationOn as LocationIcon,
  Schedule as DeadlineIcon,
  AttachMoney as SalaryIcon,
  Description as DescriptionIcon,
  Assignment as RequirementsIcon,
  Work as JobTypeIcon,
  Email as ContactIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';
import MDBadge from 'components/MDBadge';

// Services
import { formatSalary, getJobStatusColor } from 'services/jobService';

const JobDetailsModal = ({ open, onClose, job }) => {
  if (!job) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilDeadline = (deadline) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `${diffDays} days left`;
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', md: '80%', lg: '70%' },
        maxHeight: '90vh',
        bgcolor: 'background.paper',
        boxShadow: 24,
        borderRadius: 2,
        overflow: 'auto'
      }}>
        <MDBox p={4}>
          {/* Header */}
          <MDBox mb={3}>
            <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <MDBox>
                <MDTypography variant="h4" fontWeight="medium" mb={1}>
                  {job.title}
                </MDTypography>
                <MDBox display="flex" alignItems="center" gap={2} mb={1}>
                  <MDBox display="flex" alignItems="center" gap={0.5}>
                    <CompanyIcon fontSize="small" color="info" />
                    <MDTypography variant="body2" color="text">
                      {job.company?.name || 'N/A'}
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" alignItems="center" gap={0.5}>
                    <LocationIcon fontSize="small" color="info" />
                    <MDTypography variant="body2" color="text">
                      {job.location || 'N/A'}
                    </MDTypography>
                  </MDBox>
                </MDBox>
                <MDBadge
                  badgeContent={job.status || 'Unknown'}
                  color={getJobStatusColor(job.status)}
                  variant="gradient"
                  size="lg"
                />
              </MDBox>
              <MDButton variant="outlined" color="secondary" onClick={onClose}>
                Close
              </MDButton>
            </MDBox>
          </MDBox>

          <Divider sx={{ my: 2 }} />

          {/* Job Overview */}
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Job Overview
            </MDTypography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <DeadlineIcon fontSize="small" color="warning" />
                  <MDTypography variant="body2" fontWeight="medium">
                    Deadline:
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    {formatDate(job.deadline)} ({getDaysUntilDeadline(job.deadline)})
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <JobTypeIcon fontSize="small" color="info" />
                  <MDTypography variant="body2" fontWeight="medium">
                    Job Type:
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    {job.jobType || 'Not specified'}
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <SalaryIcon fontSize="small" color="success" />
                  <MDTypography variant="body2" fontWeight="medium">
                    Salary:
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    {formatSalary(job.salary)}
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <ContactIcon fontSize="small" color="info" />
                  <MDTypography variant="body2" fontWeight="medium">
                    Contact:
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    {job.contactEmail || 'Not specified'}
                  </MDTypography>
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>

          <Divider sx={{ my: 2 }} />

          {/* Job Description */}
          <MDBox mb={3}>
            <MDBox display="flex" alignItems="center" gap={1} mb={2}>
              <DescriptionIcon fontSize="small" color="info" />
              <MDTypography variant="h6" fontWeight="medium">
                Job Description
              </MDTypography>
            </MDBox>
            <MDTypography variant="body2" color="text" sx={{ whiteSpace: 'pre-line' }}>
              {job.description || 'No description provided.'}
            </MDTypography>
          </MDBox>

          {/* Job Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <MDBox mb={3}>
              <MDBox display="flex" alignItems="center" gap={1} mb={2}>
                <RequirementsIcon fontSize="small" color="info" />
                <MDTypography variant="h6" fontWeight="medium">
                  Requirements
                </MDTypography>
              </MDBox>
              <MDBox>
                {job.requirements.map((requirement, index) => (
                  <Chip
                    key={index}
                    label={requirement}
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </MDBox>
            </MDBox>
          )}

          {/* Additional Information */}
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Additional Information
            </MDTypography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <MDTypography variant="body2" color="text">
                  <strong>Posted:</strong> {formatDate(job.createdAt)}
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="body2" color="text">
                  <strong>Last Updated:</strong> {formatDate(job.updatedAt)}
                </MDTypography>
              </Grid>
              {job.benefits && (
                <Grid item xs={12}>
                  <MDTypography variant="body2" color="text">
                    <strong>Benefits:</strong> {job.benefits}
                  </MDTypography>
                </Grid>
              )}
            </Grid>
          </MDBox>

          {/* Statistics */}
          {job.stats && (
            <>
              <Divider sx={{ my: 2 }} />
              <MDBox>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Engagement Statistics
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <MDBox textAlign="center" p={2} sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
                      <MDTypography variant="h4" color="info" fontWeight="medium">
                        {job.stats.totalViews || 0}
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        Total Views
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <MDBox textAlign="center" p={2} sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
                      <MDTypography variant="h4" color="success" fontWeight="medium">
                        {job.stats.totalApplications || 0}
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        Applications
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <MDBox textAlign="center" p={2} sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
                      <MDTypography variant="h4" color="warning" fontWeight="medium">
                        {job.stats.totalViews > 0
                          ? ((job.stats.totalApplications || 0) / job.stats.totalViews * 100).toFixed(1)
                          : 0}%
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        Conversion Rate
                      </MDTypography>
                    </MDBox>
                  </Grid>
                </Grid>
              </MDBox>
            </>
          )}
        </MDBox>
      </Box>
    </Modal>
  );
};

export default JobDetailsModal;
