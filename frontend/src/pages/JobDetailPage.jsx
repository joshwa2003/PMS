import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApplicationResponse } from 'context/ApplicationResponseContext';
import {
  Container,
  Grid,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert
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
  AttachMoney as SalaryIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDBadge from 'components/MDBadge';
import GoogleDrivePreview from 'components/GoogleDrivePreview';

// Material Dashboard 2 React examples
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';

// Material Dashboard 2 React contexts
import { useMaterialUIController } from 'context';

// Services
import { getPublicJobById } from 'services/jobService';
import { formatSalary, getDaysUntilDeadline } from 'services/jobService';


const JobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const { hasApplied, checkIfApplied } = useApplicationResponse();
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getPublicJobById(jobId);
        
        if (response.success) {
          setJob(response.data.job);
          
          // Check if user has already applied for this job
          if (response.data.job._id) {
            const applied = await checkIfApplied(response.data.job._id);
            setIsApplied(applied);
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

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId, checkIfApplied, hasApplied]);

  const { recordApplyClick } = useApplicationResponse();

  const handleApply = async () => {
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

  const handleBack = () => {
    navigate(-1);
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
      
      <MDBox py={3}>
        <Container maxWidth="lg">
          {/* Header Section */}
          <MDBox mb={4}>
            <MDButton
              variant="outlined"
              color="primary"
              onClick={handleBack}
              startIcon={<BackIcon />}
              sx={{ mb: 3 }}
            >
              Back to Jobs
            </MDButton>
            
            <MDBox 
              p={4} 
              borderRadius={3}
              sx={{ 
                backgroundColor: darkMode ? '#202940' : (theme) => theme.palette.background.paper,
                border: 1,
                borderColor: 'divider',
                boxShadow: (theme) => theme.shadows[1]
              }}
            >
              <MDBox display="flex" alignItems="flex-start" gap={4} mb={4}>
                {/* Company Logo */}
                {companyLogo ? (
                  <Avatar 
                    src={companyLogo} 
                    alt={job.company.name}
                    sx={{ width: 80, height: 80, border: '2px solid #e0e0e0' }}
                  />
                ) : (
                  <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
                    <BusinessIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                )}
                
                {/* Job Title and Company */}
                <MDBox flex={1}>
                  <MDTypography 
                    variant="h3" 
                    fontWeight="bold" 
                    color={darkMode ? "white" : "dark"}
                    gutterBottom
                  >
                    {job.title}
                  </MDTypography>
                  
                  <MDBox display="flex" alignItems="center" gap={2} mb={2}>
                    <MDTypography variant="h5" color="info" fontWeight="medium">
                      {job.company.name}
                    </MDTypography>
                    {job.company.website && (
                      <IconButton 
                        size="small" 
                        onClick={() => window.open(job.company.website, '_blank')}
                        sx={{ color: 'info.main' }}
                      >
                        <WebsiteIcon />
                      </IconButton>
                    )}
                  </MDBox>
                  
                  <MDBox display="flex" alignItems="center" gap={2} flexWrap="wrap">
                    <MDBadge 
                      badgeContent={job.jobType} 
                      color={getJobTypeColor(job.jobType)} 
                      variant="gradient" 
                      size="lg"
                    />
                    {isUrgent && (
                      <MDBadge 
                        badgeContent={`${daysLeft} days left`} 
                        color="error" 
                        variant="gradient" 
                        size="lg"
                      />
                    )}
                  </MDBox>
                </MDBox>
                
                {/* Apply Button */}
                <MDButton
                  variant="gradient"
                  color={isApplied ? "success" : "info"}
                  onClick={isApplied ? null : handleApply}
                  startIcon={isApplied ? <CheckIcon /> : <OpenIcon />}
                  size="large"
                  sx={{ minWidth: 160, height: 48 }}
                >
                  {isApplied ? "Applied" : "Apply Now"}
                </MDButton>
              </MDBox>

              {/* Quick Info Grid */}
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                  <MDBox display="flex" alignItems="center" gap={2}>
                    <LocationIcon sx={{ color: 'info.main', fontSize: 24 }} />
                    <MDBox>
                      <MDTypography variant="caption" color="text" display="block">
                        Location
                      </MDTypography>
                      <MDTypography 
                        variant="h6" 
                        fontWeight="medium" 
                        color={darkMode ? "white" : "dark"}
                      >
                        {job.location}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <MDBox display="flex" alignItems="center" gap={2}>
                    <WorkIcon sx={{ color: 'info.main', fontSize: 24 }} />
                    <MDBox>
                      <MDTypography variant="caption" color="text" display="block">
                        Work Mode
                      </MDTypography>
                      <MDTypography 
                        variant="h6" 
                        fontWeight="medium" 
                        color={darkMode ? "white" : "dark"}
                      >
                        {job.workMode || 'On-site'}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <MDBox display="flex" alignItems="center" gap={2}>
                    <PeopleIcon sx={{ color: 'info.main', fontSize: 24 }} />
                    <MDBox>
                      <MDTypography variant="caption" color="text" display="block">
                        Openings
                      </MDTypography>
                      <MDTypography 
                        variant="h6" 
                        fontWeight="medium" 
                        color={darkMode ? "white" : "dark"}
                      >
                        {job.numberOfOpenings || 1} position{(job.numberOfOpenings || 1) > 1 ? 's' : ''}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <MDBox display="flex" alignItems="center" gap={2}>
                    <CalendarIcon sx={{ color: 'info.main', fontSize: 24 }} />
                    <MDBox>
                      <MDTypography variant="caption" color="text" display="block">
                        Start Date
                      </MDTypography>
                      <MDTypography 
                        variant="h6" 
                        fontWeight="medium" 
                        color={darkMode ? "white" : "dark"}
                      >
                        {job.startDate || 'Immediately'}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Grid>
              </Grid>

              {/* Salary Information */}
              {(job.salary?.min || job.salary?.max || job.stipend?.amount) && (
                <MDBox mb={4}>
                  <MDBox display="flex" alignItems="center" gap={2} mb={2}>
                    <SalaryIcon sx={{ color: 'success.main', fontSize: 24 }} />
                    <MDTypography 
                      variant="h5" 
                      fontWeight="medium" 
                      color={darkMode ? "white" : "dark"}
                    >
                      Compensation
                    </MDTypography>
                  </MDBox>
                  <MDTypography variant="h4" color="success" fontWeight="bold">
                    {job.salary?.min || job.salary?.max ? 
                      formatSalary(job.salary) : 
                      `₹${job.stipend.amount} ${job.stipend.period || 'Monthly'}`
                    }
                  </MDTypography>
                </MDBox>
              )}

              {/* Application Deadline */}
              <MDBox 
                p={3} 
                borderRadius={2} 
                sx={{ 
                  backgroundColor: isUrgent ? 'error.light' : 'info.light',
                  border: 1,
                  borderColor: isUrgent ? 'error.main' : 'info.main',
                }}
              >
                <MDBox display="flex" alignItems="center" gap={2}>
                  <TimeIcon sx={{ color: isUrgent ? 'error.main' : 'info.main', fontSize: 24 }} />
                  <MDTypography 
                    variant="h6" 
                    fontWeight="medium" 
                    color={darkMode ? "white" : "dark"}
                  >
                    Application Deadline: {new Date(job.deadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </MDTypography>
                  <MDTypography 
                    variant="h6" 
                    color={isUrgent ? 'error' : 'info'} 
                    fontWeight="bold"
                  >
                    ({daysLeft} days left)
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>
          </MDBox>

          {/* Main Content */}
          <Grid container spacing={4}>
            {/* Left Column - Job Details */}
            <Grid item xs={12} lg={8}>
              {/* Job Description */}
              <MDBox 
                p={4} 
                borderRadius={3}
                sx={{ 
                  backgroundColor: darkMode ? '#202940' : (theme) => theme.palette.background.paper,
                  border: 1,
                  borderColor: 'divider',
                  boxShadow: (theme) => theme.shadows[1]
                }}
                mb={4}
              >
                <MDTypography 
                  variant="h4" 
                  fontWeight="bold" 
                  color={darkMode ? "white" : "dark"}
                  mb={3}
                >
                  Job Description
                </MDTypography>
                <MDTypography 
                  variant="body1" 
                  color={darkMode ? "white" : "text"}
                  sx={{ lineHeight: 1.8, fontSize: '16px' }}
                >
                  {job.description}
                </MDTypography>
              </MDBox>

              {/* Key Responsibilities */}
              {job.keyResponsibilities && job.keyResponsibilities.length > 0 && (
                <MDBox 
                  p={4} 
                  borderRadius={3}
                  sx={{ 
                    backgroundColor: darkMode ? '#202940' : (theme) => theme.palette.background.paper,
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: (theme) => theme.shadows[1]
                  }}
                  mb={4}
                >
                  <MDTypography 
                    variant="h4" 
                    fontWeight="bold" 
                    color={darkMode ? "white" : "dark"}
                    mb={3}
                  >
                    Key Responsibilities
                  </MDTypography>
                  <List>
                    {job.keyResponsibilities.map((responsibility, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <CheckIcon sx={{ color: 'success.main', fontSize: 24 }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <MDTypography 
                              variant="body1" 
                              color={darkMode ? "white" : "text"}
                              sx={{ fontSize: '16px' }}
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
                  p={4}
                  borderRadius={3}
                  sx={{
                    backgroundColor: darkMode ? '#202940' : (theme) => theme.palette.background.paper,
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: (theme) => theme.shadows[1],
                    mb: 4
                  }}
                >
                  <MDTypography variant="h4" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={3}>
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
                      <MDTypography variant="h6" fontWeight="medium" color={darkMode ? "white" : "dark"} mb={2}>
                        Document Preview
                      </MDTypography>
                      <GoogleDrivePreview 
                        link={job.googleDriveLink} 
                        title={`${job.title} - Document`}
                        showPreview={true}
                      />
                    </MDBox>
                  )}
                </MDBox>
              ) : null}

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <MDBox 
                  p={4} 
                  borderRadius={3}
                  sx={{ 
                    backgroundColor: darkMode ? '#202940' : (theme) => theme.palette.background.paper,
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: (theme) => theme.shadows[1]
                  }}
                  mb={4}
                >
                  <MDTypography 
                    variant="h4" 
                    fontWeight="bold" 
                    color={darkMode ? "white" : "dark"}
                    mb={3}
                  >
                    Requirements
                  </MDTypography>
                  <List>
                    {job.requirements.map((requirement, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <StarIcon sx={{ color: 'warning.main', fontSize: 24 }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <MDTypography 
                              variant="body1" 
                              color={darkMode ? "white" : "text"}
                              sx={{ fontSize: '16px' }}
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
                  p={4} 
                  borderRadius={3}
                  sx={{ 
                    backgroundColor: darkMode ? '#202940' : (theme) => theme.palette.background.paper,
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: (theme) => theme.shadows[1]
                  }}
                  mb={4}
                >
                  <MDTypography 
                    variant="h4" 
                    fontWeight="bold" 
                    color={darkMode ? "white" : "dark"}
                    mb={3}
                  >
                    Skills Required
                  </MDTypography>
                  <MDBox display="flex" flexWrap="wrap" gap={1}>
                    {job.skillsRequired.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        variant="outlined"
                        size="medium"
                        sx={{ 
                          borderColor: 'primary.main',
                          color: darkMode ? 'white' : 'primary.main',
                          fontSize: '14px',
                          height: 32,
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'white',
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
                  p={4} 
                  borderRadius={3}
                  sx={{ 
                    backgroundColor: darkMode ? '#202940' : (theme) => theme.palette.background.paper,
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: (theme) => theme.shadows[1]
                  }}
                  mb={4}
                >
                  <MDBox display="flex" alignItems="center" gap={2} mb={3}>
                    <SchoolIcon sx={{ color: 'info.main', fontSize: 28 }} />
                    <MDTypography 
                      variant="h4" 
                      fontWeight="bold" 
                      color={darkMode ? "white" : "dark"}
                    >
                      Education Qualifications
                    </MDTypography>
                  </MDBox>
                  <List>
                    {job.educationQualifications.map((qualification, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <CheckIcon sx={{ color: 'info.main', fontSize: 24 }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <MDTypography 
                              variant="body1" 
                              color={darkMode ? "white" : "text"}
                              sx={{ fontSize: '16px' }}
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
                  p={4} 
                  borderRadius={3}
                  sx={{ 
                    backgroundColor: darkMode ? '#202940' : (theme) => theme.palette.background.paper,
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: (theme) => theme.shadows[1]
                  }}
                  mb={4}
                >
                  <MDTypography 
                    variant="h4" 
                    fontWeight="bold" 
                    color={darkMode ? "white" : "dark"}
                    mb={3}
                  >
                    Benefits & Perks
                  </MDTypography>
                  <MDBox display="flex" flexWrap="wrap" gap={1}>
                    {job.benefits.map((benefit, index) => (
                      <Chip
                        key={index}
                        label={benefit}
                        variant="filled"
                        size="medium"
                        sx={{ 
                          backgroundColor: darkMode ? 'success.main' : 'success.light',
                          color: darkMode ? 'white' : 'success.dark',
                          fontSize: '14px',
                          height: 32,
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
                  p={4} 
                  borderRadius={3}
                  sx={{ 
                    backgroundColor: darkMode ? '#202940' : (theme) => theme.palette.background.paper,
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: (theme) => theme.shadows[1],
                    position: { lg: 'sticky' },
                    top: { lg: 24 },
                  }}
                >
                  <MDTypography 
                    variant="h4" 
                    fontWeight="bold" 
                    color={darkMode ? "white" : "dark"}
                    mb={3}
                  >
                    About {job.company.name}
                  </MDTypography>
                  
                  {job.company.about && (
                    <MDTypography 
                      variant="body1" 
                      color={darkMode ? "white" : "text"}
                      mb={3} 
                      sx={{ lineHeight: 1.6, fontSize: '16px' }}
                    >
                      {job.company.about}
                    </MDTypography>
                  )}
                  
                  <Grid container spacing={2}>
                    {job.company.industry && (
                      <Grid item xs={12}>
                        <MDTypography variant="h6" color="text" display="block">
                          Industry
                        </MDTypography>
                        <MDTypography 
                          variant="body1" 
                          fontWeight="medium" 
                          color={darkMode ? "white" : "dark"}
                        >
                          {job.company.industry}
                        </MDTypography>
                      </Grid>
                    )}
                    
                    {job.company.size && (
                      <Grid item xs={12}>
                        <MDTypography variant="h6" color="text" display="block">
                          Company Size
                        </MDTypography>
                        <MDTypography 
                          variant="body1" 
                          fontWeight="medium" 
                          color={darkMode ? "white" : "dark"}
                        >
                          {job.company.size} employees
                        </MDTypography>
                      </Grid>
                    )}
                    
                    {job.company.founded && (
                      <Grid item xs={12}>
                        <MDTypography variant="h6" color="text" display="block">
                          Founded
                        </MDTypography>
                        <MDTypography 
                          variant="body1" 
                          fontWeight="medium" 
                          color={darkMode ? "white" : "dark"}
                        >
                          {job.company.founded}
                        </MDTypography>
                      </Grid>
                    )}
                    
                    {job.company.website && (
                      <Grid item xs={12}>
                        <MDTypography variant="h6" color="text" display="block">
                          Website
                        </MDTypography>
                        <MDButton
                          variant="text"
                          color="info"
                          onClick={() => window.open(job.company.website, '_blank')}
                          startIcon={<WebsiteIcon />}
                          sx={{ p: 0, textTransform: 'none' }}
                        >
                          {job.company.website}
                        </MDButton>
                      </Grid>
                    )}
                  </Grid>
                </MDBox>
              )}
            </Grid>
          </Grid>

          {/* Bottom Apply Button for mobile */}
          <MDBox 
            position="fixed" 
            bottom={0} 
            left={0} 
            right={0} 
            p={2} 
            sx={{ 
              backgroundColor: darkMode ? '#202940' : (theme) => theme.palette.background.paper,
              borderTop: 1,
              borderColor: 'divider',
              display: { xs: 'flex', lg: 'none' },
              justifyContent: 'center',
              zIndex: 1000,
              boxShadow: (theme) => theme.shadows[4]
            }}
          >
            <MDButton
              variant="gradient"
              color={isApplied ? "success" : "info"}
              onClick={isApplied ? null : handleApply}
              startIcon={isApplied ? <CheckIcon /> : <OpenIcon />}
              size="large"
              fullWidth
              sx={{ maxWidth: 400 }}
            >
              {isApplied ? "Applied" : "Apply Now"}
            </MDButton>
          </MDBox>
        </Container>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
};

export default JobDetailPage;
