import React, { useState, useEffect } from 'react';
import {
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  People as PeopleIcon
} from '@mui/icons-material';

// S.A. Engineering College React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// S.A. Engineering College React example components
import DataTable from "examples/Tables/DataTable";

// Components
import PlacementStaffAssignmentModal from './PlacementStaffAssignmentModal';

// Context
import { useDepartment } from 'context/DepartmentContext';
import { useAuth } from 'context/AuthContext';

const DepartmentDataTable = ({ onEditDepartment, onDepartmentDeleted }) => {
  const {
    departments,
    loading,
    error,
    fetchDepartments,
    deleteDepartment,
    getDepartmentStatusColor,
    getDepartmentStatusText,
    getPlacementStaffDisplayName,
    formatCreationDate
  } = useDepartment();

  const { user } = useAuth();

  // Department detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Placement staff assignment modal state
  const [staffAssignmentModalOpen, setStaffAssignmentModalOpen] = useState(false);
  const [departmentForStaffAssignment, setDepartmentForStaffAssignment] = useState(null);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Handler functions
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  const handleRefresh = () => {
    fetchDepartments();
    handleClearFilters();
  };

  // Handle view details
  const handleViewDetails = (department) => {
    setSelectedDepartment(department);
    setDetailModalOpen(true);
  };

  // Handle edit department
  const handleEditDepartment = (department) => {
    if (onEditDepartment) {
      onEditDepartment(department);
    }
  };

  // Handle placement staff assignment
  const handleManageStaffAssignment = (department) => {
    setDepartmentForStaffAssignment(department);
    setStaffAssignmentModalOpen(true);
  };

  const handleStaffAssignmentSuccess = (updatedDepartment) => {
    // Refresh departments to show updated assignments
    fetchDepartments();
    setStaffAssignmentModalOpen(false);
    setDepartmentForStaffAssignment(null);
  };

  // Handle delete department
  const handleDeleteDepartment = (department) => {
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (departmentToDelete) {
      try {
        await deleteDepartment(departmentToDelete.id);
        setDeleteDialogOpen(false);
        setDepartmentToDelete(null);
        if (onDepartmentDeleted) {
          onDepartmentDeleted(departmentToDelete.name);
        }
      } catch (error) {
        // Error handled by context
      }
    }
  };

  // Cancel delete
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDepartmentToDelete(null);
  };

  const canDelete = user?.role === 'admin';

  // Filter departments based on search and status
  const filteredDepartments = departments.filter(department => {
    const matchesSearch = !searchTerm || 
      department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (department.description && department.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && department.isActive) ||
      (statusFilter === 'inactive' && !department.isActive);

    return matchesSearch && matchesStatus;
  });

  // Create table data
  const columns = [
    { Header: "Department", accessor: "department", width: "25%", align: "left" },
    { Header: "Code", accessor: "code", width: "10%", align: "center" },
    { Header: "Course Category", accessor: "courseCategory", width: "15%", align: "left" },
    { Header: "Placement Staff", accessor: "placementStaff", width: "20%", align: "left" },
    { Header: "Status", accessor: "status", width: "10%", align: "center" },
    { Header: "Created", accessor: "created", width: "10%", align: "center" },
    { Header: "Actions", accessor: "actions", width: "10%", align: "center" }
  ];

  const rows = filteredDepartments.map((department) => ({
    department: (
      <MDBox display="flex" alignItems="center" lineHeight={1}>
        <MDBox ml={2} lineHeight={1}>
          <MDTypography display="block" variant="button" fontWeight="medium">
            {department.name}
          </MDTypography>
          {department.description && (
            <MDTypography variant="caption" color="text">
              {department.description.length > 50 
                ? `${department.description.substring(0, 50)}...` 
                : department.description
              }
            </MDTypography>
          )}
        </MDBox>
      </MDBox>
    ),
    code: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {department.code}
      </MDTypography>
    ),
    courseCategory: (
      <MDBox lineHeight={1}>
        <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
          {department.courseCategory?.name || 'Not Assigned'}
        </MDTypography>
      </MDBox>
    ),
    placementStaff: (
      <MDBox lineHeight={1}>
        <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
          {department.placementStaff 
            ? getPlacementStaffDisplayName(department.placementStaff)
            : 'No Staff Assigned'
          }
        </MDTypography>
        {department.placementStaff && typeof department.placementStaff === 'object' && (
          <MDTypography variant="caption" color="text">
            {department.placementStaff.email}
          </MDTypography>
        )}
      </MDBox>
    ),
    status: (
      <Chip
        label={getDepartmentStatusText(department)}
        color={getDepartmentStatusColor(department)}
        size="small"
        variant="filled"
      />
    ),
    created: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {formatCreationDate(department.createdAt)}
      </MDTypography>
    ),
    actions: (
      <MDBox display="flex" alignItems="center" gap={1}>
        <Tooltip title="View Details">
          <IconButton size="small" onClick={() => handleViewDetails(department)}>
            <BusinessIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Manage Placement Staff">
          <IconButton size="small" onClick={() => handleManageStaffAssignment(department)}>
            <PeopleIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Department">
          <IconButton size="small" onClick={() => handleEditDepartment(department)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {canDelete && (
          <Tooltip title="Delete Department">
            <IconButton 
              size="small" 
              onClick={() => handleDeleteDepartment(department)}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </MDBox>
    )
  }));

  if (loading) {
    return (
      <Card>
        <MDBox p={4} textAlign="center">
          <Typography variant="h6" color="text.secondary">
            Loading departments...
          </Typography>
        </MDBox>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <MDBox p={4} textAlign="center">
          <Typography variant="h6" color="error" mb={2}>
            Error loading departments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
        </MDBox>
      </Card>
    );
  }

  return (
    <Box>
      {/* Department Table Card */}
      <Card>
        {/* Search and Filters Section */}
        <MDBox p={3} pb={0}>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search departments..."
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm('')}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Clear Filters */}
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={handleClearFilters}
                disabled={!searchTerm && !statusFilter}
                startIcon={<ClearIcon />}
                size="small"
              >
                Clear Filters
              </Button>
            </Grid>

            {/* Refresh */}
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                color="info"
                fullWidth
                onClick={handleRefresh}
                startIcon={<RefreshIcon />}
                size="small"
                disabled={loading}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>

          {/* Results Summary */}
          <MDBox mt={2}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredDepartments.length} of {departments.length} departments
            </Typography>
          </MDBox>
        </MDBox>

        {/* Blue Header Bar */}
        <MDBox
          mx={2}
          mt={2}
          py={3}
          px={2}
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
        >
          <MDTypography variant="h6" color="white">
            Departments Table
          </MDTypography>
        </MDBox>

        <MDBox pt={3}>
          <DataTable
            table={{ columns, rows }}
            isSorted={false}
            noEndBorder
          />
        </MDBox>
      </Card>

      {/* Placement Staff Assignment Modal */}
      <PlacementStaffAssignmentModal
        open={staffAssignmentModalOpen}
        onClose={() => {
          setStaffAssignmentModalOpen(false);
          setDepartmentForStaffAssignment(null);
        }}
        department={departmentForStaffAssignment}
        onSuccess={handleStaffAssignmentSuccess}
      />

      {/* Department Detail Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedDepartment && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h5" fontWeight="medium">
                  Department Details
                </MDTypography>
                <Button
                  onClick={() => setDetailModalOpen(false)}
                  sx={{ minWidth: 'auto', p: 1 }}
                >
                  <CloseIcon />
                </Button>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                    Department Name
                  </MDTypography>
                  <MDTypography variant="body2" mb={2}>
                    {selectedDepartment.name}
                  </MDTypography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                    Department Code
                  </MDTypography>
                  <MDTypography variant="body2" mb={2}>
                    {selectedDepartment.code}
                  </MDTypography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                    Course Category
                  </MDTypography>
                  <MDTypography variant="body2" mb={2}>
                    {selectedDepartment.courseCategory?.name || 'Not Assigned'}
                  </MDTypography>
                </Grid>
                
                <Grid item xs={12}>
                  <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                    Description
                  </MDTypography>
                  <MDTypography variant="body2" mb={2}>
                    {selectedDepartment.description || 'No description provided'}
                  </MDTypography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                    Assigned Placement Staff
                  </MDTypography>
                  <MDTypography variant="body2" mb={2}>
                    {selectedDepartment.placementStaff 
                      ? getPlacementStaffDisplayName(selectedDepartment.placementStaff)
                      : 'No staff assigned'
                    }
                  </MDTypography>
                  {selectedDepartment.placementStaff && typeof selectedDepartment.placementStaff === 'object' && (
                    <MDTypography variant="body2" color="text.secondary">
                      {selectedDepartment.placementStaff.email}
                    </MDTypography>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                    Status
                  </MDTypography>
                  <Chip
                    label={getDepartmentStatusText(selectedDepartment)}
                    color={getDepartmentStatusColor(selectedDepartment)}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                    Created Date
                  </MDTypography>
                  <MDTypography variant="body2" mb={2}>
                    {formatCreationDate(selectedDepartment.createdAt)}
                  </MDTypography>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>
              <MDButton
                variant="gradient"
                color="warning"
                onClick={() => {
                  setDetailModalOpen(false);
                  handleManageStaffAssignment(selectedDepartment);
                }}
                startIcon={<PeopleIcon />}
                sx={{ mr: 1 }}
              >
                Manage Staff
              </MDButton>
              <MDButton
                variant="gradient"
                color="info"
                onClick={() => {
                  setDetailModalOpen(false);
                  handleEditDepartment(selectedDepartment);
                }}
              >
                Edit Department
              </MDButton>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="medium">
            Delete Department
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {departmentToDelete && (
            <>
              <Typography variant="body1" mb={2}>
                Are you sure you want to delete <strong>{departmentToDelete.name}</strong>?
              </Typography>
              
              <Typography variant="body2" color="text.secondary" mb={2}>
                This action cannot be undone. All associated data will be permanently removed.
              </Typography>

              <Box 
                sx={{ 
                  backgroundColor: 'error.light', 
                  color: 'error.contrastText',
                  p: 2, 
                  borderRadius: 1,
                  mb: 2
                }}
              >
                <Typography variant="body2" fontWeight="medium">
                  Department Details:
                </Typography>
                <Typography variant="body2">
                  • Name: {departmentToDelete.name}
                </Typography>
                <Typography variant="body2">
                  • Code: {departmentToDelete.code}
                </Typography>
                <Typography variant="body2">
                  • Course Category: {departmentToDelete.courseCategory?.name || 'Not Assigned'}
                </Typography>
                <Typography variant="body2">
                  • Assigned Staff: {departmentToDelete.placementStaff ? '1 member' : '0 members'}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Department'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentDataTable;
