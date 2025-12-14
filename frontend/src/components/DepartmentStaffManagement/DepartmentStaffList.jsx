import React, { useState, useEffect } from 'react';
import {
  Card,
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
  Tooltip,
  Button,
  Menu,
  ListItemIcon,
  ListItemText,
  Alert,
  Checkbox,
  TablePagination
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  AssignmentInd as AssignmentIndIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

// S.A. Engineering College React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";

// S.A. Engineering College React example components
import DataTable from "examples/Tables/DataTable";

import { useMaterialUIController } from "context";

// Context
import { useDepartmentStaff } from 'context/DepartmentStaffContext';

// Services
import departmentStaffService from 'services/departmentStaffService';
import { getGoogleDriveThumbnail } from 'utils/googleDriveUtils';
import { getInitials } from "utils/formatUtils";

const DepartmentStaffList = () => {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const {
    staff,
    selectedStaff,
    loading,
    error,
    pagination,
    filters,
    currentDepartment,
    toggleStaffSelection,
    selectAllStaff,
    clearSelectedStaff,
    setSelectedStaff,
    setFilters,
    clearFilters,
    openModal,
    fetchStaffByDepartment
  } = useDepartmentStaff();

  // Local state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStaffForMenu, setSelectedStaffForMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Handle menu
  const handleMenuOpen = (event, staffMember) => {
    setAnchorEl(event.currentTarget);
    setSelectedStaffForMenu(staffMember);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStaffForMenu(null);
  };

  // Handle role assignment
  const handleAssignRole = (staffMember) => {
    // Set the selected staff as an array with one item (required by RoleAssignmentModal)
    setSelectedStaff([staffMember]);
    setSelectedStaffForMenu(staffMember);
    openModal('roleAssignment');
    handleMenuClose();
  };

  // Handle view details
  const handleViewDetails = (staffMember) => {
    // Set the selected staff as an array with one item (required by StaffDetailsModal)
    setSelectedStaff([staffMember]);
    setSelectedStaffForMenu(staffMember);
    openModal('staffDetails');
    handleMenuClose();
  };

  // Handle search change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  // Handle role filter change
  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setRoleFilter('');
    clearFilters();
  };

  // Handle refresh
  const handleRefresh = () => {
    if (currentDepartment) {
      fetchStaffByDepartment(currentDepartment.code, { page: page + 1, limit: rowsPerPage });
    }
    handleClearFilters();
  };

  // Handle pagination
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    if (currentDepartment) {
      fetchStaffByDepartment(currentDepartment.code, { page: newPage + 1, limit: rowsPerPage });
    }
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    if (currentDepartment) {
      fetchStaffByDepartment(currentDepartment.code, { page: 1, limit: newRowsPerPage });
    }
  };

  // Get role color
  const getRoleColor = (role) => {
    return departmentStaffService.getRoleColor(role);
  };

  // Get status color
  const getStatusColor = (staffMember) => {
    return departmentStaffService.getStaffStatusColor(staffMember);
  };

  // Get status text
  const getStatusText = (staffMember) => {
    return departmentStaffService.getStaffStatusText(staffMember);
  };

  // Format date
  const formatDate = (dateString) => {
    return departmentStaffService.formatDate(dateString);
  };

  // Refresh data when filters change
  useEffect(() => {
    if (currentDepartment) {
      fetchStaffByDepartment(currentDepartment.code, { page: page + 1, limit: rowsPerPage });
    }
  }, [filters, currentDepartment, fetchStaffByDepartment, page, rowsPerPage]);

  // Handle staff selection
  const handleStaffSelection = (staffMember) => {
    toggleStaffSelection(staffMember);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedStaff.length === staff.length) {
      clearSelectedStaff();
    } else {
      selectAllStaff();
    }
  };

  // Check if staff member is selected
  const isStaffSelected = (staffMember) => {
    return selectedStaff.some(selected => selected.id === staffMember.id);
  };

  // Create table data using the same pattern as DepartmentDataTable
  const columns = [
    {
      Header: (
        <Checkbox
          checked={selectedStaff.length === staff.length && staff.length > 0}
          indeterminate={selectedStaff.length > 0 && selectedStaff.length < staff.length}
          onChange={handleSelectAll}
        />
      ),
      accessor: "select",
      width: "5%",
      align: "center"
    },
    { Header: "Staff Member", accessor: "staffMember", width: "25%", align: "left" },
    { Header: "Role", accessor: "role", width: "15%", align: "left" },
    { Header: "Status", accessor: "status", width: "10%", align: "center" },
    { Header: "Email Status", accessor: "emailStatus", width: "15%", align: "left" },
    { Header: "Role Assigned", accessor: "roleAssigned", width: "15%", align: "left" },
    { Header: "Last Login", accessor: "lastLogin", width: "10%", align: "center" },
    { Header: "Actions", accessor: "actions", width: "10%", align: "center" }
  ];

  const rows = staff.map((staffMember) => ({
    select: (
      <Checkbox
        checked={isStaffSelected(staffMember)}
        onChange={() => handleStaffSelection(staffMember)}
      />
    ),
    staffMember: (
      <MDBox display="flex" alignItems="center" lineHeight={1}>
        <MDAvatar
          src={getGoogleDriveThumbnail(staffMember.profilePicture || staffMember.profilePhotoUrl)}
          name={staffMember.fullName}
          size="sm"
          imgProps={{ referrerPolicy: 'no-referrer' }}
          bgColor={getRoleColor(staffMember.role)}
        >
          {getInitials(staffMember.fullName)}
        </MDAvatar>
        <MDBox ml={2} lineHeight={1}>
          <MDTypography display="block" variant="button" fontWeight="medium">
            {staffMember.fullName}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            {staffMember.email}
          </MDTypography>
          {staffMember.employeeId && (
            <MDTypography variant="caption" color="text" display="block">
              ID: {staffMember.employeeId}
            </MDTypography>
          )}
        </MDBox>
      </MDBox>
    ),
    role: (
      <MDBox lineHeight={1} textAlign="left">
        <Chip
          label={departmentStaffService.getRoleDisplayName(staffMember.role)}
          color={getRoleColor(staffMember.role)}
          size="small"
          variant="outlined"
        />
      </MDBox>
    ),
    status: (
      <MDBox ml={-1}>
        <MDBadge
          badgeContent={getStatusText(staffMember)}
          color={getStatusColor(staffMember)}
          variant="gradient"
          size="sm"
        />
      </MDBox>
    ),
    emailStatus: (
      <MDBox display="flex" alignItems="center" lineHeight={1}>
        <EmailIcon
          color={staffMember.emailSent ? 'success' : 'disabled'}
          sx={{ mr: 1, fontSize: 16, color: !staffMember.emailSent && darkMode ? 'rgba(255,255,255,0.6)' : undefined }}
        />
        <MDTypography variant="caption" color="text" fontWeight="medium" sx={{ color: darkMode ? '#FFFFFF' : 'text.secondary' }}>
          {staffMember.emailSent ? 'Sent' : 'Pending'}
        </MDTypography>
      </MDBox>
    ),
    roleAssigned: (
      <MDBox display="flex" alignItems="center" lineHeight={1}>
        <AssignmentIndIcon
          color={staffMember.roleAssignedAt ? 'success' : 'disabled'}
          sx={{ mr: 1, fontSize: 16, color: !staffMember.roleAssignedAt && darkMode ? 'rgba(255,255,255,0.6)' : undefined }}
        />
        <MDTypography variant="caption" color="text" fontWeight="medium" sx={{ color: darkMode ? '#FFFFFF' : 'text.secondary' }}>
          {staffMember.roleAssignedAt ? formatDate(staffMember.roleAssignedAt) : 'Pending'}
        </MDTypography>
      </MDBox>
    ),
    lastLogin: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {formatDate(staffMember.lastLogin)}
      </MDTypography>
    ),
    actions: (
      <MDBox display="flex" alignItems="center" gap={1}>
        <Tooltip title="Assign Role">
          <IconButton size="small" onClick={() => handleAssignRole(staffMember)} sx={{ color: darkMode ? '#FFFFFF' : 'inherit' }}>
            <AssignmentIndIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="View Details">
          <IconButton size="small" onClick={() => handleViewDetails(staffMember)} sx={{ color: darkMode ? '#FFFFFF' : 'inherit' }}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="More Actions">
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, staffMember)}
            sx={{ color: darkMode ? '#FFFFFF' : 'inherit' }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </MDBox>
    )
  }));

  if (loading && staff.length === 0) {
    return (
      <Card>
        <MDBox p={4} textAlign="center">
          <Typography variant="h6" color="text.secondary">
            Loading staff members...
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
            Error loading staff members
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
      {/* Staff Table Card */}
      <Card>
        {/* Search and Filters Section */}
        <MDBox p={3} pb={0}>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
                InputProps={{
                  sx: { height: 44 },
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

            {/* Role Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ lineHeight: '14px' }}>Role</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={handleRoleFilterChange}
                  label="Role"
                  sx={{ height: 44 }}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="placement_staff">Placement Staff</MenuItem>
                  <MenuItem value="department_hod">Department HOD</MenuItem>
                  <MenuItem value="other_staff">Other Staff</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ lineHeight: '14px' }}>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status"
                  sx={{ height: 44 }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Clear Filters */}
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={handleClearFilters}
                disabled={!searchTerm && !statusFilter && !roleFilter}
                startIcon={<ClearIcon />}
                size="small"
                sx={{
                  height: 44,
                  color: darkMode ? '#FFFFFF' : 'inherit',
                  borderColor: darkMode ? 'rgba(255,255,255,0.3)' : undefined
                }}
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
                sx={{ height: 44 }}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>

          {/* Results Summary */}
          <MDBox mt={2} mb={2}>
            <Typography variant="body2" sx={{ color: darkMode ? '#FFFFFF' : 'text.secondary' }}>
              Showing {staff.length} of {pagination.totalStaff || 0} staff members
              {selectedStaff.length > 0 && (
                <span style={{ marginLeft: 8, fontWeight: 'bold', color: darkMode ? '#90CAF9' : '#1976d2' }}>
                  ({selectedStaff.length} selected)
                </span>
              )}
            </Typography>
          </MDBox>

          {/* Selection Actions */}
          <MDBox mb={2}>
            <Grid container spacing={1} alignItems="center">
              <Grid item>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    const pendingEmailStaff = staff.filter(s => !s.emailSent);
                    setSelectedStaff(pendingEmailStaff);
                  }}
                  disabled={staff.filter(s => !s.emailSent).length === 0}
                  sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                >
                  Select Pending Emails ({staff.filter(s => !s.emailSent).length})
                </Button>
              </Grid>

              <Grid item>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    const pendingRoleStaff = staff.filter(s => !s.roleAssignedAt);
                    setSelectedStaff(pendingRoleStaff);
                  }}
                  disabled={staff.filter(s => !s.roleAssignedAt).length === 0}
                  sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                >
                  Select Pending Roles ({staff.filter(s => !s.roleAssignedAt).length})
                </Button>
              </Grid>

              <Grid item>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    const otherStaff = staff.filter(s => s.role === 'other_staff');
                    setSelectedStaff(otherStaff);
                  }}
                  disabled={staff.filter(s => s.role === 'other_staff').length === 0}
                  sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                >
                  Select Other Staff ({staff.filter(s => s.role === 'other_staff').length})
                </Button>
              </Grid>

              {selectedStaff.length > 0 && (
                <Grid item>
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={clearSelectedStaff}
                    sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                  >
                    Clear Selection
                  </Button>
                </Grid>
              )}
            </Grid>
          </MDBox>
        </MDBox>

        {/* Blue Header Bar - same as Department Management */}
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
            Staff Members Table
          </MDTypography>
        </MDBox>

        <MDBox pt={3}>
          {staff.length === 0 ? (
            <MDBox p={4} textAlign="center">
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No staff members found for this department.
                {(roleFilter || statusFilter || searchTerm) &&
                  ' Try adjusting your filters.'}
              </Alert>
            </MDBox>
          ) : (
            <>
              <DataTable
                table={{ columns, rows }}
                isSorted={false}
                noEndBorder
              />

              {/* Pagination */}
              <Box mt={2} mb={2}>
                <TablePagination
                  component="div"
                  count={pagination.totalStaff || 0}
                  page={page}
                  onPageChange={handlePageChange}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  sx={{
                    '& .MuiTablePagination-toolbar': {
                      paddingLeft: 2,
                      paddingRight: 2
                    },
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      color: darkMode ? '#FFFFFF' : '#344767',
                      fontSize: '0.875rem'
                    },
                    '& .MuiTablePagination-select': {
                      color: darkMode ? '#FFFFFF' : '#344767',
                      '& .MuiTablePagination-selectIcon': {
                        color: darkMode ? '#FFFFFF' : '#344767'
                      }
                    },
                    '& .MuiTablePagination-actions': {
                      color: darkMode ? '#FFFFFF' : '#344767'
                    }
                  }}
                />
              </Box>
            </>
          )}
        </MDBox>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleAssignRole(selectedStaffForMenu)}>
          <ListItemIcon>
            <AssignmentIndIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Assign Role</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleViewDetails(selectedStaffForMenu)}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DepartmentStaffList;
