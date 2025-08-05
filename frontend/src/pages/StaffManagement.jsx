import React, { useState } from 'react';
import {
  Grid,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import CreateStaffForm from 'components/StaffManagement/CreateStaffForm';
import StaffDataTable from 'components/StaffManagement/StaffDataTable';
import EditStaffForm from 'components/StaffManagement/EditStaffForm';
import { StaffManagementProvider } from 'context/StaffManagementContext';
import { useAuth } from 'context/AuthContext';

const StaffManagementContent = () => {
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
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

  const handleStaffCreated = (response) => {
    setSnackbar({
      open: true,
      message: `Staff member "${response.staff.fullName}" created successfully!`,
      severity: 'success'
    });
    setCreateDialogOpen(false);
  };

  const handleEditStaff = (staff) => {
    setEditingStaff(staff);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingStaff(null);
  };

  const handleStaffUpdated = (response) => {
    setSnackbar({
      open: true,
      message: `Staff member "${response.staff.fullName}" updated successfully!`,
      severity: 'success'
    });
    setEditDialogOpen(false);
    setEditingStaff(null);
  };

  const handleStaffDeleted = (staffName) => {
    setSnackbar({
      open: true,
      message: `Staff member "${staffName}" deleted successfully!`,
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Check if user has permission to access staff management
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
                    You don't have permission to access staff management. 
                    Only Administrators and Placement Directors can manage staff members.
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
              {/* Header with Add Staff Button */}
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <MDBox>
                  <MDTypography variant="h4" fontWeight="medium" mb={1}>
                    Staff Management
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    Create and manage staff members in the placement management system.
                  </MDTypography>
                </MDBox>
                
                <MDButton
                  variant="gradient"
                  color="success"
                  startIcon={<PersonAddIcon />}
                  onClick={handleOpenCreateDialog}
                >
                  Add Staff
                </MDButton>
              </MDBox>

              {/* Staff List */}
              <StaffDataTable 
                onEditStaff={handleEditStaff}
                onStaffDeleted={handleStaffDeleted}
              />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>

      {/* Create Staff Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h5" fontWeight="medium">
              Create New Staff Member
            </MDTypography>
            <Button
              onClick={handleCloseCreateDialog}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <CloseIcon />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <CreateStaffForm 
            onSuccess={handleStaffCreated}
            onCancel={handleCloseCreateDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h5" fontWeight="medium">
              Edit Staff Member
            </MDTypography>
            <Button
              onClick={handleCloseEditDialog}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <CloseIcon />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {editingStaff && (
            <EditStaffForm 
              staff={editingStaff}
              onSuccess={handleStaffUpdated}
              onCancel={handleCloseEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>

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

// Main component with provider
const StaffManagement = () => {
  return (
    <StaffManagementProvider>
      <StaffManagementContent />
    </StaffManagementProvider>
  );
};

export default StaffManagement;
