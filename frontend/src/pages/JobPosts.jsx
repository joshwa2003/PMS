import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Container, CircularProgress, Alert, Pagination, Box } from '@mui/material';
import { Work as WorkIcon } from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';

// Material Dashboard 2 React examples
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';

// Custom components
import JobCard from 'components/JobPosts/JobCard';
import JobFilters from 'components/JobPosts/JobFilters';
import LoadingSpinner from 'components/LoadingSpinner'; // Added import

// Services
import { getPublicJobs } from 'services/jobService';

const JobPosts = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [availableFilters, setAvailableFilters] = useState({
    jobTypes: [],
    locations: [],
    companies: []
  });
  const [filters, setFilters] = useState({
    search: '',
    jobType: '',
    location: '',
    company: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 12
  });

  // Fetch jobs function
  const fetchJobs = useCallback(async (currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getPublicJobs(currentFilters);
      
      if (response.success) {
        setJobs(response.data.jobs || []);
        setPagination(response.data.pagination || {});
        setAvailableFilters(response.data.filters || {});
      } else {
        setError(response.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...newFilters, page: 1 }; // Reset to first page
    setFilters(updatedFilters);
    fetchJobs(updatedFilters);
  };

  // Handle pagination
  const handlePageChange = (event, page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchJobs(updatedFilters);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle job application
  const handleApply = (job) => {
    if (job.applicationLink) {
      window.open(job.applicationLink, '_blank');
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      
      <MDBox py={3}>
        <Container maxWidth="xl">
          {/* Header */}
          <MDBox mb={4}>
            <MDBox display="flex" alignItems="center" gap={2} mb={2}>
              <WorkIcon sx={{ fontSize: 32, color: 'info.main' }} />
              <MDBox>
                <MDTypography variant="h3" fontWeight="bold" color="dark">
                  Job Opportunities
                </MDTypography>
                <MDTypography variant="body1" color="text">
                  Discover exciting career opportunities from top companies
                </MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>

          {/* Main Content Layout - Two Column */}
          <Grid container spacing={3}>
            {/* Left Column - Job Cards */}
            <Grid item xs={12} lg={8}>
              {/* Error Alert */}
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3, borderRadius: 2 }}
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}

              {/* Loading State */}
              {loading && <LoadingSpinner />} {/* Integrated Loading Spinner */}

              {/* No Jobs Found */}
              {!loading && jobs.length === 0 && !error && (
                <MDBox 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center" 
                  py={8}
                  textAlign="center"
                >
                  <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <MDTypography variant="h5" color="text" mb={1}>
                    No jobs found
                  </MDTypography>
                  <MDTypography variant="body1" color="text">
                    Try adjusting your search criteria or check back later for new opportunities.
                  </MDTypography>
                </MDBox>
              )}

              {/* Jobs List - Vertical Layout */}
              {!loading && jobs.length > 0 && (
                <>
                  <MDBox mb={4} >
                    {jobs.map((job) => (
                      <JobCard
                        key={job._id}
                        job={job}
                        onApply={handleApply}
                      />
                    ))}
                  </MDBox>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <MDBox display="flex" justifyContent="center" mt={4}>
                      <Pagination
                        count={pagination.totalPages}
                        page={pagination.currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                        sx={{
                          '& .MuiPaginationItem-root': {
                            borderRadius: 2,
                          },
                          '& .Mui-selected': {
                            backgroundColor: 'info.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'info.dark',
                            },
                          },
                        }}
                      />
                    </MDBox>
                  )}

                  {/* Results Summary */}
                  <MDBox display="flex" justifyContent="center" mt={3}>
                    <MDTypography variant="body2" color="text">
                      Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{' '}
                      {Math.min(pagination.currentPage * filters.limit, pagination.totalJobs)} of{' '}
                      {pagination.totalJobs} jobs
                    </MDTypography>
                  </MDBox>
                </>
              )}
            </Grid>

            {/* Right Column - Filters Sidebar */}
            <Grid item xs={12} lg={4}>
              <MDBox 
                sx={{ 
                  position: { lg: 'sticky' },
                  top: { lg: 24 },
                  height: 'fit-content'
                }}
              >
                <JobFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  availableFilters={availableFilters}
                  loading={loading}
                  totalJobs={pagination.totalJobs}
                />
              </MDBox>
            </Grid>
          </Grid>
        </Container>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
};

export default JobPosts;
