import React, { useState, useEffect } from 'react';
import {
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
  Typography,
  Box,
  Paper,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  Toolbar,
  Fade,
  Collapse
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Sort as SortIcon,
  FilterList as FilterListIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Pages as PagesIcon,
  DeleteSweep as DeleteSweepIcon,
  SelectAll as SelectAllIcon
} from '@mui/icons-material';

// S.A. Engineering College React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// S.A. Engineering College React example components
import CustomDataTable from "./CustomDataTable";

// Advanced Pagination Component
import AdvancedPagination from './AdvancedPagination';

// Data
import staffTableData from "./data/staffTableData";

// Context
import { useStaffManagement } from 'context/StaffManagementContext';
import { useAuth } from 'context/AuthContext';
import staffService from '../../services/staffService';
const StaffDataTable = ({ onEditStaff, onStaffDeleted }) => {
  const {
    staff,
    loading,
    error,
    displayMode,
    itemsPerPage,
    pagination,
    selectedStaff: contextSelectedStaff,
    selectAll,
    bulkOperationLoading,
    fetchStaff,
    deleteStaff,
    deleteBulkStaff,
    getRoleDisplayName,
    getDepartmentDisplayName,
    formatLastLogin,
    getAvailableRoles,
    getAvailableDepartments,
    updateStaffStatus,
    toggleDisplayMode,
    changeItemsPerPage,
    handlePageChange,
    handleFilterChange: contextHandleFilterChange,
    toggleStaffSelection,
    toggleSelectAll,
    clearSelection,
    getSelectedStaffData
  } = useStaffManagement();

  const { user } = useAuth();

  // State for available departments
  const [availableDepartments, setAvailableDepartments] = useState([]);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departments = await staffService.getAvailableDepartments();
        setAvailableDepartments(departments);
      } catch (error) {
        console.error('Error fetching departments:', error);
        // Fallback to sync method
        setAvailableDepartments(staffService.getAvailableDepartmentsSync());
      }
    };
    fetchDepartments();
  }, []);
  // Staff detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  // Bulk delete confirmation dialog state
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    department: '',
    status: ''
  });
  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch staff on component mount
  useEffect(() => {
    fetchStaff();
  }, []);

  // Handler functions
  const handleSearchChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    
    // Update context filters for server-side filtering
    const contextFilters = {
      searchTerm: newSearchTerm,
      role: filters.role,
      department: filters.department,
      isActive: filters.status === 'active' ? 'true' : filters.status === 'inactive' ? 'false' : ''
    };
    
    // Use context's handleFilterChange for server-side filtering
    contextHandleFilterChange(contextFilters);
  };

  const handleFilterChange = (filterType) => (event) => {
    const newValue = event.target.value;
    setFilters(prev => ({
      ...prev,
      [filterType]: newValue
    }));
    
    // Update context filters for server-side filtering
    const contextFilters = {
      searchTerm: searchTerm,
      role: filterType === 'role' ? newValue : filters.role,
      department: filterType === 'department' ? newValue : filters.department,
      isActive: filterType === 'status' ? 
        (newValue === 'active' ? 'true' : newValue === 'inactive' ? 'false' : '') :
        (filters.status === 'active' ? 'true' : filters.status === 'inactive' ? 'false' : '')
    };
    
    // Use context's handleFilterChange for server-side filtering
    contextHandleFilterChange(contextFilters);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      role: '',
      department: '',
      status: ''
    });
    
    // Clear context filters for server-side filtering
    contextHandleFilterChange({
      searchTerm: '',
      role: '',
      department: '',
      isActive: ''
    });
  };

  const handleRefresh = () => {
    fetchStaff();
    handleClearFilters();
  };

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleDisplayModeChange = (event, newMode) => {
    if (newMode !== null && newMode !== displayMode) {
      toggleDisplayMode();
    }
  };

  const handleItemsPerPageChange = (event) => {
    changeItemsPerPage(parseInt(event.target.value));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (filters.role) count++;
    if (filters.department) count++;
    if (filters.status) count++;
    return count;
  };

  // Handle view details
  const handleViewDetails = (staffMember) => {
    setSelectedStaff(staffMember);
    setDetailModalOpen(true);
  };

  // Handle edit staff
  const handleEditStaff = (staffMember) => {
    if (onEditStaff) {
      onEditStaff(staffMember);
    }
  };

  // Handle delete staff
  const handleDeleteStaff = (staffMember) => {
    setStaffToDelete(staffMember);
    setDeleteDialogOpen(true);
  };

  // Handle toggle staff status
  const handleToggleStatus = async (staffMember) => {
    try {
      await updateStaffStatus(staffMember.id, !staffMember.isActive);
      // The context will handle updating the staff list
    } catch (error) {
      console.error('Error toggling staff status:', error);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (contextSelectedStaff.length === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  // Confirm bulk delete
  const handleBulkDeleteConfirm = async () => {
    if (contextSelectedStaff.length === 0) return;

    try {
      const selectedStaffData = getSelectedStaffData();
      await deleteBulkStaff(contextSelectedStaff);
      setBulkDeleteDialogOpen(false);
      
      if (onStaffDeleted) {
        const staffNames = selectedStaffData.map(s => s.fullName).join(', ');
        onStaffDeleted(`${contextSelectedStaff.length} staff members (${staffNames})`);
      }
    } catch (error) {
      // Error handled by context
    }
  };

  // Cancel bulk delete
  const handleBulkDeleteCancel = () => {
    setBulkDeleteDialogOpen(false);
  };

  // Handle select all checkbox in header
  const handleSelectAllChange = () => {
    toggleSelectAll();
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (staffToDelete) {
      try {
        await deleteStaff(staffToDelete.id);
        setDeleteDialogOpen(false);
        setStaffToDelete(null);
        if (onStaffDeleted) {
          onStaffDeleted(staffToDelete.fullName);
        }
      } catch (error) {
        // Error handled by context
      }
    }
  };

  // Cancel delete
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setStaffToDelete(null);
  };

  // Helper functions
  const getInitials = (staffMember) => {
    return `${staffMember.firstName?.charAt(0) || ''}${staffMember.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusIcon = (staffMember) => {
    if (!staffMember.isActive) {
      return '🔴'; // Red circle for inactive
    }
    if (!staffMember.isVerified) {
      return '🟡'; // Yellow circle for unverified
    }
    return '🟢'; // Green circle for active
  };

  const canDelete = user?.role === 'admin';

  // Get available options for filters
  const availableRoles = getAvailableRoles ? getAvailableRoles() : [];

  // Get table data using staff from context (server-side filtered)
  const { columns, rows } = staffTableData(
    staff,
    handleViewDetails,
    handleEditStaff,
    canDelete ? handleDeleteStaff : null,
    handleToggleStatus,
    // Pass selection props for checkboxes
    canDelete ? {
      selectedStaff: contextSelectedStaff,
      toggleStaffSelection: toggleStaffSelection
    } : null,
    // Pass departments for dynamic department name resolution
    availableDepartments
  );

  if (loading) {
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
        {/* Search and Filters Section - ABOVE the blue header */}
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
                sx={{ 
                  height: '40px',
                  '& .MuiOutlinedInput-root': {
                    height: '40px',
                    minHeight: '40px'
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '8.5px 14px'
                  }
                }}
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
              <FormControl fullWidth size="small" sx={{ height: '40px' }}>
                <InputLabel sx={{ top: '-7px' }}>Role</InputLabel>
                <Select
                  value={filters.role}
                  onChange={handleFilterChange('role')}
                  label="Role"
                  sx={{ 
                    height: '40px',
                    minHeight: '40px',
                    '& .MuiSelect-select': {
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      lineHeight: '20px'
                    }
                  }}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  {availableRoles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Department Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small" sx={{ height: '40px' }}>
                <InputLabel sx={{ top: '-7px' }}>Department</InputLabel>
                <Select
                  value={filters.department}
                  onChange={handleFilterChange('department')}
                  label="Department"
                  sx={{ 
                    height: '40px',
                    minHeight: '40px',
                    '& .MuiSelect-select': {
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      lineHeight: '20px'
                    }
                  }}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {availableDepartments.map((dept) => (
                    <MenuItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small" sx={{ height: '40px' }}>
                <InputLabel sx={{ top: '-7px' }}>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={handleFilterChange('status')}
                  label="Status"
                  sx={{ 
                    height: '40px',
                    minHeight: '40px',
                    '& .MuiSelect-select': {
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      lineHeight: '20px'
                    }
                  }}
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
                disabled={getActiveFiltersCount() === 0}
                startIcon={<ClearIcon />}
                size="small"
                sx={{ 
                  height: '40px',
                  minHeight: '40px',
                  padding: '8.5px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Clear ({getActiveFiltersCount()})
              </Button>
            </Grid>
          </Grid>

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Active Filters:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {searchTerm && (
                  <Chip
                    label={`Search: "${searchTerm}"`}
                    onDelete={() => setSearchTerm('')}
                    size="small"
                    variant="outlined"
                  />
                )}
                {filters.role && (
                  <Chip
                    label={`Role: ${getRoleDisplayName(filters.role)}`}
                    onDelete={() => handleFilterChange('role')({ target: { value: '' } })}
                    size="small"
                    variant="outlined"
                  />
                )}
                {filters.department && (
                  <Chip
                    label={`Dept: ${getDepartmentDisplayName(filters.department)}`}
                    onDelete={() => handleFilterChange('department')({ target: { value: '' } })}
                    size="small"
                    variant="outlined"
                  />
                )}
                {filters.status && (
                  <Chip
                    label={`Status: ${filters.status === 'active' ? 'Active' : 'Inactive'}`}
                    onDelete={() => handleFilterChange('status')({ target: { value: '' } })}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Results Summary and Display Controls */}
          <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {displayMode === 'paginated' 
                ? `Showing ${staff.length} of ${pagination.totalStaff} staff members • Page ${pagination.currentPage} of ${pagination.totalPages}`
                : `Showing ${staff.length} staff members`
              }
              {getActiveFiltersCount() > 0 && ' (filtered)'}
              {contextSelectedStaff.length > 0 && ` • ${contextSelectedStaff.length} selected`}
            </Typography>
            
            {/* Display Mode Controls */}
            <Box display="flex" alignItems="center" gap={2}>
              {/* Display Mode Toggle */}
              <ToggleButtonGroup
                value={displayMode}
                exclusive
                onChange={handleDisplayModeChange}
                size="small"
                sx={{ height: '32px' }}
              >
                <ToggleButton value="all" sx={{ px: 2 }}>
                  <ViewListIcon sx={{ mr: 1, fontSize: '1rem' }} />
                  Show All
                </ToggleButton>
                <ToggleButton value="paginated" sx={{ px: 2 }}>
                  <PagesIcon sx={{ mr: 1, fontSize: '1rem' }} />
                  Paginated
                </ToggleButton>
              </ToggleButtonGroup>

            </Box>
          </Box>
        </MDBox>

        {/* Bulk Actions Toolbar - Show when items are selected */}
        <Collapse in={contextSelectedStaff.length > 0}>
          <Box mx={2} mt={2}>
            <Toolbar
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: '12px',
                minHeight: '64px !important',
                px: 2
              }}
            >
              <Box display="flex" alignItems="center" flex={1}>
                <Checkbox
                  checked={selectAll}
                  indeterminate={contextSelectedStaff.length > 0 && contextSelectedStaff.length < staff.length}
                  onChange={handleSelectAllChange}
                  sx={{ 
                    color: 'white',
                    '&.Mui-checked': { color: 'white' },
                    '&.MuiCheckbox-indeterminate': { color: 'white' }
                  }}
                />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {contextSelectedStaff.length} staff member{contextSelectedStaff.length !== 1 ? 's' : ''} selected
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" gap={1}>
                <Tooltip title="Clear Selection">
                  <IconButton onClick={clearSelection} sx={{ color: 'white' }}>
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
                {canDelete && (
                  <Tooltip title="Delete Selected">
                    <IconButton 
                      onClick={handleBulkDelete} 
                      disabled={bulkOperationLoading}
                      sx={{ color: 'white' }}
                    >
                      <DeleteSweepIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Toolbar>
          </Box>
        </Collapse>

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
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center">
              {canDelete && staff.length > 0 && (
                <Checkbox
                  checked={selectAll}
                  indeterminate={contextSelectedStaff.length > 0 && contextSelectedStaff.length < staff.length}
                  onChange={handleSelectAllChange}
                  sx={{ 
                    color: 'white',
                    '&.Mui-checked': { color: 'white' },
                    '&.MuiCheckbox-indeterminate': { color: 'white' },
                    mr: 2
                  }}
                />
              )}
              <MDTypography variant="h6" color="white">
                Staff Members Table
              </MDTypography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh} disabled={loading} sx={{ color: 'white' }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}>
                <IconButton onClick={handleSortToggle} sx={{ color: 'white' }}>
                  <SortIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </MDBox>
        </MDBox>

        <MDBox pt={3}>
          <CustomDataTable
            table={{ columns, rows }}
            isSorted={false}
            noEndBorder
          />
          
          {/* Advanced Pagination Controls (always show in paginated mode) */}
          {displayMode === 'paginated' && (
            <Box mt={3} mb={2}>
              <AdvancedPagination
                currentPage={pagination.currentPage}
                totalPages={Math.max(1, pagination.totalPages)}
                totalItems={pagination.totalStaff}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={changeItemsPerPage}
                onRefresh={handleRefresh}
                loading={loading}
                showItemsPerPage={true}
                showTotalInfo={true}
                showRefresh={true}
                itemsPerPageOptions={[5, 10, 25, 50, 100]}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
              />
            </Box>
          )}
        </MDBox>
      </Card>

      {/* Enhanced Staff Detail Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { 
            minHeight: '80vh',
            borderRadius: '16px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }
        }}
      >
        {selectedStaff && (
          <>
            {/* Enhanced Header with Gradient Background */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                color: 'white',
                p: 4,
                position: 'relative'
              }}
            >
              {/* Close Button */}
              <IconButton
                onClick={() => setDetailModalOpen(false)}
                sx={{ 
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>

              {/* Staff Profile Header */}
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    border: '4px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                  }}
                >
                  {getInitials(selectedStaff)}
                </Avatar>
                
                <Box flex={1}>
                  <Typography variant="h3" fontWeight="bold" mb={1}>
                    {selectedStaff.fullName}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Chip
                      label={selectedStaff.isActive ? 'Active' : 'Inactive'}
                      sx={{
                        backgroundColor: selectedStaff.isActive ? '#4caf50' : '#f44336',
                        color: 'white',
                        fontWeight: 'bold',
                        '& .MuiChip-label': { px: 2 }
                      }}
                    />
                    <Chip
                      label={selectedStaff.isVerified ? 'Verified' : 'Unverified'}
                      sx={{
                        backgroundColor: selectedStaff.isVerified ? '#2196f3' : '#ff9800',
                        color: 'white',
                        fontWeight: 'bold',
                        '& .MuiChip-label': { px: 2 }
                      }}
                    />
                  </Box>
                  
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    {getRoleDisplayName(selectedStaff.role)} • {getDepartmentDisplayName(selectedStaff.department)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Enhanced Content */}
            <DialogContent sx={{ p: 0 }}>
              <Box p={4}>
                <Grid container spacing={4}>
                  {/* Personal Information Card */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        borderRadius: '12px',
                        border: '1px solid #e0e0e0',
                        height: '100%'
                      }}
                    >
                      <Box display="flex" alignItems="center" mb={3}>
                        <Avatar sx={{ bgcolor: '#2196f3', mr: 2 }}>
                          👤
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          Personal Information
                        </Typography>
                      </Box>
                      
                      <Box space={3}>
                        <Box mb={3}>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                            Full Name
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem' }}>
                            {selectedStaff.fullName}
                          </Typography>
                        </Box>

                        <Box mb={3}>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                            Designation
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem' }}>
                            {selectedStaff.designation || 'Not specified'}
                          </Typography>
                        </Box>

                        {selectedStaff.employeeId && (
                          <Box mb={3}>
                            <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                              Employee ID
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem', fontFamily: 'monospace' }}>
                              {selectedStaff.employeeId}
                            </Typography>
                          </Box>
                        )}

                        <Box mb={3}>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                            Department
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem' }}>
                            {getDepartmentDisplayName(selectedStaff.department)}
                          </Typography>
                        </Box>

                        <Box mb={3}>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                            Role
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem' }}>
                            {getRoleDisplayName(selectedStaff.role)}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Contact Information Card */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        borderRadius: '12px',
                        border: '1px solid #e0e0e0',
                        height: '100%'
                      }}
                    >
                      <Box display="flex" alignItems="center" mb={3}>
                        <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                          📞
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          Contact Information
                        </Typography>
                      </Box>
                      
                      <Box space={3}>
                        <Box mb={3}>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                            Email Address
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem', color: '#1976d2' }}>
                            {selectedStaff.email}
                          </Typography>
                        </Box>

                        {selectedStaff.phone && (
                          <Box mb={3}>
                            <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                              Phone Number
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem', fontFamily: 'monospace' }}>
                              {selectedStaff.phone}
                            </Typography>
                          </Box>
                        )}

                        <Box mb={3}>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                            Account Status
                          </Typography>
                          <Box display="flex" alignItems="center" mt={0.5}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: selectedStaff.isActive ? '#4caf50' : '#f44336',
                                mr: 1
                              }}
                            />
                            <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                              {selectedStaff.isActive ? 'Active' : 'Inactive'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box mb={3}>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                            Verification Status
                          </Typography>
                          <Box display="flex" alignItems="center" mt={0.5}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: selectedStaff.isVerified ? '#2196f3' : '#ff9800',
                                mr: 1
                              }}
                            />
                            <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                              {selectedStaff.isVerified ? 'Verified' : 'Unverified'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box mb={3}>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                            Last Login
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem' }}>
                            {formatLastLogin(selectedStaff.lastLogin)}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Record Information Card */}
                  <Grid item xs={12}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        borderRadius: '12px',
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      <Box display="flex" alignItems="center" mb={3}>
                        <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                          📋
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          Record Information
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                            Created Date
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem' }}>
                            {new Date(selectedStaff.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                            Last Updated
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem' }}>
                            {selectedStaff.updatedAt ? new Date(selectedStaff.updatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Never'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            
            {/* Enhanced Action Buttons */}
            <Box
              sx={{
                p: 3,
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Button
                onClick={() => setDetailModalOpen(false)}
                variant="outlined"
                size="large"
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 'bold'
                }}
              >
                Close
              </Button>
              
              <Box display="flex" gap={2}>
                <MDButton
                  variant="gradient"
                  color="info"
                  size="large"
                  onClick={() => {
                    setDetailModalOpen(false);
                    if (onEditStaff) onEditStaff(selectedStaff);
                  }}
                  startIcon={<EditIcon />}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    px: 3
                  }}
                >
                  Edit Staff
                </MDButton>
                
                {canDelete && (
                  <MDButton
                    variant="gradient"
                    color="error"
                    size="large"
                    onClick={() => {
                      setDetailModalOpen(false);
                      setStaffToDelete(selectedStaff);
                      setDeleteDialogOpen(true);
                    }}
                    startIcon={<DeleteIcon />}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      px: 3
                    }}
                  >
                    Delete Staff
                  </MDButton>
                )}
              </Box>
            </Box>
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
            Delete Staff Member
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {staffToDelete && (
            <>
              <Typography variant="body1" mb={2}>
                Are you sure you want to delete <strong>{staffToDelete.fullName}</strong>?
              </Typography>
              
              <Typography variant="body2" color="text.secondary" mb={2}>
                This action cannot be undone. The staff member will lose access to the system immediately.
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
                  Staff Details:
                </Typography>
                <Typography variant="body2">
                  • Email: {staffToDelete.email}
                </Typography>
                <Typography variant="body2">
                  • Role: {getRoleDisplayName(staffToDelete.role)}
                </Typography>
                <Typography variant="body2">
                  • Department: {getDepartmentDisplayName(staffToDelete.department)}
                </Typography>
                {staffToDelete.employeeId && (
                  <Typography variant="body2">
                    • Employee ID: {staffToDelete.employeeId}
                  </Typography>
                )}
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
            {loading ? 'Deleting...' : 'Delete Staff'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={handleBulkDeleteCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="medium">
            Delete Multiple Staff Members
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" mb={2}>
            Are you sure you want to delete <strong>{contextSelectedStaff.length} staff member{contextSelectedStaff.length !== 1 ? 's' : ''}</strong>?
          </Typography>
          
          <Typography variant="body2" color="text.secondary" mb={3}>
            This action cannot be undone. All selected staff members will lose access to the system immediately.
          </Typography>

          <Box 
            sx={{ 
              backgroundColor: 'error.light', 
              color: 'error.contrastText',
              p: 2, 
              borderRadius: 1,
              mb: 2,
              maxHeight: '300px',
              overflow: 'auto'
            }}
          >
            <Typography variant="body2" fontWeight="medium" mb={2}>
              Staff Members to be deleted:
            </Typography>
            {getSelectedStaffData().map((staff, index) => (
              <Box key={staff.id} mb={1}>
                <Typography variant="body2">
                  {index + 1}. <strong>{staff.fullName}</strong> ({staff.email})
                </Typography>
                <Typography variant="caption" display="block" sx={{ ml: 2, opacity: 0.8 }}>
                  {getRoleDisplayName(staff.role)} • {getDepartmentDisplayName(staff.department)}
                  {staff.employeeId && ` • ID: ${staff.employeeId}`}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={handleBulkDeleteCancel}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBulkDeleteConfirm}
            color="error"
            variant="contained"
            disabled={bulkOperationLoading}
            startIcon={<DeleteSweepIcon />}
          >
            {bulkOperationLoading ? 'Deleting...' : `Delete ${contextSelectedStaff.length} Staff Members`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffDataTable;
