import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Grid, 
  Card, 
  CardContent, 
  IconButton, 
  Tooltip,
  Chip
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDAlert from 'components/MDAlert';

// Material Dashboard 2 React example components
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';
import DataTable from 'examples/Tables/DataTable';

// Context
import { useAuth } from 'context/AuthContext';

// Services
import { getJobBatchAnalytics } from 'services/jobService';

// Components
import LoadingSpinner from 'components/LoadingSpinner';

function JobBatchAnalytics() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [batchStats, setBatchStats] = useState([]);

  // Check permissions
  const canViewAnalytics = ['admin', 'placement_director', 'placement_staff'].includes(user?.role);

  useEffect(() => {
    if (canViewAnalytics && jobId) {
      fetchBatchAnalytics();
    }
  }, [jobId, canViewAnalytics]);

  const fetchBatchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getJobBatchAnalytics(jobId);
      
      if (response.success) {
        setJobData(response.data.job);
        setBatchStats(response.data.batchStats);
      } else {
        setError(response.message || 'Failed to fetch batch analytics');
      }
    } catch (err) {
      console.error('Error fetching batch analytics:', err);
      setError(err.message || 'Failed to fetch batch analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchClick = (batchId) => {
    navigate(`/job-monitoring/${jobId}/batch/${batchId}/students`);
  };

  const handleBackToJobs = () => {
    navigate('/job-monitoring');
  };

  // Prepare batch table columns
  const batchColumns = [
    {
      Header: 'Batch',
      accessor: 'batchName',
      Cell: ({ row }) => (
        <MDBox>
          <MDTypography variant="button" fontWeight="medium">
            {row.original.batchName}
          </MDTypography>
          <MDTypography variant="caption" color="text" display="block">
            Year: {row.original.batchYear}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: 'Total Students',
      accessor: 'totalStudents',
      align: 'center',
      Cell: ({ value }) => (
        <MDTypography variant="button" fontWeight="medium">
          {value}
        </MDTypography>
      ),
    },
    {
      Header: 'Applied',
      accessor: 'appliedCount',
      align: 'center',
      Cell: ({ value }) => (
        <Chip 
          label={value} 
          color="success" 
          size="small"
          sx={{ fontWeight: 'bold' }}
        />
      ),
    },
    {
      Header: 'Viewed Only',
      accessor: 'viewedCount',
      align: 'center',
      Cell: ({ value }) => (
        <Chip 
          label={value} 
          color="info" 
          size="small"
        />
      ),
    },
    {
      Header: 'Pending',
      accessor: 'pendingCount',
      align: 'center',
      Cell: ({ value }) => (
        <Chip 
          label={value} 
          color="warning" 
          size="small"
        />
      ),
    },
    {
      Header: 'Application Rate',
      accessor: 'applicationRate',
      align: 'center',
      Cell: ({ row }) => {
        const rate = row.original.totalStudents > 0 
          ? ((row.original.appliedCount / row.original.totalStudents) * 100).toFixed(1)
          : 0;
        return (
          <MDBox display="flex" alignItems="center" justifyContent="center">
            <TrendingUpIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
            <MDTypography variant="button" fontWeight="medium">
              {rate}%
            </MDTypography>
          </MDBox>
        );
      },
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      align: 'center',
      Cell: ({ row }) => (
        <MDBox display="flex" alignItems="center" justifyContent="center">
          <Tooltip title="View Students">
            <IconButton 
              size="small" 
              onClick={() => handleBatchClick(row.original._id)}
              color="info"
            >
              <PeopleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
      ),
    },
  ];

  // Prepare table data
  const batchTableData = {
    columns: batchColumns,
    rows: batchStats || [],
  };

  if (!canViewAnalytics) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDAlert color="error">
            You do not have permission to view batch analytics.
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
            <MDButton variant="outlined" color="info" onClick={handleBackToJobs}>
              Back to Job Monitoring
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
        customTitle={jobData?.title || 'Batch Analytics'}
        customRoute={['job-monitoring', jobData?.title || jobId, 'batches']}
      />
      
      <MDBox py={3}>
        {/* Department Filter Notice for Placement Staff */}
        {user?.role === 'placement_staff' && (
          <MDBox mb={3}>
            <MDAlert color="info">
              <MDTypography variant="body2" color="white">
                <strong>Department Filter Active:</strong> You are viewing batches only from your department.
              </MDTypography>
            </MDAlert>
          </MDBox>
        )}

        {/* Header */}
        <MDBox mb={3}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <MDBox display="flex" alignItems="center" mb={1}>
                <IconButton onClick={handleBackToJobs} sx={{ mr: 1 }}>
                  <ArrowBackIcon />
                </IconButton>
                <MDTypography variant="h4" fontWeight="medium">
                  Batch-wise Analytics
                </MDTypography>
              </MDBox>
              <MDTypography variant="body2" color="text">
                Job: <strong>{jobData?.title}</strong> | Company: <strong>{jobData?.company}</strong>
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>

        {/* Batch Statistics Table */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={3}>
              <MDBox mb={2}>
                <MDTypography variant="h6" fontWeight="medium">
                  Batches
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Click on a batch to view students who applied
                </MDTypography>
              </MDBox>
              {batchStats.length > 0 ? (
                <DataTable
                  table={batchTableData}
                  showTotalEntries={true}
                  isSorted={false}
                  noEndBorder
                  entriesPerPage={false}
                />
              ) : (
                <MDBox textAlign="center" py={3}>
                  <MDTypography variant="body2" color="text">
                    No batch data available for this job
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

export default JobBatchAnalytics;
