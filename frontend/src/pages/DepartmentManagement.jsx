import React, { useState, useEffect } from 'react';
import {
  Grid,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import DepartmentDataTable from 'components/DepartmentManagement/DepartmentDataTable';
import CreateDepartmentModal from 'components/DepartmentManagement/CreateDepartmentModal';
import EditDepartmentModal from 'components/DepartmentManagement/EditDepartmentModal';
import { DepartmentProvider, useDepartment } from 'context/DepartmentContext';
import { CourseCategoryProvider } from 'context/CourseCategoryContext';
import { useAuth } from 'context/AuthContext';

const DepartmentManagementContent = () => {
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleDepartmentCreated = (response) => {
    const departmentName = response?.data?.department?.name || 'Department';
    setSnackbar({
      open: true,
      message: `${departmentName} created successfully!`,
      severity: 'success'
    });
    setCreateDialogOpen(false);
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingDepartment(null);
  };

  const handleDepartmentUpdated = (response) => {
    const departmentName = response?.data?.department?.name || 'Department';
    setSnackbar({
      open: true,
      message: `${departmentName} updated successfully!`,
      severity: 'success'
    });
    setEditDialogOpen(false);
    setEditingDepartment(null);
  };

  const handleDepartmentDeleted = (departmentName) => {
    setSnackbar({
      open: true,
      message: `Department "${departmentName}" deleted successfully!`,
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Check if user has permission to access department management
  const hasPermission = user?.role === 'admin' || user?.role === 'placement_director';

  if (!hasPermission) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDBox mb={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="error">
                  <MDTypography variant="h6" fontWeight="medium" mb={1}>
                    Access Denied
                  </MDTypography>
                  <MDTypography variant="body2">
                    You don't have permission to access department management. 
                    Only Administrators can manage departments.
                  </MDTypography>
                </Alert>
              </Grid>
            </Grid>
          </MDBox>
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
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {/* Header with Action Buttons */}
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <MDBox>
                  <MDTypography variant="h4" fontWeight="medium" mb={1}>
                    Department Management
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    Create and manage departments with course category assignments. Placement staff can be managed separately.
                  </MDTypography>
                </MDBox>
                
                <MDBox display="flex" gap={2}>
                  <MDButton
                    variant="gradient"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateDialog}
                  >
                    Add Department
                  </MDButton>
                </MDBox>
              </MDBox>

              {/* Department List */}
              <DepartmentDataTable 
                onEditDepartment={handleEditDepartment}
                onDepartmentDeleted={handleDepartmentDeleted}
              />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>

      {/* Create Department Dialog */}
      <CreateDepartmentModal
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        onSuccess={handleDepartmentCreated}
      />

      {/* Edit Department Dialog */}
      <EditDepartmentModal
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        onSuccess={handleDepartmentUpdated}
        department={editingDepartment}
      />

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </DashboardLayout>
  );
};

// Main component with providers
const DepartmentManagement = () => {
  return (
    <CourseCategoryProvider>
      <DepartmentProvider>
        <DepartmentManagementContent />
      </DepartmentProvider>
    </CourseCategoryProvider>
  );
};

export default DepartmentManagement;
