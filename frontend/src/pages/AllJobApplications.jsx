import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Grid, 
  Card, 
  CardContent, 
  IconButton, 
  Tooltip, 
  Box,
  Chip
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDAlert from 'components/MDAlert';
import MDBadge from 'components/MDBadge';

// Material Dashboard 2 React example components
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';
import DataTable from 'examples/Tables/DataTable';

// Context
import { useAuth } from 'context/AuthContext';

// Services
import { jobApi } from 'services/jobService';
import { getApplicationStatusColor } from 'services/jobService';

// Components
import LoadingSpinner from 'components/LoadingSpinner';

function AllJobApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [overallStats, setOverallStats] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    department: ''
  });

  // Check permissions
  const canViewApplications = ['admin', 'placement_director', 'placement_staff'].includes(user?.role);

  useEffect(() => {
    if (canViewApplications && jobId) {
      fetchAllApplications();
    }
  }, [jobId, canViewApplications]);

  const fetchAllApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobApi.getJobAnalyticsByDepartment(jobId);
      
      if (response.success) {
        setJobData(response.data.job);
        setApplications(response.data.allApplications);
        setOverallStats(response.data.overallStats);
      } else {
        setError(response.message || 'Failed to fetch applications');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToAnalytics = () => {
    navigate(`/job-monitoring/${jobId}/analytics`);
  };

  const handleViewApplication = (application) => {
    // Navigate to application details or open modal
    console.log('View application:', application);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const getFilteredApplications = () => {
    let filtered = applications;

    if (filters.status) {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    if (filters.department) {
      filtered = filtered.filter(app => app.department._id === filters.department);
    }

    return filtered;
  };

  const getUniqueDepartments = () => {
    const departments = applications.map(app => app.department).filter(Boolean);
    const unique = departments.filter((dept, index, self) => 
      index === self.findIndex(d => d._id === dept._id)
    );
    return unique;
  };

  // Prepare applications table columns
  const applicationColumns = [
    {
      Header: 'Student',
      accessor: 'student',
      Cell: ({ value }) => (
        <MDBox>
          <MDTypography variant="button" fontWeight="medium">
            {value?.personalInfo?.fullName || 'N/A'}
          </MDTypography>
          <MDTypography variant="caption" color="text" display="block">
            {value?.studentId || 'N/A'}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: 'Department',
      accessor: 'department',
      Cell: ({ value }) => (
        <MDBox>
          <MDTypography variant="caption" color="text">
            {value?.name || 'N/A'}
          </MDTypography>
          <MDTypography variant="caption" color="text" display="block">
            {value?.code || 'N/A'}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: 'Email',
      accessor: 'user',
      Cell: ({ value }) => (
        <MDTypography variant="caption" color="text">
          {value?.email || 'N/A'}
        </MDTypography>
      ),
    },
    {
      Header: 'CGPA',
      accessor: 'student.academic.cgpa',
      Cell: ({ value }) => (
        <MDTypography variant="caption" color="text">
          {value || 'N/A'}
        </MDTypography>
      ),
    },
    {
      Header: 'Backlogs',
      accessor: 'student.academic.backlogs',
      Cell: ({ value }) => (
        <MDTypography variant="caption" color="text">
          {value || 'N/A'}
        </MDTypography>
      ),
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ value }) => (
        <MDBadge 
          badgeContent={value} 
          color={getApplicationStatusColor(value)} 
          variant="gradient" 
          size="sm" 
        />
      ),
    },
    {
      Header: 'Applied Date',
      accessor: 'appliedAt',
      Cell: ({ value }) => (
        <MDTypography variant="caption" color="text">
          {value ? new Date(value).toLocaleDateString() : 'Not Applied'}
        </MDTypography>
      ),
    },
    {
      Header: 'Response Date',
      accessor: 'responseAt',
      Cell: ({ value }) => (
        <MDTypography variant="caption" color="text">
          {value ? new Date(value).toLocaleDateString() : 'No Response'}
        </MDTypography>
      ),
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <MDBox display="flex" alignItems="center">
          <Tooltip title="View Application Details">
            <IconButton 
              size="small" 
              onClick={() => handleViewApplication(row.original)}
            >
              <PersonIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
      ),
    },
  ];

  const filteredApplications = getFilteredApplications();
  const uniqueDepartments = getUniqueDepartments();

  // Prepare table data
  const applicationTableData = {
    columns: applicationColumns,
    rows: filteredApplications || [],
  };

  if (!canViewApplications) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDAlert color="error">
            You do not have permission to view job applications.
          </MDAlert>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <LoadingSpinner />
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
          <MDAlert color="error" dismissible onClose={() => setError(null)}>
            {error}
          </MDAlert>
          <MDBox mt={2}>
            <MDButton variant="outlined" color="info" onClick={handleBackToAnalytics}>
              Back to Job Analytics
            </MDButton>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      
      <MDBox py={3}>
        {/* Header */}
        <MDBox mb={3}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <MDBox display="flex" alignItems="center" mb={1}>
                <IconButton onClick={handleBackToAnalytics} sx={{ mr: 1 }}>
                  <ArrowBackIcon />
                </IconButton>
                <MDTypography variant="h4" fontWeight="medium">
                  All Applications
                </MDTypography>
              </MDBox>
              <MDTypography variant="h6" color="text">
                {jobData?.title}
              </MDTypography>
              <MDTypography variant="body2" color="text">
                {jobData?.company} • {jobData?.deadline ? new Date(jobData.deadline).toLocaleDateString() : 'No deadline'}
              </MDTypography>
            </Grid>
            <Grid item xs={12} md={4}>
              <MDBox display="flex" justifyContent="flex-end">
                <MDButton
                  variant="outlined"
                  color="info"
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate(`/job-monitoring/${jobId}/analytics`)}
                >
                  Back to Analytics
                </MDButton>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Overall Statistics */}
        {overallStats && (
          <MDBox mb={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <MDBox display="flex" alignItems="center">
                      <PeopleIcon color="info" sx={{ mr: 2 }} />
                      <MDBox>
                        <MDTypography variant="h6" fontWeight="medium">
                          {overallStats.totalApplications}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Total Applications
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <MDBox display="flex" alignItems="center">
                      <PersonIcon color="success" sx={{ mr: 2 }} />
                      <MDBox>
                        <MDTypography variant="h6" fontWeight="medium" color="success">
                          {overallStats.appliedCount}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Applied
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <MDBox display="flex" alignItems="center">
                      <AssessmentIcon color="warning" sx={{ mr: 2 }} />
                      <MDBox>
                        <MDTypography variant="h6" fontWeight="medium" color="warning">
                          {overallStats.pendingCount}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Pending
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <MDBox display="flex" alignItems="center">
                      <PeopleIcon color="error" sx={{ mr: 2 }} />
                      <MDBox>
                        <MDTypography variant="h6" fontWeight="medium" color="error">
                          {overallStats.notAppliedCount}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Not Applied
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </MDBox>
        )}

        {/* Filters */}
        <MDBox mb={3}>
          <Card>
            <CardContent>
              <MDBox display="flex" alignItems="center" mb={2}>
                <FilterIcon sx={{ mr: 1 }} />
                <MDTypography variant="h6" fontWeight="medium">
                  Filters
                </MDTypography>
              </MDBox>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <MDBox>
                    <MDTypography variant="caption" color="text" display="block" mb={1}>
                      Status
                    </MDTypography>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange({ ...filters, status: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">All Status</option>
                      <option value="Applied">Applied</option>
                      <option value="Not Applied">Not Applied</option>
                      <option value="Pending Response">Pending Response</option>
                    </select>
                  </MDBox>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <MDBox>
                    <MDTypography variant="caption" color="text" display="block" mb={1}>
                      Department
                    </MDTypography>
                    <select
                      value={filters.department}
                      onChange={(e) => handleFilterChange({ ...filters, department: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">All Departments</option>
                      {uniqueDepartments.map(dept => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                  </MDBox>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </MDBox>

        {/* Applications Table */}
        <Card>
          <CardContent>
            <MDBox mb={2}>
              <MDTypography variant="h6" fontWeight="medium">
                All Student Applications
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Showing {filteredApplications.length} of {applications.length} applications
              </MDTypography>
            </MDBox>
            
            <DataTable
              table={applicationTableData}
              showTotalEntries={true}
              isSorted={true}
              noEndBorder={true}
              entriesPerPage={false}
              canSearch={false}
              loading={loading}
            />
          </CardContent>
        </Card>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default AllJobApplications;
