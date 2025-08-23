import React, { useState, useEffect } from 'react';
import {
  Card,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Checkbox,
  Toolbar,
  Collapse,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  CheckCircle as VerifyIcon,
  Block as DeactivateIcon,
  CheckCircleOutline as ActivateIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  DeleteSweep as DeleteSweepIcon,
  SelectAll as SelectAllIcon,
  ArrowDropDown as ArrowDropDownIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon
} from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDInput from 'components/MDInput';
import MDAvatar from 'components/MDAvatar';
import MDBadge from 'components/MDBadge';
import DataTable from 'examples/Tables/DataTable';
import AdvancedPagination from 'components/StaffManagement/AdvancedPagination';
import { useStudentManagement } from 'context/StudentManagementContext';

const StudentDataTable = () => {
  const {
    students,
    loading,
    pagination,
    filters,
    selectedStudents,
    selectAll,
    selectAllAcrossPages,
    bulkOperationLoading,
    fetchStudents,
    updateStudentStatus,
    deleteStudent,
    deleteBulkStudents,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    toggleStudentSelection,
    toggleSelectAll,
    toggleSelectAllAcrossPages,
    clearSelection,
    getSelectedStudentData,
    getStudentStatusColor,
    getStudentStatusText,
    getPlacementStatusColor,
    getPlacementStatusDisplayName,
    getDepartmentDisplayName,
    formatLastLogin,
    formatCreationDate
  } = useStudentManagement();

  const [localSearch, setLocalSearch] = useState(filters.search);

  // Selection dropdown menu state
  const [selectMenuAnchor, setSelectMenuAnchor] = useState(null);

  // Bulk delete confirmation dialog state
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Single delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Fetch students on component mount and when filters change
  useEffect(() => {
    const queryParams = {
      limit: 10,
      search: filters.search,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      status: filters.status !== 'all' ? filters.status : '',
      placementStatus: filters.placementStatus !== 'all' ? filters.placementStatus : ''
    };

    fetchStudents(queryParams);
  }, [filters.search, filters.sortBy, filters.sortOrder, filters.status, filters.placementStatus, filters.currentPage, fetchStudents]);

  const handleSearchSubmit = () => {
    handleSearch(localSearch);
  };

  const handleSearchClear = () => {
    setLocalSearch('');
    handleSearch('');
  };

  const handleRefresh = () => {
    fetchStudents();
  };

  const handleVerifyStudent = async (studentId) => {
    try {
      await updateStudentStatus(studentId, { isVerified: true });
      // Refresh the students list to show updated status
      fetchStudents();
    } catch (error) {
      console.error('Error verifying student:', error);
      // You could add a toast notification here
    }
  };

  const handleActivateStudent = async (studentId) => {
    try {
      await updateStudentStatus(studentId, { isActive: true });
      fetchStudents();
    } catch (error) {
      console.error('Error activating student:', error);
    }
  };

  const handleDeactivateStudent = async (studentId) => {
    try {
      await updateStudentStatus(studentId, { isActive: false });
      fetchStudents();
    } catch (error) {
      console.error('Error deactivating student:', error);
    }
  };

  const handleDeleteStudent = async (student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedStudents.length === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  // Confirm bulk delete
  const handleBulkDeleteConfirm = async () => {
    if (selectedStudents.length === 0) return;

    try {
      await deleteBulkStudents(selectedStudents);
      setBulkDeleteDialogOpen(false);
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error('Error in bulk delete:', error);
      // Error is handled by context
    }
  };

  // Cancel bulk delete
  const handleBulkDeleteCancel = () => {
    setBulkDeleteDialogOpen(false);
  };

  // Confirm single delete
  const handleDeleteConfirm = async () => {
    if (studentToDelete) {
      try {
        await deleteStudent(studentToDelete.id);
        setDeleteDialogOpen(false);
        setStudentToDelete(null);
        fetchStudents(); // Refresh the list
      } catch (error) {
        console.error('Error deleting student:', error);
        // Error is handled by context
      }
    }
  };

  // Cancel single delete
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  // Handle select all checkbox in header
  const handleSelectAllChange = () => {
    toggleSelectAll();
  };

  // Handle dropdown menu for selection options
  const handleSelectMenuClick = (event) => {
    setSelectMenuAnchor(event.currentTarget);
  };

  const handleSelectMenuClose = () => {
    setSelectMenuAnchor(null);
  };

  const handleSelectCurrentPage = () => {
    toggleSelectAll();
    handleSelectMenuClose();
  };

  const handleSelectAllPages = async () => {
    await toggleSelectAllAcrossPages();
    handleSelectMenuClose();
  };

  const handleViewStudent = (studentId) => {
    // Navigate to student profile page
    window.open(`/student-profile/${studentId}`, '_blank');
  };

  // Table data formatter
  const getStudentTableData = () => {
    const defaultAvatar = "https://ui-avatars.com/api/?name=";

    const Student = ({ student }) => (
      <MDBox 
        display="flex" 
        alignItems="center" 
        lineHeight={1}
        sx={{ 
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            borderRadius: 1
          }
        }}
        onClick={() => handleViewStudent(student.id)}
      >
        <MDAvatar 
          src={`${defaultAvatar}${encodeURIComponent(student.fullName || 'Student')}&size=40&background=4CAF50&color=ffffff`} 
          name={student.fullName} 
          size="sm" 
        />
        <MDBox ml={2} lineHeight={1}>
          <MDTypography display="block" variant="button" fontWeight="medium">
            {student.fullName}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            {student.email}
          </MDTypography>
          <MDTypography variant="caption" color="text" display="block">
            ID: {student.studentId}
          </MDTypography>
        </MDBox>
      </MDBox>
    );

    const Status = ({ student }) => (
      <MDBox ml={-1}>
        <MDBadge 
          badgeContent={getStudentStatusText(student)} 
          color={getStudentStatusColor(student)} 
          variant="gradient" 
          size="sm" 
        />
      </MDBox>
    );

    const PlacementStatus = ({ student }) => {
      const status = student.profile?.placementStatus || 'Unplaced';
      return (
        <MDBox ml={-1}>
          <MDBadge 
            badgeContent={getPlacementStatusDisplayName(status)} 
            color={getPlacementStatusColor(status)} 
            variant="gradient" 
            size="sm" 
          />
        </MDBox>
      );
    };

    const Department = ({ student }) => (
      <MDBox lineHeight={1} textAlign="left">
        <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
          {getDepartmentDisplayName(student.profile?.department || 'Not Specified')}
        </MDTypography>
        {student.profile?.program && (
          <MDTypography variant="caption" color="text">
            {student.profile.program}
          </MDTypography>
        )}
      </MDBox>
    );

    const LastLogin = ({ student }) => (
      <MDBox lineHeight={1} textAlign="left">
        <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
          {formatLastLogin(student.lastLogin)}
        </MDTypography>
        <MDTypography variant="caption" color="text">
          Created: {formatCreationDate(student.createdAt)}
        </MDTypography>
      </MDBox>
    );

    const Selection = ({ student }) => (
      <Checkbox
        checked={selectedStudents.includes(student.id)}
        onChange={() => toggleStudentSelection(student.id)}
        size="small"
        disabled={loading}
      />
    );

    const Actions = ({ student }) => (
      <MDBox display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
        {/* View Student */}
        <Tooltip title="View Profile">
          <span>
            <IconButton
              size="small"
              onClick={() => handleViewStudent(student.id)}
              disabled={loading}
              color="info"
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        {/* Verify Student */}
        {!student.isVerified && (
          <Tooltip title="Verify Student">
            <span>
              <IconButton
                size="small"
                onClick={() => handleVerifyStudent(student.id)}
                disabled={loading}
                color="success"
              >
                <VerifyIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}

        {/* Activate/Deactivate Student */}
        {student.isActive ? (
          <Tooltip title="Deactivate Student">
            <span>
              <IconButton
                size="small"
                onClick={() => handleDeactivateStudent(student.id)}
                disabled={loading}
                color="warning"
              >
                <DeactivateIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <Tooltip title="Activate Student">
            <span>
              <IconButton
                size="small"
                onClick={() => handleActivateStudent(student.id)}
                disabled={loading}
                color="success"
              >
                <ActivateIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}

        {/* Delete Student */}
        <Tooltip title="Delete Student">
          <span>
            <IconButton
              size="small"
              onClick={() => handleDeleteStudent(student)}
              disabled={loading}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </MDBox>
    );

    return {
      columns: [
        { Header: "", accessor: "selection", width: "5%", align: "center" },
        { Header: "student", accessor: "student", width: "25%", align: "left" },
        { Header: "department", accessor: "department", align: "left" },
        { Header: "status", accessor: "status", align: "center" },
        { Header: "placement", accessor: "placement", align: "center" },
        { Header: "last login", accessor: "lastLogin", align: "left" },
        { Header: "actions", accessor: "actions", align: "center" },
      ],

      rows: students.map((student) => ({
        selection: <Selection student={student} />,
        student: <Student student={student} />,
        department: <Department student={student} />,
        status: <Status student={student} />,
        placement: <PlacementStatus student={student} />,
        lastLogin: <LastLogin student={student} />,
        actions: <Actions student={student} />,
      })),
    };
  };

  return (
    <Card>
      <MDBox p={3}>
        {/* Header */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDBox display="flex" alignItems="center">
            {students.length > 0 && (
              <MDBox display="flex" alignItems="center" mr={2}>
                <Checkbox
                  checked={selectAll || selectAllAcrossPages}
                  indeterminate={selectedStudents.length > 0 && !selectAll && !selectAllAcrossPages}
                  onChange={handleSelectAllChange}
                />
                <IconButton
                  size="small"
                  onClick={handleSelectMenuClick}
                  sx={{ ml: -1, mr: 1 }}
                >
                  <ArrowDropDownIcon />
                </IconButton>
                <Menu
                  anchorEl={selectMenuAnchor}
                  open={Boolean(selectMenuAnchor)}
                  onClose={handleSelectMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                >
                  <MenuItem onClick={handleSelectCurrentPage}>
                    <ListItemIcon>
                      {selectAll && !selectAllAcrossPages ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
                    </ListItemIcon>
                    <ListItemText primary="Select Current Page" secondary={`${students.length} students`} />
                  </MenuItem>
                  <MenuItem onClick={handleSelectAllPages}>
                    <ListItemIcon>
                      {selectAllAcrossPages ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
                    </ListItemIcon>
                    <ListItemText primary="Select All Pages" secondary={`${pagination.totalStudents} students`} />
                  </MenuItem>
                </Menu>
              </MDBox>
            )}
            <MDBox>
              <MDTypography variant="h6" fontWeight="medium">
                Students List
              </MDTypography>
              <MDTypography variant="body2" color="text">
                {pagination.totalStudents} students found
                {selectedStudents.length > 0 && (
                  <>
                    {` • ${selectedStudents.length} selected`}
                    {selectAllAcrossPages && ` (all pages)`}
                  </>
                )}
              </MDTypography>
            </MDBox>
          </MDBox>
          <MDBox display="flex" gap={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </MDBox>
        </MDBox>

        {/* Filters */}
        <Grid container spacing={2} mb={3}>
          {/* Search */}
          <Grid item xs={12} md={4}>
            <MDBox display="flex" gap={1}>
              <MDInput
                fullWidth
                placeholder="Search students..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
              />
              <IconButton onClick={handleSearchSubmit} disabled={loading}>
                <SearchIcon />
              </IconButton>
              {localSearch && (
                <IconButton onClick={handleSearchClear} disabled={loading}>
                  <ClearIcon />
                </IconButton>
              )}
            </MDBox>
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
                disabled={loading}
                sx={{ height: '45px' }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="unverified">Unverified</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Placement Status Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Placement</InputLabel>
              <Select
                value={filters.placementStatus}
                onChange={(e) => handleFilterChange('placementStatus', e.target.value)}
                label="Placement"
                disabled={loading}
                sx={{ height: '45px' }}
              >
                <MenuItem value="all">All Placement</MenuItem>
                <MenuItem value="Unplaced">Unplaced</MenuItem>
                <MenuItem value="Placed">Placed</MenuItem>
                <MenuItem value="Multiple Offers">Multiple Offers</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Sort */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleSortChange(sortBy, sortOrder);
                }}
                label="Sort By"
                disabled={loading}
                sx={{ height: '45px' }}
              >
                <MenuItem value="createdAt-desc">Newest First</MenuItem>
                <MenuItem value="createdAt-asc">Oldest First</MenuItem>
                <MenuItem value="name-asc">Name A-Z</MenuItem>
                <MenuItem value="name-desc">Name Z-A</MenuItem>
                <MenuItem value="email-asc">Email A-Z</MenuItem>
                <MenuItem value="lastLogin-desc">Recent Login</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Active Filters */}
        {(filters.search || filters.status !== 'all' || filters.placementStatus !== 'all') && (
          <MDBox mb={2}>
            <MDBox display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <MDTypography variant="caption" color="text">
                Active filters:
              </MDTypography>
              {filters.search && (
                <Chip
                  label={`Search: "${filters.search}"`}
                  size="small"
                  onDelete={() => handleSearch('')}
                  color="primary"
                  variant="outlined"
                />
              )}
              {filters.status !== 'all' && (
                <Chip
                  label={`Status: ${filters.status}`}
                  size="small"
                  onDelete={() => handleFilterChange('status', 'all')}
                  color="primary"
                  variant="outlined"
                />
              )}
              {filters.placementStatus !== 'all' && (
                <Chip
                  label={`Placement: ${filters.placementStatus}`}
                  size="small"
                  onDelete={() => handleFilterChange('placementStatus', 'all')}
                  color="primary"
                  variant="outlined"
                />
              )}
            </MDBox>
          </MDBox>
        )}

        {/* Bulk Actions Toolbar - Show when items are selected */}
        <Collapse in={selectedStudents.length > 0}>
          <MDBox mb={2}>
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
                  indeterminate={selectedStudents.length > 0 && selectedStudents.length < students.length}
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
                <Tooltip title="Delete Selected">
                  <IconButton 
                    onClick={handleBulkDelete} 
                    disabled={bulkOperationLoading}
                    sx={{ color: 'white' }}
                  >
                    <DeleteSweepIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Toolbar>
          </MDBox>
        </Collapse>

        {/* Data Table */}
        <DataTable
          table={getStudentTableData()}
          isSorted={false}
          entriesPerPage={false}
          showTotalEntries={false}
          noEndBorder
          canSearch={false}
        />

        {/* Advanced Pagination */}
        {pagination.totalStudents > 0 && (
          <MDBox mt={2}>
            <AdvancedPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalStudents}
              itemsPerPage={10}
              onPageChange={(page) => handleFilterChange('currentPage', page)}
              onItemsPerPageChange={(itemsPerPage) => {
                // For now, we'll keep it at 10 items per page
                // You can implement this later if needed
              }}
              onRefresh={handleRefresh}
              loading={loading}
              showItemsPerPage={false}
              showRefresh={true}
            />
          </MDBox>
        )}

        {/* No Data Message */}
        {students.length === 0 && !loading && (
          <MDBox textAlign="center" py={4}>
            <MDTypography variant="h6" color="text">
              No students found
            </MDTypography>
            <MDTypography variant="body2" color="text">
              {filters.search || filters.status !== 'all' || filters.placementStatus !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Start by adding your first student using the "Add Student" button above.'
              }
            </MDTypography>
          </MDBox>
        )}
      </MDBox>

      {/* Single Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="medium">
            Delete Student
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {studentToDelete && (
            <>
              <Typography variant="body1" mb={2}>
                Are you sure you want to delete <strong>{studentToDelete.fullName}</strong>?
              </Typography>
              
              <Typography variant="body2" color="text.secondary" mb={2}>
                This action cannot be undone. The student will lose access to the system immediately.
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
                  Student Details:
                </Typography>
                <Typography variant="body2">
                  • Email: {studentToDelete.email}
                </Typography>
                <Typography variant="body2">
                  • Student ID: {studentToDelete.studentId}
                </Typography>
                <Typography variant="body2">
                  • Department: {getDepartmentDisplayName(studentToDelete.profile?.department || 'Not Specified')}
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
            {loading ? 'Deleting...' : 'Delete Student'}
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
            Delete Multiple Students
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" mb={2}>
            Are you sure you want to delete <strong>{selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}</strong>?
          </Typography>
          
          <Typography variant="body2" color="text.secondary" mb={3}>
            This action cannot be undone. All selected students will lose access to the system immediately.
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
              Students to be deleted:
            </Typography>
            {getSelectedStudentData().map((student, index) => (
              <Box key={student.id} mb={1}>
                <Typography variant="body2">
                  {index + 1}. <strong>{student.fullName}</strong> ({student.email})
                </Typography>
                <Typography variant="caption" display="block" sx={{ ml: 2, opacity: 0.8 }}>
                  ID: {student.studentId} • {getDepartmentDisplayName(student.profile?.department || 'Not Specified')}
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
            {bulkOperationLoading ? 'Deleting...' : `Delete ${selectedStudents.length} Students`}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default StudentDataTable;
