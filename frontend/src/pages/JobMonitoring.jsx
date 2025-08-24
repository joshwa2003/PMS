import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, IconButton, Tooltip, Tab, Tabs, Box } from '@mui/material';
import { 
  Visibility as ViewIcon, 
  Analytics as AnalyticsIcon,
  GetApp as ExportIcon,
  Refresh as RefreshIcon
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
import { useJob } from 'context/JobContext';
import { useAuth } from 'context/AuthContext';

// Components
import JobDetailsModal from 'components/JobManagement/JobDetailsModal';
import JobAnalyticsModal from 'components/JobMonitoring/JobAnalyticsModal';
import ApplicationDetailsModal from 'components/JobMonitoring/ApplicationDetailsModal';
import JobMonitoringFilters from 'components/JobMonitoring/JobMonitoringFilters';
import JobStatisticsCards from 'components/JobMonitoring/JobStatisticsCards';
import ExportDataModal from 'components/JobMonitoring/ExportDataModal';

// Services
import { formatSalary, getDaysUntilDeadline, getJobStatusColor, getApplicationStatusColor } from 'services/jobService';

// Tab panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`job-monitoring-tabpanel-${index}`}
      aria-labelledby={`job-monitoring-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function JobMonitoring() {
  const { user } = useAuth();
  const {
    jobs,
    jobsLoading,
    jobsError,
    applications,
    applicationsLoading,
    applicationsError,
    analytics,
    analyticsLoading,
    pagination,
    filters,
    fetchJobs,
    fetchJobApplications,
    fetchJobAnalytics,
    setFilters,
    setCurrentPage,
    clearErrors
  } = useJob();

  // Tab state
  const [currentTab, setCurrentTab] = useState(0);

  // Modal states
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Alert state
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Check if user has permission to monitor jobs
  const canMonitorJobs = ['admin', 'placement_director', 'placement_staff'].includes(user?.role);

  // Fetch jobs on component mount
  useEffect(() => {
    if (canMonitorJobs) {
      fetchJobs();
    }
  }, [fetchJobs, canMonitorJobs]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => clearErrors();
  }, [clearErrors]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Handle job actions
  const handleViewJob = (job) => {
    setSelectedJob(job);
    setDetailsModalOpen(true);
  };

  const handleViewAnalytics = async (job) => {
    setSelectedJob(job);
    try {
      await fetchJobAnalytics(job._id);
      setAnalyticsModalOpen(true);
    } catch (error) {
      setAlert({
        show: true,
        message: error.message || 'Failed to fetch analytics',
        type: 'error'
      });
    }
  };

  const handleViewApplications = async (job) => {
    setSelectedJob(job);
    try {
      await fetchJobApplications(job._id);
      setCurrentTab(1); // Switch to applications tab
    } catch (error) {
      setAlert({
        show: true,
        message: error.message || 'Failed to fetch applications',
        type: 'error'
      });
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setApplicationModalOpen(true);
  };

  const handleExportData = (job) => {
    setSelectedJob(job);
    setExportModalOpen(true);
  };

  const handleRefresh = () => {
    fetchJobs();
    if (selectedJob) {
      fetchJobApplications(selectedJob._id);
    }
  };

  // Prepare jobs table columns
  const jobColumns = [
    {
      Header: 'Job Details',
      accessor: 'title',
      Cell: ({ row }) => (
        <MDBox>
          <MDTypography variant="button" fontWeight="medium">
            {row.original.title}
          </MDTypography>
          <MDTypography variant="caption" color="text" display="block">
            {row.original.company?.name}
          </MDTypography>
          <MDTypography variant="caption" color="text" display="block">
            {row.original.location}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ value }) => (
        <MDBadge 
          badgeContent={value} 
          color={getJobStatusColor(value)} 
          variant="gradient" 
          size="sm" 
        />
      ),
    },
    {
      Header: 'Deadline',
      accessor: 'deadline',
      Cell: ({ value }) => {
        const daysLeft = getDaysUntilDeadline(value);
        const isExpired = daysLeft <= 0;
        
        return (
          <MDBox>
            <MDTypography variant="caption" color={isExpired ? 'error' : 'text'}>
              {new Date(value).toLocaleDateString()}
            </MDTypography>
            <MDTypography variant="caption" color={isExpired ? 'error' : 'warning'} display="block">
              {isExpired ? 'Expired' : `${daysLeft} days left`}
            </MDTypography>
          </MDBox>
        );
      },
    },
    {
      Header: 'Engagement',
      accessor: 'stats',
      Cell: ({ value }) => (
        <MDBox textAlign="center">
          <MDTypography variant="button" fontWeight="medium" color="info">
            {value?.totalViews || 0}
          </MDTypography>
          <MDTypography variant="caption" color="text" display="block">
            views
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: 'Applications',
      accessor: 'stats.totalApplications',
      Cell: ({ value, row }) => {
        const totalViews = row.original.stats?.totalViews || 0;
        const conversionRate = totalViews > 0 ? ((value || 0) / totalViews * 100).toFixed(1) : 0;
        
        return (
          <MDBox textAlign="center">
            <MDTypography variant="button" fontWeight="medium" color="success">
              {value || 0}
            </MDTypography>
            <MDTypography variant="caption" color="text" display="block">
              {conversionRate}% rate
            </MDTypography>
          </MDBox>
        );
      },
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <MDBox display="flex" alignItems="center">
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => handleViewJob(row.original)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Analytics">
            <IconButton size="small" onClick={() => handleViewAnalytics(row.original)}>
              <AnalyticsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Applications">
            <IconButton size="small" onClick={() => handleViewApplications(row.original)}>
              <ViewIcon fontSize="small" color="info" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Data">
            <IconButton size="small" onClick={() => handleExportData(row.original)}>
              <ExportIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
      ),
    },
  ];

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
      Header: 'Department',
      accessor: 'department',
      Cell: ({ value }) => (
        <MDTypography variant="caption" color="text">
          {value?.name || 'N/A'}
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
    {
      Header: 'Response Date',
      accessor: 'responseAt',
      Cell: ({ value }) => (
        <MDTypography variant="caption" color="text">
          {value ? new Date(value).toLocaleDateString() : 'No Response'}
        </MDTypography>
      ),
    },
    {
      Header: 'Actions',
      accessor: 'applicationActions',
      Cell: ({ row }) => (
        <Tooltip title="View Application Details">
          <IconButton size="small" onClick={() => handleViewApplication(row.original)}>
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  // Prepare table data
  const jobTableData = {
    columns: jobColumns,
    rows: jobs || [],
  };

  const applicationTableData = {
    columns: applicationColumns,
    rows: applications || [],
  };

  if (!canMonitorJobs) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDAlert color="error">
            You do not have permission to access job monitoring.
          </MDAlert>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      
      <MDBox py={3}>
        {/* Alert */}
        {alert.show && (
          <MDBox mb={3}>
            <MDAlert 
              color={alert.type} 
              dismissible 
              onClose={() => setAlert({ ...alert, show: false })}
            >
              {alert.message}
            </MDAlert>
          </MDBox>
        )}

        {/* Error Alerts */}
        {(jobsError || applicationsError) && (
          <MDBox mb={3}>
            <MDAlert color="error" dismissible onClose={clearErrors}>
              {jobsError || applicationsError}
            </MDAlert>
          </MDBox>
        )}

        {/* Page Header */}
        <MDBox mb={3}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <MDTypography variant="h4" fontWeight="medium">
                Job Monitoring
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Monitor job postings and track student engagement
              </MDTypography>
            </Grid>
            <Grid item xs={12} md={6}>
              <MDBox display="flex" justifyContent="flex-end">
                <MDButton
                  variant="outlined"
                  color="info"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={jobsLoading || applicationsLoading}
                >
                  Refresh
                </MDButton>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Statistics Cards */}
        <MDBox mb={3}>
          <JobStatisticsCards jobs={jobs} />
        </MDBox>

        {/* Filters */}
        <MDBox mb={3}>
          <JobMonitoringFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            loading={jobsLoading}
          />
        </MDBox>

        {/* Tabs */}
        <Card>
          <CardContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={currentTab} onChange={handleTabChange} aria-label="job monitoring tabs">
                <Tab label="All Jobs" />
                <Tab label="Applications" disabled={!selectedJob} />
              </Tabs>
            </Box>

            {/* Jobs Tab */}
            <TabPanel value={currentTab} index={0}>
              <DataTable
                table={jobTableData}
                showTotalEntries={true}
                isSorted={true}
                noEndBorder={true}
                entriesPerPage={false}
                canSearch={false}
                loading={jobsLoading}
              />
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <MDBox display="flex" justifyContent="center" mt={3}>
                  <MDButton
                    variant="outlined"
                    color="info"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setCurrentPage(pagination.currentPage - 1)}
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
                    onClick={() => setCurrentPage(pagination.currentPage + 1)}
                    sx={{ ml: 1 }}
                  >
                    Next
                  </MDButton>
                </MDBox>
              )}
            </TabPanel>

            {/* Applications Tab */}
            <TabPanel value={currentTab} index={1}>
              {selectedJob && (
                <MDBox mb={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Applications for: {selectedJob.title}
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    {selectedJob.company?.name} • {selectedJob.location}
                  </MDTypography>
                </MDBox>
              )}
              
              <DataTable
                table={applicationTableData}
                showTotalEntries={true}
                isSorted={true}
                noEndBorder={true}
                entriesPerPage={false}
                canSearch={false}
                loading={applicationsLoading}
              />
            </TabPanel>
          </CardContent>
        </Card>
      </MDBox>

      {/* Modals */}
      {detailsModalOpen && selectedJob && (
        <JobDetailsModal
          open={detailsModalOpen}
          job={selectedJob}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedJob(null);
          }}
        />
      )}

      {analyticsModalOpen && selectedJob && (
        <JobAnalyticsModal
          open={analyticsModalOpen}
          job={selectedJob}
          analytics={analytics}
          loading={analyticsLoading}
          onClose={() => {
            setAnalyticsModalOpen(false);
            setSelectedJob(null);
          }}
        />
      )}

      {applicationModalOpen && selectedApplication && (
        <ApplicationDetailsModal
          open={applicationModalOpen}
          application={selectedApplication}
          onClose={() => {
            setApplicationModalOpen(false);
            setSelectedApplication(null);
          }}
        />
      )}

      {exportModalOpen && selectedJob && (
        <ExportDataModal
          open={exportModalOpen}
          job={selectedJob}
          onClose={() => {
            setExportModalOpen(false);
            setSelectedJob(null);
          }}
        />
      )}

      <Footer />
    </DashboardLayout>
  );
}

export default JobMonitoring;
