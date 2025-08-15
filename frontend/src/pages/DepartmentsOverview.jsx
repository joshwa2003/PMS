import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// @mui material components
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';

// @mui icons
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import EmailIcon from '@mui/icons-material/Email';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

// Material Dashboard 2 React example components
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';

// Services
import departmentService from 'services/departmentService';
import departmentStaffService from 'services/departmentStaffService';

// Context
import { useMaterialUIController } from 'context';

const DepartmentCard = ({ department, staffStats, onClick }) => {
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const roleAssignedPercentage = staffStats?.total > 0 
    ? Math.round((staffStats.roleAssigned / staffStats.total) * 100) 
    : 0;

  const emailSentPercentage = staffStats?.total > 0 
    ? Math.round((staffStats.emailSent / staffStats.total) * 100) 
    : 0;

  return (
    <Card sx={{ height: '100%', cursor: 'pointer' }}>
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                mr: 2,
                width: 48,
                height: 48
              }}
            >
              <BusinessIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight="medium">
                {department.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {department.code}
              </Typography>
            </Box>
          </Box>

          {/* Stats */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Box display="flex" alignItems="center">
                <GroupIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Total Staff
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight="medium" color="primary.main">
                {staffStats?.total || 0}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Box display="flex" alignItems="center">
                <AssignmentIndIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Roles Assigned
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Typography variant="body2" fontWeight="medium" mr={1}>
                  {staffStats?.roleAssigned || 0}/{staffStats?.total || 0}
                </Typography>
                <Chip
                  label={`${roleAssignedPercentage}%`}
                  size="small"
                  color={getProgressColor(roleAssignedPercentage)}
                  variant="outlined"
                />
              </Box>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Emails Sent
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Typography variant="body2" fontWeight="medium" mr={1}>
                  {staffStats?.emailSent || 0}/{staffStats?.total || 0}
                </Typography>
                <Chip
                  label={`${emailSentPercentage}%`}
                  size="small"
                  color={getProgressColor(emailSentPercentage)}
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>

          {/* Status Indicators */}
          <Box display="flex" gap={1} flexWrap="wrap">
            {staffStats?.active > 0 && (
              <Chip
                label={`${staffStats.active} Active`}
                size="small"
                color="success"
                variant="filled"
              />
            )}
            {staffStats?.rolePending > 0 && (
              <Chip
                label={`${staffStats.rolePending} Pending`}
                size="small"
                color="warning"
                variant="filled"
              />
            )}
            {staffStats?.inactive > 0 && (
              <Chip
                label={`${staffStats.inactive} Inactive`}
                size="small"
                color="error"
                variant="filled"
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const DepartmentCardSkeleton = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
        <Box flex={1}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="30%" height={20} />
        </Box>
      </Box>
      <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="90%" height={20} sx={{ mb: 2 }} />
      <Box display="flex" gap={1}>
        <Skeleton variant="rounded" width={60} height={24} />
        <Skeleton variant="rounded" width={80} height={24} />
      </Box>
    </CardContent>
  </Card>
);

const DepartmentsOverview = () => {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [departmentStats, setDepartmentStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartmentsAndStats();
  }, []);

  const fetchDepartmentsAndStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all departments without pagination
      console.log('Fetching departments...');
      const departmentsResponse = await departmentService.getAllDepartmentsNoPagination();
      console.log('Departments Response:', departmentsResponse);
      
      // Handle different response structures
      let departmentsList = [];
      if (departmentsResponse.departments) {
        departmentsList = departmentsResponse.departments;
      } else if (departmentsResponse.data?.departments) {
        departmentsList = departmentsResponse.data.departments;
      } else if (Array.isArray(departmentsResponse.data)) {
        departmentsList = departmentsResponse.data;
      } else if (Array.isArray(departmentsResponse)) {
        departmentsList = departmentsResponse;
      }
      
      console.log('Departments List:', departmentsList);
      setDepartments(departmentsList);

      // Fetch staff stats for each department
      const statsPromises = departmentsList.map(async (dept) => {
        try {
          const statsResponse = await departmentStaffService.getStaffStatsByDepartment(dept._id);
          return { departmentId: dept._id, stats: statsResponse.stats };
        } catch (error) {
          console.error(`Error fetching stats for department ${dept.code}:`, error);
          return { 
            departmentId: dept._id, 
            stats: {
              total: 0,
              active: 0,
              inactive: 0,
              verified: 0,
              unverified: 0,
              emailSent: 0,
              emailPending: 0,
              roleAssigned: 0,
              rolePending: 0,
              byRole: {
                placement_staff: 0,
                department_hod: 0,
                other_staff: 0
              }
            }
          };
        }
      });

      const statsResults = await Promise.all(statsPromises);
      const statsMap = {};
      statsResults.forEach(({ departmentId, stats }) => {
        statsMap[departmentId] = stats;
      });
      setDepartmentStats(statsMap);

    } catch (error) {
      console.error('Error fetching departments and stats:', error);
      setError('Failed to load departments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentClick = (department) => {
    navigate(`/department-staff/${department.code}`);
  };

  const handleRefresh = () => {
    fetchDepartmentsAndStats();
  };

  // Calculate overall stats
  const overallStats = Object.values(departmentStats).reduce(
    (acc, stats) => ({
      totalDepartments: acc.totalDepartments + 1,
      totalStaff: acc.totalStaff + stats.total,
      totalActive: acc.totalActive + stats.active,
      totalRoleAssigned: acc.totalRoleAssigned + stats.roleAssigned,
      totalEmailSent: acc.totalEmailSent + stats.emailSent
    }),
    { totalDepartments: 0, totalStaff: 0, totalActive: 0, totalRoleAssigned: 0, totalEmailSent: 0 }
  );

  // Update overall stats to include department count from departments array
  const finalOverallStats = {
    ...overallStats,
    totalDepartments: departments.length
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox>
          {/* Header */}
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <MDBox>
              <MDTypography variant="h4" fontWeight="medium">
                Departments Overview
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Manage staff across all departments with role assignment and email notifications
              </MDTypography>
            </MDBox>
            <MDButton
              variant="contained"
              color="primary"
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </MDButton>
          </MDBox>

          {/* Overall Stats */}
          {!loading && (
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="primary.main">
                          {finalOverallStats.totalDepartments}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Departments
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                        <GroupIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="info.main">
                          {finalOverallStats.totalStaff}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Staff
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                        <AssignmentIndIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="success.main">
                          {finalOverallStats.totalRoleAssigned}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Roles Assigned
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                        <EmailIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="warning.main">
                          {finalOverallStats.totalEmailSent}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Emails Sent
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Departments Grid */}
          <Grid container spacing={3}>
            {loading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <DepartmentCardSkeleton />
                </Grid>
              ))
            ) : departments.length > 0 ? (
              // Department cards
              departments.map((department) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={department._id}>
                  <DepartmentCard
                    department={department}
                    staffStats={departmentStats[department._id]}
                    onClick={() => handleDepartmentClick(department)}
                  />
                </Grid>
              ))
            ) : (
              // Empty state
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 6 }}>
                    <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Departments Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                      Create departments first to manage staff members.
                    </Typography>
                    <MDButton
                      variant="contained"
                      color="primary"
                      onClick={() => navigate('/department-management')}
                    >
                      Manage Departments
                    </MDButton>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default DepartmentsOverview;
