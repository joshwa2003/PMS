import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// @mui material components
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

// Material Dashboard 2 React example components
import ComplexStatisticsCard from 'examples/Cards/StatisticsCards/ComplexStatisticsCard';

// Dashboard components
import DepartmentCard from './DepartmentCard';

// Services
import departmentWiseStudentService from 'services/departmentWiseStudentService';

// Context
import { useAuth } from 'context/AuthContext';

function DepartmentWiseStudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [overallStats, setOverallStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Check permissions
  const hasPermission = departmentWiseStudentService.hasPermission(user?.role);

  useEffect(() => {
    if (hasPermission) {
      fetchDashboardData();
    }
  }, [hasPermission]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await departmentWiseStudentService.getDepartmentWiseStudents();
      
      if (response.success) {
        setDepartments(response.data.departments || []);
        setOverallStats(response.data.overallStatistics || null);
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleViewStudents = (department) => {
    // Navigate to the dedicated department students page
    navigate(`/department-students/${department.id}`);
  };

  const filteredDepartments = departments.filter(dept => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        dept.name.toLowerCase().includes(searchLower) ||
        dept.code.toLowerCase().includes(searchLower) ||
        (dept.placementStaff?.name.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Department filter (could be used for categories in future)
    if (departmentFilter !== 'all') {
      // This can be extended based on department categories
      return true;
    }

    return true;
  });

  // Permission check
  if (!hasPermission) {
    return (
      <MDBox p={3}>
        <Alert severity="error">
          <MDTypography variant="h6" color="error">
            Access Denied
          </MDTypography>
          <MDTypography variant="body2" color="error">
            You don't have permission to view this dashboard. Only administrators and placement directors can access this page.
          </MDTypography>
        </Alert>
      </MDBox>
    );
  }

  return (
    <MDBox py={3}>
      {/* Header */}
      <MDBox mb={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDBox>
            <MDTypography variant="h3" fontWeight="medium">
              Department-wise Student Dashboard
            </MDTypography>
            <MDTypography variant="body2" color="text">
              {overallStats && departmentWiseStudentService.getSummaryText(overallStats)}
            </MDTypography>
          </MDBox>
          
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <Icon>{refreshing ? 'hourglass_empty' : 'refresh'}</Icon>
            </IconButton>
          </Tooltip>
        </MDBox>

        {/* Filters */}
        <MDBox display="flex" gap={2} mb={3}>
          <TextField
            label="Search departments..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: <Icon sx={{ mr: 1 }}>search</Icon>
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={departmentFilter}
              label="Filter"
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <MenuItem value="all">All Departments</MenuItem>
              <MenuItem value="with-staff">With Staff</MenuItem>
              <MenuItem value="without-staff">Without Staff</MenuItem>
            </Select>
          </FormControl>
        </MDBox>
      </MDBox>

      {/* Overall Statistics */}
      {overallStats && (
        <MDBox mb={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <ComplexStatisticsCard
                color="primary"
                icon="school"
                title="Total Departments"
                count={overallStats.departments?.total || 0}
                percentage={{
                  color: "success",
                  amount: `${overallStats.departments?.active || 0} active`,
                  label: "departments"
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
              <ComplexStatisticsCard
                color="info"
                icon="people"
                title="Total Students"
                count={departmentWiseStudentService.formatNumber(overallStats.students?.total || 0)}
                percentage={{
                  color: "success",
                  amount: `${overallStats.students?.placementRate || 0}%`,
                  label: "placement rate"
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
              <ComplexStatisticsCard
                color="success"
                icon="check_circle"
                title="Placed Students"
                count={overallStats.students?.placed || 0}
                percentage={{
                  color: "info",
                  amount: `${overallStats.students?.multipleOffers || 0}`,
                  label: "multiple offers"
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
              <ComplexStatisticsCard
                color="warning"
                icon="schedule"
                title="Unplaced Students"
                count={overallStats.students?.unplaced || 0}
                percentage={{
                  color: "error",
                  amount: `${overallStats.departments?.withoutStaff || 0}`,
                  label: "depts without staff"
                }}
              />
            </Grid>
          </Grid>
        </MDBox>
      )}

      {/* Loading State */}
      {loading && (
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </MDBox>
      )}

      {/* Error State */}
      {error && (
        <MDBox mb={3}>
          <Alert severity="error">
            <MDTypography variant="body2">
              {error}
            </MDTypography>
            <MDButton 
              variant="outlined" 
              color="error" 
              size="small" 
              onClick={handleRefresh}
              sx={{ mt: 1 }}
            >
              Try Again
            </MDButton>
          </Alert>
        </MDBox>
      )}

      {/* Department Cards */}
      {!loading && !error && (
        <>
          {filteredDepartments.length > 0 ? (
            <Grid container spacing={3}>
              {filteredDepartments.map((department, index) => (
                <Grid item xs={12} sm={6} lg={4} key={department.id}>
                  <DepartmentCard
                    department={department}
                    onViewStudents={handleViewStudents}
                    colorVariant={departmentWiseStudentService.getDepartmentColor(index)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card>
              <MDBox p={3} textAlign="center">
                <Icon fontSize="large" color="disabled" sx={{ mb: 2 }}>
                  search_off
                </Icon>
                <MDTypography variant="h5" color="text" mb={1}>
                  No Departments Found
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  {searchTerm 
                    ? `No departments match your search "${searchTerm}"`
                    : 'No departments are available at the moment'
                  }
                </MDTypography>
                {searchTerm && (
                  <MDButton 
                    variant="outlined" 
                    color="info" 
                    size="small" 
                    onClick={() => setSearchTerm('')}
                    sx={{ mt: 2 }}
                  >
                    Clear Search
                  </MDButton>
                )}
              </MDBox>
            </Card>
          )}
        </>
      )}
    </MDBox>
  );
}

export default DepartmentWiseStudentDashboard;
