import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Grid,
  IconButton,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

// Custom components
import DepartmentBatchesView from 'components/DepartmentStudents/DepartmentBatchesView';

// Services
import departmentWiseStudentService from 'services/departmentWiseStudentService';

const DepartmentBatches = () => {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  
  const [department, setDepartment] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch department batches
  const fetchDepartmentBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await departmentWiseStudentService.getDepartmentBatches(departmentId);
      
      if (response.success) {
        setDepartment(response.data.department);
        setBatches(response.data.batches);
      } else {
        setError(response.message || 'Failed to fetch department batches');
      }
    } catch (error) {
      console.error('Error fetching department batches:', error);
      setError('Failed to fetch department batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (departmentId) {
      fetchDepartmentBatches();
    }
  }, [departmentId]);

  // Handle batch selection
  const handleBatchSelect = (batch) => {
    // Navigate to the batch students page
    navigate(`/department-students/${departmentId}/${batch.id}`);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchDepartmentBatches();
  };

  if (loading && !department) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </MDBox>
      </DashboardLayout>
    );
  }

  if (error && !department) {
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
            onClick={() => navigate('/department-wise-student-dashboard')}
          >
            Back to Dashboard
          </MDButton>
        </MDBox>
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
            <Grid item>
              <IconButton 
                onClick={() => navigate('/department-wise-student-dashboard')}
                sx={{ 
                  mr: 1,
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.08)'
                  }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Grid>
            <Grid item xs>
              <MDTypography variant="h4" fontWeight="medium">
                Batches in {department?.name}
              </MDTypography>
              <MDTypography variant="body2" color="text" mt={1}>
                {department?.placementStaff ? 
                  `Placement Staff: ${department.placementStaff.name} (${department.placementStaff.email})` : 
                  'No Staff Assigned'
                }
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>

        {/* Batches View */}
        <DepartmentBatchesView
          department={department}
          batches={batches}
          loading={loading}
          error={error}
          onBatchSelect={handleBatchSelect}
          onRefresh={handleRefresh}
        />
      </MDBox>
    </DashboardLayout>
  );
};

export default DepartmentBatches;
