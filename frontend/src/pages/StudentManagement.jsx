import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

// Material Dashboard 2 React example components
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';
import ComplexStatisticsCard from 'examples/Cards/StatisticsCards/ComplexStatisticsCard';

// Student Management components
import CreateStudentForm from 'components/StudentManagement/CreateStudentForm';
import BulkStudentUploadModal from 'components/StudentManagement/BulkStudentUploadModal';
import StudentDataTable from 'components/StudentManagement/StudentDataTable';

// Context
import { StudentManagementProvider, useStudentManagement } from 'context/StudentManagementContext';
import { useAuth } from 'context/AuthContext';

const StudentManagementContent = () => {
  const { user } = useAuth();
  const {
    stats,
    loading,
    error,
    fetchStudentStats,
    fetchStudents,
    clearError
  } = useStudentManagement();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false);

  // Fetch stats and students on component mount
  useEffect(() => {
    fetchStudentStats();
    fetchStudents();
  }, [fetchStudentStats, fetchStudents]);

  const handleStudentCreated = (response) => {
    setCreateDialogOpen(false);
    // Refresh both stats and student list
    fetchStudentStats();
    fetchStudents();
  };

  const handleBulkUploadSuccess = (response) => {
    setBulkUploadDialogOpen(false);
    // Refresh both stats and student list after bulk upload
    fetchStudentStats();
    fetchStudents();
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    clearError();
  };

  const handleBulkUploadDialogClose = () => {
    setBulkUploadDialogOpen(false);
    clearError();
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center">
                <MDBox>
                  <MDTypography variant="h4" fontWeight="medium">
                    Student Management
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    Manage students created by placement staff
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" gap={2}>
                  <MDButton
                    variant="outlined"
                    color="info"
                    startIcon={<UploadIcon />}
                    onClick={() => setBulkUploadDialogOpen(true)}
                  >
                    Bulk Upload
                  </MDButton>
                  <MDButton
                    variant="gradient"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    Add Student
                  </MDButton>
                </MDBox>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Statistics Cards */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="success"
                  icon="school"
                  title="Total Students"
                  count={stats.total}
                  percentage={{
                    color: "success",
                    amount: `+${stats.recent}`,
                    label: "added recently"
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  icon="people"
                  title="Active Students"
                  count={stats.active}
                  percentage={{
                    color: stats.active > 0 ? "success" : "secondary",
                    amount: `${Math.round((stats.active / Math.max(stats.total, 1)) * 100)}%`,
                    label: "of total students"
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="info"
                  icon="check_circle"
                  title="Verified Students"
                  count={stats.verified}
                  percentage={{
                    color: stats.verified > 0 ? "success" : "secondary",
                    amount: `${Math.round((stats.verified / Math.max(stats.total, 1)) * 100)}%`,
                    label: "verification rate"
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="warning"
                  icon="work"
                  title="Placed Students"
                  count={stats.placement.placed + stats.placement.multipleOffers}
                  percentage={{
                    color: (stats.placement.placed + stats.placement.multipleOffers) > 0 ? "success" : "secondary",
                    amount: `${Math.round(((stats.placement.placed + stats.placement.multipleOffers) / Math.max(stats.total, 1)) * 100)}%`,
                    label: "placement rate"
                  }}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Placement Statistics */}
        {stats.total > 0 && (
          <MDBox mb={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Placement Overview
                    </MDTypography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <MDBox textAlign="center" p={2} sx={{ backgroundColor: '#fff3e0', borderRadius: 2 }}>
                          <ScheduleIcon sx={{ fontSize: 40, color: '#f57c00', mb: 1 }} />
                          <MDTypography variant="h4" fontWeight="bold" color="warning">
                            {stats.placement.unplaced}
                          </MDTypography>
                          <MDTypography variant="body2" color="text">
                            Unplaced Students
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <MDBox textAlign="center" p={2} sx={{ backgroundColor: '#e8f5e8', borderRadius: 2 }}>
                          <CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                          <MDTypography variant="h4" fontWeight="bold" color="success">
                            {stats.placement.placed}
                          </MDTypography>
                          <MDTypography variant="body2" color="text">
                            Placed Students
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <MDBox textAlign="center" p={2} sx={{ backgroundColor: '#e3f2fd', borderRadius: 2 }}>
                          <PeopleIcon sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
                          <MDTypography variant="h4" fontWeight="bold" color="info">
                            {stats.placement.multipleOffers}
                          </MDTypography>
                          <MDTypography variant="body2" color="text">
                            Multiple Offers
                          </MDTypography>
                        </MDBox>
                      </Grid>
                    </Grid>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </MDBox>
        )}

        {/* Error Display */}
        {error && (
          <MDBox mb={3}>
            <Alert severity="error" onClose={clearError}>
              {error}
            </Alert>
          </MDBox>
        )}

        {/* Students Data Table */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {/* Green Header Bar */}
              <MDBox
                mx={0}
                mt={0}
                py={3}
                px={2}
                variant="gradient"
                bgColor="success"
                borderRadius="lg"
                coloredShadow="success"
              >
                <MDBox display="flex" justifyContent="space-between" alignItems="center">
                  <MDTypography variant="h6" color="white">
                    Students Created by You
                  </MDTypography>
                  <MDBox display="flex" gap={1}>
                    <MDButton
                      variant="outlined"
                      color="white"
                      size="small"
                      startIcon={<UploadIcon />}
                      onClick={() => setBulkUploadDialogOpen(true)}
                      sx={{
                        color: 'white',
                        borderColor: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          borderColor: 'white'
                        }
                      }}
                    >
                      Bulk Upload
                    </MDButton>
                    <MDButton
                      variant="contained"
                      color="white"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => setCreateDialogOpen(true)}
                      sx={{
                        color: '#4caf50',
                        backgroundColor: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.9)'
                        }
                      }}
                    >
                      Add Student
                    </MDButton>
                  </MDBox>
                </MDBox>
              </MDBox>

              <MDBox pt={3}>
                <StudentDataTable />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Create Student Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={handleCreateDialogClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '16px' }
          }}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <MDTypography variant="h5" fontWeight="medium">
                Add New Student
              </MDTypography>
              <IconButton onClick={handleCreateDialogClose} sx={{ minWidth: 'auto', p: 1 }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <CreateStudentForm
              onSuccess={handleStudentCreated}
              onCancel={handleCreateDialogClose}
            />
          </DialogContent>
        </Dialog>

        {/* Bulk Upload Dialog */}
        <BulkStudentUploadModal
          open={bulkUploadDialogOpen}
          onClose={handleBulkUploadDialogClose}
          onSuccess={handleBulkUploadSuccess}
        />
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

// Main component with provider
const StudentManagement = () => {
  return (
    <StudentManagementProvider>
      <StudentManagementContent />
    </StudentManagementProvider>
  );
};

export default StudentManagement;
