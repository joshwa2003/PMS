/**
=========================================================
* S.A. Engineering College React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 S.A. Engineering College (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";

// S.A. Engineering College React components
import MDBox from "components/MDBox";

// S.A. Engineering College React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import defaultBarChartData, { formatJobPostingData } from "layouts/dashboard/data/reportsBarChartData";
import defaultLineChartData, { formatJobApplicationData, formatActiveStudentsData } from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

// Services
import dashboardService from "services/dashboardService";

function Dashboard() {
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    placedStudents: 0,
    unplacedStudents: 0,
    multipleOffersStudents: 0,
    placementRate: 0,
    totalDepartments: 0,
    activeDepartments: 0,
    loading: true
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [jobStats, setJobStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    applicationRate: 0
  });
  const [jobPostingChartData, setJobPostingChartData] = useState(defaultBarChartData);
  const [jobApplicationChartData, setJobApplicationChartData] = useState(defaultLineChartData.jobApplications);
  const [activeStudentsChartData, setActiveStudentsChartData] = useState(defaultLineChartData.activeStudents);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard summary
        const summaryResponse = await dashboardService.getDashboardSummary();
        if (summaryResponse.success) {
          const { departments, students, jobs } = summaryResponse.data;
          setDashboardData({
            totalStudents: students.total,
            placedStudents: students.placed,
            unplacedStudents: students.unplaced,
            multipleOffersStudents: students.multipleOffers,
            placementRate: students.placementRate,
            totalDepartments: departments.total,
            activeDepartments: departments.active,
            loading: false
          });
          
          // Set job stats from dashboard summary
          setJobStats({
            totalJobs: jobs?.total || 0,
            activeJobs: jobs?.active || 0,
            totalApplications: 0, // We'll update this from job application stats
            applicationRate: 0
          });
        }

        // Fetch recent job postings
        const jobsResponse = await dashboardService.getRecentJobPostings(5);
        if (jobsResponse.success) {
          setRecentJobs(jobsResponse.data.jobs);
        }
        
        // Fetch job application stats specifically
        const appStatsResponse = await dashboardService.getJobApplicationStats();
        if (appStatsResponse.success) {
          // Update application stats from the dedicated endpoint
          setJobStats(prevStats => ({
            ...prevStats,
            totalApplications: appStatsResponse.data.totalApplications || 0,
            applicationRate: appStatsResponse.data.applicationRate || 0
          }));
          
          // Create mock data for job postings chart based on actual jobs
          const mockJobPostingData = {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: { 
              label: "Job Postings", 
              data: [
                jobsResponse.data.jobs.length > 0 ? jobsResponse.data.jobs.length : 0,
                0,
                0,
                0,
                0,
                0,
                0
              ] 
            },
          };
          setJobPostingChartData(mockJobPostingData);
          
          // Use real monthly job application data from the backend
          const jobApplicationData = {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: { 
              label: "Job Applications", 
              data: appStatsResponse.data.monthlyData || Array(12).fill(0)
            },
          };
          setJobApplicationChartData(jobApplicationData);
          
          // Create mock data for active students chart
          const mockActiveStudentsData = {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: { 
              label: "Active Students", 
              data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, dashboardData.totalStudents || 0] 
            },
          };
          setActiveStudentsChartData(mockActiveStudentsData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="work"
                title="Total Jobs"
                count={jobStats.totalJobs}
                percentage={{
                  color: "success",
                  amount: `${jobStats.activeJobs} active`,
                  label: "job postings",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="leaderboard"
                title="Total Students"
                count={dashboardData.totalStudents}
                percentage={{
                  color: "success",
                  amount: `${dashboardData.placementRate}%`,
                  label: "placement rate",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="person"
                title="Placed Students"
                count={dashboardData.placedStudents}
                percentage={{
                  color: "success",
                  amount: `${dashboardData.multipleOffersStudents}`,
                  label: "with multiple offers",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="school"
                title="Departments"
                count={dashboardData.totalDepartments}
                percentage={{
                  color: "success",
                  amount: `${dashboardData.activeDepartments} active`,
                  label: "departments",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="Job Postings"
                  description="Monthly job posting statistics"
                  date="updated today"
                  chart={jobPostingChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Job Applications"
                  description={
                    <>
                      (<strong>{jobStats.applicationRate}%</strong>) application rate
                    </>
                  }
                  date="updated today"
                  chart={jobApplicationChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="Daily Active Students"
                  description="Student activity on the platform"
                  date="updated today"
                  chart={activeStudentsChartData}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <Projects recentJobs={recentJobs} />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <OrdersOverview />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
