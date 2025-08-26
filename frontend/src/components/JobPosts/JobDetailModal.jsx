import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Chip,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  OpenInNew as OpenIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Language as WebsiteIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as SalaryIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDBadge from 'components/MDBadge';

// Services
import { formatSalary, getDaysUntilDeadline } from 'services/jobService';

const JobDetailModal = ({ open, job, onClose, onApply }) => {
  if (!job) return null;

  const daysLeft = getDaysUntilDeadline(job.deadline);
  const isUrgent = daysLeft <= 7;
  const companyLogo = job.company?.logo || null;

  const handleApply = () => {
    if (job.applicationLink) {
      window.open(job.applicationLink, '_blank');
      onApply && onApply(job);
    }
  };

  // Get job type color
  const getJobTypeColor = (type) => {
    switch (type) {
      case 'Full-time': return 'success';
      case 'Part-time': return 'info';
      case 'Internship': return 'warning';
      case 'Contract': return 'secondary';
      default: return 'primary';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 1 }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start">
          <MDBox display="flex" alignItems="center" gap={2} flex={1}>
            {companyLogo ? (
              <Avatar 
                src={companyLogo} 
                alt={job.company.name}
                sx={{ width: 64, height: 64 }}
              />
            ) : (
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                <BusinessIcon sx={{ fontSize: 32 }} />
              </Avatar>
            )}
            <MDBox flex={1}>
              <MDTypography variant="h4" fontWeight="bold" color="dark" gutterBottom>
                {job.title}
              </MDTypography>
              <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                <MDTypography variant="h6" color="info" fontWeight="medium">
                  {job.company.name}
                </MDTypography>
                {job.company.website && (
                  <IconButton 
                    size="small" 
                    onClick={() => window.open(job.company.website, '_blank')}
                    sx={{ color: 'info.main' }}
                  >
                    <WebsiteIcon fontSize="small" />
                  </IconButton>
                )}
              </MDBox>
              <MDBox display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <MDBadge 
                  badgeContent={job.jobType} 
                  color={getJobTypeColor(job.jobType)} 
                  variant="gradient" 
                  size="sm"
                />
                {isUrgent && (
                  <MDBadge 
                    badgeContent={`${daysLeft} days left`} 
                    color="error" 
                    variant="gradient" 
                    size="sm"
                  />
                )}
              </MDBox>
            </MDBox>
          </MDBox>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </MDBox>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 1 }}>
        {/* Quick Info Grid */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <MDBox display="flex" alignItems="center" gap={1}>
              <LocationIcon sx={{ color: 'info.main' }} />
              <MDBox>
                <MDTypography variant="caption" color="text" display="block">
                  Location
                </MDTypography>
                <MDTypography variant="body2" fontWeight="medium" color="dark">
                  {job.location}
                </MDTypography>
              </MDBox>
            </MDBox>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MDBox display="flex" alignItems="center" gap={1}>
              <WorkIcon sx={{ color: 'info.main' }} />
              <MDBox>
                <MDTypography variant="caption" color="text" display="block">
                  Work Mode
                </MDTypography>
                <MDTypography variant="body2" fontWeight="medium" color="dark">
                  {job.workMode || 'On-site'}
                </MDTypography>
              </MDBox>
            </MDBox>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MDBox display="flex" alignItems="center" gap={1}>
              <PeopleIcon sx={{ color: 'info.main' }} />
              <MDBox>
                <MDTypography variant="caption" color="text" display="block">
                  Openings
                </MDTypography>
                <MDTypography variant="body2" fontWeight="medium" color="dark">
                  {job.numberOfOpenings || 1} position{(job.numberOfOpenings || 1) > 1 ? 's' : ''}
                </MDTypography>
              </MDBox>
            </MDBox>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MDBox display="flex" alignItems="center" gap={1}>
              <CalendarIcon sx={{ color: 'info.main' }} />
              <MDBox>
                <MDTypography variant="caption" color="text" display="block">
                  Start Date
                </MDTypography>
                <MDTypography variant="body2" fontWeight="medium" color="dark">
                  {job.startDate || 'Immediately'}
                </MDTypography>
              </MDBox>
            </MDBox>
          </Grid>
        </Grid>

        {/* Salary Information */}
        {(job.salary?.min || job.salary?.max || job.stipend?.amount) && (
          <MDBox mb={3}>
            <MDBox display="flex" alignItems="center" gap={1} mb={1}>
              <SalaryIcon sx={{ color: 'success.main' }} />
              <MDTypography variant="h6" fontWeight="medium" color="dark">
                Compensation
              </MDTypography>
            </MDBox>
            <MDTypography variant="h5" color="success" fontWeight="bold">
              {job.salary?.min || job.salary?.max ? 
                formatSalary(job.salary) : 
                `₹${job.stipend.amount} ${job.stipend.period || 'Monthly'}`
              }
            </MDTypography>
          </MDBox>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Job Description */}
        <MDBox mb={3}>
          <MDTypography variant="h6" fontWeight="medium" color="dark" mb={2}>
            Job Description
          </MDTypography>
          <MDTypography variant="body1" color="text" sx={{ lineHeight: 1.8 }}>
            {job.description}
          </MDTypography>
        </MDBox>

        {/* Key Responsibilities */}
        {job.keyResponsibilities && job.keyResponsibilities.length > 0 && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" color="dark" mb={2}>
              Key Responsibilities
            </MDTypography>
            <List dense>
              {job.keyResponsibilities.map((responsibility, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <MDTypography variant="body2" color="text">
                        {responsibility}
                      </MDTypography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </MDBox>
        )}

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" color="dark" mb={2}>
              Requirements
            </MDTypography>
            <List dense>
              {job.requirements.map((requirement, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <MDTypography variant="body2" color="text">
                        {requirement}
                      </MDTypography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </MDBox>
        )}

        {/* Skills Required */}
        {job.skillsRequired && job.skillsRequired.length > 0 && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" color="dark" mb={2}>
              Skills Required
            </MDTypography>
            <MDBox display="flex" flexWrap="wrap" gap={1}>
              {job.skillsRequired.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  variant="outlined"
                  sx={{ 
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                    }
                  }}
                />
              ))}
            </MDBox>
          </MDBox>
        )}

        {/* Education Qualifications */}
        {job.educationQualifications && job.educationQualifications.length > 0 && (
          <MDBox mb={3}>
            <MDBox display="flex" alignItems="center" gap={1} mb={2}>
              <SchoolIcon sx={{ color: 'info.main' }} />
              <MDTypography variant="h6" fontWeight="medium" color="dark">
                Education Qualifications
              </MDTypography>
            </MDBox>
            <List dense>
              {job.educationQualifications.map((qualification, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon sx={{ color: 'info.main', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <MDTypography variant="body2" color="text">
                        {qualification}
                      </MDTypography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </MDBox>
        )}

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" color="dark" mb={2}>
              Benefits & Perks
            </MDTypography>
            <MDBox display="flex" flexWrap="wrap" gap={1}>
              {job.benefits.map((benefit, index) => (
                <Chip
                  key={index}
                  label={benefit}
                  variant="filled"
                  sx={{ 
                    backgroundColor: 'success.light',
                    color: 'success.dark',
                  }}
                />
              ))}
            </MDBox>
          </MDBox>
        )}

        {/* Company Information */}
        {job.company && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" color="dark" mb={2}>
              About {job.company.name}
            </MDTypography>
            {job.company.about && (
              <MDTypography variant="body2" color="text" mb={2} sx={{ lineHeight: 1.6 }}>
                {job.company.about}
              </MDTypography>
            )}
            <Grid container spacing={2}>
              {job.company.industry && (
                <Grid item xs={6} sm={4}>
                  <MDTypography variant="caption" color="text" display="block">
                    Industry
                  </MDTypography>
                  <MDTypography variant="body2" fontWeight="medium" color="dark">
                    {job.company.industry}
                  </MDTypography>
                </Grid>
              )}
              {job.company.size && (
                <Grid item xs={6} sm={4}>
                  <MDTypography variant="caption" color="text" display="block">
                    Company Size
                  </MDTypography>
                  <MDTypography variant="body2" fontWeight="medium" color="dark">
                    {job.company.size} employees
                  </MDTypography>
                </Grid>
              )}
              {job.company.founded && (
                <Grid item xs={6} sm={4}>
                  <MDTypography variant="caption" color="text" display="block">
                    Founded
                  </MDTypography>
                  <MDTypography variant="body2" fontWeight="medium" color="dark">
                    {job.company.founded}
                  </MDTypography>
                </Grid>
              )}
            </Grid>
          </MDBox>
        )}

        {/* Application Deadline */}
        <MDBox 
          p={2} 
          borderRadius={2} 
          sx={{ 
            backgroundColor: isUrgent ? 'error.light' : 'info.light',
            border: 1,
            borderColor: isUrgent ? 'error.main' : 'info.main',
          }}
        >
          <MDBox display="flex" alignItems="center" gap={1}>
            <TimeIcon sx={{ color: isUrgent ? 'error.main' : 'info.main' }} />
            <MDTypography variant="body2" fontWeight="medium" color="dark">
              Application Deadline: {new Date(job.deadline).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </MDTypography>
            <MDTypography 
              variant="body2" 
              color={isUrgent ? 'error' : 'info'} 
              fontWeight="bold"
            >
              ({daysLeft} days left)
            </MDTypography>
          </MDBox>
        </MDBox>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <MDButton
          variant="outlined"
          color="secondary"
          onClick={onClose}
          sx={{ mr: 1 }}
        >
          Close
        </MDButton>
        <MDButton
          variant="gradient"
          color="info"
          onClick={handleApply}
          startIcon={<OpenIcon />}
          sx={{ minWidth: 140 }}
        >
          Apply Now
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

export default JobDetailModal;
