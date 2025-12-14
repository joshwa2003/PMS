import React, { useState, useEffect } from 'react';
import { Grid, Container, Box, Tabs, Tab, Avatar, Typography, Divider } from '@mui/material';
import { Work as WorkIcon, BookmarkBorder as BookmarkIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

// Material Dashboard 2 React examples
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';

// Custom components
import LoadingSpinner from 'components/LoadingSpinner';
import JobCard from 'components/JobPosts/JobCard';

// Context
import { useJob } from 'context/JobContext';
import { useMaterialUIController } from 'context';

// Services
// Define getPostedTime function locally
const getPostedTime = (createdAt) => {
  const now = new Date();
  const posted = new Date(createdAt);
  const diffInDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return '1 Day Ago';
  return `${diffInDays} Days Ago`;
};

const AppliedJobs = () => {
  const {
    studentJobs,
    studentJobsLoading,
    studentJobsError,
    fetchStudentJobs,
    savedJobs,
    savedJobsLoading,
    savedJobsError,
    fetchSavedJobs,
    toggleSaveJob
  } = useJob();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [tabValue, setTabValue] = useState(0); // Default to "Saved" tab
  const navigate = useNavigate();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  useEffect(() => {
    fetchStudentJobs();
    fetchSavedJobs();
  }, [fetchStudentJobs, fetchSavedJobs]);

  useEffect(() => {
    if (studentJobs && studentJobs.length > 0) {
      // Filter jobs that the student has applied to
      const applied = studentJobs.filter(job => job.hasApplied === true);
      setAppliedJobs(applied);
    } else {
      // If studentJobs is undefined or empty, set appliedJobs to empty array
      setAppliedJobs([]);
    }
  }, [studentJobs]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleJobClick = (jobId) => {
    navigate(`/job-detail/${jobId}`);
  };

  // Helper to handle save toggle
  const handleSaveToggle = async (jobId) => {
    await toggleSaveJob(jobId);
  };

  if (studentJobsLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <LoadingSpinner />
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Container maxWidth="xl">
          {/* Header Section */}
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
                  My Jobs
                </MDTypography>
                <MDTypography variant="body1" color="text" sx={{ fontSize: '15px' }}>
                  Track your saved opportunities and applications
                </MDTypography>
              </MDBox>
            </MDBox>

            {/* Tabs Section */}
            <MDBox
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                mb: 3
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="my jobs tabs"
                sx={{
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#1976d2',
                    height: 3,
                    borderRadius: '3px 3px 0 0'
                  },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '16px',
                    minWidth: 120,
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      color: '#1976d2',
                    },
                  }
                }}
              >
                <Tab label={`Saved (${savedJobs?.length || 0})`} />
                <Tab label={`Applied (${appliedJobs?.length || 0})`} />
              </Tabs>
            </MDBox>
          </MDBox>

          {/* Error Handling */}
          {(savedJobsError || studentJobsError) && (
            <Grid item xs={12}>
              <MDBox mb={3} p={3} bgcolor="error.main" borderRadius="lg">
                <MDTypography variant="body1" color="white">
                  {savedJobsError || studentJobsError}
                </MDTypography>
              </MDBox>
            </Grid>
          )}

          {/* Content Area */}
          <Grid container spacing={3}>

            {/* Saved Jobs Tab Content */}
            {tabValue === 0 && (
              <>
                {savedJobsLoading ? (
                  <Grid item xs={12}>
                    <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
                      <LoadingSpinner />
                    </MDBox>
                  </Grid>
                ) : (!savedJobs || savedJobs.length === 0) ? (
                  <Grid item xs={12}>
                    <MDBox
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                      alignItems="center"
                      minHeight="40vh"
                      textAlign="center"
                      p={3}
                      sx={{
                        bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                        borderRadius: '12px',
                        border: '1px dashed',
                        borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                      }}
                    >
                      <BookmarkIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary', opacity: 0.5 }} />
                      <MDTypography variant="h5" color="text" gutterBottom>
                        No saved jobs yet
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        Jobs you bookmark will appear here for easy access.
                      </MDTypography>
                      <MDButton
                        variant="gradient"
                        color="info"
                        size="small"
                        sx={{ mt: 3 }}
                        onClick={() => navigate('/job-posts')}
                      >
                        Browse Jobs
                      </MDButton>
                    </MDBox>
                  </Grid>
                ) : (
                  savedJobs.map((job) => {
                    // Check if this saved job is also applied
                    const isApplied = appliedJobs.some(appliedJob => appliedJob._id === job._id);

                    return (
                      <Grid item xs={12} md={6} lg={4} key={job._id}>
                        <JobCard
                          job={{ ...job, isSaved: true, hasApplied: isApplied }}
                          onSave={handleSaveToggle}
                          showAppliedBadge={isApplied}
                        />
                      </Grid>
                    );
                  })
                )}
              </>
            )}

            {/* Applied Jobs Tab Content */}
            {tabValue === 1 && (
              <>
                {(!appliedJobs || appliedJobs.length === 0) ? (
                  <Grid item xs={12}>
                    <MDBox
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                      alignItems="center"
                      minHeight="40vh"
                      textAlign="center"
                      p={3}
                      sx={{
                        bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                        borderRadius: '12px',
                        border: '1px dashed',
                        borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                      }}
                    >
                      <WorkIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary', opacity: 0.5 }} />
                      <MDTypography variant="h5" color="text" gutterBottom>
                        No applications yet
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        When you apply to jobs, track their status here.
                      </MDTypography>
                      <MDButton
                        variant="gradient"
                        color="info"
                        size="small"
                        sx={{ mt: 3 }}
                        onClick={() => navigate('/job-posts')}
                      >
                        Find Opportunities
                      </MDButton>
                    </MDBox>
                  </Grid>
                ) : (
                  appliedJobs.map((job) => (
                    <Grid item xs={12} md={6} lg={4} key={job._id}>
                      <JobCard
                        job={job}
                        onSave={handleSaveToggle}
                        showAppliedBadge={true} // Explicitly show the applied badge
                      />
                    </Grid>
                  ))
                )}
              </>
            )}

          </Grid>
        </Container>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default AppliedJobs;