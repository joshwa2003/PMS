import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Modal,
  IconButton
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  OpenInNew as OpenIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Language as WebsiteIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as AttachMoneyIcon,
  AttachMoney as SalaryIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDBadge from 'components/MDBadge';

// Material Dashboard 2 React examples
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';

// Material Dashboard 2 React contexts
import { useMaterialUIController } from 'context';

// Auth and Application contexts - Fixed import paths
import { useAuth } from '../context/AuthContext';
import { useApplicationResponse } from '../context/ApplicationResponseContext';

// Services
import { getPublicJobById, recordJobView } from 'services/jobService';
import { formatSalary, getDaysUntilDeadline } from 'services/jobService';


const JobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const { isStudent } = useAuth();

  const { checkIfApplied, pendingResponse } = useApplicationResponse();
  const [isApplied, setIsApplied] = useState(false);
  
  // Document viewer state
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [documentZoom, setDocumentZoom] = useState(1);

  useEffect(() => {
    if (!jobId) return;
    
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getPublicJobById(jobId);
        
        if (response.success) {
          setJob(response.data.job);
          
          // Record job view (only counted for students on first view) - with error prevention
          if (response.data.job._id && !sessionStorage.getItem(`job-view-${response.data.job._id}`)) {
            try {
              console.log('📊 Attempting to record job view for job:', response.data.job._id);
              const viewResponse = await recordJobView(response.data.job._id, {
                viewType: 'Detail View',
                duration: 0,
                context: {
                  source: 'job-detail-page',
                  timestamp: new Date().toISOString()
                }
              });
              console.log('✅ Job view recorded successfully:', viewResponse);
              // Mark as recorded to prevent retries
              sessionStorage.setItem(`job-view-${response.data.job._id}`, 'recorded');
            } catch (viewErr) {
              console.warn('⚠️ Job view recording failed (non-critical):', viewErr.message);
              // Mark as attempted to prevent infinite retries
              sessionStorage.setItem(`job-view-${response.data.job._id}`, 'failed');
              // Don't block the page if view recording fails
            }
          }
          
          // Check if user has already applied for this job
          if (response.data.job._id) {
            try {
              const applied = await checkIfApplied(response.data.job._id);
              setIsApplied(applied);
            } catch (appliedErr) {
              console.warn('⚠️ Could not check applied status (non-critical):', appliedErr.message);
              setIsApplied(false); // Default to not applied if check fails
            }
          }
        } else {
          setError(response.message || 'Failed to fetch job details');
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError(err.message || 'Failed to fetch job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]); // Only depend on jobId to prevent unnecessary re-renders

  // Separate useEffect for checking applied status when pendingResponse changes
  useEffect(() => {
    if (jobId && pendingResponse) {
      const refreshAppliedStatus = async () => {
        try {
          const applied = await checkIfApplied(jobId);
          setIsApplied(applied);
        } catch (err) {
          console.warn('⚠️ Failed to refresh applied status (non-critical):', err.message);
          // Don't change isApplied state if refresh fails
        }
      };
      refreshAppliedStatus();
    }
  }, [pendingResponse, jobId, checkIfApplied]);

  const { recordApplyClick } = useApplicationResponse();

  const handleApply = () => {
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

  const handleBack = () => {
    navigate(-1);
  };

  // Document viewer functions
  const handleOpenDocumentViewer = () => {
    setDocumentViewerOpen(true);
    setDocumentZoom(1); // Reset zoom when opening
  };

  const handleCloseDocumentViewer = () => {
    setDocumentViewerOpen(false);
    setDocumentZoom(1);
  };

  const handleZoomIn = () => {
    setDocumentZoom(prev => Math.min(prev + 0.25, 3)); // Max zoom 3x
  };

  const handleZoomOut = () => {
    setDocumentZoom(prev => Math.max(prev - 0.25, 0.5)); // Min zoom 0.5x
  };

  const handleResetZoom = () => {
    setDocumentZoom(1);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar 
          customTitle="Loading..."
          customRoute={['job-detail']}
        />
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </MDBox>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar 
          customTitle="Error"
          customRoute={['job-detail']}
        />
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mt: 4, borderRadius: 2 }}>
            {error}
          </Alert>
          <MDButton
            variant="outlined"
            color="primary"
            onClick={handleBack}
            startIcon={<BackIcon />}
            sx={{ mt: 2 }}
          >
            Go Back
          </MDButton>
        </Container>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <DashboardNavbar 
          customTitle="Job Not Found"
          customRoute={['job-detail']}
        />
        <Container maxWidth="lg">
          <Alert severity="warning" sx={{ mt: 4, borderRadius: 2 }}>
            Job not found
          </Alert>
          <MDButton
            variant="outlined"
            color="primary"
            onClick={handleBack}
            startIcon={<BackIcon />}
            sx={{ mt: 2 }}
          >
            Go Back
          </MDButton>
        </Container>
      </DashboardLayout>
    );
  }

  const daysLeft = getDaysUntilDeadline(job.deadline);
  const isUrgent = daysLeft <= 7;
  const companyLogo = job.company?.logo || null;

  // Get job type color
  const getJobTypeColor = (type) => {
    switch (type) {
      case 'Full-time': return 'success';
      case 'Part-time': return 'info';
      case 'Internship': return 'warning';
      case 'Contract': return 'secondary';
      default: return 'primary';
    }
  };

  // Create custom breadcrumb data
  const customTitle = job ? job.title : 'Loading...';
  const customRoute = ['job-detail'];

  return (
    <DashboardLayout>
      <DashboardNavbar 
        customTitle={customTitle}
        customRoute={customRoute}
      />
      
      <MDBox py={3} pb={{ xs: 10, lg: 3 }}>
        <Container maxWidth="lg">
          {/* Header Section */}
          <MDBox mb={4}>
            <MDButton
              variant="outlined"
              onClick={handleBack}
              startIcon={<BackIcon />}
              sx={{ 
                mb: 3,
                borderRadius: '8px',
                borderColor: darkMode ? '#444' : '#ddd',
                color: darkMode ? '#fff' : '#666',
                '&:hover': {
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  bgcolor: darkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              Back to Jobs
            </MDButton>
            
            <MDBox 
              p={3} 
              borderRadius="12px"
              sx={{ 
                backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
                border: '1px solid',
                borderColor: darkMode ? '#333' : '#e5e5e5',
                boxShadow: 'none'
              }}
            >
              <MDBox display="flex" alignItems="flex-start" gap={3} mb={3}>
                {/* Company Logo */}
                {companyLogo ? (
                  <Avatar 
                    src={companyLogo} 
                    alt={job.company.name}
                    sx={{ 
                      width: 72, 
                      height: 72, 
                      border: '1px solid',
                      borderColor: darkMode ? '#333' : '#e0e0e0',
                      bgcolor: darkMode ? '#2a2a2a' : '#fafafa'
                    }}
                  />
                ) : (
                  <Avatar sx={{ 
                    width: 72, 
                    height: 72, 
                    bgcolor: darkMode ? '#2a2a2a' : '#f5f5f5',
                    color: darkMode ? '#999' : '#666',
                    border: '1px solid',
                    borderColor: darkMode ? '#333' : '#e0e0e0'
                  }}>
                    <BusinessIcon sx={{ fontSize: 36 }} />
                  </Avatar>
                )}
                
                {/* Job Title and Company */}
                <MDBox flex={1}>
                  <MDTypography 
                    variant="h4" 
                    fontWeight="bold" 
                    color={darkMode ? "white" : "dark"}
                    sx={{ 
                      mb: 1,
                      color: darkMode ? '#fff !important' : 'inherit'
                    }}
                  >
                    {job.title}
                  </MDTypography>
                  
                  <MDBox display="flex" alignItems="center" gap={2} mb={2}>
                    <MDTypography 
                      variant="h6" 
                      fontWeight="medium"
                      sx={{ 
                        color: darkMode ? '#e0e0e0 !important' : '#666'
                      }}
                    >
                      {job.company.name}
                    </MDTypography>
                    {job.company.website && (
                      <IconButton 
                        size="small" 
                        onClick={() => window.open(job.company.website, '_blank')}
                        sx={{ 
                          color: darkMode ? '#bbb' : '#666',
                          '&:hover': { color: '#1976d2' }
                        }}
                      >
                        <WebsiteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </MDBox>
                  
                  <MDBox display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                    <Chip 
                      label={job.jobType}
                      size="small"
                      sx={{
                        bgcolor: darkMode ? '#2a2a2a' : '#f0f0f0',
                        color: darkMode ? '#fff !important' : '#666',
                        border: '1px solid',
                        borderColor: darkMode ? '#444' : '#ddd',
                        fontSize: '12px',
                        height: 24
                      }}
                    />
                    {isUrgent && (
                      <Chip 
                        label={`${daysLeft} days left`}
                        size="small"
                        sx={{
                          bgcolor: '#fff8e1',
                          color: '#f57c00',
                          border: '1px solid #ffcc02',
                          fontSize: '11px',
                          height: 24,
                          fontWeight: 500
                        }}
                      />
                    )}
                  </MDBox>
                </MDBox>
                
                {/* Apply Button - Show only for students who haven't applied */}
                {isStudent() && !isApplied && (
                  <MDButton
                    variant="contained"
                    onClick={handleApply}
                    startIcon={<OpenIcon />}
                    sx={{ 
                      minWidth: 140, 
                      height: 44,
                      bgcolor: '#1976d2',
                      color: '#ffffff !important',
                      borderRadius: '8px',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#1565c0',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    Apply Now
                  </MDButton>
                )}
              </MDBox>

              {/* Quick Info Grid */}
              <MDBox 
                sx={{
                  bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  borderRadius: '8px',
                  p: 2.5,
                  border: '1px solid',
                  borderColor: darkMode ? '#333' : '#f0f0f0',
                  mb: 3
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <MDBox display="flex" alignItems="center" gap={2}>
                      <LocationIcon sx={{ color: darkMode ? '#bbb' : '#666', fontSize: 20 }} />
                      <MDBox>
                        <MDTypography 
                          variant="caption" 
                          display="block"
                          sx={{ 
                            color: darkMode ? '#aaa !important' : '#888',
                            fontSize: '11px',
                            fontWeight: 500
                          }}
                        >
                          Location
                        </MDTypography>
                        <MDTypography 
                          variant="body1" 
                          fontWeight="medium" 
                          sx={{ 
                            color: darkMode ? '#fff !important' : '#333',
                            fontSize: '14px'
                          }}
                        >
                          {job.location}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <MDBox display="flex" alignItems="center" gap={2}>
                      <WorkIcon sx={{ color: darkMode ? '#bbb' : '#666', fontSize: 20 }} />
                      <MDBox>
                        <MDTypography 
                          variant="caption" 
                          display="block"
                          sx={{ 
                            color: darkMode ? '#aaa !important' : '#888',
                            fontSize: '11px',
                            fontWeight: 500
                          }}
                        >
                          Work Mode
                        </MDTypography>
                        <MDTypography 
                          variant="body1" 
                          fontWeight="medium" 
                          sx={{ 
                            color: darkMode ? '#fff !important' : '#333',
                            fontSize: '14px'
                          }}
                        >
                          {job.workMode || 'Work from office'}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <MDBox display="flex" alignItems="center" gap={2}>
                      <PeopleIcon sx={{ color: darkMode ? '#bbb' : '#666', fontSize: 20 }} />
                      <MDBox>
                        <MDTypography 
                          variant="caption" 
                          display="block"
                          sx={{ 
                            color: darkMode ? '#aaa !important' : '#888',
                            fontSize: '11px',
                            fontWeight: 500
                          }}
                        >
                          Openings
                        </MDTypography>
                        <MDTypography 
                          variant="body1" 
                          fontWeight="medium" 
                          sx={{ 
                            color: darkMode ? '#fff !important' : '#333',
                            fontSize: '14px'
                          }}
                        >
                          {job.numberOfOpenings || 1} position{(job.numberOfOpenings || 1) > 1 ? 's' : ''}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <MDBox display="flex" alignItems="center" gap={2}>
                      <CalendarIcon sx={{ color: darkMode ? '#bbb' : '#666', fontSize: 20 }} />
                      <MDBox>
                        <MDTypography 
                          variant="caption" 
                          display="block"
                          sx={{ 
                            color: darkMode ? '#aaa !important' : '#888',
                            fontSize: '11px',
                            fontWeight: 500
                          }}
                        >
                          Start Date
                        </MDTypography>
                        <MDTypography 
                          variant="body1" 
                          fontWeight="medium" 
                          sx={{ 
                            color: darkMode ? '#fff !important' : '#333',
                            fontSize: '14px'
                          }}
                        >
                          {job.startDate || 'Immediately'}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </Grid>
                </Grid>
              </MDBox>

              {/* Salary Information */}
              {(job.salary?.min || job.salary?.max || job.stipend?.amount) && (
                <MDBox 
                  sx={{
                    bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    borderRadius: '8px',
                    p: 2.5,
                    border: '1px solid',
                    borderColor: darkMode ? '#333' : '#f0f0f0',
                    mb: 3
                  }}
                >
                  <MDBox display="flex" alignItems="center" gap={2} mb={1.5}>
                    <SalaryIcon sx={{ color: darkMode ? '#bbb' : '#666', fontSize: 20 }} />
                    <MDTypography 
                      variant="h6" 
                      fontWeight="medium" 
                      sx={{ 
                        color: darkMode ? '#fff !important' : '#333'
                      }}
                    >
                      Compensation
                    </MDTypography>
                  </MDBox>
                  <MDTypography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{ 
                      color: darkMode ? '#4caf50 !important' : '#2e7d32',
                      fontSize: '20px'
                    }}
                  >
                    {job.salary?.min || job.salary?.max ? 
                      formatSalary(job.salary) : 
                      `₹${job.stipend.amount} ${job.stipend.period || 'Monthly'}`
                    }
                  </MDTypography>
                </MDBox>
              )}

              {/* Application Deadline */}
              <MDBox 
                sx={{
                  bgcolor: isUrgent ? '#fff8e1' : (darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
                  borderRadius: '8px',
                  p: 2.5,
                  border: '1px solid',
                  borderColor: isUrgent ? '#ffcc02' : (darkMode ? '#333' : '#f0f0f0'),
                }}
              >
                <MDBox display="flex" alignItems="center" gap={2} flexWrap="wrap">
                  <TimeIcon sx={{ 
                    color: isUrgent ? '#f57c00' : (darkMode ? '#bbb' : '#666'), 
                    fontSize: 20 
                  }} />
                  <MDTypography 
                    variant="body1" 
                    fontWeight="medium" 
                    sx={{ 
                      color: isUrgent ? '#f57c00' : (darkMode ? '#fff !important' : '#333'),
                      fontSize: '14px'
                    }}
                  >
                    Application Deadline: {new Date(job.deadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </MDTypography>
                  <Chip 
                    label={`${daysLeft} days left`}
                    size="small"
                    sx={{
                      bgcolor: isUrgent ? '#f57c00' : (darkMode ? '#2a2a2a' : '#f0f0f0'),
                      color: isUrgent ? '#fff' : (darkMode ? '#fff !important' : '#666'),
                      fontSize: '11px',
                      height: 22,
                      fontWeight: 500
                    }}
                  />
                </MDBox>
              </MDBox>
            </MDBox>
          </MDBox>

          {/* Main Content */}
          <Grid container spacing={3}>
            {/* Left Column - Job Details */}
            <Grid item xs={12} lg={8}>
              {/* Job Description */}
              <MDBox 
                p={3} 
                borderRadius="12px"
                sx={{ 
                  backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
                  border: '1px solid',
                  borderColor: darkMode ? '#333' : '#e5e5e5',
                  boxShadow: 'none'
                }}
                mb={3}
              >
                <MDTypography 
                  variant="h5" 
                  fontWeight="bold" 
                  sx={{ 
                    mb: 2.5,
                    color: darkMode ? '#fff !important' : '#333'
                  }}
                >
                  Job Description
                </MDTypography>
                <MDTypography 
                  variant="body1" 
                  sx={{ 
                    lineHeight: 1.7, 
                    fontSize: '15px',
                    color: darkMode ? '#e0e0e0 !important' : '#555'
                  }}
                >
                  {job.description}
                </MDTypography>
              </MDBox>

              {/* Key Responsibilities */}
              {job.keyResponsibilities && job.keyResponsibilities.length > 0 && (
                <MDBox 
                  p={3} 
                  borderRadius="12px"
                  sx={{ 
                    backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
                    border: '1px solid',
                    borderColor: darkMode ? '#333' : '#e5e5e5',
                    boxShadow: 'none'
                  }}
                  mb={3}
                >
                  <MDTypography 
                    variant="h5" 
                    fontWeight="bold" 
                    sx={{ 
                      mb: 2.5,
                      color: darkMode ? '#fff !important' : '#333'
                    }}
                  >
                    Key Responsibilities
                  </MDTypography>
                  <List sx={{ p: 0 }}>
                    {job.keyResponsibilities.map((responsibility, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon sx={{ 
                            color: darkMode ? '#4caf50' : '#2e7d32', 
                            fontSize: 20 
                          }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <MDTypography 
                              variant="body1" 
                              sx={{ 
                                fontSize: '15px',
                                lineHeight: 1.6,
                                color: darkMode ? '#e0e0e0 !important' : '#555'
                              }}
                            >
                              {responsibility}
                            </MDTypography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </MDBox>
              )}

              {/* Documents and Google Drive Link Preview */}
              {(job.documents && job.documents.length > 0) || job.googleDriveLink ? (
                <MDBox
                  p={3}
                  borderRadius="12px"
                  sx={{
                    backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
                    border: '1px solid',
                    borderColor: darkMode ? '#333' : '#e5e5e5',
                    boxShadow: 'none',
                    mb: 3
                  }}
                >
                  <MDTypography 
                    variant="h5" 
                    fontWeight="bold" 
                    sx={{ 
                      mb: 2.5,
                      color: darkMode ? '#fff !important' : '#333'
                    }}
                  >
                    Documents & Links
                  </MDTypography>
                  
                  {/* Uploaded Documents */}
                  {job.documents && job.documents.length > 0 && (
                    <MDBox mb={3}>
                      <MDTypography variant="h6" fontWeight="medium" color={darkMode ? "white" : "dark"} mb={2}>
                        Uploaded Documents
                      </MDTypography>
                      <List>
                        {job.documents.map((doc, index) => (
                          <ListItem key={index} sx={{ px: 0, py: 1 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <AttachMoneyIcon sx={{ color: 'info.main', fontSize: 24 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <MDTypography
                                  variant="body1"
                                  color={darkMode ? "white" : "text"}
                                  sx={{ fontSize: '16px' }}
                                >
                                  <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                                    {doc.name}
                                  </a>
                                </MDTypography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </MDBox>
                  )}
                  
                  {/* Google Drive Link with Preview */}
                  {job.googleDriveLink && (
                    <MDBox>
                      <MDTypography 
                        variant="body1" 
                        fontWeight="medium" 
                        sx={{ 
                          mb: 2,
                          color: darkMode ? '#fff !important' : '#333'
                        }}
                      >
                        📄 Additional Documents
                      </MDTypography>
                      
                      {/* Document Preview Card */}
                      <MDBox 
                        sx={{
                          border: '1px solid',
                          borderColor: darkMode ? '#333' : '#e0e0e0',
                          borderRadius: '8px',
                          bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Preview Image */}
                        <MDBox 
                          onClick={handleOpenDocumentViewer}
                          sx={{
                            width: '100%',
                            height: 200,
                            bgcolor: darkMode ? '#2a2a2a' : '#f8f9fa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderBottom: '1px solid',
                            borderColor: darkMode ? '#333' : '#e0e0e0',
                            backgroundImage: `url(https://drive.google.com/thumbnail?id=${job.googleDriveLink.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] || ''}&sz=w400)`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            position: 'relative',
                            cursor: 'pointer',
                            '&:hover': {
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                bgcolor: 'rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }
                            }
                          }}
                        >
                          {/* Fallback content when image doesn't load */}
                          <MDBox 
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 1,
                              color: darkMode ? '#bbb' : '#666',
                              textAlign: 'center'
                            }}
                          >
                            <MDTypography sx={{ fontSize: '48px' }}>📄</MDTypography>
                            <MDTypography 
                              variant="body2" 
                              sx={{ 
                                color: darkMode ? '#bbb !important' : '#666',
                                fontSize: '14px'
                              }}
                            >
                              Document Preview
                            </MDTypography>
                          </MDBox>
                          
                          {/* File type badge */}
                          <MDBox 
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(0,0,0,0.7)',
                              color: '#fff',
                              px: 1,
                              py: 0.5,
                              borderRadius: '4px',
                              fontSize: '11px'
                            }}
                          >
                            PDF
                          </MDBox>
                          
                          {/* Fullscreen icon overlay */}
                          <MDBox 
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              bgcolor: 'rgba(0,0,0,0.7)',
                              color: '#fff',
                              p: 0.5,
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <FullscreenIcon sx={{ fontSize: '16px' }} />
                          </MDBox>
                        </MDBox>
                        
                        {/* Document Info */}
                        <MDBox 
                          sx={{
                            p: 2.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                          }}
                        >
                          <MDBox 
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '8px',
                              bgcolor: darkMode ? '#2a2a2a' : '#f5f5f5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid',
                              borderColor: darkMode ? '#444' : '#ddd'
                            }}
                          >
                            <MDTypography 
                              sx={{ 
                                fontSize: '18px',
                                color: darkMode ? '#bbb' : '#666'
                              }}
                            >
                              📎
                            </MDTypography>
                          </MDBox>
                          
                          <MDBox flex={1}>
                            <MDTypography 
                              variant="body1" 
                              fontWeight="medium"
                              sx={{ 
                                color: darkMode ? '#fff !important' : '#333',
                                mb: 0.5
                              }}
                            >
                              Job Related Document
                            </MDTypography>
                            <MDTypography 
                              variant="body2" 
                              sx={{ 
                                color: darkMode ? '#bbb !important' : '#666',
                                fontSize: '13px'
                              }}
                            >
                              Additional information and requirements
                            </MDTypography>
                          </MDBox>
                          
                          <MDButton
                            variant="contained"
                            onClick={() => window.open(job.googleDriveLink, '_blank')}
                            sx={{
                              fontSize: '13px',
                              textTransform: 'none',
                              bgcolor: '#1976d2',
                              color: '#ffffff !important',
                              borderRadius: '6px',
                              boxShadow: 'none',
                              px: 2,
                              py: 1,
                              '&:hover': {
                                bgcolor: '#1565c0',
                                boxShadow: 'none'
                              }
                            }}
                          >
                            View Document
                          </MDButton>
                        </MDBox>
                      </MDBox>
                    </MDBox>
                  )}
                </MDBox>
              ) : null}

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <MDBox 
                  p={3} 
                  borderRadius="12px"
                  sx={{ 
                    backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
                    border: '1px solid',
                    borderColor: darkMode ? '#333' : '#e5e5e5',
                    boxShadow: 'none'
                  }}
                  mb={3}
                >
                  <MDTypography 
                    variant="h5" 
                    fontWeight="bold" 
                    sx={{ 
                      mb: 2.5,
                      color: darkMode ? '#fff !important' : '#333'
                    }}
                  >
                    Requirements
                  </MDTypography>
                  <List sx={{ p: 0 }}>
                    {job.requirements.map((requirement, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <StarIcon sx={{ 
                            color: darkMode ? '#ffa726' : '#f57c00', 
                            fontSize: 20 
                          }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <MDTypography 
                              variant="body1" 
                              sx={{ 
                                fontSize: '15px',
                                lineHeight: 1.6,
                                color: darkMode ? '#e0e0e0 !important' : '#555'
                              }}
                            >
                              {requirement}
                            </MDTypography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </MDBox>
              )}

              {/* Skills Required */}
              {job.skillsRequired && job.skillsRequired.length > 0 && (
                <MDBox 
                  p={3} 
                  borderRadius="12px"
                  sx={{ 
                    backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
                    border: '1px solid',
                    borderColor: darkMode ? '#333' : '#e5e5e5',
                    boxShadow: 'none'
                  }}
                  mb={3}
                >
                  <MDTypography 
                    variant="h5" 
                    fontWeight="bold" 
                    sx={{ 
                      mb: 2.5,
                      color: darkMode ? '#fff !important' : '#333'
                    }}
                  >
                    Skills Required
                  </MDTypography>
                  <MDBox display="flex" flexWrap="wrap" gap={1.5}>
                    {job.skillsRequired.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                        sx={{ 
                          bgcolor: darkMode ? '#2a2a2a' : '#f8f9fa',
                          color: darkMode ? '#fff !important' : '#666',
                          border: '1px solid',
                          borderColor: darkMode ? '#444' : '#e0e0e0',
                          fontSize: '13px',
                          height: 28,
                          '&:hover': {
                            bgcolor: darkMode ? '#333' : '#e3f2fd',
                            borderColor: '#1976d2',
                            color: '#1976d2 !important'
                          }
                        }}
                      />
                    ))}
                  </MDBox>
                </MDBox>
              )}

              {/* Education Qualifications */}
              {job.educationQualifications && job.educationQualifications.length > 0 && (
                <MDBox 
                  p={3} 
                  borderRadius="12px"
                  sx={{ 
                    backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
                    border: '1px solid',
                    borderColor: darkMode ? '#333' : '#e5e5e5',
                    boxShadow: 'none'
                  }}
                  mb={3}
                >
                  <MDBox display="flex" alignItems="center" gap={2} mb={2.5}>
                    <SchoolIcon sx={{ color: darkMode ? '#bbb' : '#666', fontSize: 24 }} />
                    <MDTypography 
                      variant="h5" 
                      fontWeight="bold" 
                      sx={{ 
                        color: darkMode ? '#fff !important' : '#333'
                      }}
                    >
                      Education Qualifications
                    </MDTypography>
                  </MDBox>
                  <List sx={{ p: 0 }}>
                    {job.educationQualifications.map((qualification, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon sx={{ 
                            color: darkMode ? '#4caf50' : '#2e7d32', 
                            fontSize: 20 
                          }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <MDTypography 
                              variant="body1" 
                              sx={{ 
                                fontSize: '15px',
                                lineHeight: 1.6,
                                color: darkMode ? '#e0e0e0 !important' : '#555'
                              }}
                            >
                              {qualification}
                            </MDTypography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </MDBox>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <MDBox 
                  p={3} 
                  borderRadius="12px"
                  sx={{ 
                    backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
                    border: '1px solid',
                    borderColor: darkMode ? '#333' : '#e5e5e5',
                    boxShadow: 'none'
                  }}
                  mb={3}
                >
                  <MDTypography 
                    variant="h5" 
                    fontWeight="bold" 
                    sx={{ 
                      mb: 2.5,
                      color: darkMode ? '#fff !important' : '#333'
                    }}
                  >
                    Benefits & Perks
                  </MDTypography>
                  <MDBox display="flex" flexWrap="wrap" gap={1.5}>
                    {job.benefits.map((benefit, index) => (
                      <Chip
                        key={index}
                        label={benefit}
                        size="small"
                        sx={{ 
                          bgcolor: darkMode ? '#2a4d3a' : '#e8f5e8',
                          color: darkMode ? '#4caf50' : '#2e7d32',
                          border: '1px solid',
                          borderColor: darkMode ? '#4caf50' : '#c8e6c9',
                          fontSize: '12px',
                          height: 26,
                          fontWeight: 500
                        }}
                      />
                    ))}
                  </MDBox>
                </MDBox>
              )}
            </Grid>

            {/* Right Column - Company Information */}
            <Grid item xs={12} lg={4}>
              {job.company && (
                <MDBox 
                  p={3} 
                  borderRadius="12px"
                  sx={{ 
                    backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
                    border: '1px solid',
                    borderColor: darkMode ? '#333' : '#e5e5e5',
                    boxShadow: 'none',
                    position: { lg: 'sticky' },
                    top: { lg: 24 },
                  }}
                >
                  <MDTypography 
                    variant="h5" 
                    fontWeight="bold" 
                    sx={{ 
                      mb: 2.5,
                      color: darkMode ? '#fff !important' : '#333'
                    }}
                  >
                    About {job.company.name}
                  </MDTypography>
                  
                  {job.company.about && (
                    <MDTypography 
                      variant="body1" 
                      sx={{ 
                        mb: 3, 
                        lineHeight: 1.6, 
                        fontSize: '14px',
                        color: darkMode ? '#e0e0e0 !important' : '#555'
                      }}
                    >
                      {job.company.about}
                    </MDTypography>
                  )}
                  <MDBox 
                    sx={{
                      bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      borderRadius: '8px',
                      p: 2.5,
                      border: '1px solid',
                      borderColor: darkMode ? '#333' : '#f0f0f0',
                      mb: 3
                    }}
                  >  
                  <Grid container spacing={2}>
                      {job.company.industry && (
                        <Grid item xs={12}>
                          <MDTypography 
                            variant="caption" 
                            display="block"
                            sx={{ 
                              color: darkMode ? '#aaa !important' : '#888',
                              fontSize: '11px',
                              fontWeight: 500,
                              mb: 0.5
                            }}
                          >
                            Industry
                          </MDTypography>
                          <MDTypography 
                            variant="body2" 
                            fontWeight="medium" 
                            sx={{ 
                              color: darkMode ? '#fff !important' : '#333',
                              fontSize: '13px'
                            }}
                          >
                            {job.company.industry}
                          </MDTypography>
                        </Grid>
                      )}
                    
                      {job.company.size && (
                        <Grid item xs={12}>
                          <MDTypography 
                            variant="caption" 
                            display="block"
                            sx={{ 
                              color: darkMode ? '#aaa !important' : '#888',
                              fontSize: '11px',
                              fontWeight: 500,
                              mb: 0.5
                            }}
                          >
                            Company Size
                          </MDTypography>
                          <MDTypography 
                            variant="body2" 
                            fontWeight="medium" 
                            sx={{ 
                              color: darkMode ? '#fff !important' : '#333',
                              fontSize: '13px'
                            }}
                          >
                            {job.company.size} employees
                          </MDTypography>
                        </Grid>
                      )}
                      
                      {job.company.founded && (
                        <Grid item xs={12}>
                          <MDTypography 
                            variant="caption" 
                            display="block"
                            sx={{ 
                              color: darkMode ? '#aaa !important' : '#888',
                              fontSize: '11px',
                              fontWeight: 500,
                              mb: 0.5
                            }}
                          >
                            Founded
                          </MDTypography>
                          <MDTypography 
                            variant="body2" 
                            fontWeight="medium" 
                            sx={{ 
                              color: darkMode ? '#fff !important' : '#333',
                              fontSize: '13px'
                            }}
                          >
                            {job.company.founded}
                          </MDTypography>
                        </Grid>
                      )}
                      
                      {job.company.website && (
                        <Grid item xs={12}>
                          <MDTypography 
                            variant="caption" 
                            display="block"
                            sx={{ 
                              color: darkMode ? '#aaa !important' : '#888',
                              fontSize: '11px',
                              fontWeight: 500,
                              mb: 0.5
                            }}
                          >
                            Website
                          </MDTypography>
                          <MDButton
                            variant="text"
                            onClick={() => window.open(job.company.website, '_blank')}
                            startIcon={<WebsiteIcon fontSize="small" />}
                            sx={{ 
                              p: 0, 
                              textTransform: 'none',
                              fontSize: '13px',
                              color: darkMode ? '#1976d2 !important' : '#1976d2',
                              '&:hover': {
                                bgcolor: 'transparent',
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            Visit Website
                          </MDButton>
                        </Grid>
                      )}
                    </Grid>
                  </MDBox>
                </MDBox>
              )}
            </Grid>
          </Grid>

          {/* Bottom Apply Button for mobile */}
          {isStudent() && !isApplied && (
            <MDBox 
              position="fixed" 
              bottom={0} 
              left={0} 
              right={0} 
              p={2} 
              sx={{ 
                backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
                borderTop: '1px solid',
                borderColor: darkMode ? '#333' : '#e5e5e5',
                display: { xs: 'flex', lg: 'none' },
                justifyContent: 'center',
                zIndex: 1000,
                boxShadow: 'none'
              }}
            >
              <MDButton
                variant="contained"
                onClick={handleApply}
                startIcon={<OpenIcon />}
                fullWidth
                sx={{ 
                  maxWidth: 400,
                  height: 48,
                  bgcolor: '#1976d2',
                  color: '#ffffff !important',
                  borderRadius: '8px',
                  boxShadow: 'none',
                  fontSize: '16px',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#1565c0',
                    boxShadow: 'none'
                  }
                }}
              >
                Apply Now
              </MDButton>
            </MDBox>
          )}
        </Container>
      </MDBox>

      <Footer />
      
      {/* Document Viewer Modal */}
      {job?.googleDriveLink && (
        <Modal
          open={documentViewerOpen}
          onClose={handleCloseDocumentViewer}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
        >
          <MDBox
            sx={{
              width: '90vw',
              height: '90vh',
              bgcolor: darkMode ? '#1a1a1a' : '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid',
              borderColor: darkMode ? '#333' : '#e0e0e0',
              boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Header with controls */}
            <MDBox
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: '1px solid',
                borderColor: darkMode ? '#333' : '#e0e0e0',
                bgcolor: darkMode ? '#2a2a2a' : '#f8f9fa'
              }}
            >
              <MDTypography
                variant="h6"
                fontWeight="medium"
                sx={{ color: darkMode ? '#fff !important' : '#333' }}
              >
                Document Viewer
              </MDTypography>
              
              <MDBox sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Zoom controls */}
                <IconButton
                  onClick={handleZoomOut}
                  disabled={documentZoom <= 0.5}
                  sx={{
                    color: darkMode ? '#fff' : '#333',
                    '&:disabled': { color: darkMode ? '#666' : '#ccc' }
                  }}
                >
                  <ZoomOutIcon />
                </IconButton>
                
                <MDTypography
                  variant="body2"
                  sx={{
                    color: darkMode ? '#bbb !important' : '#666',
                    minWidth: '60px',
                    textAlign: 'center'
                  }}
                >
                  {Math.round(documentZoom * 100)}%
                </MDTypography>
                
                <IconButton
                  onClick={handleZoomIn}
                  disabled={documentZoom >= 3}
                  sx={{
                    color: darkMode ? '#fff' : '#333',
                    '&:disabled': { color: darkMode ? '#666' : '#ccc' }
                  }}
                >
                  <ZoomInIcon />
                </IconButton>
                
                <MDButton
                  variant="outlined"
                  onClick={handleResetZoom}
                  sx={{
                    fontSize: '12px',
                    textTransform: 'none',
                    borderColor: darkMode ? '#444' : '#ddd',
                    color: darkMode ? '#fff !important' : '#333',
                    ml: 1
                  }}
                >
                  Reset
                </MDButton>
                
                <IconButton
                  onClick={handleCloseDocumentViewer}
                  sx={{ color: darkMode ? '#fff' : '#333', ml: 1 }}
                >
                  <CloseIcon />
                </IconButton>
              </MDBox>
            </MDBox>
            
            {/* Document content */}
            <MDBox
              sx={{
                height: 'calc(100% - 73px)',
                overflow: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: darkMode ? '#1a1a1a' : '#f5f5f5'
              }}
            >
              <MDBox
                sx={{
                  transform: `scale(${documentZoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              >
                <iframe
                  src={`https://drive.google.com/file/d/${job.googleDriveLink.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] || ''}/preview`}
                  width="800"
                  height="600"
                  style={{
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff'
                  }}
                  title="Document Preview"
                />
              </MDBox>
            </MDBox>
          </MDBox>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default JobDetailPage;
