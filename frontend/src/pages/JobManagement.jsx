import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, IconButton, Tooltip, Fab } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDInput from 'components/MDInput';
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
import CreateJobModal from 'components/JobManagement/CreateJobModal';
import EditJobModal from 'components/JobManagement/EditJobModal';
import JobDetailsModal from 'components/JobManagement/JobDetailsModal';
import DeleteConfirmationModal from 'components/JobManagement/DeleteConfirmationModal';
import JobFilters from 'components/JobManagement/JobFilters';

// Services
import { formatSalary, getDaysUntilDeadline, getJobStatusColor } from 'services/jobService';

function JobManagement() {
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
  const [createModalOpen, setCreateModalOpen] = useState(false);
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
  const handleCreateSuccess = (newJob) => {
    setCreateModalOpen(false);
    setAlert({
      show: true,
      message: 'Job created successfully',
      type: 'success'
    });
    fetchJobs(); // Refresh the list
  };

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
      Header: 'Job Title',
      accessor: 'title',
      Cell: ({ row }) => (
        <MDBox>
          <MDTypography variant="button" fontWeight="medium">
            {row.original.title}
          </MDTypography>
          <MDTypography variant="caption" color="text" display="block">
            {row.original.company?.name}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: 'Location',
      accessor: 'location',
      Cell: ({ value }) => (
        <MDTypography variant="caption" color="text">
          {value}
        </MDTypography>
      ),
    },
    {
      Header: 'Job Type',
      accessor: 'jobType',
      Cell: ({ value }) => (
        <MDBadge badgeContent={value} color="info" variant="gradient" size="sm" />
      ),
    },
    {
      Header: 'Salary',
      accessor: 'salary',
      Cell: ({ value }) => (
        <MDTypography variant="caption" color="text">
          {formatSalary(value)}
        </MDTypography>
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
      Header: 'Applications',
      accessor: 'stats.totalApplications',
      Cell: ({ value, row }) => (
        <MDBox textAlign="center">
          <MDTypography variant="button" fontWeight="medium">
            {value || 0}
          </MDTypography>
          <MDTypography variant="caption" color="text" display="block">
            {row.original.stats?.totalViews || 0} views
          </MDTypography>
        </MDBox>
      ),
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
          {canCreateJobs && (
            <>
              <Tooltip title="Edit Job">
                <IconButton size="small" onClick={() => handleEditJob(row.original)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Job">
                <IconButton size="small" onClick={() => handleDeleteJob(row.original)}>
                  <DeleteIcon fontSize="small" color="error" />
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
        <MDBox mb={3}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <MDTypography variant="h4" fontWeight="medium">
                Job Management
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Manage job postings and track applications
              </MDTypography>
            </Grid>
            <Grid item xs={12} md={6}>
              <MDBox display="flex" justifyContent="flex-end">
                {canCreateJobs && (
                  <MDButton
                    variant="gradient"
                    color="info"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateModalOpen(true)}
                  >
                    Create Job
                  </MDButton>
                )}
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Filters */}
        <MDBox mb={3}>
          <JobFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            loading={jobsLoading}
          />
        </MDBox>

        {/* Jobs Table */}
        <Card>
          <CardContent>
            <DataTable
              table={tableData}
              showTotalEntries={true}
              isSorted={true}
              noEndBorder={true}
              entriesPerPage={false}
              canSearch={false}
              loading={jobsLoading}
            />
            
            {/* Custom Pagination */}
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

      {/* Floating Action Button for Mobile */}
      {canCreateJobs && (
        <Fab
          color="info"
          aria-label="add job"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' }
          }}
          onClick={() => setCreateModalOpen(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Modals */}
      {createModalOpen && (
        <CreateJobModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

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

export default JobManagement;
