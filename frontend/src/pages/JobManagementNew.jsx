import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, 
  Card, 
  CardContent, 
  IconButton, 
  Tooltip, 
  Fab,
  Paper,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon
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
import EditJobModal from 'components/JobManagement/EditJobModal';
import JobDetailsModal from 'components/JobManagement/JobDetailsModal';
import DeleteConfirmationModal from 'components/JobManagement/DeleteConfirmationModal';
import JobFilters from 'components/JobManagement/JobFilters';

// Services
import { formatSalary, getDaysUntilDeadline, getJobStatusColor } from 'services/jobService';

// Analytics Card Component
const AnalyticsCard = ({ title, value, subtitle, icon, color = "info" }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <MDBox display="flex" justifyContent="space-between" alignItems="center">
        <MDBox>
          <MDTypography variant="h4" fontWeight="bold" color={color}>
            {value}
          </MDTypography>
          <MDTypography variant="button" fontWeight="medium" color="text">
            {title}
          </MDTypography>
          {subtitle && (
            <MDTypography variant="caption" color="text" display="block">
              {subtitle}
            </MDTypography>
          )}
        </MDBox>
        <MDBox
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="4rem"
          height="4rem"
          borderRadius="50%"
          sx={{
            backgroundColor: ({ palette }) => palette[color].main,
            color: "white"
          }}
        >
          {icon}
        </MDBox>
      </MDBox>
    </CardContent>
  </Card>
);

// Quick Stats Component
const QuickStats = ({ jobs }) => {
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === 'Active').length;
  const totalApplications = jobs.reduce((sum, job) => sum + (job.stats?.totalApplications || 0), 0);
  const avgApplicationsPerJob = totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0;

  return (
    <Grid container spacing={3} mb={3}>
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticsCard
          title="Total Jobs"
          value={totalJobs}
          subtitle="All job postings"
          icon={<WorkIcon />}
          color="info"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticsCard
          title="Active Jobs"
          value={activeJobs}
          subtitle="Currently open"
          icon={<TrendingUpIcon />}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticsCard
          title="Total Applications"
          value={totalApplications}
          subtitle="Across all jobs"
          icon={<PeopleIcon />}
          color="warning"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticsCard
          title="Avg Applications"
          value={avgApplicationsPerJob}
          subtitle="Per job posting"
          icon={<AnalyticsIcon />}
          color="error"
        />
      </Grid>
    </Grid>
  );
};

function JobManagementNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    jobs,
    jobsLoading,
    jobsError,
    pagination,
    filters,
    fetchJobs,
    deleteJob,
    setFilters,
    setCurrentPage,
    clearErrors
  } = useJob();

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Alert state
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Check if user has permission to create jobs
  const canCreateJobs = ['admin', 'placement_director'].includes(user?.role);

  // Fetch jobs on component mount and when filters change
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, filters, pagination.currentPage]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => clearErrors();
  }, [clearErrors]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle job actions
  const handleViewJob = (job) => {
    setSelectedJob(job);
    setDetailsModalOpen(true);
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setEditModalOpen(true);
  };

  const handleDeleteJob = (job) => {
    setSelectedJob(job);
    setDeleteModalOpen(true);
  };

  const handleCreateJob = () => {
    navigate('/job-management/create');
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteJob(selectedJob._id);
      setAlert({
        show: true,
        message: 'Job deleted successfully',
        type: 'success'
      });
      setDeleteModalOpen(false);
      setSelectedJob(null);
    } catch (error) {
      setAlert({
        show: true,
        message: error.message || 'Failed to delete job',
        type: 'error'
      });
    }
  };

  // Handle modal close events
  const handleEditSuccess = (updatedJob) => {
    setEditModalOpen(false);
    setSelectedJob(null);
    setAlert({
      show: true,
      message: 'Job updated successfully',
      type: 'success'
    });
    fetchJobs(); // Refresh the list
  };

  // Prepare table columns
  const columns = [
    {
      Header: 'Job Details',
      accessor: 'title',
      Cell: ({ row }) => (
        <MDBox>
          <MDTypography variant="button" fontWeight="medium" color="dark">
            {row.original.title}
          </MDTypography>
          <MDTypography variant="caption" color="text" display="block">
            <strong>{row.original.company?.name}</strong> • {row.original.location}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: 'Type & Salary',
      accessor: 'jobType',
      Cell: ({ row }) => (
        <MDBox>
          <MDBadge badgeContent={row.original.jobType} color="info" variant="gradient" size="sm" />
          <MDTypography variant="caption" color="text" display="block" mt={0.5}>
            {formatSalary(row.original.salary)}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: 'Deadline',
      accessor: 'deadline',
      Cell: ({ value }) => {
        const daysLeft = getDaysUntilDeadline(value);
        const isExpired = daysLeft <= 0;
        const isUrgent = daysLeft <= 3 && daysLeft > 0;
        
        return (
          <MDBox>
            <MDTypography variant="caption" color={isExpired ? 'error' : 'text'}>
              {new Date(value).toLocaleDateString()}
            </MDTypography>
            <MDBox display="flex" alignItems="center" mt={0.5}>
              <ScheduleIcon 
                fontSize="small" 
                sx={{ 
                  mr: 0.5, 
                  color: isExpired ? 'error.main' : isUrgent ? 'warning.main' : 'text.secondary' 
                }} 
              />
              <MDTypography 
                variant="caption" 
                color={isExpired ? 'error' : isUrgent ? 'warning' : 'text'}
                fontWeight={isUrgent || isExpired ? 'bold' : 'regular'}
              >
                {isExpired ? 'Expired' : `${daysLeft} days left`}
              </MDTypography>
            </MDBox>
          </MDBox>
        );
      },
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
      Header: 'Performance',
      accessor: 'stats.totalApplications',
      Cell: ({ value, row }) => (
        <MDBox textAlign="center">
          <MDBox display="flex" alignItems="center" justifyContent="center">
            <PeopleIcon fontSize="small" sx={{ mr: 0.5, color: 'info.main' }} />
            <MDTypography variant="button" fontWeight="bold" color="info">
              {value || 0}
            </MDTypography>
          </MDBox>
          <MDTypography variant="caption" color="text">
            {row.original.stats?.totalViews || 0} views
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <MDBox display="flex" alignItems="center" gap={0.5}>
          <Tooltip title="View Details">
            <IconButton 
              size="small" 
              onClick={() => handleViewJob(row.original)}
              sx={{ color: 'info.main' }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {canCreateJobs && (
            <>
              <Tooltip title="Edit Job">
                <IconButton 
                  size="small" 
                  onClick={() => handleEditJob(row.original)}
                  sx={{ color: 'warning.main' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Job">
                <IconButton 
                  size="small" 
                  onClick={() => handleDeleteJob(row.original)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </MDBox>
      ),
    },
  ];

  // Prepare table data
  const tableData = {
    columns,
    rows: jobs || [],
  };

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

        {/* Error Alert */}
        {jobsError && (
          <MDBox mb={3}>
            <MDAlert color="error" dismissible onClose={clearErrors}>
              {jobsError}
            </MDAlert>
          </MDBox>
        )}

        {/* Page Header */}
        <MDBox mb={4}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <MDTypography variant="h3" fontWeight="bold" color="dark">
                Job Management
              </MDTypography>
              <MDTypography variant="body1" color="text" mt={1}>
                Manage job postings, track applications, and analyze performance metrics
              </MDTypography>
            </Grid>
            <Grid item xs={12} md={4}>
              <MDBox display="flex" justifyContent="flex-end" gap={2}>
                {canCreateJobs && (
                  <MDButton
                    variant="gradient"
                    color="info"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={handleCreateJob}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}
                  >
                    Create New Job
                  </MDButton>
                )}
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Analytics Dashboard */}
        <QuickStats jobs={jobs || []} />

        {/* Filters Section */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <MDBox mb={2}>
            <MDTypography variant="h6" fontWeight="medium" color="dark">
              Filter & Search Jobs
            </MDTypography>
          </MDBox>
          <JobFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            loading={jobsLoading}
          />
        </Paper>

        {/* Jobs Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            <MDBox p={3} pb={0}>
              <MDBox display="flex" alignItems="center" justifyContent="space-between">
                <MDBox>
                  <MDTypography variant="h6" fontWeight="medium" color="dark">
                    Job Listings
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    {pagination.totalJobs} total jobs found
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" alignItems="center" gap={1}>
                  <TrendingUpIcon sx={{ color: 'success.main' }} />
                  <MDTypography variant="caption" color="success" fontWeight="medium">
                    {jobs?.filter(job => job.status === 'Active').length || 0} Active
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>
            
            <Divider sx={{ my: 2 }} />
            
            <MDBox px={3}>
              <DataTable
                table={tableData}
                showTotalEntries={false}
                isSorted={true}
                noEndBorder={true}
                entriesPerPage={false}
                canSearch={false}
                loading={jobsLoading}
              />
            </MDBox>
            
            {/* Custom Pagination */}
            {pagination.totalPages > 1 && (
              <MDBox display="flex" justifyContent="center" p={3} pt={2}>
                <MDBox display="flex" alignItems="center" gap={2}>
                  <MDButton
                    variant="outlined"
                    color="info"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    size="small"
                  >
                    Previous
                  </MDButton>
                  
                  <MDTypography variant="body2" color="text">
                    Page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong>
                  </MDTypography>
                  
                  <MDButton
                    variant="outlined"
                    color="info"
                    disabled={!pagination.hasNextPage}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    size="small"
                  >
                    Next
                  </MDButton>
                </MDBox>
              </MDBox>
            )}
          </CardContent>
        </Card>
      </MDBox>

      {/* Floating Action Button for Mobile */}
      {canCreateJobs && (
        <Fab
          color="info"
          aria-label="add job"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: { xs: 'flex', md: 'none' },
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }}
          onClick={handleCreateJob}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Modals */}
      {editModalOpen && selectedJob && (
        <EditJobModal
          open={editModalOpen}
          job={selectedJob}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedJob(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

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

      {deleteModalOpen && selectedJob && (
        <DeleteConfirmationModal
          open={deleteModalOpen}
          job={selectedJob}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedJob(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}

      <Footer />
    </DashboardLayout>
  );
}

export default JobManagementNew;
