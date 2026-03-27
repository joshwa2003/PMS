import React from 'react';
import PropTypes from 'prop-types';

// @mui material components
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

// @mui icons
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import PersonIcon from '@mui/icons-material/Person';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';



import { useMaterialUIController } from "context";

const StatCard = ({ title, value, total, icon, color, percentage, darkMode }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: darkMode ? '#FFFFFF' : 'text.secondary',
              opacity: darkMode ? 0.8 : 1
            }}
            gutterBottom
          >
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" color={color}>
            {value}
            {total && (
              <Typography
                component="span"
                variant="body1"
                sx={{
                  color: darkMode ? '#FFFFFF' : 'text.secondary',
                  opacity: darkMode ? 0.6 : 1
                }}
              >
                /{total}
              </Typography>
            )}
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : `${color}.100`,
            borderRadius: 2,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {React.cloneElement(icon, {
            sx: { color: darkMode ? '#FFFFFF' : `${color}.600`, fontSize: 24 }
          })}
        </Box>
      </Box>

      {percentage !== undefined && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography
              variant="body2"
              sx={{
                color: darkMode ? '#FFFFFF' : 'text.secondary',
                opacity: darkMode ? 0.8 : 1
              }}
            >
              Progress
            </Typography>
            <Typography variant="body2" fontWeight="medium" sx={{ color: darkMode ? '#FFFFFF' : color }}>
              {percentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: `${color}.main`,
                borderRadius: 3
              }
            }}
          />
        </Box>
      )}
    </CardContent>
  </Card>
);

