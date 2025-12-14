import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Chip, IconButton, Box, Typography, Avatar } from '@mui/material';
import {
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  Visibility as ViewIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  RemoveRedEye as EyeIcon,
  People as PeopleIcon,
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

// Material Dashboard 2 React contexts
import { useMaterialUIController } from 'context';
import { useAuth } from 'context/AuthContext';
import { useApplicationResponse } from 'context/ApplicationResponseContext';

// Services
import { formatSalary, getDaysUntilDeadline } from 'services/jobService';



const JobCard = ({ job, onApply, onSave, showAppliedBadge }) => {
  const navigate = useNavigate();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const { isStudent, user } = useAuth();
  const { recordApplyClick } = useApplicationResponse();
  const daysLeft = getDaysUntilDeadline(job.deadline);
  const isUrgent = daysLeft <= 7;

  // Debug logging
  console.log('JobCard Debug:', {
    userRole: user?.role,
    isStudentFunction: isStudent(),
    hasApplied: job.hasApplied,
    showAppliedBadge,
    shouldShowApplyButton: isStudent() && !job.hasApplied
  });

  // Format company logo
  const companyLogo = job.company?.logo || null;

  // Format skills for display (show max 4)
  const displaySkills = job.skillsRequired?.slice(0, 4) || [];
  const remainingSkills = (job.skillsRequired?.length || 0) - 4;

  // Format posted time
  const getPostedTime = (createdAt) => {
    const now = new Date();
    const posted = new Date(createdAt);
    const diffInDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 Day Ago';
    return `${diffInDays} Days Ago`;
  };

  return (
    <Card
      sx={{
        mb: 2.5,
        borderRadius: '12px',
        boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
        backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        width: '100%',
        height: '100%', // Ensure equal height
        display: 'flex', // Flex layout for vertical alignment
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: darkMode ? '#333' : '#e5e5e5',
        '&:hover': {
          boxShadow: darkMode ? '0 4px 16px rgba(0, 0, 0, 0.4)' : '0 4px 16px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-2px)',
          borderColor: darkMode ? '#444' : '#d0d0d0',
        },
      }}
      onClick={() => navigate(`/job-detail/${job._id}`)}
    >
      <CardContent sx={{
        p: 2.5,
        '&:last-child': { pb: 2.5 },
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flex: 1
      }}>
        {/* Header Section */}
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
          <MDBox display="flex" alignItems="flex-start" gap={2.5} flex={1}>
            {/* Company Logo */}
            {companyLogo ? (
              <Avatar
                src={companyLogo}
                alt={job.company?.name}
                sx={{
                  width: 56,
                  height: 56,
                  border: '1px solid',
                  borderColor: darkMode ? '#333' : '#e0e0e0',
                  bgcolor: darkMode ? '#2a2a2a' : '#fafafa'
                }}
              />
            ) : (
              <Avatar sx={{
                width: 56,
                height: 56,
                bgcolor: darkMode ? '#2a2a2a' : '#f5f5f5',
                color: darkMode ? '#999' : '#666',
                border: '1px solid',
                borderColor: darkMode ? '#333' : '#e0e0e0'
              }}>
                <BusinessIcon sx={{ fontSize: 28 }} />
              </Avatar>
            )}

            {/* Job Title and Company */}
            <MDBox flex={1}>
              <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                <MDTypography
                  variant="h6"
                  fontWeight="bold"
                  color={darkMode ? "white" : "dark"}
                  sx={{
                    fontSize: '18px',
                    lineHeight: 1.3,
                    color: darkMode ? '#fff !important' : 'inherit',
                    '&:hover': { color: '#1976d2' }
                  }}
                >
                  {job.title}
                </MDTypography>
                {/* Applied Badge */}
                {(showAppliedBadge || job.hasApplied) && (
                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                    label="Applied"
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '11px',
                      bgcolor: '#e8f5e8',
                      color: '#2e7d32',
                      border: '1px solid #c8e6c9',
                      fontWeight: 500
                    }}
                  />
                )}
              </MDBox>

              <MDBox display="flex" alignItems="center" gap={1.5} mb={1.5}>
                <MDTypography
                  variant="body1"
                  color={darkMode ? "white" : "text"}
                  sx={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: darkMode ? '#fff !important' : 'inherit'
                  }}
                >
                  {job.company.name}
                </MDTypography>
                {job.company.size && (
                  <>
                    <Box sx={{ width: 4, height: 4, bgcolor: darkMode ? '#fff' : '#ccc', borderRadius: '50%' }} />
                    <MDTypography
                      variant="body2"
                      color={darkMode ? "white" : "text"}
                      sx={{
                        fontSize: '13px',
                        color: darkMode ? '#fff !important' : 'inherit'
                      }}
                    >
                      {job.company.size}
                    </MDTypography>
                  </>
                )}
              </MDBox>
            </MDBox>
          </MDBox>

          {/* Save Button */}
          <IconButton
            size="small"
            sx={{
              color: job.isSaved ? '#1976d2' : (darkMode ? '#888' : '#999'),
              bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              border: '1px solid',
              borderColor: darkMode ? '#333' : '#e0e0e0',
              '&:hover': {
                color: '#1976d2',
                bgcolor: darkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.04)',
                borderColor: '#1976d2'
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (onSave) {
                onSave(job._id);
              }
            }}
          >
            {job.isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
          </IconButton>
        </MDBox>

        {/* Job Details Row */}
        <MDBox
          display="flex"
          alignItems="center"
          gap={3}
          mb={2.5}
          flexWrap="wrap"
          sx={{
            bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            borderRadius: '8px',
            p: 1.5,
            border: '1px solid',
            borderColor: darkMode ? '#333' : '#f0f0f0'
          }}
        >
          {/* Experience */}
          <MDBox display="flex" alignItems="center" gap={1}>
            <WorkIcon sx={{ fontSize: 16, color: darkMode ? '#fff' : '#666' }} />
            <MDTypography
              variant="body2"
              color={darkMode ? "white" : "text"}
              sx={{
                fontSize: '13px',
                fontWeight: 500,
                color: darkMode ? '#fff !important' : 'inherit'
              }}
            >
              0-2 Yrs
            </MDTypography>
          </MDBox>

          {/* Salary */}
          {(job.salary?.min || job.salary?.max || job.stipend?.amount) && (
            <>
              <Box sx={{ width: 4, height: 4, bgcolor: darkMode ? '#fff' : '#ccc', borderRadius: '50%' }} />
              <MDTypography
                variant="body2"
                color={darkMode ? "white" : "text"}
                sx={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: darkMode ? '#fff !important' : 'inherit'
                }}
              >
                ₹ {job.salary?.min || job.salary?.max ?
                  formatSalary(job.salary).replace('INR', '') :
                  `${job.stipend.amount} ${job.stipend.period || 'Monthly'}`
                }
              </MDTypography>
            </>
          )}

          {/* Location */}
          <Box sx={{ width: 4, height: 4, bgcolor: darkMode ? '#fff' : '#ccc', borderRadius: '50%' }} />
          <MDBox display="flex" alignItems="center" gap={1}>
            <LocationIcon sx={{ fontSize: 16, color: darkMode ? '#fff' : '#666' }} />
            <MDTypography
              variant="body2"
              color={darkMode ? "white" : "text"}
              sx={{
                fontSize: '13px',
                fontWeight: 500,
                color: darkMode ? '#fff !important' : 'inherit'
              }}
            >
              {job.location}
            </MDTypography>
          </MDBox>

          {/* Posted Time */}
          <MDBox display="flex" alignItems="center" gap={1} ml="auto">
            <TimeIcon sx={{ fontSize: 16, color: darkMode ? '#fff' : '#666' }} />
            <MDTypography
              variant="body2"
              color={darkMode ? "white" : "text"}
              sx={{
                fontSize: '12px',
                color: darkMode ? '#fff !important' : 'inherit'
              }}
            >
              {getPostedTime(job.createdAt)}
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* Job Description */}
        <MDBox mb={2.5}>
          <MDTypography
            variant="body2"
            color={darkMode ? "white" : "text"}
            sx={{
              fontSize: '14px',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              color: darkMode ? '#fff !important' : 'inherit'
            }}
          >
            {job.description}
          </MDTypography>
        </MDBox>

        {/* New: Documents and Google Drive Link Preview Indicator */}
        {((job.documents && job.documents.length > 0) || job.googleDriveLink) && (
          <MDBox display="flex" flexDirection="column" gap={1} mb={3}>
            {job.documents && job.documents.length > 0 && (
              <MDTypography variant="body2" color={darkMode ? "white" : "text"}>
                📎 {job.documents.length} document{job.documents.length > 1 ? 's' : ''}
              </MDTypography>
            )}
            {job.googleDriveLink && (
              <MDTypography variant="body2" color={darkMode ? "white" : "text"}>
                📄 Document Preview Available
              </MDTypography>
            )}
          </MDBox>
        )}

        {/* Spacer to push footer to bottom */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Skills */}
        {displaySkills.length > 0 && (
          <MDBox mb={2.5}>
            <MDBox display="flex" flexWrap="wrap" gap={1}>
              {displaySkills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  sx={{
                    fontSize: '11px',
                    height: 22,
                    bgcolor: darkMode ? '#2a2a2a' : '#f8f9fa',
                    color: darkMode ? '#fff !important' : '#666',
                    border: '1px solid',
                    borderColor: darkMode ? '#444' : '#e0e0e0',
                    '&:hover': {
                      bgcolor: darkMode ? '#333' : '#e3f2fd',
                      borderColor: '#1976d2',
                      color: '#1976d2 !important'
                    }
                  }}
                />
              ))}
              {remainingSkills > 0 && (
                <Chip
                  label={`+${remainingSkills} more`}
                  size="small"
                  sx={{
                    fontSize: '11px',
                    height: 22,
                    bgcolor: darkMode ? '#2a2a2a' : '#f0f0f0',
                    color: darkMode ? '#bbb' : '#999',
                    border: '1px solid',
                    borderColor: darkMode ? '#444' : '#ddd'
                  }}
                />
              )}
            </MDBox>
          </MDBox>
        )}

        {/* Footer Section */}
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          pt={2}
          borderTop={`1px solid ${darkMode ? '#333' : '#e5e5e5'}`}
        >
          <MDBox display="flex" alignItems="center" gap={3}>
            {/* View Count */}
            <MDBox display="flex" alignItems="center" gap={0.5}>
              <EyeIcon sx={{ fontSize: 16, color: darkMode ? '#fff' : '#666' }} />
              <MDTypography
                variant="body2"
                color={darkMode ? "white" : "text"}
                sx={{
                  fontSize: '12px',
                  color: darkMode ? '#fff !important' : 'inherit'
                }}
              >
                {job.stats?.totalViews || 0} views
              </MDTypography>
            </MDBox>

            {/* Apply Count */}
            <MDBox display="flex" alignItems="center" gap={0.5}>
              <PeopleIcon sx={{ fontSize: 16, color: darkMode ? '#fff' : '#666' }} />
              <MDTypography
                variant="body2"
                color={darkMode ? "white" : "text"}
                sx={{
                  fontSize: '12px',
                  color: darkMode ? '#fff !important' : 'inherit'
                }}
              >
                {job.stats?.totalApplications || 0} applied
              </MDTypography>
            </MDBox>

            {/* Urgency Badge */}
            {isUrgent && (
              <Chip
                label={`${daysLeft} days left`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '10px',
                  bgcolor: '#fff8e1',
                  color: '#f57c00',
                  border: '1px solid #ffcc02',
                  fontWeight: 500
                }}
              />
            )}
          </MDBox>

          {/* Action Buttons */}
          <MDBox display="flex" alignItems="center" gap={1.5}>
            <MDButton
              variant="outlined"
              size="small"
              sx={{
                px: 2,
                py: 0.75,
                fontSize: '12px',
                textTransform: 'none',
                borderRadius: '6px',
                fontWeight: 500,
                borderColor: darkMode ? '#444' : '#ddd',
                color: darkMode ? '#fff !important' : '#666',
                '&:hover': {
                  borderColor: '#1976d2',
                  color: '#1976d2 !important',
                  bgcolor: darkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.04)'
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/job-detail/${job._id}`);
              }}
            >
              View Details
            </MDButton>

            {/* Show Apply Now button for students who haven't applied */}
            {isStudent() && !job.hasApplied && !showAppliedBadge && (
              <MDButton
                variant="contained"
                size="small"
                sx={{
                  px: 2.5,
                  py: 0.75,
                  fontSize: '12px',
                  textTransform: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  bgcolor: '#1976d2',
                  color: '#ffffff !important',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#1565c0',
                    color: '#ffffff !important',
                    boxShadow: 'none'
                  },
                  '& .MuiButton-root': {
                    color: '#ffffff !important'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();

                  // Apply Now functionality - same as JobDetailPage
                  if (job?.applicationLink) {
                    // ... (existing helper log)

                    // Open external application link FIRST (synchronously)
                    const newWindow = window.open(job.applicationLink, '_blank', 'noopener,noreferrer');

                    if (newWindow) {
                      console.log('✅ External link opened successfully in new tab');
                    } else {
                      console.warn('⚠️ Popup may have been blocked by browser');
                    }

                    // Small delay to ensure window opens before showing modal
                    setTimeout(() => {
                      recordApplyClick(job._id, {
                        _id: job._id,
                        title: job.title,
                        company: job.company,
                        location: job.location
                      });
                    }, 100);
                  } else {
                    navigate(`/job-detail/${job._id}`);
                  }
                }}
              >
                Apply Now
              </MDButton>
            )}

            {/* Show Applied Button if already applied */}
            {(job.hasApplied || showAppliedBadge) && (
              <MDButton
                variant="outlined"
                color="success"
                size="small"
                disabled
                sx={{
                  px: 2.5,
                  py: 0.75,
                  fontSize: '12px',
                  textTransform: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  borderColor: '#4caf50',
                  color: '#4caf50 !important',
                  '&.Mui-disabled': {
                    borderColor: '#4caf50',
                    color: '#4caf50 !important',
                  }
                }}
              >
                Applied
              </MDButton>
            )}
          </MDBox>
        </MDBox>
      </CardContent>
    </Card>
  );
};

export default JobCard;
