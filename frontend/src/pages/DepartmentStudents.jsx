import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Grid,
  IconButton,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

// Custom components
import StudentAnalytics from 'components/DepartmentStudents/StudentAnalytics';
import StudentDataTable from 'components/DepartmentStudents/StudentDataTable';

// Services
import departmentWiseStudentService from 'services/departmentWiseStudentService';

const DepartmentStudents = () => {
  const { departmentId, batchId } = useParams();
  const navigate = useNavigate();
  
  const [department, setDepartment] = useState(null);
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalStudents: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    page: 1,
    limit: 10
  });

  // Fetch department students (batch-specific or all)
  const fetchDepartmentStudents = async (newFilters = null) => {
    try {
      setLoading(true);
      const params = newFilters || filters;
      
      let response;
      if (batchId) {
        // Fetch batch-specific students
        response = await departmentWiseStudentService.getDepartmentBatchStudents(departmentId, batchId, params);
      } else {
        // Fetch all department students (legacy support)
        response = await departmentWiseStudentService.getDepartmentStudents(departmentId, params);
      }
      
      if (response.success) {
        setDepartment(response.data.department);
        setBatch(response.data.batch || null);
        setStudents(response.data.students);
        setPagination(response.data.pagination);
        
        // Calculate statistics from the current data
        const stats = {
          total: response.data.pagination.totalStudents,
          placed: response.data.students.filter(s => s.placementStatus === 'Placed').length,
          unplaced: response.data.students.filter(s => s.placementStatus === 'Unplaced').length,
          multipleOffers: response.data.students.filter(s => s.placementStatus === 'Multiple Offers').length
        };
        
        setStatistics(stats);
        setError(null);
      } else {
        setError(response.message || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  // Fetch accurate statistics separately
  const fetchDepartmentStatistics = async () => {
    try {
      // Fetch all students to get accurate statistics
      const allStudentsParams = {
        page: 1,
        limit: 1000, // Large number to get all students
        search: '',
        status: 'all'
      };
      
      const response = await departmentWiseStudentService.getDepartmentStudents(departmentId, allStudentsParams);
      
      if (response.success) {
        const allStudents = response.data.students;
        const stats = {
          total: allStudents.length,
          placed: allStudents.filter(s => s.placementStatus === 'Placed').length,
          unplaced: allStudents.filter(s => s.placementStatus === 'Unplaced').length,
          multipleOffers: allStudents.filter(s => s.placementStatus === 'Multiple Offers').length
        };
        
        setStatistics(stats);
      }
    } catch (error) {
      console.error('Error fetching department statistics:', error);
    }
  };

  useEffect(() => {
    if (departmentId) {
      fetchDepartmentStudents();
      fetchDepartmentStatistics();
    }
  }, [departmentId]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    fetchDepartmentStudents(updatedFilters);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);
    fetchDepartmentStudents(updatedFilters);
  };

  const handleRowsPerPageChange = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    const updatedFilters = { ...filters, limit: newLimit, page: 1 };
    setFilters(updatedFilters);
    fetchDepartmentStudents(updatedFilters);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchDepartmentStudents();
    fetchDepartmentStatistics();
  };

  // Handle export CSV
  const handleExportCSV = async () => {
    try {
      const params = {
        page: 1,
        limit: pagination.totalStudents, // Get all students for export
        search: filters.search,
        status: filters.status
      };
      
      const response = await departmentWiseStudentService.getDepartmentStudents(departmentId, params);
      
      if (response.success) {
        departmentWiseStudentService.exportToCSV(response.data.students, `${department?.name}_students`);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  if (loading && !department) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </MDBox>
      </DashboardLayout>
    );
  }

  if (error && !department) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <MDButton
            variant="outlined"
            color="secondary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(batchId ? `/department-batches/${departmentId}` : '/department-wise-student-dashboard')}
          >
            {batchId ? 'Back to Batches' : 'Back to Dashboard'}
          </MDButton>
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Header */}
        <MDBox mb={3}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <IconButton 
                onClick={() => navigate(batchId ? `/department-batches/${departmentId}` : '/department-wise-student-dashboard')}
                sx={{ 
                  mr: 1,
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.08)'
                  }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Grid>
            <Grid item xs>
              <MDTypography variant="h4" fontWeight="medium">
                {batchId && batch ? 
                  `Students in ${batch.batchCode} - ${department?.name}` : 
                  `Students in ${department?.name}`
                }
              </MDTypography>
              <MDTypography variant="body2" color="text" mt={1}>
                {batchId && batch ? 
                  `${batch.courseType} • ${batch.startYear}-${batch.endYear} • ${department?.placementStaff ? 
                    `Staff: ${department.placementStaff.name}` : 'No Staff Assigned'}` :
                  (department?.placementStaff ? 
                    `Placement Staff: ${department.placementStaff.name} (${department.placementStaff.email})` : 
                    'No Staff Assigned')
                }
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>

        {/* Analytics Dashboard */}
        <StudentAnalytics 
          department={department}
          statistics={statistics}
          loading={loading && !statistics}
        />

        {/* Enhanced Students Table */}
        <StudentDataTable
          students={students}
          loading={loading}
          error={error}
          pagination={pagination}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onRefresh={handleRefresh}
          onExportCSV={handleExportCSV}
          department={department}
        />
      </MDBox>
    </DashboardLayout>
  );
};

export default DepartmentStudents;
