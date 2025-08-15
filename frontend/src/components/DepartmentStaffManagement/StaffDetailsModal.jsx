import React from 'react';
import PropTypes from 'prop-types';

// @mui material components
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';

// @mui icons
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import LoginIcon from '@mui/icons-material/Login';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

// Context
import { useDepartmentStaff } from 'context/DepartmentStaffContext';

// Services
import departmentStaffService from 'services/departmentStaffService';

const StaffDetailsModal = ({ open, onClose }) => {
  const { selectedStaff } = useDepartmentStaff();

  // Get the staff member to show details for
  const staffMember = selectedStaff.length === 1 ? selectedStaff[0] : null;

  if (!staffMember) {
    return null;
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="span">
            Staff Member Details
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <MDBox>
          {/* Header with Avatar and Basic Info */}
          <Box 
            display="flex" 
            alignItems="center" 
            p={3} 
            bgcolor="grey.50" 
            borderRadius={2}
            mb={3}
          >
            <Avatar 
              sx={{ 
                mr: 3, 
                bgcolor: 'primary.main', 
                width: 80, 
                height: 80,
                fontSize: '2rem'
              }}
            >
              {staffMember.firstName?.[0]}{staffMember.lastName?.[0]}
            </Avatar>
            <Box flex={1}>
              <MDTypography variant="h4" fontWeight="medium" mb={1}>
                {staffMember.fullName}
              </MDTypography>
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                <Chip
                  label={departmentStaffService.getRoleDisplayName(staffMember.role)}
                  color={departmentStaffService.getRoleColor(staffMember.role)}
                  variant="filled"
                />
                <Chip
                  label={departmentStaffService.getStaffStatusText(staffMember)}
                  color={departmentStaffService.getStaffStatusColor(staffMember)}
                  variant="outlined"
                />
                {staffMember.emailSent && (
                  <Chip
                    icon={<EmailIcon />}
                    label="Email Sent"
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
              <Typography variant="body1" color="text.secondary">
                {staffMember.designation || 'No designation specified'}
              </Typography>
            </Box>
          </Box>

          {/* Details Grid */}
          <Grid container spacing={3}>
            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Contact Information
                  </MDTypography>
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {staffMember.email}
                      </Typography>
                    </Box>
                  </Box>

                  {staffMember.phone && (
                    <Box display="flex" alignItems="center" mb={2}>
                      <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">
                          {staffMember.phone}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {staffMember.employeeId && (
                    <Box display="flex" alignItems="center">
                      <BadgeIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Employee ID
                        </Typography>
                        <Typography variant="body1">
                          {staffMember.employeeId}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Professional Information */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Professional Information
                  </MDTypography>
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <BusinessIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Department
                      </Typography>
                      <Typography variant="body1">
                        {staffMember.departmentCode || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" mb={2}>
                    <AssignmentIndIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Role
                      </Typography>
                      <Typography variant="body1">
                        {departmentStaffService.getRoleDisplayName(staffMember.role)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center">
                    <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Designation
                      </Typography>
                      <Typography variant="body1">
                        {staffMember.designation || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Account Status */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Account Status
                  </MDTypography>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Account Status
                    </Typography>
                    <Chip
                      label={staffMember.isActive ? 'Active' : 'Inactive'}
                      color={staffMember.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Email Verification
                    </Typography>
                    <Chip
                      label={staffMember.isVerified ? 'Verified' : 'Unverified'}
                      color={staffMember.isVerified ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Welcome Email
                    </Typography>
                    <Chip
                      label={staffMember.emailSent ? 'Sent' : 'Pending'}
                      color={staffMember.emailSent ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Role Assignment
                    </Typography>
                    <Chip
                      label={staffMember.roleAssignedAt ? 'Assigned' : 'Pending'}
                      color={staffMember.roleAssignedAt ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Activity Information */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Activity Information
                  </MDTypography>
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <LoginIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Last Login
                      </Typography>
                      <Typography variant="body1">
                        {departmentStaffService.formatDate(staffMember.lastLogin)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" mb={2}>
                    <CalendarTodayIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Account Created
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(staffMember.createdAt)}
                      </Typography>
                    </Box>
                  </Box>

                  {staffMember.roleAssignedAt && (
                    <Box display="flex" alignItems="center" mb={2}>
                      <AssignmentIndIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Role Assigned
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(staffMember.roleAssignedAt)}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {staffMember.emailSentAt && (
                    <Box display="flex" alignItems="center">
                      <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Email Sent
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(staffMember.emailSentAt)}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Administrative Notes */}
            {staffMember.adminNotes && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Administrative Notes
                    </MDTypography>
                    <Typography variant="body1" color="text.secondary">
                      {staffMember.adminNotes}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </MDBox>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <MDButton
          variant="contained"
          color="primary"
          onClick={onClose}
          fullWidth
        >
          Close
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

StaffDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default StaffDetailsModal;
