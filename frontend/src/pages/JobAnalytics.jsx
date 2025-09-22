import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Grid, 
  Card, 
  CardContent, 
  IconButton, 
  Tooltip, 
  LinearProgress
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDAlert from 'components/MDAlert';
// import MDBadge from 'components/MDBadge';

// Material Dashboard 2 React example components
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';
import DataTable from 'examples/Tables/DataTable';

// Context
import { useAuth } from 'context/AuthContext';

// Services
import { jobApi } from 'services/jobService';

// Components
import LoadingSpinner from 'components/LoadingSpinner';
import ExportMenu from 'components/ExportMenu';

function JobAnalytics() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [overallStats, setOverallStats] = useState(null);

  // Check permissions
  const canViewAnalytics = ['admin', 'placement_director', 'placement_staff'].includes(user?.role);

  useEffect(() => {
    if (canViewAnalytics && jobId) {
      fetchJobAnalytics();
    }
  }, [jobId, canViewAnalytics]);

  const fetchJobAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobApi.getJobAnalyticsByDepartment(jobId);
      
      if (response.success) {
        setJobData(response.data.job);
        setDepartmentStats(response.data.departmentStats);
        setOverallStats(response.data.overallStats);
      } else {
        setError(response.message || 'Failed to fetch job analytics');
      }
    } catch (err) {
      console.error('Error fetching job analytics:', err);
      setError(err.message || 'Failed to fetch job analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentClick = (departmentId) => {
    navigate(`/job-monitoring/${jobId}/department/${departmentId}`);
  };

  const handleViewAllApplications = () => {
    navigate(`/job-monitoring/${jobId}/applications`);
  };

  const handleBackToJobs = () => {
    navigate('/job-monitoring');
  };

  // Prepare department table columns
  const departmentColumns = [
    {
      Header: 'Department',
      accessor: 'departmentName',
      Cell: ({ value, row }) => (
        <MDBox>
          <MDTypography variant="button" fontWeight="medium">
            {value}
          </MDTypography>
          <MDTypography variant="caption" color="text" display="block">
            {row.original.departmentCode}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: 'Total Students',
      accessor: 'totalStudents',
      Cell: ({ value }) => (
        <MDBox textAlign="center">
          <MDTypography variant="button" fontWeight="medium" color="info">
            {value}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: 'Applied',
      accessor: 'appliedCount',
      Cell: ({ value, row }) => {
        const total = row.original.totalStudents;
        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
        
        return (
          <MDBox textAlign="center">
            <MDTypography variant="button" fontWeight="medium" color="success">
              {value}
            </MDTypography>
            <MDTypography variant="caption" color="text" display="block">
              {percentage}%
            </MDTypography>
          </MDBox>
        );
      },
    },
    {
      Header: 'Not Applied',
      accessor: 'notAppliedCount',
      Cell: ({ value, row }) => {
        const total = row.original.totalStudents;
        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
        
        return (
          <MDBox textAlign="center">
            <MDTypography variant="button" fontWeight="medium" color="error">
              {value}
            </MDTypography>
            <MDTypography variant="caption" color="text" display="block">
              {percentage}%
            </MDTypography>
          </MDBox>
        );
      },
    },
    {
      Header: 'Pending',
      accessor: 'pendingCount',
      Cell: ({ value, row }) => {
        const total = row.original.totalStudents;
        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
        
        return (
          <MDBox textAlign="center">
            <MDTypography variant="button" fontWeight="medium" color="warning">
              {value}
            </MDTypography>
            <MDTypography variant="caption" color="text" display="block">
              {percentage}%
            </MDTypography>
          </MDBox>
        );
      },
    },
    {
      Header: 'Application Rate',
      accessor: 'applicationRate',
      Cell: ({ value }) => (
        <MDBox>
          <LinearProgress 
            variant="determinate" 
            value={value} 
            color="success"
            sx={{ mb: 1, height: 8, borderRadius: 4 }}
          />
          <MDTypography variant="caption" color="text">
            {value.toFixed(1)}%
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <MDBox display="flex" alignItems="center">
          <Tooltip title="View Department Applications">
            <IconButton 
              size="small" 
              onClick={() => handleDepartmentClick(row.original._id)}
            >
              <PeopleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
      ),
    },
  ];

  // Prepare table data
  const departmentTableData = {
    columns: departmentColumns,
    rows: departmentStats || [],
  };

  // Prepare export config
  const exportColumns = [
    { field: 'departmentName', headerName: 'Department' },
    { field: 'departmentCode', headerName: 'Code' },
    { field: 'totalStudents', headerName: 'Total Students' },
    { field: 'appliedCount', headerName: 'Applied' },
    { field: 'notAppliedCount', headerName: 'Not Applied' },
    { field: 'pendingCount', headerName: 'Pending' },
    { field: 'applicationRate', headerName: 'Application Rate (%)' },
  ];
  const exportRows = (departmentStats || []).map((r) => ({
    ...r,
    applicationRate: Number(r.applicationRate ?? 0).toFixed(1),
  }));

  if (!canViewAnalytics) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDAlert color="error">
            You do not have permission to view job analytics.
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
      <DashboardNavbar />
      
      <MDBox py={3}>
        {/* Header */}
        <MDBox mb={3}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <MDBox display="flex" alignItems="center" mb={1}>
                <IconButton onClick={handleBackToJobs} sx={{ mr: 1 }}>
                  <ArrowBackIcon />
                </IconButton>
                <MDTypography variant="h4" fontWeight="medium">
                  Job Analytics
                </MDTypography>
              </MDBox>
              <MDTypography variant="h6" color="text">
                {jobData?.title}
              </MDTypography>
              <MDTypography variant="body2" color="text">
                {jobData?.company} • {jobData?.deadline ? new Date(jobData.deadline).toLocaleDateString() : 'No deadline'}
              </MDTypography>
            </Grid>
            <Grid item xs={12} md={4}>
              <MDBox display="flex" justifyContent="flex-end" gap={1}>
                <MDButton
                  variant="outlined"
                  color="info"
                  startIcon={<AssessmentIcon />}
                  onClick={handleViewAllApplications}
                >
                  View All Applications
                </MDButton>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Overall Statistics */}
        {overallStats && (
          <MDBox mb={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <MDBox display="flex" alignItems="center">
                      <PeopleIcon color="info" sx={{ mr: 2 }} />
                      <MDBox>
                        <MDTypography variant="h6" fontWeight="medium">
                          {overallStats.totalApplications}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Total Applications
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
                      <TrendingUpIcon color="success" sx={{ mr: 2 }} />
                      <MDBox>
                        <MDTypography variant="h6" fontWeight="medium" color="success">
                          {overallStats.appliedCount}
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
                      <AnalyticsIcon color="warning" sx={{ mr: 2 }} />
                      <MDBox>
                        <MDTypography variant="h6" fontWeight="medium" color="warning">
                          {overallStats.pendingCount}
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
                      <AssessmentIcon color="info" sx={{ mr: 2 }} />
                      <MDBox>
                        <MDTypography variant="h6" fontWeight="medium" color="info">
                          {overallStats.totalDepartments}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Departments
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </MDBox>
        )}

        {/* Department Analytics Table */}
        <Card>
          <CardContent>
            <MDBox mb={2} display="flex" alignItems="center" justifyContent="space-between" gap={2}>
              <MDBox>
                <MDTypography variant="h6" fontWeight="medium">
                  Department-wise Analytics
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Click on a department to view detailed applications
                </MDTypography>
              </MDBox>
              <ExportMenu 
                rows={exportRows}
                columns={exportColumns}
                filename={`job-analytics-${jobData?.title || 'job'}`}
                // Pass job detail lines for PDF header via props using ExportMenu passthrough
                headerLines={[`Company: ${jobData?.company || '-'}`, `Deadline: ${jobData?.deadline ? new Date(jobData.deadline).toLocaleDateString() : 'No deadline'}`]}
                title={`Job Analytics`}
              />
            </MDBox>
            
            <DataTable
              table={departmentTableData}
              showTotalEntries={true}
              isSorted={true}
              noEndBorder={true}
              entriesPerPage={false}
              canSearch={false}
              loading={loading}
            />
          </CardContent>
        </Card>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default JobAnalytics;
