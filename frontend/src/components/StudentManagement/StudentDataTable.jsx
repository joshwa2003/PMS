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
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  CheckCircle as VerifyIcon,
  Block as DeactivateIcon,
  CheckCircleOutline as ActivateIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
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
    fetchStudents,
    updateStudentStatus,
    deleteStudent,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    getStudentStatusColor,
    getStudentStatusText,
    getPlacementStatusColor,
    getPlacementStatusDisplayName,
    getDepartmentDisplayName,
    formatLastLogin,
    formatCreationDate
  } = useStudentManagement();

  const [localSearch, setLocalSearch] = useState(filters.search);

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

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        await deleteStudent(studentId);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
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
              onClick={() => handleDeleteStudent(student.id)}
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
        { Header: "student", accessor: "student", width: "25%", align: "left" },
        { Header: "department", accessor: "department", align: "left" },
        { Header: "status", accessor: "status", align: "center" },
        { Header: "placement", accessor: "placement", align: "center" },
        { Header: "last login", accessor: "lastLogin", align: "left" },
        { Header: "actions", accessor: "actions", align: "center" },
      ],

      rows: students.map((student) => ({
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
          <MDBox>
            <MDTypography variant="h6" fontWeight="medium">
              Students List
            </MDTypography>
            <MDTypography variant="body2" color="text">
              {pagination.totalStudents} students found
            </MDTypography>
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
    </Card>
  );
};

export default StudentDataTable;
