import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// @mui material components
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';

// @mui icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import EmailIcon from '@mui/icons-material/Email';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDSnackbar from 'components/MDSnackbar';

// Material Dashboard 2 React example components
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';

// Department Staff Management components
import DepartmentStaffList from 'components/DepartmentStaffManagement/DepartmentStaffList';
import RoleAssignmentModal from 'components/DepartmentStaffManagement/RoleAssignmentModal';
import BulkRoleAssignmentModal from 'components/DepartmentStaffManagement/BulkRoleAssignmentModal';
import StaffDetailsModal from 'components/DepartmentStaffManagement/StaffDetailsModal';
import DepartmentStaffStats from 'components/DepartmentStaffManagement/DepartmentStaffStats';

// Context
import { DepartmentStaffProvider, useDepartmentStaff } from 'context/DepartmentStaffContext';

// Services
import departmentService from 'services/departmentService';

// Department Staff Management Content Component
const DepartmentStaffManagementContent = () => {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  
  const {
    currentDepartment,
    staff,
    selectedStaff,
    loading,
    error,
    stats,
    modals,
    setCurrentDepartment,
    fetchStaffByDepartment,
    fetchStaffStats,
    clearError,
    openModal,
    closeModal,
    refreshCurrentDepartmentData
  } = useDepartmentStaff();

  // Local state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    color: 'success'
  });

  // Fetch department and staff data on mount
  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        // Fetch department by code (departmentId is now the department code)
        const departmentResponse = await departmentService.getDepartmentByCode(departmentId);
        
        if (departmentResponse.success && departmentResponse.department) {
          const department = departmentResponse.department;
          const formattedDepartment = {
            id: department._id,
            name: department.name,
            code: department.code,
            description: department.description
          };
          
          setCurrentDepartment(formattedDepartment);
          
          // Fetch staff and stats using the department code (not ObjectId)
          await Promise.all([
            fetchStaffByDepartment(department.code),
            fetchStaffStats(department.code)
          ]);
        } else {
          console.error('Department not found:', departmentId);
        }
      } catch (error) {
        console.error('Error fetching department data:', error);
      }
    };

    if (departmentId) {
      fetchDepartmentData();
    }
  }, [departmentId, setCurrentDepartment, fetchStaffByDepartment, fetchStaffStats]);

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refreshCurrentDepartmentData();
      setSnackbar({
        open: true,
        message: 'Data refreshed successfully',
        color: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to refresh data',
        color: 'error'
      });
    }
  };

  // Handle role assignment success
  const handleRoleAssignmentSuccess = (message) => {
    setSnackbar({
      open: true,
      message: message || 'Role assigned successfully',
      color: 'success'
    });
    closeModal('roleAssignment');
    refreshCurrentDepartmentData();
  };

  // Handle bulk role assignment success
  const handleBulkRoleAssignmentSuccess = (results) => {
    const { successCount, failureCount } = results;
    setSnackbar({
      open: true,
      message: `Bulk assignment completed: ${successCount} successful, ${failureCount} failed`,
      color: successCount > 0 ? 'success' : 'warning'
    });
    closeModal('bulkRoleAssignment');
    refreshCurrentDepartmentData();
  };

  // Close snackbar
  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Clear error
  const handleClearError = () => {
    clearError();
  };

  if (loading && !currentDepartment) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box ml={2} flex={1}>
                      <Skeleton variant="text" width="60%" height={32} />
                      <Skeleton variant="text" width="40%" height={20} />
                    </Box>
                  </Box>
                  <Skeleton variant="rectangular" height={200} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <IconButton 
                onClick={() => navigate('/staff-management')}
                color="primary"
              >
                <ArrowBackIcon />
              </IconButton>
            </Grid>
            <Grid item xs>
              <MDBox>
                <MDTypography variant="h4" fontWeight="medium">
                  {currentDepartment?.name || 'Department Staff Management'}
                </MDTypography>
                <MDTypography variant="body2" color="text" mb={1}>
                  Manage staff members and assign roles for {currentDepartment?.code || 'department'}
                </MDTypography>
                {stats && (
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip 
                      icon={<GroupIcon />}
                      label={`${stats.total} Total Staff`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip 
                      icon={<AssignmentIndIcon />}
                      label={`${stats.roleAssigned} Roles Assigned`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                    <Chip 
                      icon={<EmailIcon />}
                      label={`${stats.emailSent} Emails Sent`}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  </Box>
                )}
              </MDBox>
            </Grid>
            <Grid item>
              <Box display="flex" gap={1}>
                <Tooltip title="Refresh Data">
                  <IconButton onClick={handleRefresh} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                {selectedStaff.length > 0 && (
                  <MDButton
                    variant="contained"
                    color="info"
                    startIcon={<PersonAddIcon />}
                    onClick={() => openModal('bulkRoleAssignment')}
                  >
                    Assign Roles ({selectedStaff.length})
                  </MDButton>
                )}
              </Box>
            </Grid>
          </Grid>
        </MDBox>

        {/* Error Alert */}
        {error && (
          <MDBox mb={3}>
            <Alert 
              severity="error" 
              onClose={handleClearError}
              sx={{ borderRadius: 2 }}
            >
              {error}
            </Alert>
          </MDBox>
        )}

        {/* Statistics */}
        {stats && (
          <MDBox mb={3}>
            <DepartmentStaffStats stats={stats} department={currentDepartment} />
          </MDBox>
        )}

        {/* Staff List */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <DepartmentStaffList />
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Modals */}
        <RoleAssignmentModal
          open={modals.roleAssignment}
          onClose={() => closeModal('roleAssignment')}
          onSuccess={handleRoleAssignmentSuccess}
        />

        <BulkRoleAssignmentModal
          open={modals.bulkRoleAssignment}
          onClose={() => closeModal('bulkRoleAssignment')}
          onSuccess={handleBulkRoleAssignmentSuccess}
          selectedStaff={selectedStaff}
        />

        <StaffDetailsModal
          open={modals.staffDetails}
          onClose={() => closeModal('staffDetails')}
        />

        {/* Snackbar */}
        <MDSnackbar
          color={snackbar.color}
          icon="check"
          title="Department Staff Management"
          content={snackbar.message}
          open={snackbar.open}
          onClose={closeSnackbar}
          close={closeSnackbar}
          bgWhite
        />
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

// Main component with provider
const DepartmentStaffManagement = () => {
  return (
    <DepartmentStaffProvider>
      <DepartmentStaffManagementContent />
    </DepartmentStaffProvider>
  );
};

export default DepartmentStaffManagement;
