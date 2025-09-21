import React from 'react';
import { Modal, Box, Typography, Grid, LinearProgress, Divider } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Visibility as ViewsIcon,
  People as ApplicationsIcon,
  Schedule as TimeIcon,
  Assessment as AnalyticsIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';
import MDProgress from 'components/MDProgress';

const JobAnalyticsModal = ({ open, onClose, job, analytics, loading }) => {
  if (!job) return null;

  // Mock analytics data if not provided
  const analyticsData = analytics || {
    totalViews: job.stats?.totalViews || 0,
    totalApplications: job.stats?.totalApplications || 0,
    uniqueViews: Math.floor((job.stats?.totalViews || 0) * 0.8),
    applicationRate: job.stats?.totalViews > 0
      ? ((job.stats?.totalApplications || 0) / job.stats?.totalViews * 100).toFixed(1)
      : 0,
    dailyViews: [
      { date: '2024-01-01', views: 5 },
      { date: '2024-01-02', views: 8 },
      { date: '2024-01-03', views: 12 },
      { date: '2024-01-04', views: 15 },
      { date: '2024-01-05', views: 10 },
      { date: '2024-01-06', views: 18 },
      { date: '2024-01-07', views: 22 }
    ],
    topDepartments: [
      { name: 'Computer Science', applications: 5 },
      { name: 'Information Technology', applications: 3 },
      { name: 'Electronics', applications: 2 }
    ],
    applicationTimeline: [
      { date: '2024-01-01', count: 1 },
      { date: '2024-01-03', count: 2 },
      { date: '2024-01-05', count: 1 },
      { date: '2024-01-07', count: 1 }
    ]
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getEngagementLevel = (views, applications) => {
    const rate = views > 0 ? (applications / views) * 100 : 0;
    if (rate >= 15) return { level: 'High', color: 'success' };
    if (rate >= 8) return { level: 'Medium', color: 'warning' };
    return { level: 'Low', color: 'error' };
  };

  const engagement = getEngagementLevel(analyticsData.totalViews, analyticsData.totalApplications);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', md: '90%', lg: '80%' },
        maxHeight: '90vh',
        bgcolor: 'background.paper',
        boxShadow: 24,
        borderRadius: 2,
        overflow: 'auto'
      }}>
        <MDBox p={4}>
          {/* Header */}
          <MDBox mb={3}>
            <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <MDBox>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <AnalyticsIcon fontSize="large" color="info" />
                  <MDTypography variant="h4" fontWeight="medium">
                    Job Analytics
                  </MDTypography>
                </MDBox>
                <MDTypography variant="h6" color="text">
                  {job.title}
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  {job.company?.name} • {job.location}
                </MDTypography>
              </MDBox>
              <MDButton variant="outlined" color="secondary" onClick={onClose}>
                Close
              </MDButton>
            </MDBox>
          </MDBox>

          <Divider sx={{ my: 2 }} />

          {loading ? (
            <MDBox display="flex" justifyContent="center" p={4}>
              <MDTypography variant="h6">Loading analytics...</MDTypography>
            </MDBox>
          ) : (
            <>
              {/* Key Metrics */}
              <MDBox mb={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Key Metrics
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <MDBox p={2} sx={{ bgcolor: 'info.50', borderRadius: 2, textAlign: 'center' }}>
                      <ViewsIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
                      <MDTypography variant="h4" color="info" fontWeight="medium">
                        {analyticsData.totalViews}
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        Total Views
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MDBox p={2} sx={{ bgcolor: 'success.50', borderRadius: 2, textAlign: 'center' }}>
                      <ApplicationsIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                      <MDTypography variant="h4" color="success" fontWeight="medium">
                        {analyticsData.totalApplications}
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        Applications
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MDBox p={2} sx={{ bgcolor: 'warning.50', borderRadius: 2, textAlign: 'center' }}>
                      <TrendingUpIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
                      <MDTypography variant="h4" color="warning" fontWeight="medium">
                        {analyticsData.applicationRate}%
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        Conversion Rate
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MDBox p={2} sx={{ bgcolor: `${engagement.color}.50`, borderRadius: 2, textAlign: 'center' }}>
                      <TimeIcon color={engagement.color} sx={{ fontSize: 32, mb: 1 }} />
                      <MDTypography variant="h4" color={engagement.color} fontWeight="medium">
                        {engagement.level}
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        Engagement Level
                      </MDTypography>
                    </MDBox>
                  </Grid>
                </Grid>
              </MDBox>

              <Divider sx={{ my: 2 }} />

              {/* View Statistics */}
              <MDBox mb={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  View Statistics
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <MDBox p={2} sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
                      <MDTypography variant="body2" fontWeight="medium" mb={1}>
                        Unique vs Total Views
                      </MDTypography>
                      <MDBox display="flex" alignItems="center" gap={2}>
                        <MDBox flex={1}>
                          <MDBox display="flex" justifyContent="space-between" mb={1}>
                            <MDTypography variant="caption">Unique Views</MDTypography>
                            <MDTypography variant="caption">{analyticsData.uniqueViews}</MDTypography>
                          </MDBox>
                          <LinearProgress
                            variant="determinate"
                            value={(analyticsData.uniqueViews / analyticsData.totalViews) * 100}
                            color="info"
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </MDBox>
                        <MDBox flex={1}>
                          <MDBox display="flex" justifyContent="space-between" mb={1}>
                            <MDTypography variant="caption">Total Views</MDTypography>
                            <MDTypography variant="caption">{analyticsData.totalViews}</MDTypography>
                          </MDBox>
                          <LinearProgress
                            variant="determinate"
                            value={100}
                            color="secondary"
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </MDBox>
                      </MDBox>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDBox p={2} sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
                      <MDTypography variant="body2" fontWeight="medium" mb={1}>
                        Application Rate
                      </MDTypography>
                      <MDProgress
                        value={parseFloat(analyticsData.applicationRate)}
                        color={engagement.color}
                        variant="gradient"
                        label={`${analyticsData.applicationRate}%`}
                      />
                    </MDBox>
                  </Grid>
                </Grid>
              </MDBox>

              {/* Department Breakdown */}
              {analyticsData.topDepartments && analyticsData.topDepartments.length > 0 && (
                <MDBox mb={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Applications by Department
                  </MDTypography>
                  <MDBox>
                    {analyticsData.topDepartments.map((dept, index) => (
                      <MDBox key={index} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                        <MDTypography variant="body2">{dept.name}</MDTypography>
                        <MDBox display="flex" alignItems="center" gap={2}>
                          <MDTypography variant="body2" color="text">
                            {dept.applications} applications
                          </MDTypography>
                          <MDBox
                            sx={{
                              width: 100,
                              height: 8,
                              bgcolor: 'grey.200',
                              borderRadius: 4,
                              overflow: 'hidden'
                            }}
                          >
                            <MDBox
                              sx={{
                                width: `${(dept.applications / Math.max(...analyticsData.topDepartments.map(d => d.applications))) * 100}%`,
                                height: '100%',
                                bgcolor: 'info.main',
                                borderRadius: 4
                              }}
                            />
                          </MDBox>
                        </MDBox>
                      </MDBox>
                    ))}
                  </MDBox>
                </MDBox>
              )}

              {/* Recent Activity */}
              <MDBox>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Recent Activity
                </MDTypography>
                <MDBox p={2} sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
                  <MDTypography variant="body2" color="text">
                    <strong>Posted:</strong> {formatDate(job.createdAt)}
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    <strong>Last Updated:</strong> {formatDate(job.updatedAt)}
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    <strong>Days Active:</strong> {Math.floor((new Date() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24))} days
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    <strong>Status:</strong> {job.status}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </>
          )}
        </MDBox>
      </Box>
    </Modal>
  );
};

export default JobAnalyticsModal;
