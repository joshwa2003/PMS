import React, { useState, useEffect } from 'react';
import { Grid, Container, Box, Tabs, Tab, Avatar, Typography, Divider } from '@mui/material';
import { Work as WorkIcon, MoreVert as MoreVertIcon, BookmarkBorder as BookmarkIcon } from '@mui/icons-material';
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
          <MDBox 
            sx={{ 
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              borderRadius: '15px',
              boxShadow: '0 2px 12px 0 rgba(0,0,0,0.1)',
              overflow: 'hidden',
              mb: 3
            }}
          >
            <MDBox p={3}>
              <MDTypography variant="h4" fontWeight="bold" mb={2}>
                My Jobs
              </MDTypography>
              
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTabs-indicator': {
                    display: 'none',
                  },
                  '& .MuiTab-root': {
                    minWidth: 100,
                    borderRadius: '50px',
                    mx: 0.5,
                    color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                    '&.Mui-selected': {
                      color: tabValue === 0 ? '#000' : 
                             tabValue === 1 ? '#fff' : 
                             tabValue === 2 ? '#000' : 
                             tabValue === 3 ? '#000' : '#000',
                      backgroundColor: tabValue === 0 ? 'rgba(0,0,0,0.08)' : 
                                      tabValue === 1 ? '#2e7d32' : 
                                      tabValue === 2 ? 'rgba(0,0,0,0.08)' : 
                                      tabValue === 3 ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.08)',
                    },
                    '&:hover': {
                      backgroundColor: tabValue === 1 ? '#2e7d32' : 'rgba(0,0,0,0.04)',
                      opacity: 0.9
                    }
                  }
                }}
              >
                <Tab 
                  label="Saved" 
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 600,
                    fontSize: '16px',
                    border: '1px solid',
                    borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  }} 
                />
                <Tab 
                  label="Applied" 
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 600,
                    fontSize: '16px',
                    border: '1px solid',
                    borderColor: '#2e7d32',
                  }} 
                />
              </Tabs>
            </MDBox>

            {(tabValue === 0 && savedJobsError) || (tabValue === 1 && studentJobsError) && (
              <MDBox mb={3} p={3} bgcolor="error.main" borderRadius="lg">
                <MDTypography variant="body1" color="white">
                  {tabValue === 0 ? savedJobsError : studentJobsError}
                </MDTypography>
              </MDBox>
            )}

            {/* Saved Jobs Tab */}
            {tabValue === 0 && savedJobsLoading ? (
              <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
                <LoadingSpinner />
              </MDBox>
            ) : tabValue === 0 && (!savedJobs || savedJobs.length === 0) ? (
              <MDBox 
                display="flex" 
                flexDirection="column" 
                justifyContent="center" 
                alignItems="center" 
                minHeight="40vh"
                textAlign="center"
                p={3}
              >
                <BookmarkIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary', opacity: 0.5 }} />
                <MDTypography variant="h5" color="text.secondary">
                  You haven't saved any jobs yet
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary" mt={1}>
                  Save jobs you're interested in to view them later
                </MDTypography>
              </MDBox>
            ) : tabValue === 0 && (
              <MDBox>
                {savedJobs.map((job) => (
                  <Box 
                    key={job._id}
                    onClick={() => handleJobClick(job._id)}
                    sx={{
                      cursor: 'pointer',
                      borderBottom: '1px solid',
                      borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      },
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <MDBox p={3} display="flex" alignItems="flex-start">
                      <Avatar 
                        src={job.company?.logo} 
                        alt={job.company?.name}
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          mr: 2,
                          bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : '#f0f0f0',
                          border: '1px solid',
                          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                          fontSize: '24px',
                          fontWeight: 'bold',
                          color: darkMode ? 'white' : 'text.primary'
                        }}
                      >
                        {!job.company?.logo && (job.company?.name?.charAt(0) || 'C')}
                      </Avatar>
                      
                      <MDBox flex={1}>
                        <MDTypography variant="h6" fontWeight="bold">
                          {job.title}
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          {job.company?.name} in {job.location || 'Remote'}
                        </MDTypography>
                        <MDTypography variant="body2" color="text" mt={0.5}>
                          {job.location || 'Remote'} ({job.locationType || 'On-site'})
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary" mt={0.5}>
                          Saved {getPostedTime(job.savedAt || job.createdAt)}
                        </MDTypography>
                      </MDBox>
                      
                      <MoreVertIcon 
                        sx={{ 
                          color: 'text.secondary',
                          cursor: 'pointer',
                          '&:hover': {
                            color: 'primary.main'
                          }
                        }} 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add menu functionality here if needed
                        }}
                      />
                    </MDBox>
                  </Box>
                ))}
              </MDBox>
            )}

            {/* Applied Jobs Tab */}
            {tabValue === 1 && appliedJobs.length === 0 ? (
              <MDBox 
                display="flex" 
                flexDirection="column" 
                justifyContent="center" 
                alignItems="center" 
                minHeight="40vh"
                textAlign="center"
                p={3}
              >
                <WorkIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary', opacity: 0.5 }} />
                <MDTypography variant="h5" color="text.secondary">
                  You haven't applied to any jobs yet
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary" mt={1}>
                  When you apply for jobs, they will appear here for easy tracking
                </MDTypography>
              </MDBox>
            ) : tabValue === 1 && (
              <MDBox>
                {appliedJobs.map((job) => (
                  <Box 
                    key={job._id}
                    onClick={() => handleJobClick(job._id)}
                    sx={{
                      cursor: 'pointer',
                      borderBottom: '1px solid',
                      borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      },
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <MDBox p={3} display="flex" alignItems="flex-start">
                      <Avatar 
                        src={job.company?.logo} 
                        alt={job.company?.name}
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          mr: 2,
                          bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : '#f0f0f0',
                          border: '1px solid',
                          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                          fontSize: '24px',
                          fontWeight: 'bold',
                          color: darkMode ? 'white' : 'text.primary'
                        }}
                      >
                        {!job.company?.logo && (job.company?.name?.charAt(0) || 'C')}
                      </Avatar>
                      
                      <MDBox flex={1}>
                        <MDTypography variant="h6" fontWeight="bold">
                          {job.title}
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          {job.company?.name} in {job.location || 'Remote'}
                        </MDTypography>
                        <MDTypography variant="body2" color="text" mt={0.5}>
                          {job.location || 'Remote'} ({job.locationType || 'On-site'})
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary" mt={0.5}>
                          Applied {getPostedTime(job.appliedAt || job.createdAt)}
                        </MDTypography>
                      </MDBox>
                      
                      <MoreVertIcon 
                        sx={{ 
                          color: 'text.secondary',
                          cursor: 'pointer',
                          '&:hover': {
                            color: 'primary.main'
                          }
                        }} 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add menu functionality here if needed
                        }}
                      />
                    </MDBox>
                  </Box>
                ))}
              </MDBox>
            )}
          </MDBox>
        </Container>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default AppliedJobs;