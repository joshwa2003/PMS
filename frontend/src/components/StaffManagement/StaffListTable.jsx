import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  Typography,
  Pagination,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Sort as SortIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import { useStaffManagement } from 'context/StaffManagementContext';
import { useAuth } from 'context/AuthContext';

const StaffListTable = ({ onEditStaff, onStaffDeleted }) => {
  const {
    staff,
    loading,
    error,
    pagination,
    filters,
    sortBy,
    sortOrder,
    fetchStaff,
    handlePageChange,
    handleFilterChange,
    handleSortChange,
    searchStaff,
    clearFilters,
    getAvailableRoles,
    getAvailableDepartments,
    getRoleDisplayName,
    getDepartmentDisplayName,
    getStaffStatusColor,
    getStaffStatusText,
    formatLastLogin,
    deleteStaff
  } = useStaffManagement();

  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [localFilters, setLocalFilters] = useState({
    role: '',
    department: '',
    isActive: '',
    isVerified: ''
  });

  // Staff detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Action menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuStaff, setMenuStaff] = useState(null);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  const availableRoles = getAvailableRoles();
  const availableDepartments = getAvailableDepartments();

  // Fetch staff on component mount
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Update local filters when context filters change
  useEffect(() => {
    setLocalFilters({
      role: filters.role || '',
      department: filters.department || '',
      isActive: filters.isActive || '',
      isVerified: filters.isVerified || ''
    });
    setSearchTerm(filters.searchTerm || '');
  }, [filters]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchStaff(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleLocalFilterChange = (filterName) => (event) => {
    const value = event.target.value;
    const newFilters = {
      ...localFilters,
      [filterName]: value
    };
    setLocalFilters(newFilters);
    handleFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocalFilters({
      role: '',
      department: '',
      isActive: '',
      isVerified: ''
    });
    clearFilters();
  };

  const handleRefresh = () => {
    fetchStaff();
  };

  const handleSortToggle = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    handleSortChange(sortBy, newSortOrder);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (localFilters.role) count++;
    if (localFilters.department) count++;
    if (localFilters.isActive) count++;
    if (localFilters.isVerified) count++;
    return count;
  };

  // Staff row click handler
  const handleStaffRowClick = (staffMember) => {
    setSelectedStaff(staffMember);
    setDetailModalOpen(true);
  };

  // Action menu handlers
  const handleMenuOpen = (event, staffMember) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuStaff(staffMember);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuStaff(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    if (onEditStaff && menuStaff) {
      onEditStaff(menuStaff);
    }
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setStaffToDelete(menuStaff);
    setDeleteDialogOpen(true);
  };

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

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setStaffToDelete(null);
  };

  // Helper functions
  const getStatusIcon = (staffMember) => {
    if (!staffMember.isActive) {
      return <CancelIcon color="error" fontSize="small" />;
    }
    if (!staffMember.isVerified) {
      return <WarningIcon color="warning" fontSize="small" />;
    }
    return <CheckCircleIcon color="success" fontSize="small" />;
  };

  const getInitials = (staffMember) => {
    return `${staffMember.firstName?.charAt(0) || ''}${staffMember.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const canDelete = user?.role === 'admin';

  const renderFilterChips = () => {
    const chips = [];
    
    if (searchTerm) {
      chips.push(
        <Chip
          key="search"
          label={`Search: "${searchTerm}"`}
          onDelete={() => {
            setSearchTerm('');
            searchStaff('');
          }}
          size="small"
          variant="outlined"
        />
      );
    }
    
    if (localFilters.role) {
      chips.push(
        <Chip
          key="role"
          label={`Role: ${getRoleDisplayName(localFilters.role)}`}
          onDelete={() => handleLocalFilterChange('role')({ target: { value: '' } })}
          size="small"
          variant="outlined"
        />
      );
    }
    
    if (localFilters.department) {
      chips.push(
        <Chip
          key="department"
          label={`Dept: ${getDepartmentDisplayName(localFilters.department)}`}
          onDelete={() => handleLocalFilterChange('department')({ target: { value: '' } })}
          size="small"
          variant="outlined"
        />
      );
    }
    
    if (localFilters.isActive) {
      chips.push(
        <Chip
          key="isActive"
          label={`Status: ${localFilters.isActive === 'true' ? 'Active' : 'Inactive'}`}
          onDelete={() => handleLocalFilterChange('isActive')({ target: { value: '' } })}
          size="small"
          variant="outlined"
        />
      );
    }
    
    if (localFilters.isVerified) {
      chips.push(
        <Chip
          key="isVerified"
          label={`Verified: ${localFilters.isVerified === 'true' ? 'Yes' : 'No'}`}
          onDelete={() => handleLocalFilterChange('isVerified')({ target: { value: '' } })}
          size="small"
          variant="outlined"
        />
      );
    }
    
    return chips;
  };

  return (
    <Box>
      {/* Header */}
      <MDBox mb={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h5" fontWeight="medium">
            Staff Members
          </MDTypography>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}>
              <IconButton onClick={handleSortToggle}>
                <SortIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </MDBox>

        {/* Search and Filters */}
        <Card>
          <MDBox p={2}>
            <Grid container spacing={2} alignItems="center">
              {/* Search */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search staff members..."
                  value={searchTerm}
                  onChange={handleSearchChange}
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
                          onClick={() => {
                            setSearchTerm('');
                            searchStaff('');
                          }}
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
                    value={localFilters.role}
                    onChange={handleLocalFilterChange('role')}
                    input={<OutlinedInput label="Role" />}
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
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={localFilters.department}
                    onChange={handleLocalFilterChange('department')}
                    input={<OutlinedInput label="Department" />}
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
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={localFilters.isActive}
                    onChange={handleLocalFilterChange('isActive')}
                    input={<OutlinedInput label="Status" />}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Clear Filters */}
              <Grid item xs={12} md={2}>
                <MDButton
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  onClick={handleClearFilters}
                  disabled={getActiveFiltersCount() === 0}
                  startIcon={<ClearIcon />}
                >
                  Clear ({getActiveFiltersCount()})
                </MDButton>
              </Grid>
            </Grid>

            {/* Active Filters */}
            {getActiveFiltersCount() > 0 && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Active Filters:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {renderFilterChips()}
                </Box>
              </Box>
            )}
          </MDBox>
        </Card>
      </MDBox>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" ml={2}>
            Loading staff members...
          </Typography>
        </Box>
      )}

      {/* Staff Table */}
      {!loading && (
        <>
          {staff.length === 0 ? (
            <Card>
              <MDBox p={4} textAlign="center">
                <Typography variant="h6" color="text.secondary" mb={1}>
                  No Staff Members Found
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {getActiveFiltersCount() > 0 
                    ? 'Try adjusting your filters to see more results.'
                    : 'No staff members have been added yet.'
                  }
                </Typography>
                {getActiveFiltersCount() > 0 && (
                  <MDButton
                    variant="outlined"
                    color="primary"
                    onClick={handleClearFilters}
                  >
                    Clear All Filters
                  </MDButton>
                )}
              </MDBox>
            </Card>
          ) : (
            <>
              {/* Results Summary */}
              <MDBox mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Showing {staff.length} of {pagination.totalStaff} staff members
                  {getActiveFiltersCount() > 0 && ' (filtered)'}
                </Typography>
              </MDBox>

              {/* Staff Table */}
              <TableContainer component={Paper} sx={{ mb: 3, overflowX: 'auto' }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 250, minWidth: 250 }}>Staff Member</TableCell>
                      <TableCell sx={{ width: 120, minWidth: 120 }}>Role</TableCell>
                      <TableCell sx={{ width: 150, minWidth: 150 }}>Department</TableCell>
                      <TableCell sx={{ width: 200, minWidth: 200 }}>Contact</TableCell>
                      <TableCell sx={{ width: 100, minWidth: 100 }}>Status</TableCell>
                      <TableCell align="center" sx={{ width: 80, minWidth: 80 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staff.map((staffMember) => (
                      <TableRow
                        key={staffMember.id}
                        hover
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          }
                        }}
                        onClick={() => handleStaffRowClick(staffMember)}
                      >
                        <TableCell sx={{ width: 250, minWidth: 250 }}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              sx={{
                                width: { xs: 36, sm: 40 },
                                height: { xs: 36, sm: 40 },
                                bgcolor: 'primary.main',
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                fontWeight: 'bold'
                              }}
                            >
                              {getInitials(staffMember)}
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography 
                                variant="subtitle2" 
                                fontWeight="medium"
                                sx={{ 
                                  fontSize: { xs: '0.875rem', sm: '1rem' },
                                  lineHeight: 1.2
                                }}
                              >
                                {staffMember.fullName}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  lineHeight: 1.2
                                }}
                              >
                                {staffMember.designation}
                              </Typography>
                              {staffMember.employeeId && (
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary"
                                  sx={{ 
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                    display: 'block'
                                  }}
                                >
                                  ID: {staffMember.employeeId}
                                </Typography>
                              )}
                              {/* Mobile-only role and department chips */}
                              <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                                <Chip
                                  label={getRoleDisplayName(staffMember.role)}
                                  color="primary"
                                  variant="outlined"
                                  size="small"
                                  sx={{ 
                                    fontSize: '0.65rem',
                                    height: 20,
                                    '& .MuiChip-label': { px: 1 }
                                  }}
                                />
                                <Chip
                                  label={getDepartmentDisplayName(staffMember.department)}
                                  color="secondary"
                                  variant="outlined"
                                  size="small"
                                  sx={{ 
                                    fontSize: '0.65rem',
                                    height: 20,
                                    '& .MuiChip-label': { px: 1 }
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>
                        
                        <TableCell sx={{ width: 120, minWidth: 120 }}>
                          <Chip
                            label={getRoleDisplayName(staffMember.role)}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        
                        <TableCell sx={{ width: 150, minWidth: 150 }}>
                          <Chip
                            label={getDepartmentDisplayName(staffMember.department)}
                            color="secondary"
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        
                        <TableCell sx={{ width: 200, minWidth: 200 }}>
                          <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                              <EmailIcon fontSize="small" color="action" />
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '100%'
                                }}
                              >
                                {staffMember.email}
                              </Typography>
                            </Box>
                            {staffMember.phone && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <PhoneIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {staffMember.phone}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        
                        <TableCell sx={{ width: 100, minWidth: 100 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getStatusIcon(staffMember)}
                            <Typography variant="body2" color="text.secondary">
                              {getStaffStatusText(staffMember)}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell align="center" sx={{ width: 80, minWidth: 80 }}>
                          <IconButton
                            size="small"
                            onClick={(event) => handleMenuOpen(event, staffMember)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.currentPage}
                    onChange={(event, page) => handlePageChange(page)}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          if (menuStaff) handleStaffRowClick(menuStaff);
        }}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Staff
        </MenuItem>
        {canDelete && (
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete Staff
          </MenuItem>
        )}
      </Menu>

      {/* Staff Detail Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h5" fontWeight="medium">
              Staff Details
            </MDTypography>
            <IconButton
              onClick={() => setDetailModalOpen(false)}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedStaff && (
            <Box>
              {/* Header with avatar and basic info */}
              <Box display="flex" alignItems="center" gap={3} mb={3}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {getInitials(selectedStaff)}
                </Avatar>
                
                <Box flex={1}>
                  <MDTypography variant="h4" fontWeight="medium" mb={1}>
                    {selectedStaff.fullName}
                  </MDTypography>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    {getStatusIcon(selectedStaff)}
                    <Typography variant="body1" color="text.secondary">
                      {getStaffStatusText(selectedStaff)}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip
                      label={getRoleDisplayName(selectedStaff.role)}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={getDepartmentDisplayName(selectedStaff.department)}
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Detailed Information */}
              <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid item xs={12} md={6}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Personal Information
                  </MDTypography>
                  
                  <Box space={2}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <PersonIcon color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Designation
                        </Typography>
                        <Typography variant="body1">
                          {selectedStaff.designation}
                        </Typography>
                      </Box>
                    </Box>

                    {selectedStaff.employeeId && (
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <BadgeIcon color="action" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Employee ID
                          </Typography>
                          <Typography variant="body1">
                            {selectedStaff.employeeId}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <BusinessIcon color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Department
                        </Typography>
                        <Typography variant="body1">
                          {getDepartmentDisplayName(selectedStaff.department)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                {/* Contact Information */}
                <Grid item xs={12} md={6}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Contact Information
                  </MDTypography>
                  
                  <Box space={2}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <EmailIcon color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Email Address
                        </Typography>
                        <Typography variant="body1">
                          {selectedStaff.email}
                        </Typography>
                      </Box>
                    </Box>

                    {selectedStaff.phone && (
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <PhoneIcon color="action" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Phone Number
                          </Typography>
                          <Typography variant="body1">
                            {selectedStaff.phone}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* Account Information */}
                <Grid item xs={12}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Account Information
                  </MDTypography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Account Status
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(selectedStaff)}
                        <Typography variant="body1">
                          {selectedStaff.isActive ? 'Active' : 'Inactive'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Verification Status
                      </Typography>
                      <Typography variant="body1">
                        {selectedStaff.isVerified ? 'Verified' : 'Not Verified'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Last Login
                      </Typography>
                      <Typography variant="body1">
                        {formatLastLogin(selectedStaff.lastLogin)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Admin Notes */}
                {selectedStaff.adminNotes && (
                  <Grid item xs={12}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Admin Notes
                    </MDTypography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body1">
                        {selectedStaff.adminNotes}
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                {/* Timestamps */}
                <Grid item xs={12}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Record Information
                  </MDTypography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Created Date
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedStaff.createdAt).toLocaleString()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Last Updated
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedStaff.updatedAt).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>
          {selectedStaff && (
            <>
              <MDButton
                variant="outlined"
                color="primary"
                onClick={() => {
                  setDetailModalOpen(false);
                  if (onEditStaff) onEditStaff(selectedStaff);
                }}
                startIcon={<EditIcon />}
              >
                Edit Staff
              </MDButton>
              {canDelete && (
                <MDButton
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setDetailModalOpen(false);
                    setStaffToDelete(selectedStaff);
                    setDeleteDialogOpen(true);
                  }}
                  startIcon={<DeleteIcon />}
                >
                  Delete Staff
                </MDButton>
              )}
            </>
          )}
        </DialogActions>
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
    </Box>
  );
};

export default StaffListTable;
