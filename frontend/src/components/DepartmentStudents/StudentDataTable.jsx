import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Grid,
  Box,
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
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  Pages as PagesIcon,
  DeleteSweep as DeleteSweepIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React context
import { useMaterialUIController } from "context";

// Custom components
import CustomDataTable from "components/StaffManagement/CustomDataTable";
import StudentDetailsModal from "./StudentDetailsModal";

import studentTableData from "./data/studentTableData";
import { useStudentManagement } from '../../context/StudentManagementContext';


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
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const navigate = useNavigate();

  const {
    updateStudent,
    deleteStudent,
    deleteBulkStudents
  } = useStudentManagement();

  // Local state for actions
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // State for detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);

  // Handle save student
  const handleSaveStudent = async (studentId, studentData) => {
    try {
      setActionError(null);
      await updateStudent(studentId, studentData);

      // Update local state to reflect changes immediately in the modal
      if (studentToEdit && studentToEdit.id === studentId) {
        setStudentToEdit(prev => ({
          ...prev,
          ...studentData,
          // Handle nested updates if any (e.g., studentData might be flat but structure is nested)
          profile: {
            ...prev.profile,
            ...((studentData.program || studentData.department) && {
              academic: {
                ...prev.profile?.academic,
                ...(studentData.program && { program: studentData.program }),
                ...(studentData.department && { department: studentData.department })
              }
            }),
            ...(studentData.placementStatus && {
              placement: {
                ...prev.profile?.placement,
                placementStatus: studentData.placementStatus
              }
            })
          }
        }));
      }

      setActionSuccess("Student updated successfully");
      // Auto-clear success message after 3 seconds
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      const errMsg = err.message || "Failed to update student";
      setActionError(errMsg);
      // Auto-clear error after 5 seconds
      setTimeout(() => setActionError(null), 5000);
      throw err; // Propagate to modal
    }
  };



  // State for bulk delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    placementStatus: '',
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

      if (newMode === 'all') {
        const total = pagination.totalStudents || 1000;
        setItemsPerPage(total);
        if (onRowsPerPageChange) {
          onRowsPerPageChange({ target: { value: total } });
        }
      } else {
        setItemsPerPage(10);
        if (onRowsPerPageChange) {
          onRowsPerPageChange({ target: { value: 10 } });
        }
      }
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
    if (filters.status) count++;
    return count;
  };

  // Handle view details - Navigate to detailed profile page
  const handleViewDetails = (student) => {
    navigate(`/placement-director/student-profile/${student.id || student._id}`);
  };

  // Handle row click - Navigate to detailed profile page
  const handleRowClick = (student) => {
    navigate(`/placement-director/student-profile/${student.id || student._id}`);
  };



  // Handle edit student - open modal
  const handleEditStudent = (student) => {
    console.log('Edit student:', student);
    setStudentToEdit(student);
    setDetailModalOpen(true);
  };

  // Handle delete student
  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to delete ${student.name}?`)) return;

    try {
      setActionError(null);
      await deleteStudent(student.id || student._id);
      setActionSuccess("Student deleted successfully");
      setTimeout(() => setActionSuccess(null), 3000);
      setDetailModalOpen(false);
    } catch (err) {
      setActionError(err.message || 'Failed to delete student');
      setTimeout(() => setActionError(null), 5000);
    }
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

  // Handle bulk delete button click
  const handleBulkDeleteClick = () => {
    if (selectedStudents.length === 0) return;
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  // Handle bulk delete confirmation
  const handleBulkDeleteConfirm = async () => {
    if (selectedStudents.length === 0) return;

    try {
      setDeleting(true);
      setDeleteError(null);

      await deleteBulkStudents(selectedStudents);

      // Close dialog and clear selection
      setDeleteDialogOpen(false);
      clearSelection();

      // Show success message (you can add a snackbar here)
      console.log('Successfully deleted students');
    } catch (error) {
      console.error('Error deleting students:', error);
      setDeleteError(error.message || 'Failed to delete students');
    } finally {
      setDeleting(false);
    }
  };

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    if (!deleting) {
      setDeleteDialogOpen(false);
      setDeleteError(null);
    }
  };



  // Get table data
  const { columns, rows } = studentTableData(
    filteredStudents,
    handleViewDetails,
    handleEditStudent, // Restored edit functionality
    handleDeleteStudent,
    null, // handleToggleStatus - not implemented yet
    {
      selectedStudents,
      toggleStudentSelection
    },
    handleRowClick // Pass the row click handler
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
          {/* Action Alerts */}
          {actionSuccess && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setActionSuccess(null)}>
              {actionSuccess}
            </Alert>
          )}
          {actionError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
              {actionError}
            </Alert>
          )}

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
                  <MenuItem value="Multiple Offers">Multiple Offers</MenuItem>
                  <MenuItem value="Unplaced">Unplaced</MenuItem>
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
                  justifyContent: 'center',
                  color: darkMode ? 'white' : 'inherit',
                  borderColor: darkMode ? 'rgba(255,255,255,0.3)' : undefined,
                  '&:hover': {
                    borderColor: darkMode ? 'white' : undefined,
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : undefined
                  }
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
            <Typography variant="body2" sx={{ color: darkMode ? "#ffffff !important" : "text.secondary", opacity: darkMode ? 0.9 : 1 }}>
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
                sx={{
                  height: '32px',
                  '& .MuiToggleButton-root': {
                    color: darkMode ? '#ffffff !important' : 'inherit',
                    borderColor: darkMode ? 'rgba(255,255,255,0.3) !important' : 'inherit',
                    '&.Mui-selected': {
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.2) !important' : 'rgba(0,0,0,0.08)',
                      color: darkMode ? '#ffffff !important' : 'inherit',
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.3) !important' : 'rgba(0,0,0,0.12)',
                      }
                    }
                  }
                }}
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
                <Tooltip title="Delete Selected Students">
                  <IconButton
                    onClick={handleBulkDeleteClick}
                    disabled={selectedStudents.length === 0}
                    sx={{ color: 'white' }}
                  >
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
                sx={{
                  color: darkMode ? "#ffffff !important" : "inherit",
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                    color: darkMode ? "#ffffff !important" : "inherit",
                  },
                  "& .MuiTablePagination-select": {
                    color: darkMode ? "#ffffff !important" : "inherit",
                  },
                  "& .MuiTablePagination-selectIcon": {
                    color: darkMode ? "#ffffff !important" : "inherit",
                  },
                  "& .MuiTablePagination-actions": {
                    color: darkMode ? "#ffffff !important" : "inherit",
                  },
                  "& .MuiIconButton-root": {
                    color: darkMode ? "#ffffff !important" : "inherit",
                    "&.Mui-disabled": {
                      color: darkMode ? "rgba(255,255,255,0.3) !important" : "rgba(0,0,0,0.26) !important"
                    }
                  }
                }}
              />
            </Box>
          )}
        </MDBox>
      </Card>

      {/* Student Detail Modal */}
      <StudentDetailsModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setStudentToEdit(null);
        }}
        student={studentToEdit}
        onEditStudent={handleEditStudent}
        onSaveStudent={handleSaveStudent}
        onDeleteStudent={handleDeleteStudent}
        canEdit={true}
        canDelete={true}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Bulk Delete
        </DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <DialogContentText>
            Are you sure you want to delete {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteDialogClose}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentDataTable;
