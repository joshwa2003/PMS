import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Chip, IconButton, Box, Typography, Avatar } from '@mui/material';
import { 
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  Visibility as ViewIcon,
  BookmarkBorder as SaveIcon,
  Star as StarIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

// Material Dashboard 2 React contexts
import { useMaterialUIController } from 'context';

// Services
import { formatSalary, getDaysUntilDeadline } from 'services/jobService';



const JobCard = ({ job, onApply }) => {
  const navigate = useNavigate();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const daysLeft = getDaysUntilDeadline(job.deadline);
  const isUrgent = daysLeft <= 7;
  
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
        mb: 3,
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.37)',
        backgroundColor: darkMode ? '#202940' : (theme) => theme.palette.background.paper,
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        width: '100%',
        '&:hover': {
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.47)',
          borderColor: '#1976d2',
          transform: 'translateY(-2px)',
        },
      }}
      onClick={() => navigate(`/job-detail/${job._id}`)}
    >
      <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
        {/* Header Section */}
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <MDBox display="flex" alignItems="flex-start" gap={3} flex={1}>
            {/* Company Logo */}
            {companyLogo ? (
              <Avatar 
                src={companyLogo} 
                alt={job.company.name}
                sx={{ width: 50, height: 50, border: '1px solid #e0e0e0' }}
              />
            ) : (
              <Avatar sx={{ width: 50, height: 50, bgcolor: '#f5f5f5', color: '#666' }}>
                <BusinessIcon sx={{ fontSize: 24 }} />
              </Avatar>
            )}
            
            {/* Job Title and Company */}
            <MDBox flex={1}>
              <MDTypography 
                variant="h5" 
                fontWeight="bold" 
                color={darkMode ? "white" : "dark"}
                sx={{ 
                  fontSize: '20px',
                  lineHeight: 1.3,
                  mb: 1,
                  '&:hover': { color: 'primary.main' }
                }}
              >
                {job.title}
              </MDTypography>
              
              <MDBox display="flex" alignItems="center" gap={1} mb={2}>
                <MDTypography 
                  variant="h6" 
                  color={darkMode ? "white" : "dark"}
                  sx={{ fontSize: '16px', fontWeight: 600 }}
                >
                  {job.company.name}
                </MDTypography>
                {job.company.size && (
                  <>
                    <StarIcon sx={{ fontSize: 14, color: '#ffa726' }} />
                    <MDTypography variant="body2" color="text">
                      {job.company.size}
                    </MDTypography>
                  </>
                )}
              </MDBox>
            </MDBox>
          </MDBox>
          
          {/* Save Button */}
          <IconButton 
            size="medium" 
            sx={{ 
              color: 'text.secondary',
              '&:hover': { 
                color: 'primary.main',
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SaveIcon fontSize="medium" />
          </IconButton>
        </MDBox>

        {/* Job Details Row */}
        <MDBox display="flex" alignItems="center" gap={4} mb={3} flexWrap="wrap">
          {/* Experience */}
          <MDBox display="flex" alignItems="center" gap={1}>
            <WorkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <MDTypography variant="body1" color={darkMode ? "white" : "text"} sx={{ fontSize: '14px', fontWeight: 500 }}>
              0-2 Yrs
            </MDTypography>
          </MDBox>
          
          {/* Salary */}
          {(job.salary?.min || job.salary?.max || job.stipend?.amount) && (
            <MDBox display="flex" alignItems="center" gap={1}>
              <MDTypography variant="body1" color={darkMode ? "white" : "text"} sx={{ fontSize: '14px', fontWeight: 500 }}>
                ₹ {job.salary?.min || job.salary?.max ? 
                  formatSalary(job.salary).replace('INR', '') : 
                  `${job.stipend.amount} ${job.stipend.period || 'Monthly'}`
                }
              </MDTypography>
            </MDBox>
          )}
          
          {/* Location */}
          <MDBox display="flex" alignItems="center" gap={1}>
            <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <MDTypography variant="body1" color={darkMode ? "white" : "text"} sx={{ fontSize: '14px', fontWeight: 500 }}>
              {job.location}
            </MDTypography>
          </MDBox>
          
          {/* Posted Time */}
          <MDBox display="flex" alignItems="center" gap={1} ml="auto">
            <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <MDTypography variant="body2" color={darkMode ? "white" : "text"} sx={{ fontSize: '13px' }}>
              {getPostedTime(job.createdAt)}
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* Job Description */}
        <MDBox mb={3}>
          <MDTypography 
            variant="body1" 
            color={darkMode ? "white" : "text"}
            sx={{ 
              fontSize: '14px',
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {job.description}
          </MDTypography>
        </MDBox>

        {/* Skills */}
        {displaySkills.length > 0 && (
          <MDBox mb={3}>
            <MDBox display="flex" flexWrap="wrap" gap={1}>
              {displaySkills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '12px',
                    height: 24,
                    borderColor: darkMode ? '#555' : '#e0e0e0',
                    color: darkMode ? 'white' : 'text.secondary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main'
                    }
                  }}
                />
              ))}
              {remainingSkills > 0 && (
                <Chip
                  label={`+${remainingSkills} more`}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '12px',
                    height: 24,
                    borderColor: darkMode ? '#555' : '#e0e0e0',
                    color: darkMode ? 'white' : 'text.secondary'
                  }}
                />
              )}
            </MDBox>
          </MDBox>
        )}

        {/* Footer Section */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" pt={2} borderTop={`1px solid ${darkMode ? '#444' : '#f0f0f0'}`}>
          <MDBox display="flex" alignItems="center" gap={2}>
            {/* Urgency Badge */}
            {isUrgent && (
              <Chip
                label={`${daysLeft} days left`}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '12px',
                  backgroundColor: '#fff3e0',
                  color: '#f57c00',
                  border: '1px solid #ffcc02',
                  fontWeight: 600
                }}
              />
            )}
          </MDBox>
          
          {/* Action Buttons */}
          <MDBox display="flex" alignItems="center" gap={2}>
            <MDButton
              variant="outlined"
              color="primary"
              size="medium"
              sx={{
                px: 3,
                py: 1,
                fontSize: '14px',
                textTransform: 'none',
                borderRadius: '8px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white'
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/job-detail/${job._id}`);
              }}
            >
              View Details
            </MDButton>
            
            <MDButton
              variant="contained"
              color="primary"
              size="medium"
              sx={{
                px: 3,
                py: 1,
                fontSize: '14px',
                textTransform: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(25,118,210,0.3)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(25,118,210,0.4)',
                  transform: 'translateY(-1px)'
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                onApply(job);
              }}
            >
              Apply Now
            </MDButton>
          </MDBox>
        </MDBox>
      </CardContent>
    </Card>
  );
};

export default JobCard;

