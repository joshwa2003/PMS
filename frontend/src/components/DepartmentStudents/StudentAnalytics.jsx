import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Group as GroupIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDBadge from 'components/MDBadge';

const StudentAnalytics = ({ department, statistics, loading }) => {
  if (loading) {
    return (
      <Grid container spacing={3} mb={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="center" minHeight="120px">
                  <Typography variant="body2" color="text.secondary">
                    Loading...
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!statistics) {
    return null;
  }

  const placementRate = statistics.total > 0 ? 
    Math.round(((statistics.placed + statistics.multipleOffers) / statistics.total) * 100) : 0;

  const unplacedRate = statistics.total > 0 ? 
    Math.round((statistics.unplaced / statistics.total) * 100) : 0;

  const analyticsCards = [
    {
      title: 'Total Students',
      value: statistics.total,
      icon: <GroupIcon />,
      color: 'info',
      bgColor: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
      description: 'Students in department'
    },
    {
      title: 'Placed Students',
      value: statistics.placed,
      icon: <CheckCircleIcon />,
      color: 'success',
      bgColor: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)',
      description: `${statistics.total > 0 ? Math.round((statistics.placed / statistics.total) * 100) : 0}% of total students`,
      progress: statistics.total > 0 ? (statistics.placed / statistics.total) * 100 : 0
    },
    {
      title: 'Multiple Offers',
      value: statistics.multipleOffers,
      icon: <StarIcon />,
      color: 'warning',
      bgColor: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)',
      description: `${statistics.total > 0 ? Math.round((statistics.multipleOffers / statistics.total) * 100) : 0}% of total students`,
      progress: statistics.total > 0 ? (statistics.multipleOffers / statistics.total) * 100 : 0
    },
    {
      title: 'Unplaced Students',
      value: statistics.unplaced,
      icon: <ScheduleIcon />,
      color: 'error',
      bgColor: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
      description: `${unplacedRate}% of total students`,
      progress: unplacedRate
    }
  ];

  return (
    <Box mb={4}>
      {/* Department Header with Staff Info */}
      <Paper
        elevation={3}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          mb: 3,
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            transform: 'translate(50px, -50px)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '150px',
            height: '150px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            transform: 'translate(-50px, 50px)'
          }}
        />
        
        <Grid container spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  mr: 3,
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                <SchoolIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" mb={1}>
                  {department?.name}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Department Code: {department?.code}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <Typography variant="h6" fontWeight="bold" mb={2} color="white">
                Placement Staff
              </Typography>
              {department?.placementStaff ? (
                <Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: '#2196f3',
                        mr: 2,
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        border: '2px solid rgba(255,255,255,0.3)'
                      }}
                    >
                      {department.placementStaff.name ? 
                        department.placementStaff.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase() :
                        'PS'
                      }
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium" color="white">
                        {department.placementStaff.name}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }} color="white">
                        {department.placementStaff.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label="Assigned"
                    size="small"
                    sx={{
                      backgroundColor: '#4caf50',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              ) : (
                <Box textAlign="center">
                  <Typography variant="body1" color="white" mb={1}>
                    No Staff Assigned
                  </Typography>
                  <Chip
                    label="Unassigned"
                    size="small"
                    sx={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Analytics Cards */}
      <Grid container spacing={3} mb={3}>
        {analyticsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: card.bgColor,
                color: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                minHeight: '160px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 80,
                  height: 80,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%'
                }}
              />
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 50,
                      height: 50
                    }}
                  >
                    {card.icon}
                  </Avatar>
                  <Typography variant="h3" fontWeight="bold">
                    {card.value}
                  </Typography>
                </Box>
                
                <Typography variant="h6" fontWeight="medium" mb={1}>
                  {card.title}
                </Typography>
                
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  {card.description}
                </Typography>
                
                {card.progress !== undefined && (
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={card.progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'rgba(255,255,255,0.8)',
                          borderRadius: 3
                        }
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Placement Rate Summary */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          border: '1px solid #e0e0e0'
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                sx={{
                  bgcolor: placementRate >= 70 ? '#4caf50' : placementRate >= 50 ? '#ff9800' : '#f44336',
                  mr: 2,
                  width: 50,
                  height: 50
                }}
              >
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                  Overall Placement Rate
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Department performance overview
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h2" fontWeight="bold" color="primary" mb={1}>
                {placementRate}%
              </Typography>
              <Box display="flex" justifyContent="center" gap={1}>
                <Chip
                  label={`${statistics.placed + statistics.multipleOffers} Placed`}
                  color="success"
                  size="small"
                />
                <Chip
                  label={`${statistics.unplaced} Unplaced`}
                  color="error"
                  size="small"
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Box mt={2}>
          <LinearProgress
            variant="determinate"
            value={placementRate}
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: placementRate >= 70 ? '#4caf50' : placementRate >= 50 ? '#ff9800' : '#f44336',
                borderRadius: 6
              }
            }}
          />
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="caption" color="text.secondary">
              0%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Target: 80%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              100%
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default StudentAnalytics;
