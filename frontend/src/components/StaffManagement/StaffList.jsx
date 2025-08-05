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
  OutlinedInput
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import StaffCard from './StaffCard';
import { useStaffManagement } from 'context/StaffManagementContext';

const StaffList = ({ onEditStaff, onStaffDeleted }) => {
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
    getDepartmentDisplayName
  } = useStaffManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [localFilters, setLocalFilters] = useState({
    role: '',
    department: '',
    isActive: '',
    isVerified: ''
  });

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

      {/* Staff Grid */}
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

              {/* Staff Cards Grid */}
              <Grid container spacing={3}>
                {staff.map((staffMember) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={staffMember.id}>
                    <StaffCard
                      staff={staffMember}
                      onEdit={onEditStaff}
                      onDelete={(staffId) => {
                        if (onStaffDeleted) {
                          onStaffDeleted(staffMember.fullName);
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>

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
    </Box>
  );
};

export default StaffList;
