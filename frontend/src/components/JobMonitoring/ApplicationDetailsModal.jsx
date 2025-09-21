import React from 'react';
import { Modal, Box, Typography, Grid, Chip, Divider, Avatar } from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Grade as GradeIcon,
  Schedule as DateIcon,
  Assignment as StatusIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';
import MDBadge from 'components/MDBadge';

// Services
import { getApplicationStatusColor } from 'services/jobService';

const ApplicationDetailsModal = ({ open, onClose, application }) => {
  if (!application) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const student = application.student || {};
  const personalInfo = student.personalInfo || {};
  const academic = student.academic || {};

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
                <MDBox display="flex" alignItems="center" gap={2} mb={1}>
                  <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
                    <MDTypography variant="h6" color="white">
                      {getInitials(personalInfo.fullName)}
                    </MDTypography>
                  </Avatar>
                  <MDBox>
                    <MDTypography variant="h4" fontWeight="medium">
                      {personalInfo.fullName || 'Unknown Student'}
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      Application #{application._id?.slice(-8) || 'N/A'}
                    </MDTypography>
                  </MDBox>
                </MDBox>
                <MDBadge
                  badgeContent={application.status || 'Unknown'}
                  color={getApplicationStatusColor(application.status)}
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

          {/* Personal Information */}
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Personal Information
            </MDTypography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <PersonIcon fontSize="small" color="info" />
                  <MDTypography variant="body2" fontWeight="medium">
                    Full Name:
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    {personalInfo.fullName || 'Not provided'}
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <EmailIcon fontSize="small" color="info" />
                  <MDTypography variant="body2" fontWeight="medium">
                    Email:
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    {personalInfo.email || 'Not provided'}
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <PhoneIcon fontSize="small" color="info" />
                  <MDTypography variant="body2" fontWeight="medium">
                    Phone:
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    {personalInfo.phone || 'Not provided'}
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <SchoolIcon fontSize="small" color="info" />
                  <MDTypography variant="body2" fontWeight="medium">
                    Student ID:
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    {student.studentId || 'Not provided'}
                  </MDTypography>
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>

          <Divider sx={{ my: 2 }} />

          {/* Academic Information */}
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Academic Information
            </MDTypography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <SchoolIcon fontSize="small" color="info" />
                  <MDTypography variant="body2" fontWeight="medium">
                    Department:
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    {student.department?.name || 'Not specified'}
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <GradeIcon fontSize="small" color="info" />
                  <MDTypography variant="body2" fontWeight="medium">
                    CGPA:
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    {academic.cgpa || 'Not specified'}
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <GradeIcon fontSize="small" color="info" />
                  <MDTypography variant="body2" fontWeight="medium">
                    Current Semester:
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    {academic.currentSemester || 'Not specified'}
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <GradeIcon fontSize="small" color="info" />
                  <MDTypography variant="body2" fontWeight="medium">
                    Year of Study:
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    {academic.yearOfStudy || 'Not specified'}
                  </MDTypography>
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>

          <Divider sx={{ my: 2 }} />

          {/* Application Details */}
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Application Details
            </MDTypography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <DateIcon fontSize="small" color="info" />
                  <MDTypography variant="body2" fontWeight="medium">
                    Applied Date:
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    {formatDate(application.appliedAt)}
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <DateIcon fontSize="small" color="info" />
                  <MDTypography variant="body2" fontWeight="medium">
                    Response Date:
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    {formatDate(application.responseAt)}
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <StatusIcon fontSize="small" color="info" />
                  <MDTypography variant="body2" fontWeight="medium">
                    Status:
                  </MDTypography>
                  <MDBadge
                    badgeContent={application.status || 'Unknown'}
                    color={getApplicationStatusColor(application.status)}
                    variant="gradient"
                    size="sm"
                  />
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <DescriptionIcon fontSize="small" color="info" />
                  <MDTypography variant="body2" fontWeight="medium">
                    Has Applied:
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    {application.hasApplied ? 'Yes' : 'No'}
                  </MDTypography>
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>

          {/* Notes */}
          {application.notes && (
            <MDBox mb={3}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Notes
              </MDTypography>
              <MDBox p={2} sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
                <MDTypography variant="body2" color="text" sx={{ whiteSpace: 'pre-line' }}>
                  {application.notes}
                </MDTypography>
              </MDBox>
            </MDBox>
          )}

          {/* Additional Information */}
          <MDBox>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Additional Information
            </MDTypography>
            <MDBox p={2} sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
              <MDTypography variant="body2" color="text">
                <strong>Application ID:</strong> {application._id || 'N/A'}
              </MDTypography>
              <MDTypography variant="body2" color="text">
                <strong>Created:</strong> {formatDate(application.createdAt)}
              </MDTypography>
              <MDTypography variant="body2" color="text">
                <strong>Last Updated:</strong> {formatDate(application.updatedAt)}
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Box>
    </Modal>
  );
};

export default ApplicationDetailsModal;
