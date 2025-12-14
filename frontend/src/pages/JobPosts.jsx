import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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

// Context
import { useApplicationResponse } from 'context/ApplicationResponseContext';
import { useJob } from 'context/JobContext';

// Services
import { getPublicJobs } from 'services/jobService';
import api from 'services/api';

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
    jobType: '',
    location: '',
    company: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 12
  });
  // Application response context
  const { recordApplyClick, pendingResponse } = useApplicationResponse();

  // Job context for save/unsave functionality
  const { toggleSaveJob, fetchSavedJobs, savedJobs } = useJob();

  // Fetch jobs function
  const fetchJobs = useCallback(async (currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPublicJobs(currentFilters);

      if (response.success) {
        // Get the jobs from the response
        let jobsData = response.data.jobs;

        // Fetch applied jobs status from backend
        try {
          const appliedResponse = await api.get('/jobs/applications/my', {
            params: { status: 'Applied', limit: 1000 }
          });

          if (appliedResponse.success && appliedResponse.data.applications) {
            const appliedJobIds = appliedResponse.data.applications.map(app => app.job._id || app.job);
            const appliedJobsMap = appliedJobIds.reduce((map, jobId) => {
              map[jobId] = true;
              return map;
            }, {});

            // Mark jobs as applied
            jobsData = jobsData.map(job => ({
              ...job,
              hasApplied: appliedJobsMap[job._id] || false
            }));
          }
        } catch (appliedErr) {
          console.error('Error fetching applied jobs:', appliedErr);
          // Continue without applied status if this fails
        }

        setJobs(jobsData);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Initial load
  useEffect(() => {
    console.log('📌 Initial load: Fetching saved jobs and all jobs...');

    const loadData = async () => {
      try {
        // Fetch saved jobs first
        await fetchSavedJobs();
        // Then fetch all jobs
        await fetchJobs();
      } catch (err) {
        console.error('📌 Error during initial load:', err);
        // Still fetch jobs even if saved jobs fetch fails
        await fetchJobs();
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Create processed jobs by merging generic jobs with saved status from context
  const processedJobs = useMemo(() => {
    if (!savedJobs) return jobs;

    const savedJobsMap = savedJobs.reduce((map, job) => {
      map[job._id] = true;
      return map;
    }, {});

    return jobs.map(job => ({
      ...job,
      isSaved: !!savedJobsMap[job._id]
    }));
  }, [jobs, savedJobs]);

  // Refresh jobs when application response modal closes (after student responds)
  // Only refresh if modal was previously open and is now closed
  const prevPendingResponse = useRef(null);
  useEffect(() => {
    if (prevPendingResponse.current !== null && !pendingResponse) {
      // Modal was open and is now closed, refresh jobs to update applied status
      fetchJobs();
    }
    prevPendingResponse.current = pendingResponse;
  }, [pendingResponse, fetchJobs]);

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
    if (job?.applicationLink) {
      console.log('🔗 Apply button clicked for job:', job._id);
      console.log('🔗 Application link:', job.applicationLink);

      // Open external application link FIRST (synchronously, before any async operations)
      const newWindow = window.open(job.applicationLink, '_blank', 'noopener,noreferrer');

      if (newWindow) {
        console.log('✅ External link opened successfully in new tab');
      } else {
        console.warn('⚠️ Popup may have been blocked by browser');
      }

      // Small delay to ensure window opens before showing modal
      setTimeout(() => {
        console.log('📱 Now recording apply click and showing modal');
        // Record the apply click (this will show the modal)
        recordApplyClick(job._id, {
          _id: job._id,
          title: job.title,
          company: job.company,
          location: job.location
        });
      }, 100);
    } else {
      // If no external link, simulate the apply process for demo purposes
      console.log('🔗 No external link, simulating apply process for job:', job._id);

      // Record the apply click for demo
      recordApplyClick(job._id || `demo-${Date.now()}`, {
        _id: job._id || `demo-${Date.now()}`,
        title: job.title,
        company: job.company,
        location: job.location
      });

      // Show alert and simulate external redirect
      alert('Demo: You would be redirected to the company\'s application page. When you return, you\'ll see the popup asking if you applied.');

      // For demo purposes, you can refresh the page to see the popup
      console.log('💡 Tip: Refresh the page to see the application response popup!');
    }
  };

  // Handle job save/unsave
  const handleSaveToggle = async (jobId) => {
    try {
      // Call the toggleSaveJob function from JobContext
      // This will update the savedJobs context which triggers useMemo to re-calculate isSaved status
      const response = await toggleSaveJob(jobId);

      if (!response.success) {
        setError(response.message || 'Failed to save/unsave job');
      }
    } catch (err) {
      console.error('Error toggling job save status:', err);
      setError(err.message || 'Failed to save/unsave job');
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox py={3}>
        <Container maxWidth="xl">
          {/* Header */}
          <MDBox mb={4}>
            <MDBox display="flex" alignItems="center" gap={2.5} mb={3}>
              <MDBox
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: 'rgba(25, 118, 210, 0.1)',
                  border: '1px solid rgba(25, 118, 210, 0.2)'
                }}
              >
                <WorkIcon sx={{ fontSize: 28, color: '#1976d2' }} />
              </MDBox>
              <MDBox>
                <MDTypography variant="h4" fontWeight="bold" color="dark" sx={{ mb: 0.5 }}>
                  Job Opportunities
                </MDTypography>
                <MDTypography variant="body1" color="text" sx={{ fontSize: '15px' }}>
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
              {!loading && processedJobs.length === 0 && !error && (
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
              {!loading && processedJobs.length > 0 && (
                <>
                  <MDBox mb={4} >
                    {processedJobs.map((job) => (
                      <JobCard
                        key={job._id}
                        job={job}
                        onApply={() => handleApply(job)}
                        onSave={() => handleSaveToggle(job._id)}
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
                        size="medium"
                        showFirstButton
                        showLastButton
                        sx={{
                          '& .MuiPaginationItem-root': {
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0',
                            color: '#666',
                            '&:hover': {
                              backgroundColor: '#f5f5f5',
                              borderColor: '#1976d2',
                            },
                          },
                          '& .Mui-selected': {
                            backgroundColor: '#1976d2',
                            color: 'white',
                            borderColor: '#1976d2',
                            '&:hover': {
                              backgroundColor: '#1565c0',
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
