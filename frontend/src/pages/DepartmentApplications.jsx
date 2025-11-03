import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Grid, 
  Card, 
  CardContent, 
  IconButton, 
  Tooltip, 
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDAlert from 'components/MDAlert';
import MDBadge from 'components/MDBadge';

// Material Dashboard 2 React example components
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';
import DataTable from 'examples/Tables/DataTable';

// Context
import { useAuth } from 'context/AuthContext';

// Services
import { jobApi } from 'services/jobService';
import { getApplicationStatusColor } from 'services/jobService';

// Components
import LoadingSpinner from 'components/LoadingSpinner';
import ExportMenu from 'components/ExportMenu';

function DepartmentApplications() {
  const { jobId, departmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [departmentData, setDepartmentData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [departmentStats, setDepartmentStats] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalApplications: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Check permissions
  const canViewApplications = ['admin', 'placement_director', 'placement_staff'].includes(user?.role);

  useEffect(() => {
    if (canViewApplications && jobId && departmentId) {
      fetchDepartmentApplications();
    }
  }, [jobId, departmentId, canViewApplications]);

  const fetchDepartmentApplications = async (page = 1, batchId = selectedBatch) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching department applications:', { jobId, departmentId, page, batchId });
      const response = await jobApi.getJobApplicationsByDepartment(jobId, departmentId, page, batchId || null);
      console.log('📦 Response received:', response);
      
      // API interceptor returns response.data, which contains { success, data }
      if (response && response.success) {
        console.log('✅ Setting data from response');
        setJobData(response.data.job);
        setDepartmentData(response.data.department);
        setApplications(response.data.applications);
        setDepartmentStats(response.data.departmentStats);
        setBatches(response.data.batches || []);
        setPagination(response.data.pagination);
      } else {
        console.error('❌ Response missing success flag:', response);
        setError(response?.message || 'Failed to fetch department applications');
      }
    } catch (err) {
      console.error('❌ Error fetching department applications:', err);
      console.error('❌ Error details:', err.message, err.response);
      setError(err.message || 'Failed to fetch department applications');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToAnalytics = () => {
    navigate(`/job-monitoring/${jobId}/analytics`);
  };

  const handleViewApplication = (application) => {
    // Navigate to application details or open modal
    console.log('View application:', application);
  };

  const handlePageChange = (newPage) => {
    fetchDepartmentApplications(newPage, selectedBatch);
  };

  const handleBatchChange = (event) => {
    const batchId = event.target.value;
    setSelectedBatch(batchId);
    fetchDepartmentApplications(1, batchId); // Reset to page 1 when filter changes
  };

  // Prepare applications table columns
  const applicationColumns = [
    {
      Header: 'Student',
      accessor: 'student',
      Cell: ({ value }) => (
        <MDBox>
          <MDTypography variant="button" fontWeight="medium">
            {value?.personalInfo?.fullName || 'N/A'}
          </MDTypography>
          <MDTypography variant="caption" color="text" display="block">
            {value?.studentId || 'N/A'}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: 'Email',
      accessor: 'user',
      Cell: ({ value }) => (
        <MDTypography variant="caption" color="text">
          {value?.email || 'N/A'}
        </MDTypography>
      ),
    },
    {
      Header: 'CGPA',
      accessor: 'student.academic.cgpa',
      Cell: ({ value }) => (
        <MDTypography variant="caption" color="text">
          {value || 'N/A'}
        </MDTypography>
      ),
    },
    {
      Header: 'Backlogs',
      accessor: 'student.academic.backlogs',
      Cell: ({ value }) => (
        <MDTypography variant="caption" color="text">
          {value || 'N/A'}
        </MDTypography>
      ),
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ value }) => (
        <MDBadge 
          badgeContent={value} 
          color={getApplicationStatusColor(value)} 
          variant="gradient" 
          size="sm" 
        />
      ),
    },
    {
      Header: 'Applied Date',
      accessor: 'appliedAt',
      Cell: ({ value }) => (
        <MDTypography variant="caption" color="text">
          {value ? new Date(value).toLocaleDateString() : 'Not Applied'}
        </MDTypography>
      ),
    },
  ];

  // Prepare table data
  const applicationTableData = {
    columns: applicationColumns,
    rows: applications || [],
  };

  // Export config
  const exportColumns = [
    { field: 'student', headerName: 'Student' },
    { field: 'studentId', headerName: 'Student ID' },
    { field: 'email', headerName: 'Email' },
    { field: 'cgpa', headerName: 'CGPA' },
    { field: 'backlogs', headerName: 'Backlogs' },
    { field: 'status', headerName: 'Status' },
    { field: 'appliedDate', headerName: 'Applied Date' },
  ];
  const exportRows = (applications || []).map((a) => ({
    student: a.student?.personalInfo?.fullName || 'N/A',
    studentId: a.student?.studentId || 'N/A',
    email: a.user?.email || 'N/A',
    cgpa: a.student?.academic?.cgpa ?? 'N/A',
    backlogs: a.student?.academic?.backlogs ?? 'N/A',
    status: a.status || 'N/A',
    appliedDate: a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : 'Not Applied',
  }));

  if (!canViewApplications) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDAlert color="error">
            You do not have permission to view department applications.
          </MDAlert>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <LoadingSpinner />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDAlert color="error" dismissible onClose={() => setError(null)}>
            {error}
          </MDAlert>
          <MDBox mt={2}>
            <MDButton variant="outlined" color="info" onClick={handleBackToAnalytics}>
              Back to Job Analytics
            </MDButton>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar 
        customTitle={departmentData?.name || 'Department'}
        customRoute={['job-monitoring', jobData?.title || jobId, 'department', departmentData?.name || departmentId]}
      />
      
      <MDBox py={3}>
        {/* Header */}
        <MDBox mb={3}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <MDBox display="flex" alignItems="center" mb={1}>
                <IconButton onClick={handleBackToAnalytics} sx={{ mr: 1 }}>
                  <ArrowBackIcon />
                </IconButton>
                <MDTypography variant="h4" fontWeight="medium">
                  Department Applications
                </MDTypography>
              </MDBox>
              <MDTypography variant="h6" color="text">
                {jobData?.title}
              </MDTypography>
              <MDTypography variant="body2" color="text">
                {departmentData?.name} ({departmentData?.code}) • {jobData?.company}
              </MDTypography>
            </Grid>
            <Grid item xs={12} md={4}>
              <MDBox display="flex" justifyContent="flex-end">
                <MDButton
                  variant="outlined"
                  color="info"
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate(`/job-monitoring/${jobId}/analytics`)}
                >
                  Back to Analytics
                </MDButton>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Department Statistics */}
        {departmentStats && (
          <MDBox mb={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <MDBox display="flex" alignItems="center">
                      <PeopleIcon color="info" sx={{ mr: 2 }} />
                      <MDBox>
                        <MDTypography variant="h6" fontWeight="medium">
                          {departmentStats.totalStudents}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Total Students
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <MDBox display="flex" alignItems="center">
                      <PersonIcon color="success" sx={{ mr: 2 }} />
                      <MDBox>
                        <MDTypography variant="h6" fontWeight="medium" color="success">
                          {departmentStats.appliedCount}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Applied
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <MDBox display="flex" alignItems="center">
                      <AssessmentIcon color="warning" sx={{ mr: 2 }} />
                      <MDBox>
                        <MDTypography variant="h6" fontWeight="medium" color="warning">
                          {departmentStats.pendingCount}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Pending
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <MDBox display="flex" alignItems="center">
                      <PeopleIcon color="error" sx={{ mr: 2 }} />
                      <MDBox>
                        <MDTypography variant="h6" fontWeight="medium" color="error">
                          {departmentStats.notAppliedCount}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Not Applied
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </MDBox>
        )}

        {/* Applications Table */}
        <Card>
          <CardContent>
            <MDBox mb={2} display="flex" alignItems="center" justifyContent="space-between" gap={2}>
              <MDBox>
                <MDTypography variant="h6" fontWeight="medium">
                  Student Applications
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Applications from {departmentData?.name} department
                </MDTypography>
              </MDBox>
              <ExportMenu 
                rows={exportRows}
                columns={exportColumns}
                filename={`department-applications-${departmentData?.code || ''}`}
                title={`Department Applications`}
                headerLines={[`Department: ${departmentData?.name} (${departmentData?.code})`, `Job: ${jobData?.title || '-'}`]}
              />
            </MDBox>

            {/* Batch Filter */}
            {batches.length > 0 && (
              <MDBox mb={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="batch-filter-label">Filter by Batch Year</InputLabel>
                  <Select
                    labelId="batch-filter-label"
                    id="batch-filter"
                    value={selectedBatch}
                    onChange={handleBatchChange}
                    label="Filter by Batch Year"
                  >
                    <MenuItem value="">
                      <em>All Batches ({batches.reduce((sum, b) => sum + b.count, 0)} students)</em>
                    </MenuItem>
                    {batches.map((batch) => (
                      <MenuItem key={batch._id} value={batch._id}>
                        {batch.batchCode} - {batch.courseType} ({batch.count} students)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </MDBox>
            )}
            
            <DataTable
              table={applicationTableData}
              showTotalEntries={true}
              isSorted={true}
              noEndBorder={true}
              entriesPerPage={false}
              canSearch={false}
              loading={loading}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <MDBox display="flex" justifyContent="center" mt={3}>
                <MDButton
                  variant="outlined"
                  color="info"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  sx={{ mr: 1 }}
                >
                  Previous
                </MDButton>
                
                <MDTypography variant="body2" sx={{ mx: 2, alignSelf: 'center' }}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </MDTypography>
                
                <MDButton
                  variant="outlined"
                  color="info"
                  disabled={!pagination.hasNextPage}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  sx={{ ml: 1 }}
                >
                  Next
                </MDButton>
              </MDBox>
            )}
          </CardContent>
        </Card>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default DepartmentApplications;
