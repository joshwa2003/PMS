import React, { useState, useEffect } from 'react';
import {
  Card,
  Grid,
  Box,
  Paper,
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
  Collapse,
  Button,
  Typography,
  TablePagination
} from '@mui/material';
import { 
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Sort as SortIcon,
  FilterList as FilterListIcon,
  ViewList as ViewListIcon,
  Pages as PagesIcon,
  DeleteSweep as DeleteSweepIcon,
  SelectAll as SelectAllIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Custom components
import CustomDataTable from "components/StaffManagement/CustomDataTable";
import StudentDetailsModal from "./StudentDetailsModal";
import studentTableData from "./data/studentTableData";

// Services
import departmentWiseStudentService from 'services/departmentWiseStudentService';

const StudentDataTable = ({ 
  students = [], 
  loading = false, 
  error = null,
  pagination = {},
  onPageChange,
  onRowsPerPageChange,
  onRefresh,
  onExportCSV,
  department
}) => {
  // State for student detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    placementStatus: '',
    program: '',
    status: ''
  });
  const [sortOrder, setSortOrder] = useState('asc');

  // Selection state
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Display mode state
  const [displayMode, setDisplayMode] = useState('paginated');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtered students for display
  const [filteredStudents, setFilteredStudents] = useState([]);

  // Filter students based on search and filters
  useEffect(() => {
    let filtered = [...students];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student => {
        const searchableText = `${student.name} ${student.email} ${student.studentId} ${student.registrationNumber}`.toLowerCase();
        return searchableText.includes(searchTerm.toLowerCase());
      });
    }

    // Apply placement status filter
    if (filters.placementStatus) {
      filtered = filtered.filter(student => student.placementStatus === filters.placementStatus);
    }

    // Apply program filter
    if (filters.program) {
      filtered = filtered.filter(student => student.program === filters.program);
    }

    // Apply status filter
    if (filters.status) {
      if (filters.status === 'active') {
        filtered = filtered.filter(student => student.isActive);
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(student => !student.isActive);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a.name?.toLowerCase() || '';
      const bValue = b.name?.toLowerCase() || '';
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    setFilteredStudents(filtered);
  }, [students, searchTerm, filters, sortOrder]);

  // Handler functions
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (filterType) => (event) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: event.target.value
    }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      placementStatus: '',
      program: '',
      status: ''
    });
  };

  const handleRefresh = () => {
    handleClearFilters();
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleDisplayModeChange = (event, newMode) => {
    if (newMode !== null && newMode !== displayMode) {
      setDisplayMode(newMode);
    }
  };

  const handleItemsPerPageChange = (event) => {
    const newItemsPerPage = parseInt(event.target.value);
    setItemsPerPage(newItemsPerPage);
    if (onRowsPerPageChange) {
      onRowsPerPageChange({ target: { value: newItemsPerPage } });
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (filters.placementStatus) count++;
    if (filters.program) count++;
    if (filters.status) count++;
    return count;
  };

  // Handle view details
  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setDetailModalOpen(true);
  };

  // Handle edit student (placeholder)
  const handleEditStudent = (student) => {
    console.log('Edit student:', student);
    // TODO: Implement edit functionality
  };

  // Handle delete student (placeholder)
  const handleDeleteStudent = (student) => {
    console.log('Delete student:', student);
    // TODO: Implement delete functionality
  };

  // Handle student selection
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      const newSelection = prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId];
      
      // Update select all state
      setSelectAll(newSelection.length === filteredStudents.length && filteredStudents.length > 0);
      
      return newSelection;
    });
  };

  // Handle select all
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedStudents([]);
      setSelectAll(false);
    } else {
      const allIds = filteredStudents.map(student => student.id);
      setSelectedStudents(allIds);
      setSelectAll(true);
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedStudents([]);
    setSelectAll(false);
  };

  // Get unique programs for filter
  const availablePrograms = [...new Set(students.map(s => s.program).filter(Boolean))];

  // Get table data
  const { columns, rows } = studentTableData(
    filteredStudents,
    handleViewDetails,
    handleEditStudent,
    handleDeleteStudent,
    null, // handleToggleStatus - not implemented yet
    {
      selectedStudents,
      toggleStudentSelection
    }
  );

  if (loading) {
    return (
      <Card>
        <MDBox p={4} textAlign="center">
          <Typography variant="h6" color="text.secondary">
            Loading students...
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
            Error loading students
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
      {/* Students Table Card */}
      <Card>
        {/* Search and Filters Section - ABOVE the blue header */}
        <MDBox p={3} pb={0}>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search students..."
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

            {/* Placement Status Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small" sx={{ height: '40px' }}>
                <InputLabel sx={{ top: '-7px' }}>Placement Status</InputLabel>
                <Select
                  value={filters.placementStatus}
                  onChange={handleFilterChange('placementStatus')}
                  label="Placement Status"
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
                  <MenuItem value="Placed">Placed</MenuItem>
                  <MenuItem value="Unplaced">Unplaced</MenuItem>
                  <MenuItem value="Multiple Offers">Multiple Offers</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Program Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small" sx={{ height: '40px' }}>
                <InputLabel sx={{ top: '-7px' }}>Program</InputLabel>
                <Select
                  value={filters.program}
                  onChange={handleFilterChange('program')}
                  label="Program"
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
                  <MenuItem value="">All Programs</MenuItem>
                  {availablePrograms.map((program) => (
                    <MenuItem key={program} value={program}>
                      {program}
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
                {filters.placementStatus && (
                  <Chip
                    label={`Status: ${filters.placementStatus}`}
                    onDelete={() => handleFilterChange('placementStatus')({ target: { value: '' } })}
                    size="small"
                    variant="outlined"
                  />
                )}
                {filters.program && (
                  <Chip
                    label={`Program: ${filters.program}`}
                    onDelete={() => handleFilterChange('program')({ target: { value: '' } })}
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
                ? `Showing ${filteredStudents.length} of ${pagination.totalStudents || students.length} students • Page ${pagination.currentPage || 1} of ${pagination.totalPages || 1}`
                : `Showing ${filteredStudents.length} students`
              }
              {getActiveFiltersCount() > 0 && ' (filtered)'}
              {selectedStudents.length > 0 && ` • ${selectedStudents.length} selected`}
            </Typography>
            
            {/* Display Mode Controls */}
            <Box display="flex" alignItems="center" gap={2}>
              {/* Export Button */}
              {onExportCSV && (
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={onExportCSV}
                  startIcon={<DownloadIcon />}
                  disabled={filteredStudents.length === 0}
                >
                  Export CSV
                </MDButton>
              )}

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
        <Collapse in={selectedStudents.length > 0}>
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
                  indeterminate={selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length}
                  onChange={handleSelectAllChange}
                  sx={{ 
                    color: 'white',
                    '&.Mui-checked': { color: 'white' },
                    '&.MuiCheckbox-indeterminate': { color: 'white' }
                  }}
                />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" gap={1}>
                <Tooltip title="Clear Selection">
                  <IconButton onClick={clearSelection} sx={{ color: 'white' }}>
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Bulk Actions">
                  <IconButton sx={{ color: 'white' }}>
                    <DeleteSweepIcon />
                  </IconButton>
                </Tooltip>
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
              {filteredStudents.length > 0 && (
                <Checkbox
                  checked={selectAll}
                  indeterminate={selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length}
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
                Students Table
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
          {filteredStudents.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No students found matching your criteria
              </Typography>
            </Box>
          ) : (
            <CustomDataTable
              table={{ columns, rows }}
              isSorted={false}
              noEndBorder
            />
          )}
          
          {/* Pagination Controls */}
          {displayMode === 'paginated' && pagination && (
            <Box mt={3} mb={2}>
              <TablePagination
                component="div"
                count={pagination.totalStudents || 0}
                page={(pagination.currentPage || 1) - 1}
                onPageChange={(event, newPage) => onPageChange && onPageChange(newPage + 1)}
                rowsPerPage={itemsPerPage}
                onRowsPerPageChange={handleItemsPerPageChange}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </Box>
          )}
        </MDBox>
      </Card>

      {/* Student Detail Modal */}
      <StudentDetailsModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        student={selectedStudent}
        onEditStudent={handleEditStudent}
        onDeleteStudent={handleDeleteStudent}
        canEdit={false} // TODO: Implement based on user permissions
        canDelete={false} // TODO: Implement based on user permissions
      />
    </Box>
  );
};

export default StudentDataTable;
