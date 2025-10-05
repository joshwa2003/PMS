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

// Context
import { useApplicationResponse } from 'context/ApplicationResponseContext';
import { useJob } from 'context/JobContext';

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
    sortBy: 'publishedAt',
    sortOrder: 'desc',
    page: 1,
    limit: 12
  });

  // Application response context
  const { recordApplyClick } = useApplicationResponse();
  
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
        
        // If we have saved jobs, mark the ones that are saved
        if (savedJobs && savedJobs.length > 0) {
          // Create a map of saved job IDs for faster lookup
          const savedJobsMap = savedJobs.reduce((map, job) => {
            map[job._id] = true;
            return map;
          }, {});
          
          // Update the isSaved property for each job
          jobsData = jobsData.map(job => ({
            ...job,
            isSaved: savedJobsMap[job._id] || false
          }));
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
  }, [filters]);

  // Initial load
  useEffect(() => {
    // Fetch saved jobs first, then fetch all jobs
    fetchSavedJobs().then(() => {
      fetchJobs();
    }).catch(err => {
      console.error('Error fetching saved jobs:', err);
      // Still fetch jobs even if saved jobs fetch fails
      fetchJobs();
    });
  }, [fetchJobs, fetchSavedJobs]);
  
  // Update jobs when savedJobs changes
  useEffect(() => {
    if (savedJobs && jobs.length > 0) {
      // Create a map of saved job IDs for faster lookup
      const savedJobsMap = savedJobs.reduce((map, job) => {
        map[job._id] = true;
        return map;
      }, {});
      
      // Update the jobs with the current saved status
      setJobs(prevJobs => 
        prevJobs.map(job => ({
          ...job,
          isSaved: savedJobsMap[job._id] || false
        }))
      );
    }
  }, [savedJobs]);

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
  const handleApply = async (job) => {
    if (job?.applicationLink) {
      console.log('🔗 Apply button clicked for job:', job._id);
      
      // Record the apply click before opening external link
      await recordApplyClick(job._id, {
        _id: job._id,
        title: job.title,
        company: job.company,
        location: job.location
      });
      
      console.log('✅ Apply click recorded, opening external link:', job.applicationLink);
      
      // Open external application link
      window.open(job.applicationLink, '_blank');
    } else {
      // If no external link, simulate the apply process for demo purposes
      console.log('🔗 No external link, simulating apply process for job:', job._id);
      
      // Record the apply click for demo
      await recordApplyClick(job._id || `demo-${Date.now()}`, {
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
      const response = await toggleSaveJob(jobId);
      
      if (response.success) {
        // Update the jobs list to reflect the new saved status
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job._id === jobId ? { ...job, isSaved: !job.isSaved } : job
          )
        );
      } else {
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
