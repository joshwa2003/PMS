import React, { useState } from 'react';
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
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import CreateStaffForm from 'components/StaffManagement/CreateStaffForm';
import StaffDataTable from 'components/StaffManagement/StaffDataTable';
import EditStaffForm from 'components/StaffManagement/EditStaffForm';
import BulkStaffUploadModal from 'components/StaffManagement/BulkStaffUploadModal';
import { StaffManagementProvider } from 'context/StaffManagementContext';
import { useAuth } from 'context/AuthContext';

const StaffManagementContent = () => {
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false);
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

  const handleOpenBulkUploadDialog = () => {
    setBulkUploadDialogOpen(true);
  };

  const handleCloseBulkUploadDialog = () => {
    setBulkUploadDialogOpen(false);
  };

  const handleBulkUploadSuccess = (response) => {
    const createdCount = response.results?.createdStaff?.length || response.results?.successCount || 0;
    setSnackbar({
      open: true,
      message: `Successfully uploaded ${createdCount} staff members!`,
      severity: 'success'
    });
    setBulkUploadDialogOpen(false);
  };

  const handleDownloadTemplate = async () => {
    try {
      // Fetch available departments dynamically using the api service
      let departmentCodes = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT']; // Default fallback
      
      try {
        const response = await fetch('/api/v1/users/departments', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.departments) {
            departmentCodes = data.departments.map(dept => dept.code);
          }
        } else {
          console.warn('Failed to fetch departments, using defaults');
        }
      } catch (apiError) {
        console.warn('Error fetching departments, using defaults:', apiError);
      }

      // Create template data with only 4 columns: First Name, Last Name, Department, Email
      const templateData = [
        {
          'First Name': 'John',
          'Last Name': 'Smith',
          'Department': departmentCodes[0] || 'CSE',
          'Email': 'john.smith@college.edu'
        }
      ];

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(templateData);

      // Set column widths for better formatting (only 4 columns)
      const columnWidths = [
        { wch: 15 }, // First Name
        { wch: 15 }, // Last Name
        { wch: 12 }, // Department
        { wch: 30 }  // Email
      ];
      worksheet['!cols'] = columnWidths;

      // Add validation sheet with department codes
      const validationData = [
        { 'Valid Department Codes': 'Available Codes' },
        ...departmentCodes.map(code => ({ 'Valid Department Codes': code })),
        { 'Valid Department Codes': '' },
        { 'Valid Department Codes': 'Required Fields:' },
        { 'Valid Department Codes': 'First Name*' },
        { 'Valid Department Codes': 'Last Name*' },
        { 'Valid Department Codes': 'Department*' },
        { 'Valid Department Codes': 'Email*' },
        { 'Valid Department Codes': '' },
        { 'Valid Department Codes': 'Note: Only these 4 columns are required' },
        { 'Valid Department Codes': 'Other fields will be set to defaults' }
      ];

      const validationSheet = XLSX.utils.json_to_sheet(validationData);
      validationSheet['!cols'] = [{ wch: 25 }];

      // Add both sheets to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff Template');
      XLSX.utils.book_append_sheet(workbook, validationSheet, 'Validation Info');

      // Generate and download the file
      const fileName = `Staff_Template_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      setSnackbar({
        open: true,
        message: 'Enhanced Excel template downloaded successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      setSnackbar({
        open: true,
        message: 'Error downloading template. Please try again.',
        severity: 'error'
      });
    }
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
              {/* Header with Action Buttons */}
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <MDBox>
                  <MDTypography variant="h4" fontWeight="medium" mb={1}>
                    Staff Management
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    Create and manage staff members in the placement management system.
                  </MDTypography>
                </MDBox>
                
                <MDBox display="flex" gap={2}>
                  <MDButton
                    variant="outlined"
                    color="info"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadTemplate}
                  >
                    Download Excel Format
                  </MDButton>
                  
                  <MDButton
                    variant="outlined"
                    color="warning"
                    startIcon={<UploadIcon />}
                    onClick={handleOpenBulkUploadDialog}
                  >
                    Upload Excel Sheet
                  </MDButton>
                  
                  <MDButton
                    variant="gradient"
                    color="success"
                    startIcon={<PersonAddIcon />}
                    onClick={handleOpenCreateDialog}
                  >
                    Add Staff
                  </MDButton>
                </MDBox>
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

      {/* Bulk Staff Upload Dialog */}
      <BulkStaffUploadModal
        open={bulkUploadDialogOpen}
        onClose={handleCloseBulkUploadDialog}
        onSuccess={handleBulkUploadSuccess}
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

// Main component with provider
const StaffManagement = () => {
  return (
    <StaffManagementProvider>
      <StaffManagementContent />
    </StaffManagementProvider>
  );
};

export default StaffManagement;
