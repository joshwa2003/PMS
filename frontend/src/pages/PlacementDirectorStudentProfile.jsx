import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// MUI
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PersonIcon from '@mui/icons-material/Person';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CodeIcon from '@mui/icons-material/Code';
import LanguageIcon from '@mui/icons-material/Language';
import TranslateIcon from '@mui/icons-material/Translate';
import StarIcon from '@mui/icons-material/Star';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

// MD components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

// Layout
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';

// Services
import studentViewService from 'services/studentViewService';
import ProtectedRoute from 'components/ProtectedRoute';

// Field component for displaying student data
const Field = ({ label, value, fullWidth = false }) => (
  <MDBox mb={2} sx={{ width: fullWidth ? '100%' : 'auto' }}>
    <MDTypography variant="caption" color="text" fontWeight="bold" textTransform="uppercase">
      {label}
    </MDTypography>
    <MDTypography variant="body2" color="dark" mt={0.5}>
      {value || '—'}
    </MDTypography>
  </MDBox>
);

// Section component for organizing data
const Section = ({ title, children, icon, color = "info" }) => (
  <Card sx={{ mb: 3, boxShadow: 3 }}>
    <MDBox
      mx={2}
      mt={-3}
      py={3}
      px={2}
      variant="gradient"
      bgColor={color}
      borderRadius="lg"
      coloredShadow={color}
    >
      <MDBox display="flex" alignItems="center">
        {icon}
        <MDTypography variant="h6" color="white" ml={1}>
          {title}
        </MDTypography>
      </MDBox>
    </MDBox>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

function PlacementDirectorStudentProfileContent() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStudent = async () => {
      setLoading(true);
      setError(null);
      try {
        const studentData = await studentViewService.getStudentById(studentId);
        setStudent(studentData);
      } catch (err) {
        setError(err?.message || 'Failed to load student profile');
      } finally {
        setLoading(false);
      }
    };
    
    if (studentId) {
      loadStudent();
    }
  }, [studentId]);

  // Handle profile image download
  const handleDownloadProfileImage = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const s = student || {};
    const personal = s.personalInfo || {};
    const profileImageUrl = s.profileImageUrl || 
                           s.profileImage || 
                           s.userId?.profilePicture ||
                           personal.profileImage || 
                           s.profile?.profileImage || 
                           s.profilePicture || 
                           s.avatar || 
                           s.image;
    
    console.log('Attempting to download image:', profileImageUrl);
    
    if (profileImageUrl) {
      try {
        // For Google Drive URLs, convert to direct download format
        let downloadUrl = profileImageUrl;
        if (profileImageUrl.includes('drive.google.com')) {
          // Extract file ID from Google Drive URL
          const fileIdMatch = profileImageUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
          if (fileIdMatch) {
            const fileId = fileIdMatch[1];
            downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
          }
        }
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${personal.fullName || s.fullName || 'student'}_profile_image.jpg`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading image:', error);
        // Fallback: open in new tab
        window.open(profileImageUrl, '_blank');
      }
    }
  };

  // Handle document download
  const handleDownloadDocument = async (documentUrl, fileName) => {
    if (documentUrl) {
      try {
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = fileName || 'document';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading document:', error);
      }
    }
  };

  // Get file icon based on file type
  const getFileIcon = (fileName) => {
    if (!fileName) return <InsertDriveFileIcon />;
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <PictureAsPdfIcon />;
      default:
        return <InsertDriveFileIcon />;
    }
  };

  // Convert Google Drive URL to viewable format
  const getViewableImageUrl = (url) => {
    if (!url) return null;
    
    console.log('Original URL:', url);
    
    // If it's a Google Drive URL, convert it to viewable format
    if (url.includes('drive.google.com')) {
      // Extract file ID from various Google Drive URL formats
      let fileId = null;
      
      // Format: https://drive.google.com/file/d/FILE_ID/view
      const viewMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (viewMatch) {
        fileId = viewMatch[1];
      }
      
      // Format: https://drive.google.com/open?id=FILE_ID
      const openMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
      if (openMatch) {
        fileId = openMatch[1];
      }
      
      if (fileId) {
        // Convert to thumbnail/viewable format
        const viewableUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400`;
        console.log('Converted to viewable URL:', viewableUrl);
        return viewableUrl;
      }
    }
    
    console.log('Using original URL:', url);
    return url;
  };

  // Handle back navigation
  const handleBack = () => {
    // Try to go back to the previous page, or default to department students
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/department-wise-student-dashboard');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <MDBox display="flex" alignItems="center" mb={2}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <MDBox ml={2} flex={1}>
                      <Skeleton variant="text" width="60%" height={32} />
                      <Skeleton variant="text" width="40%" height={20} />
                    </MDBox>
                  </MDBox>
                  <Skeleton variant="rectangular" height={400} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <MDButton
            variant="outlined"
            color="secondary"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Go Back
          </MDButton>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  const s = student || {};
  const personal = s.personalInfo || {};
  const contact = s.contact || {};
  const academic = s.academic || {};
  const placement = s.placement || {};
  const career = s.careerProfile || {};
  const skills = s.skillsCertifications || [];
  const projects = s.projects || [];
  const internships = s.internships || [];
  const online = s.onlineProfiles || [];
  const languages = s.languagesKnown || [];

  // Get the profile image URL
  const rawProfileImageUrl = s.profileImageUrl || 
                            s.profileImage || 
                            s.userId?.profilePicture ||
                            personal.profileImage || 
                            s.profile?.profileImage || 
                            s.profilePicture || 
                            s.avatar || 
                            s.image;

  // Convert to viewable format
  const profileImageUrl = getViewableImageUrl(rawProfileImageUrl);

  // Debug: Log student data to see the structure
  console.log('Student data:', s);
  console.log('User data:', s.userId);
  console.log('Profile image paths to check:', {
    'student.profileImageUrl': s.profileImageUrl,
    'student.profileImage': s.profileImage,
    'student.userId.profilePicture': s.userId?.profilePicture,
    'student.personalInfo.profileImage': personal.profileImage,
    'student.profile.profileImage': s.profile?.profileImage,
    'student.profilePicture': s.profilePicture,
    'student.avatar': s.avatar,
    'student.image': s.image,
    'finalProfileImageUrl': profileImageUrl
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Header */}
        <MDBox mb={3}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Tooltip title="Back">
                <IconButton onClick={handleBack} color="primary">
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item xs>
              <MDBox>
                <MDTypography variant="h4" fontWeight="medium">
                  {personal.fullName || s.fullName || 'Student Profile'}
                </MDTypography>
                <MDTypography variant="button" color="text">
                  Student ID: {s.studentId || s._id} • Registration: {s.registrationNumber || 'N/A'}
                </MDTypography>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        <Grid container spacing={3}>
          {/* Profile Image and Basic Info */}
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', boxShadow: 3 }}>
              <MDBox pt={4} pb={3}>
                <Avatar
                  src={profileImageUrl}
                  sx={{
                    width: 150,
                    height: 150,
                    mx: 'auto',
                    mb: 2,
                    fontSize: '3rem',
                    fontWeight: 'bold'
                  }}
                  onError={(e) => {
                    console.log('Avatar image failed to load:', profileImageUrl);
                    // Try alternative Google Drive format
                    if (rawProfileImageUrl && rawProfileImageUrl.includes('drive.google.com')) {
                      const fileIdMatch = rawProfileImageUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
                      if (fileIdMatch) {
                        const fileId = fileIdMatch[1];
                        e.target.src = `https://drive.google.com/uc?id=${fileId}`;
                      }
                    }
                  }}
                >
                  {personal.fullName ? personal.fullName.charAt(0).toUpperCase() : 'S'}
                </Avatar>
                
                <MDTypography variant="h5" fontWeight="medium" mb={1}>
                  {personal.fullName || s.fullName || 'Student Name'}
                </MDTypography>
                
                <MDTypography variant="body2" color="text" mb={2}>
                  {academic.department} • {academic.program}
                </MDTypography>

              </MDBox>
            </Card>

            {/* Quick Stats */}
            <Card sx={{ mt: 3, boxShadow: 3 }}>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Quick Stats
                </MDTypography>
                <Field label="CGPA" value={academic.cgpa} />
                <Field label="Placement Status" value={placement.placementStatus || 'Unplaced'} />
                <Field label="Program" value={academic.program} />
                <Field label="Year of Study" value={academic.yearOfStudy} />
              </MDBox>
            </Card>
          </Grid>

          {/* Detailed Information */}
          <Grid item xs={12} md={8}>
            {/* Basic Information */}
            <Section 
              title="Basic Information" 
              icon={<PersonIcon color="inherit" />}
              color="info"
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Field label="Full Name" value={personal.fullName} />
                  <Field label="Date of Birth" value={personal.dateOfBirth} />
                  <Field label="Gender" value={personal.gender} />
                  <Field label="Nationality" value={personal.nationality} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field label="Category" value={personal.category} />
                  <Field label="Marital Status" value={personal.maritalStatus} />
                  <Field label="Differently Abled" value={personal.differentlyAbled ? 'Yes' : 'No'} />
                  <Field label="Career Break" value={personal.careerBreak ? 'Yes' : 'No'} />
                </Grid>
              </Grid>
            </Section>

            {/* Contact Details */}
            <Section 
              title="Contact Details" 
              icon={<ContactPhoneIcon color="inherit" />}
              color="success"
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Field label="Email" value={contact.email || s.email} />
                  <Field label="Phone" value={contact.phone} />
                  <Field label="Guardian Name" value={contact.guardianName} />
                  <Field label="Guardian Contact" value={contact.guardianContact} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field label="Permanent Address" value={contact.permanentAddress} fullWidth />
                  <Field label="Current Address" value={contact.currentAddress} fullWidth />
                  <Field label="Hometown" value={contact.hometown} />
                  <Field label="Pincode" value={contact.pincode} />
                </Grid>
              </Grid>
            </Section>

            {/* Academic Details */}
            <Section 
              title="Academic Details" 
              icon={<SchoolIcon color="inherit" />}
              color="warning"
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Field label="Department" value={academic.department} />
                  <Field label="Program" value={academic.program} />
                  <Field label="Specialization" value={academic.specialization} />
                  <Field label="Course Type" value={academic.courseType} />
                  <Field label="University" value={academic.university} />
                  <Field label="CGPA" value={academic.cgpa} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field label="Course Duration From" value={academic.courseDurationFrom} />
                  <Field label="Course Duration To" value={academic.courseDurationTo} />
                  <Field label="Grading System" value={academic.gradingSystem} />
                  <Field label="Backlogs" value={academic.backlogs} />
                  <Field label="Year Of Study" value={academic.yearOfStudy} />
                  <Field label="Current Semester" value={academic.currentSemester} />
                  <Field label="Section" value={academic.section} />
                </Grid>
              </Grid>
            </Section>

            {/* Career Profile */}
            <Section 
              title="Career Profile" 
              icon={<WorkIcon color="inherit" />}
              color="error"
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Field label="Current Industry" value={career.currentIndustry} />
                  <Field label="Department" value={career.department} />
                  <Field label="Desired Job Type" value={career.desiredJobType} />
                  <Field label="Employment Type" value={career.desiredEmploymentType} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field label="Preferred Shift" value={career.preferredShift} />
                  <Field label="Preferred Locations" value={(career.preferredLocations || []).join(', ')} fullWidth />
                </Grid>
              </Grid>
            </Section>

            {/* Placement Information */}
            <Section 
              title="Placement Information" 
              icon={<BusinessCenterIcon color="inherit" />}
              color="dark"
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Field label="Placement Status" value={placement.placementStatus} />
                  <Field label="Resume Headline" value={placement.resumeHeadline} />
                  <Field label="Resume Link" value={placement.resumeLink} />
                </Grid>
                <Grid item xs={12} md={6}>
                  {(placement.offerDetails || []).length > 0 ? (
                    <MDBox>
                      <MDTypography variant="button" fontWeight="medium" mb={1}>
                        Job Offers
                      </MDTypography>
                      {(placement.offerDetails || []).map((offer, idx) => (
                        <MDBox key={idx} mb={2} p={2} sx={{ bgcolor: 'grey.100', borderRadius: 1 }}>
                          <Field label="Company" value={offer.companyName} />
                          <Field label="CTC" value={offer.ctc} />
                          <Field label="Job Role" value={offer.jobRole} />
                        </MDBox>
                      ))}
                    </MDBox>
                  ) : (
                    <MDTypography variant="body2" color="text">
                      No job offers recorded
                    </MDTypography>
                  )}
                </Grid>
              </Grid>
            </Section>

            {/* Skills & Certifications */}
            <Section 
              title="Skills & Certifications" 
              icon={<EmojiEventsIcon color="inherit" />}
              color="info"
            >
              {skills.length > 0 ? (
                <Grid container spacing={2}>
                  {skills.map((skill, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                      <MDBox p={2} sx={{ bgcolor: 'grey.50', borderRadius: 1, mb: 1 }}>
                        <Field label="Skill/Certification" value={skill?.name || skill} />
                        {skill?.level && <Field label="Level" value={skill.level} />}
                        {skill?.issuedBy && <Field label="Issued By" value={skill.issuedBy} />}
                      </MDBox>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <MDTypography variant="body2" color="text">
                  No skills or certifications added yet.
                </MDTypography>
              )}
            </Section>

            {/* Projects & Internships */}
            <Section 
              title="Projects & Internships" 
              icon={<CodeIcon color="inherit" />}
              color="success"
            >
              <MDBox mb={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Projects
                </MDTypography>
                {projects.length > 0 ? (
                  projects.map((project, idx) => (
                    <MDBox key={idx} p={2} sx={{ bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                      <Field label="Title" value={project.title} />
                      <Field label="Description" value={project.description} fullWidth />
                      <Field label="Technologies" value={(project.technologies || []).join(', ')} />
                      {project.link && <Field label="Project Link" value={project.link} />}
                    </MDBox>
                  ))
                ) : (
                  <MDTypography variant="body2" color="text" mb={2}>
                    No projects added yet.
                  </MDTypography>
                )}
              </MDBox>

              <MDBox>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Internships
                </MDTypography>
                {internships.length > 0 ? (
                  internships.map((internship, idx) => (
                    <MDBox key={idx} p={2} sx={{ bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                      <Field label="Company" value={internship.company} />
                      <Field label="Role" value={internship.role} />
                      <Field label="Duration" value={internship.duration} />
                      <Field label="Description" value={internship.description} fullWidth />
                    </MDBox>
                  ))
                ) : (
                  <MDTypography variant="body2" color="text">
                    No internships added yet.
                  </MDTypography>
                )}
              </MDBox>
            </Section>

            {/* Online Profiles */}
            <Section 
              title="Online Profiles" 
              icon={<LanguageIcon color="inherit" />}
              color="warning"
            >
              {online.length > 0 ? (
                <Grid container spacing={2}>
                  {online.map((profile, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                      <MDBox p={2} sx={{ bgcolor: 'grey.50', borderRadius: 1, mb: 1 }}>
                        <Field label="Platform" value={profile.platform || 'Online Profile'} />
                        <Field label="URL" value={profile.url} />
                        {profile.username && <Field label="Username" value={profile.username} />}
                      </MDBox>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <MDTypography variant="body2" color="text">
                  No online profiles added yet.
                </MDTypography>
              )}
            </Section>

            {/* Language Proficiency */}
            <Section 
              title="Language Proficiency" 
              icon={<TranslateIcon color="inherit" />}
              color="error"
            >
              {languages.length > 0 ? (
                <Grid container spacing={2}>
                  {languages.map((lang, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                      <MDBox p={2} sx={{ bgcolor: 'grey.50', borderRadius: 1, mb: 1 }}>
                        <Field label="Language" value={lang.language} />
                        <Field label="Proficiency" value={lang.proficiency} />
                        {lang.certification && <Field label="Certification" value={lang.certification} />}
                      </MDBox>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <MDTypography variant="body2" color="text">
                  No languages added yet.
                </MDTypography>
              )}
            </Section>

            {/* Accomplishments */}
            <Section 
              title="Accomplishments & Awards" 
              icon={<StarIcon color="inherit" />}
              color="dark"
            >
              {(s.accomplishments || []).length > 0 ? (
                <Grid container spacing={2}>
                  {(s.accomplishments || []).map((accomplishment, idx) => (
                    <Grid item xs={12} key={idx}>
                      <MDBox p={2} sx={{ bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                        <Field label="Title" value={accomplishment.title} />
                        <Field label="Description" value={accomplishment.description} fullWidth />
                        <Field label="Date" value={accomplishment.date} />
                        {accomplishment.issuedBy && <Field label="Issued By" value={accomplishment.issuedBy} />}
                      </MDBox>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <MDTypography variant="body2" color="text">
                  No accomplishments added yet.
                </MDTypography>
              )}
            </Section>

            {/* Profile Summary */}
            <Section 
              title="Profile Summary" 
              icon={<DescriptionIcon color="inherit" />}
              color="info"
            >
              {s.profileSummary ? (
                <MDTypography variant="body2">
                  {s.profileSummary}
                </MDTypography>
              ) : (
                <MDTypography variant="body2" color="text">
                  No profile summary added yet.
                </MDTypography>
              )}
            </Section>

            {/* Resume & Documents Upload */}
            <Section 
              title="Resume & Documents" 
              icon={<CloudUploadIcon color="inherit" />}
              color="success"
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Resume
                  </MDTypography>
                  {placement.resumeLink || s.resume?.url ? (
                    <MDBox p={2} sx={{ bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                      <MDBox display="flex" alignItems="center" justifyContent="space-between">
                        <MDBox display="flex" alignItems="center">
                          {getFileIcon('resume.pdf')}
                          <MDBox ml={1}>
                            <MDTypography variant="button" fontWeight="medium">
                              Resume
                            </MDTypography>
                            <MDTypography variant="caption" color="text" display="block">
                              {placement.resumeHeadline || 'Student Resume'}
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                        <MDButton
                          variant="outlined"
                          color="info"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownloadDocument(placement.resumeLink || s.resume?.url, 'resume.pdf')}
                        >
                          Download
                        </MDButton>
                      </MDBox>
                    </MDBox>
                  ) : (
                    <MDTypography variant="body2" color="text">
                      No resume uploaded yet.
                    </MDTypography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Other Documents
                  </MDTypography>
                  {(s.documents || []).length > 0 ? (
                    (s.documents || []).map((doc, idx) => (
                      <MDBox key={idx} p={2} sx={{ bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                        <MDBox display="flex" alignItems="center" justifyContent="space-between">
                          <MDBox display="flex" alignItems="center">
                            {getFileIcon(doc.fileName)}
                            <MDBox ml={1}>
                              <MDTypography variant="button" fontWeight="medium">
                                {doc.fileName || `Document ${idx + 1}`}
                              </MDTypography>
                              <MDTypography variant="caption" color="text" display="block">
                                {doc.type || 'Document'}
                              </MDTypography>
                            </MDBox>
                          </MDBox>
                          <MDButton
                            variant="outlined"
                            color="info"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadDocument(doc.url, doc.fileName)}
                          >
                            Download
                          </MDButton>
                        </MDBox>
                      </MDBox>
                    ))
                  ) : (
                    <MDTypography variant="body2" color="text">
                      No additional documents uploaded yet.
                    </MDTypography>
                  )}
                </Grid>
              </Grid>
            </Section>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default function PlacementDirectorStudentProfile() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'placement_director', 'placement_staff']}>
      <PlacementDirectorStudentProfileContent />
    </ProtectedRoute>
  );
}