const DepartmentStaffStats = ({ stats, department }) => {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  if (!stats) {
    return null;
  }

  // Calculate percentages
  const activePercentage = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;
  const emailSentPercentage = stats.total > 0 ? Math.round((stats.emailSent / stats.total) * 100) : 0;
  const roleAssignedPercentage = stats.total > 0 ? Math.round((stats.roleAssigned / stats.total) * 100) : 0;
  const verifiedPercentage = stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0;

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDTypography
          variant="h6"
          fontWeight="medium"
          sx={{ color: darkMode ? '#FFFFFF' : 'text.primary' }}
        >
          Department Statistics - {department?.name || 'Department'}
        </MDTypography>
        <MDTypography
          variant="body2"
          sx={{
            color: darkMode ? '#FFFFFF' : 'text.primary',
            opacity: darkMode ? 0.8 : 1
          }}
        >
          Overview of staff members and their current status
        </MDTypography>
      </MDBox>

      <Grid container spacing={3}>
        {/* Total Staff */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Staff"
            value={stats.total}
            icon={<GroupIcon />}
            color="primary"
            darkMode={darkMode}
          />
        </Grid>

        {/* Active Staff */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Staff"
            value={stats.active}
            total={stats.total}
            icon={<CheckCircleIcon />}
            color="success"
            percentage={activePercentage}
            darkMode={darkMode}
          />
        </Grid>

        {/* Roles Assigned */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Roles Assigned"
            value={stats.roleAssigned}
            total={stats.total}
            icon={<AssignmentIndIcon />}
            color="info"
            percentage={roleAssignedPercentage}
            darkMode={darkMode}
          />
        </Grid>

        {/* Emails Sent */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Emails Sent"
            value={stats.emailSent}
            total={stats.total}
            icon={<EmailIcon />}
            color="warning"
            percentage={emailSentPercentage}
            darkMode={darkMode}
          />
        </Grid>

        {/* Verified Accounts */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Verified Accounts"
            value={stats.verified}
            total={stats.total}
            icon={<CheckCircleIcon />}
            color="success"
            percentage={verifiedPercentage}
            darkMode={darkMode}
          />
        </Grid>

        {/* Pending Actions */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Actions"
            value={stats.rolePending + stats.emailPending}
            icon={<PendingIcon />}
            color="error"
            darkMode={darkMode}
          />
        </Grid>

        {/* Role Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <MDTypography
                variant="h6"
                fontWeight="medium"
                mb={3}
                sx={{ color: darkMode ? '#FFFFFF' : 'text.primary' }}
              >
                Role Distribution
              </MDTypography>

              <Box>
                {/* Placement Staff */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center">
                    <SupportAgentIcon sx={{ mr: 2, color: darkMode ? '#FFFFFF' : 'info.main' }} />
                    <Typography variant="body1" sx={{ color: darkMode ? '#FFFFFF' : 'text.primary' }}>
                      Placement Staff
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h6" fontWeight="medium" color="info.main">
                      {stats.byRole.placement_staff}
                    </Typography>
                  </Box>
                </Box>

                {/* Department HOD */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center">
                    <SupervisorAccountIcon sx={{ mr: 2, color: darkMode ? '#FFFFFF' : 'success.main' }} />
                    <Typography variant="body1" sx={{ color: darkMode ? '#FFFFFF' : 'text.primary' }}>
                      Department HOD
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h6" fontWeight="medium" color="success.main">
                      {stats.byRole.department_hod}
                    </Typography>
                  </Box>
                </Box>

                {/* Other Staff */}
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <PersonIcon sx={{ mr: 2, color: darkMode ? '#FFFFFF' : 'secondary.main' }} />
                    <Typography variant="body1" sx={{ color: darkMode ? '#FFFFFF' : 'text.primary' }}>
                      Other Staff
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h6" fontWeight="medium" color="secondary.main">
                      {stats.byRole.other_staff}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Overview */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <MDTypography
                variant="h6"
                fontWeight="medium"
                mb={3}
                sx={{ color: darkMode ? '#FFFFFF' : 'text.primary' }}
              >
                Status Overview
              </MDTypography>

              <Box>
                {/* Active vs Inactive */}
                <Box mb={3}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: darkMode ? '#FFFFFF' : 'text.secondary',
                      opacity: darkMode ? 0.8 : 1
                    }}
                    gutterBottom
                  >
                    Account Status
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" sx={{ color: darkMode ? '#FFFFFF' : 'text.primary' }}>Active</Typography>
                    <Typography variant="body2" fontWeight="medium" color="success.main">
                      {stats.active}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: darkMode ? '#FFFFFF' : 'text.primary' }}>Inactive</Typography>
                    <Typography variant="body2" fontWeight="medium" color="error.main">
                      {stats.inactive}
                    </Typography>
                  </Box>
                </Box>

                {/* Email Status */}
                <Box mb={3}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: darkMode ? '#FFFFFF' : 'text.secondary',
                      opacity: darkMode ? 0.8 : 1
                    }}
                    gutterBottom
                  >
                    Email Status
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" sx={{ color: darkMode ? '#FFFFFF' : 'text.primary' }}>Sent</Typography>
                    <Typography variant="body2" fontWeight="medium" color="success.main">
                      {stats.emailSent}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: darkMode ? '#FFFFFF' : 'text.primary' }}>Pending</Typography>
                    <Typography variant="body2" fontWeight="medium" color="warning.main">
                      {stats.emailPending}
                    </Typography>
                  </Box>
                </Box>

                {/* Verification Status */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: darkMode ? '#FFFFFF' : 'text.secondary',
                      opacity: darkMode ? 0.8 : 1
                    }}
                    gutterBottom
                  >
                    Verification Status
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" sx={{ color: darkMode ? '#FFFFFF' : 'text.primary' }}>Verified</Typography>
                    <Typography variant="body2" fontWeight="medium" color="success.main">
                      {stats.verified}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: darkMode ? '#FFFFFF' : 'text.primary' }}>Unverified</Typography>
                    <Typography variant="body2" fontWeight="medium" color="warning.main">
                      {stats.unverified}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
};

DepartmentStaffStats.propTypes = {
  stats: PropTypes.shape({
    total: PropTypes.number.isRequired,
    active: PropTypes.number.isRequired,
    inactive: PropTypes.number.isRequired,
    verified: PropTypes.number.isRequired,
    unverified: PropTypes.number.isRequired,
    emailSent: PropTypes.number.isRequired,
    emailPending: PropTypes.number.isRequired,
    roleAssigned: PropTypes.number.isRequired,
    rolePending: PropTypes.number.isRequired,
    byRole: PropTypes.shape({
      placement_staff: PropTypes.number.isRequired,
      department_hod: PropTypes.number.isRequired,
      other_staff: PropTypes.number.isRequired
    }).isRequired
  }),
  department: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    code: PropTypes.string
  })
};

export default DepartmentStaffStats;
