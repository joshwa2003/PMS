import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Grid, 
  Card, 
  IconButton, 
  Tooltip,
  Chip
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon
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
import { getJobBatchStudents } from 'services/jobService';

// Components
import LoadingSpinner from 'components/LoadingSpinner';

function JobBatchStudents() {
  const { jobId, batchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [batchData, setBatchData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Check permissions
  const canViewApplications = ['admin', 'placement_director', 'placement_staff'].includes(user?.role);

  useEffect(() => {
    if (canViewApplications && jobId && batchId) {
      fetchBatchStudents();
    }
  }, [jobId, batchId, currentPage, canViewApplications]);

  const fetchBatchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getJobBatchStudents(jobId, batchId, { 
        page: currentPage, 
        limit: 10 
      });
      
      if (response.success) {
        setJobData(response.data.job);
        setBatchData(response.data.batch);
        setApplications(response.data.applications);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch batch students');
      }
    } catch (err) {
      console.error('Error fetching batch students:', err);
      setError(err.message || 'Failed to fetch batch students');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToBatches = () => {
    navigate(`/job-monitoring/${jobId}/batches`);
  };

  const handleViewApplication = (applicationId) => {
    // Navigate to application details if needed
    console.log('View application:', applicationId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied':
        return 'success';
      case 'Not Applied':
        return 'info';
      case 'Pending Response':
        return 'warning';
      case 'Shortlisted':
        return 'primary';
      case 'Rejected':
        return 'error';
      default:
        return 'secondary';
    }
  };

  // Prepare student table columns
  const studentColumns = [
    {
      Header: 'Student',
      accessor: 'student',
      Cell: ({ row }) => (
        <MDBox>
          <MDTypography variant="button" fontWeight="medium">
            {row.original.student?.personalInfo?.fullName || 'N/A'}
          </MDTypography>
          <MDTypography variant="caption" color="text" display="block">
            {row.original.student?.studentId || 'N/A'}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: 'CGPA',
      accessor: 'cgpa',
      align: 'center',
      Cell: ({ row }) => (
        <MDTypography variant="button" fontWeight="medium">
          {row.original.student?.academic?.cgpa || 'N/A'}
        </MDTypography>
      ),
    },
    {
      Header: 'Backlogs',
      accessor: 'backlogs',
      align: 'center',
      Cell: ({ row }) => {
        const backlogs = row.original.student?.academic?.backlogs || 0;
        return (
          <Chip 
            label={backlogs} 
            color={backlogs === 0 ? 'success' : 'warning'} 
            size="small"
          />
        );
      },
    },
    {
      Header: 'Status',
      accessor: 'status',
      align: 'center',
      Cell: ({ value }) => (
        <MDBadge 
          badgeContent={value} 
          color={getStatusColor(value)} 
          variant="gradient" 
          size="sm"
        />
      ),
    },
    {
      Header: 'Applied Date',
      accessor: 'createdAt',
      align: 'center',
      Cell: ({ value }) => (
        <MDTypography variant="caption" color="text">
          {value ? new Date(value).toLocaleDateString() : 'N/A'}
        </MDTypography>
      ),
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      align: 'center',
      Cell: ({ row }) => (
        <MDBox display="flex" alignItems="center" justifyContent="center">
          <Tooltip title="View Details">
            <IconButton 
              size="small" 
              onClick={() => handleViewApplication(row.original._id)}
              color="info"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
      ),
    },
  ];

  // Prepare table data
  const studentTableData = {
    columns: studentColumns,
    rows: applications || [],
  };

  if (!canViewApplications) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDAlert color="error">
            You do not have permission to view student applications.
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
            <MDButton variant="outlined" color="info" onClick={handleBackToBatches}>
              Back to Batches
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
        customTitle={`${batchData?.name || 'Batch'} Students`}
        customRoute={['job-monitoring', jobData?.title || jobId, 'batch', batchData?.name || batchId]}
      />
      
      <MDBox py={3}>
        {/* Header */}
        <MDBox mb={3}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <MDBox display="flex" alignItems="center" mb={1}>
                <IconButton onClick={handleBackToBatches} sx={{ mr: 1 }}>
                  <ArrowBackIcon />
                </IconButton>
                <MDTypography variant="h4" fontWeight="medium">
                  Students - {batchData?.name} ({batchData?.year})
                </MDTypography>
              </MDBox>
              <MDTypography variant="body2" color="text">
                Job: <strong>{jobData?.title}</strong> | Company: <strong>{jobData?.company}</strong>
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>

        {/* Statistics Cards */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <MDBox p={2} textAlign="center">
                  <MDTypography variant="h4" fontWeight="bold" color="info">
                    {pagination.totalApplications || 0}
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    Total Students
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <MDBox p={2} textAlign="center">
                  <MDTypography variant="h4" fontWeight="bold" color="success">
                    {applications.filter(app => app.status === 'Applied').length}
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    Applied
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <MDBox p={2} textAlign="center">
                  <MDTypography variant="h4" fontWeight="bold" color="warning">
                    {applications.filter(app => app.status === 'Pending Response').length}
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    Pending
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <MDBox p={2} textAlign="center">
                  <MDTypography variant="h4" fontWeight="bold" color="info">
                    {applications.filter(app => app.status === 'Not Applied').length}
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    Viewed Only
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        {/* Students Table */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={3}>
              <MDBox mb={2}>
                <MDTypography variant="h6" fontWeight="medium">
                  Student Applications
                </MDTypography>
              </MDBox>
              {applications.length > 0 ? (
                <>
                  <DataTable
                    table={studentTableData}
                    showTotalEntries={true}
                    isSorted={false}
                    noEndBorder
                    entriesPerPage={false}
                  />
                  
                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <MDBox mt={3} display="flex" justifyContent="center" alignItems="center">
                      <MDButton
                        variant="outlined"
                        color="info"
                        size="small"
                        disabled={!pagination.hasPrevPage}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        sx={{ mr: 1 }}
                      >
                        Previous
                      </MDButton>
                      <MDTypography variant="button" color="text" mx={2}>
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </MDTypography>
                      <MDButton
                        variant="outlined"
                        color="info"
                        size="small"
                        disabled={!pagination.hasNextPage}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        sx={{ ml: 1 }}
                      >
                        Next
                      </MDButton>
                    </MDBox>
                  )}
                </>
              ) : (
                <MDBox textAlign="center" py={3}>
                  <MDTypography variant="body2" color="text">
                    No students found for this batch
                  </MDTypography>
                </MDBox>
              )}
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default JobBatchStudents;
