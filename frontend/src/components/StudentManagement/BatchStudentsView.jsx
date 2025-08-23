import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDBadge from 'components/MDBadge';
import DataTable from 'examples/Tables/DataTable';

import AdvancedPagination from 'components/StaffManagement/AdvancedPagination';

// Service
import studentManagementService from 'services/studentManagementService';

const BatchStudentsView = ({ batch, onBackToBatches }) => {
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

  // Fetch students for the batch
  const fetchBatchStudents = useCallback(async (params = {}) => {
    if (!batch?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await studentManagementService.getStudentsForBatch(batch.id, {
        page: params.page || 1,
        limit: 10,
        ...params
      });
      
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
  }, [batch?.id]);

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

      {/* Action Buttons */}
      <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <MDButton
          variant="outlined"
          color="info"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
        >
          Back to Batch Years
        </MDButton>
        <MDBox display="flex" gap={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </MDBox>
      </MDBox>

      {/* Error Display */}
      {error && (
        <MDBox mb={3}>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </MDBox>
      )}

      {/* Students Table */}
      <MDBox mb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {/* Green Header Bar */}
            <MDBox
              mx={0}
              mt={0}
              py={3}
              px={2}
              variant="gradient"
              bgColor="success"
              borderRadius="lg"
              coloredShadow="success"
            >
              <MDBox display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6" color="white">
                  Students in {batch.batchCode}
                </MDTypography>
                <MDBox>
                  <MDTypography variant="body2" color="white">
                    {pagination.totalStudents} students found
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>

            <MDBox pt={3}>
              {/* Use a custom version of StudentDataTable that works with batch data */}
              <BatchStudentDataTable 
                batchId={batch.id}
                students={students}
                loading={loading}
                pagination={pagination}
                onRefresh={fetchBatchStudents}
                onPageChange={(page) => fetchBatchStudents({ page })}
              />
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
    </MDBox>
  );
};

// Custom StudentDataTable component for batch-specific functionality
const BatchStudentDataTable = ({ batchId, students, loading, pagination, onRefresh, onPageChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    placementStatus: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    if (onRefresh) {
      onRefresh(newFilters);
    }
  };

  const handlePageChange = (page) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const handleRefreshData = () => {
    if (onRefresh) {
      onRefresh(filters);
    }
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3} textAlign="center">
          <MDTypography variant="h6" color="text">
            Loading students...
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  if (students.length === 0 && !loading) {
    return (
      <Card>
        <MDBox p={3} textAlign="center">
          <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <MDTypography variant="h6" color="text">
            No students found in this batch
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Students will appear here once they are assigned to this batch.
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  // Create table data from batch-specific students
  const getTableData = () => {
    const StudentInfo = ({ student }) => (
      <MDBox display="flex" alignItems="center" lineHeight={1}>
        <MDBox
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="40px"
          height="40px"
          borderRadius="50%"
          sx={{ 
            backgroundColor: `${studentManagementService.getStudentStatusColor(student)}.main`,
            color: 'white',
            mr: 2
          }}
        >
          {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
        </MDBox>
        <MDBox lineHeight={1}>
          <MDTypography display="block" variant="button" fontWeight="medium">
            {student.fullName}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            ID: {student.studentId}
          </MDTypography>
        </MDBox>
      </MDBox>
    );

    const Department = ({ student }) => (
      <MDBox lineHeight={1} textAlign="left">
        <MDTypography display="block" variant="button" fontWeight="medium">
          {studentManagementService.getDepartmentDisplayName(student.profile?.department)}
        </MDTypography>
        <MDTypography variant="caption" color="text">
          {student.profile?.program || 'Not Specified'}
        </MDTypography>
      </MDBox>
    );

    const Status = ({ student }) => (
      <MDBox textAlign="center">
        <MDBadge 
          badgeContent={studentManagementService.getStudentStatusText(student)} 
          color={studentManagementService.getStudentStatusColor(student)} 
          variant="gradient" 
          size="sm" 
        />
      </MDBox>
    );

    const Placement = ({ student }) => (
      <MDBox textAlign="center">
        <MDBadge 
          badgeContent={studentManagementService.getPlacementStatusDisplayName(student.profile?.placementStatus)} 
          color={studentManagementService.getPlacementStatusColor(student.profile?.placementStatus)} 
          variant="gradient" 
          size="sm" 
        />
      </MDBox>
    );

    const LastLogin = ({ student }) => (
      <MDBox lineHeight={1} textAlign="left">
        <MDTypography display="block" variant="caption" fontWeight="medium">
          {studentManagementService.formatLastLogin(student.lastLogin)}
        </MDTypography>
        <MDTypography variant="caption" color="text">
          Created: {studentManagementService.formatCreationDate(student.createdAt)}
        </MDTypography>
      </MDBox>
    );

    return {
      columns: [
        { Header: "student", accessor: "student", width: "30%", align: "left" },
        { Header: "department", accessor: "department", align: "left" },
        { Header: "status", accessor: "status", align: "center" },
        { Header: "placement", accessor: "placement", align: "center" },
        { Header: "last login", accessor: "lastLogin", align: "left" },
      ],
      rows: students.map((student) => ({
        student: <StudentInfo student={student} />,
        department: <Department student={student} />,
        status: <Status student={student} />,
        placement: <Placement student={student} />,
        lastLogin: <LastLogin student={student} />,
      })),
    };
  };

  return (
    <Card>
      <MDBox>
        {/* Filter Controls */}
        <MDBox p={3} pb={0}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <MDBox>
                <MDTypography variant="caption" fontWeight="bold" color="text">
                  Search students...
                </MDTypography>
                <input
                  type="text"
                  placeholder="Search by name, email, or ID"
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={2}>
              <MDBox>
                <MDTypography variant="caption" fontWeight="bold" color="text">
                  Status
                </MDTypography>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange({ status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </MDBox>
            </Grid>
            <Grid item xs={12} md={2}>
              <MDBox>
                <MDTypography variant="caption" fontWeight="bold" color="text">
                  Placement
                </MDTypography>
                <select
                  value={filters.placementStatus}
                  onChange={(e) => handleFilterChange({ placementStatus: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">All Placement</option>
                  <option value="Unplaced">Unplaced</option>
                  <option value="Placed">Placed</option>
                  <option value="Multiple Offers">Multiple Offers</option>
                </select>
              </MDBox>
            </Grid>
            <Grid item xs={12} md={2}>
              <MDBox>
                <MDTypography variant="caption" fontWeight="bold" color="text">
                  Sort By
                </MDTypography>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="createdAt">Newest First</option>
                  <option value="firstName">Name A-Z</option>
                  <option value="lastName">Last Name A-Z</option>
                  <option value="studentId">Student ID</option>
                  <option value="lastLogin">Last Login</option>
                </select>
              </MDBox>
            </Grid>
            <Grid item xs={12} md={3}>
              <MDBox display="flex" justifyContent="flex-end" alignItems="center" gap={1}>
                <MDTypography variant="caption" color="text">
                  {pagination.totalStudents} students found
                </MDTypography>
                <Tooltip title="Refresh">
                  <IconButton onClick={() => onRefresh(filters)} size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Data Table */}
        <MDBox p={3}>
          <DataTable
            table={getTableData()}
            isSorted={false}
            entriesPerPage={false}
            showTotalEntries={false}
            noEndBorder
            canSearch={false}
          />
        </MDBox>

        {/* Advanced Pagination */}
        {pagination.totalStudents > 0 && (
          <MDBox p={3} pt={0}>
            <AdvancedPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalStudents}
              itemsPerPage={10}
              onPageChange={handlePageChange}
              onItemsPerPageChange={(itemsPerPage) => {
                // For now, we'll keep it at 10 items per page
                // You can implement this later if needed
              }}
              onRefresh={handleRefreshData}
              loading={loading}
              showItemsPerPage={false}
              showRefresh={true}
            />
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
};

export default BatchStudentsView;
