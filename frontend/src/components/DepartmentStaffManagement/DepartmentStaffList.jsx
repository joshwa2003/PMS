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
  Alert
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

// Context
import { useDepartmentStaff } from 'context/DepartmentStaffContext';

// Services
import departmentStaffService from 'services/departmentStaffService';

const DepartmentStaffList = () => {
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
    setSelectedStaffForMenu(staffMember);
    openModal('roleAssignment');
    handleMenuClose();
  };

  // Handle view details
  const handleViewDetails = (staffMember) => {
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
      fetchStaffByDepartment(currentDepartment.code, { page: 1 });
    }
    handleClearFilters();
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
      fetchStaffByDepartment(currentDepartment.code, { page: 1 });
    }
  }, [filters, currentDepartment, fetchStaffByDepartment]);

  // Create table data using the same pattern as DepartmentDataTable
  const columns = [
    { Header: "Staff Member", accessor: "staffMember", width: "25%", align: "left" },
    { Header: "Role", accessor: "role", width: "15%", align: "left" },
    { Header: "Status", accessor: "status", width: "10%", align: "center" },
    { Header: "Email Status", accessor: "emailStatus", width: "15%", align: "left" },
    { Header: "Role Assigned", accessor: "roleAssigned", width: "15%", align: "left" },
    { Header: "Last Login", accessor: "lastLogin", width: "10%", align: "center" },
    { Header: "Actions", accessor: "actions", width: "10%", align: "center" }
  ];

  const rows = staff.map((staffMember) => ({
    staffMember: (
      <MDBox display="flex" alignItems="center" lineHeight={1}>
        <MDAvatar 
          src={staffMember.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(staffMember.fullName || 'Staff')}&size=40&background=2196F3&color=ffffff`} 
          name={staffMember.fullName} 
          size="sm" 
        />
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
          sx={{ mr: 1, fontSize: 16 }}
        />
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {staffMember.emailSent ? 'Sent' : 'Pending'}
        </MDTypography>
      </MDBox>
    ),
    roleAssigned: (
      <MDBox display="flex" alignItems="center" lineHeight={1}>
        <AssignmentIndIcon 
          color={staffMember.roleAssignedAt ? 'success' : 'disabled'} 
          sx={{ mr: 1, fontSize: 16 }}
        />
        <MDTypography variant="caption" color="text" fontWeight="medium">
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
          <IconButton size="small" onClick={() => handleAssignRole(staffMember)}>
            <AssignmentIndIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="View Details">
          <IconButton size="small" onClick={() => handleViewDetails(staffMember)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="More Actions">
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, staffMember)}
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
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={handleRoleFilterChange}
                  label="Role"
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
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={handleClearFilters}
                disabled={!searchTerm && !statusFilter && !roleFilter}
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
              Showing {staff.length} of {pagination.totalStaff || 0} staff members
            </Typography>
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
            <DataTable
              table={{ columns, rows }}
              isSorted={false}
              noEndBorder
            />
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
