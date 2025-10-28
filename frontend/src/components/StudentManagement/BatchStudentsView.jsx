import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Checkbox,
  Toolbar,
  Collapse,
  Alert,
  DialogContentText
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDBadge from 'components/MDBadge';
import DataTable from 'examples/Tables/DataTable';

import AdvancedPagination from 'components/StaffManagement/AdvancedPagination';

// Student Management components
import CreateStudentForm from 'components/StudentManagement/CreateStudentForm';
import BulkStudentUploadModal from 'components/StudentManagement/BulkStudentUploadModal';
import StudentDataTable from 'components/StudentManagement/StudentDataTable';
import BatchYearTable from 'components/StudentManagement/BatchYearTable';
import OptimizedStudentTable from 'components/StudentManagement/OptimizedStudentTable';

// Service
import studentManagementService from 'services/studentManagementService';

const BatchStudentsView = ({ batch, onBackToBatches }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalStudents: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Delete student dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  
  // Bulk selection state
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Bulk delete dialog state
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState(null);
  
  // Show all students state
  const [showAllStudents, setShowAllStudents] = useState(false);

  // Fetch students for the batch
  const fetchBatchStudents = useCallback(async (params = {}) => {
    if (!batch?.id) return;
    try {
      setLoading(true);
      setError(null);
      
      // If showing all students, set limit to total count, otherwise use pagination
      const limit = showAllStudents ? (batch.stats?.totalStudents || 1000) : 10;
      
      console.log('🔍 Fetching students with limit:', limit, 'showAllStudents:', showAllStudents);
      
      const response = await studentManagementService.getStudentsForBatch(batch.id, {
        page: params.page || 1,
        limit: limit,
        ...params
      });
      
      console.log('✅ Received students:', response.students?.length);
      
      setStudents(response.students || []);
      setPagination(response.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalStudents: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
    } catch (error) {
      console.error('Error fetching batch students:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [batch?.id, showAllStudents, batch.stats?.totalStudents]);

  // Fetch students on component mount
  useEffect(() => {
    if (batch && batch.id) {
      fetchBatchStudents();
    }
  }, [batch, fetchBatchStudents]);

  const handleRefresh = () => {
    fetchBatchStudents();
  };

  const handleBackClick = () => {
    if (onBackToBatches) {
      onBackToBatches();
    }
  };

  const handlePageChange = (page) => {
    fetchBatchStudents({ page });
  };

  const handleRefreshData = () => {
    fetchBatchStudents();
  };

  // View student handler
  const handleViewStudent = (student) => {
    // Navigate to student profile page
    console.log('Navigating to student profile:', student);
    // Use profileId if available, otherwise use id
    const studentId = student.profileId || student.id;
    navigate(`/student-profile/${studentId}`);
  };

  // Delete student handlers
  const handleDeleteStudent = (student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    
    try {
      setLoading(true);
      await studentManagementService.deleteStudent(studentToDelete.id);
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      // Refresh the student list
      fetchBatchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  // Bulk selection handlers
  const handleSelectAllChange = (event) => {
    if (event.target.checked) {
      setSelectedStudents(students.map(s => s.id));
      setSelectAll(true);
    } else {
      setSelectedStudents([]);
      setSelectAll(false);
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        const newSelection = prev.filter(id => id !== studentId);
        setSelectAll(newSelection.length === students.length && students.length > 0);
        return newSelection;
      } else {
        const newSelection = [...prev, studentId];
        setSelectAll(newSelection.length === students.length && students.length > 0);
        return newSelection;
      }
    });
  };

  const clearSelection = () => {
    setSelectedStudents([]);
    setSelectAll(false);
  };

  // Bulk delete handlers
  const handleBulkDeleteClick = () => {
    if (selectedStudents.length === 0) return;
    setBulkDeleteError(null);
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedStudents.length === 0) return;
    
    try {
      setBulkDeleting(true);
      setBulkDeleteError(null);
      
      await studentManagementService.deleteBulkStudents(selectedStudents);
      
      // Close dialog and clear selection
      setBulkDeleteDialogOpen(false);
      clearSelection();
      
      // Refresh the student list
      fetchBatchStudents();
    } catch (error) {
      console.error('Error deleting students:', error);
      setBulkDeleteError(error.message || 'Failed to delete students');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleBulkDeleteCancel = () => {
    if (!bulkDeleting) {
      setBulkDeleteDialogOpen(false);
      setBulkDeleteError(null);
    }
  };

  // Reset selection when students change
  useEffect(() => {
    setSelectedStudents([]);
    setSelectAll(false);
  }, [students]);
  
  // Refetch when showAllStudents changes
  useEffect(() => {
    if (batch && batch.id) {
      fetchBatchStudents({ page: 1 });
    }
  }, [showAllStudents]);
  
  // Toggle show all students
  const handleToggleShowAll = () => {
    setShowAllStudents(prev => !prev);
  };

  // Actions component for the table
  const Actions = ({ student }) => (
    <MDBox display="flex" gap={1}>
      <Tooltip title="View Student">
        <IconButton 
          size="small" 
          color="info"
          onClick={() => handleViewStudent(student)}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete Student">
        <IconButton 
          size="small" 
          color="error"
          onClick={() => handleDeleteStudent(student)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </MDBox>
  );

  if (!batch) {
    return (
      <Card>
        <MDBox p={3} textAlign="center">
          <MDTypography variant="h6" color="text">
            No batch selected
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  // Table columns definition
  const columns = [
    { 
      Header: (
        <Checkbox
          checked={selectAll}
          indeterminate={selectedStudents.length > 0 && selectedStudents.length < students.length}
          onChange={handleSelectAllChange}
          sx={{ padding: 0 }}
        />
      ), 
      accessor: "checkbox", 
      width: "5%" 
    },
    { Header: "Student", accessor: "student", width: "25%" },
    { Header: "Department", accessor: "department", width: "15%" },
    { Header: "Status", accessor: "status", width: "10%" },
    { Header: "Placement", accessor: "placement", width: "15%" },
    { Header: "Last Login", accessor: "lastLogin", width: "10%" },
    { Header: "Actions", accessor: "actions", width: "10%" }
  ];

  // Map students to rows
  const rows = students.map(student => ({
    checkbox: (
      <Checkbox
        checked={selectedStudents.includes(student.id)}
        onChange={() => toggleStudentSelection(student.id)}
        sx={{ padding: 0 }}
      />
    ),
    student: (
      <MDBox display="flex" alignItems="center">
        <MDBox
          width="40px"
          height="40px"
          borderRadius="50%"
          display="flex"
          justifyContent="center"
          alignItems="center"
          color="white"
          bgColor={student.isActive ? "success" : "error"}
          mr={2}
        >
          {student.fullName?.charAt(0)?.toUpperCase() || "S"}
        </MDBox>
        <MDBox display="flex" flexDirection="column">
          <MDTypography variant="button" fontWeight="medium">
            {student.fullName || "Unknown"}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            {student.studentId || "No ID"}
          </MDTypography>
        </MDBox>
      </MDBox>
    ),
    department: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {student.department?.name || "N/A"}
      </MDTypography>
    ),
    status: (
      <MDBadge
        badgeContent={student.isActive ? "Active" : "Inactive"}
        color={student.isActive ? "success" : "error"}
        variant="gradient"
        size="sm"
      />
    ),
    placement: (
      <MDBadge
        badgeContent={student.placementStatus || "Not Placed"}
        color={student.placementStatus === "Placed" ? "success" : "warning"}
        variant="gradient"
        size="sm"
      />
    ),
    lastLogin: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : "Never"}
      </MDTypography>
    ),
    actions: <Actions student={student} />
  }));

  return (
    <MDBox>
      {/* Breadcrumb Navigation */}
      <MDBox mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={handleBackClick}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <SchoolIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Batch Years
          </Link>
          <MDTypography color="text.primary">
            {batch.batchCode} Students
          </MDTypography>
        </Breadcrumbs>
      </MDBox>

      {/* Batch Information Header */}
      <MDBox mb={3}>
        <Card>
          <MDBox p={3}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <MDBox display="flex" alignItems="center">
                  <MDBox
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width="60px"
                    height="60px"
                    borderRadius="50%"
                    sx={{ 
                      backgroundColor: `${studentManagementService.getBatchStatusColor(batch)}.main`,
                      color: 'white',
                      mr: 2
                    }}
                  >
                    <SchoolIcon />
                  </MDBox>
                  <MDBox>
                    <MDTypography variant="h4" fontWeight="medium">
                      {batch.batchCode}
                    </MDTypography>
                    <MDTypography variant="body1" color="text">
                      {batch.courseType} • {studentManagementService.formatBatchYear(batch)} • {batch.courseDuration} Years
                    </MDTypography>
                    <MDBox mt={1}>
                      <MDBadge 
                        badgeContent={studentManagementService.getBatchStatusText(batch)} 
                        color={studentManagementService.getBatchStatusColor(batch)} 
                        variant="gradient" 
                        size="sm" 
                      />
                    </MDBox>
                  </MDBox>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={4}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center">
                  <MDBox textAlign="center">
                    <MDTypography variant="h3" fontWeight="bold" color="info">
                      {batch.stats?.totalStudents || 0}
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      Total Students
                    </MDTypography>
                  </MDBox>
                  <MDBox textAlign="center">
                    <MDTypography variant="h3" fontWeight="bold" color="success">
                      {(batch.stats?.placement?.placed || 0) + (batch.stats?.placement?.multipleOffers || 0)}
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      Placed Students
                    </MDTypography>
                  </MDBox>
                  <MDBox textAlign="center">
                    <MDTypography variant="h3" fontWeight="bold" color="warning">
                      {studentManagementService.calculateBatchPlacementRate(batch)}%
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      Placement Rate
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>
        </Card>
      </MDBox>

      {/* Students Table */}
      <Card>
        <MDBox p={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <MDTypography variant="h5">
              Students in {batch.batchCode}
            </MDTypography>
            <MDBox display="flex" gap={1}>
              <MDButton
                variant={showAllStudents ? "contained" : "outlined"}
                color="success"
                size="small"
                onClick={handleToggleShowAll}
              >
                {showAllStudents ? 'Show Paginated' : 'Show All Students'}
              </MDButton>
              <MDButton
                variant="outlined"
                color="info"
                size="small"
                onClick={handleBackClick}
                startIcon={<ArrowBackIcon />}
              >
                Back to Batch Years
              </MDButton>
              <MDButton
                variant="outlined"
                color="info"
                size="small"
                onClick={handleRefresh}
                startIcon={<RefreshIcon />}
              >
                Refresh
              </MDButton>
            </MDBox>
          </MDBox>

          {error && (
            <MDBox mb={2}>
              <Typography color="error">{error}</Typography>
            </MDBox>
          )}

          {/* Bulk Selection Toolbar */}
          <Collapse in={selectedStudents.length > 0}>
            <MDBox mb={2}>
              <Toolbar
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  borderRadius: '12px',
                  minHeight: '64px !important',
                  px: 2
                }}
              >
                <MDBox display="flex" alignItems="center" flex={1}>
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
                  <MDTypography variant="h6" sx={{ ml: 1, color: 'white' }}>
                    {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                  </MDTypography>
                </MDBox>
                
                <MDBox display="flex" alignItems="center" gap={1}>
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
                </MDBox>
              </Toolbar>
            </MDBox>
          </Collapse>

          {/* Use optimized table when showing all students for better performance */}
          {showAllStudents ? (
            <OptimizedStudentTable
              students={students}
              selectedStudents={selectedStudents}
              onToggleSelection={toggleStudentSelection}
              onViewStudent={handleViewStudent}
              onDeleteStudent={handleDeleteStudent}
              height={600}
            />
          ) : (
            <DataTable
              table={{ columns, rows }}
              showTotalEntries={false}
              isSorted={false}
              noEndBorder
              entriesPerPage={false}
              canSearch={false}
              pagination={{ variant: "gradient", color: "info" }}
            />
          )}

          {/* Show pagination only when not showing all students */}
          {pagination && !showAllStudents && (
            <MDBox mt={2} display="flex" justifyContent="center">
              <AdvancedPagination
                currentPage={pagination.currentPage || 1}
                totalPages={pagination.totalPages || 1}
                totalItems={pagination.totalStudents || 0}
                itemsPerPage={10}
                onPageChange={handlePageChange}
                onItemsPerPageChange={() => {}}
                onRefresh={handleRefresh}
                loading={loading}
                showItemsPerPage={false}
              />
            </MDBox>
          )}
          
          {/* Show total count when showing all students */}
          {showAllStudents && (
            <MDBox mt={2} display="flex" justifyContent="center">
              <MDTypography variant="body2" color="text">
                Showing all {students.length} students
              </MDTypography>
            </MDBox>
          )}
        </MDBox>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {studentToDelete?.fullName}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleDeleteCancel} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleDeleteConfirm} color="error">
            Delete
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={handleBulkDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Bulk Delete
        </DialogTitle>
        <DialogContent>
          {bulkDeleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {bulkDeleteError}
            </Alert>
          )}
          <DialogContentText>
            Are you sure you want to delete {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton 
            onClick={handleBulkDeleteCancel} 
            disabled={bulkDeleting}
            color="secondary"
          >
            Cancel
          </MDButton>
          <MDButton 
            onClick={handleBulkDeleteConfirm} 
            color="error"
            disabled={bulkDeleting}
          >
            {bulkDeleting ? 'Deleting...' : 'Delete'}
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
};

export default BatchStudentsView;
