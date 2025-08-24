import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from '@mui/material';
import { 
  Work as WorkIcon,
  CheckCircle as ActiveIcon,
  Cancel as ExpiredIcon,
  People as ApplicationsIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';

// Material Dashboard 2 React example components
import ComplexStatisticsCard from 'examples/Cards/StatisticsCards/ComplexStatisticsCard';

function JobStatisticsCards({ jobs }) {
  // Calculate statistics from jobs array
  const calculateStatistics = () => {
    if (!jobs || !Array.isArray(jobs)) {
      return {
        totalJobs: 0,
        activeJobs: 0,
        expiredJobs: 0,
        totalApplications: 0,
        totalViews: 0
      };
    }

    const now = new Date();
    let activeJobs = 0;
    let expiredJobs = 0;
    let totalApplications = 0;
    let totalViews = 0;

    jobs.forEach(job => {
      const deadline = new Date(job.deadline);
      
      if (deadline > now && job.status === 'active') {
        activeJobs++;
      } else if (deadline <= now || job.status === 'expired') {
        expiredJobs++;
      }

      // Add applications and views from job stats
      if (job.stats) {
        totalApplications += job.stats.totalApplications || 0;
        totalViews += job.stats.totalViews || 0;
      }
    });

    return {
      totalJobs: jobs.length,
      activeJobs,
      expiredJobs,
      totalApplications,
      totalViews
    };
  };

  const stats = calculateStatistics();

  // Calculate percentages and rates
  const activePercentage = stats.totalJobs > 0 
    ? ((stats.activeJobs / stats.totalJobs) * 100).toFixed(1)
    : 0;

  const applicationRate = stats.totalViews > 0 
    ? ((stats.totalApplications / stats.totalViews) * 100).toFixed(1)
    : 0;

  const expiredPercentage = stats.totalJobs > 0 
    ? ((stats.expiredJobs / stats.totalJobs) * 100).toFixed(1)
    : 0;

  const avgApplicationsPerJob = stats.totalJobs > 0 
    ? (stats.totalApplications / stats.totalJobs).toFixed(1)
    : 0;

  return (
    <MDBox>
      <Grid container spacing={3}>
        {/* Total Jobs */}
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="primary"
            icon={<WorkIcon />}
            title="Total Jobs"
            count={stats.totalJobs}
            percentage={{
              color: stats.activeJobs > stats.expiredJobs ? "success" : "warning",
              amount: `${activePercentage}%`,
              label: "active jobs"
            }}
          />
        </Grid>

        {/* Active Jobs */}
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="success"
            icon={<ActiveIcon />}
            title="Active Jobs"
            count={stats.activeJobs}
            percentage={{
              color: "info",
              amount: `${stats.totalViews}`,
              label: "total views"
            }}
          />
        </Grid>

        {/* Total Applications */}
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="info"
            icon={<ApplicationsIcon />}
            title="Applications"
            count={stats.totalApplications}
            percentage={{
              color: applicationRate > 5 ? "success" : "warning",
              amount: `${applicationRate}%`,
              label: "conversion rate"
            }}
          />
        </Grid>

        {/* Expired Jobs */}
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="warning"
            icon={<ExpiredIcon />}
            title="Expired Jobs"
            count={stats.expiredJobs}
            percentage={{
              color: "error",
              amount: `${avgApplicationsPerJob}`,
              label: "avg per job"
            }}
          />
        </Grid>
      </Grid>
    </MDBox>
  );
}

// Default props
JobStatisticsCards.defaultProps = {
  jobs: [],
};

// Prop types
JobStatisticsCards.propTypes = {
  jobs: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      title: PropTypes.string,
      status: PropTypes.string,
      deadline: PropTypes.string,
      stats: PropTypes.shape({
        totalApplications: PropTypes.number,
        totalViews: PropTypes.number,
      }),
    })
  ),
};

export default JobStatisticsCards;
