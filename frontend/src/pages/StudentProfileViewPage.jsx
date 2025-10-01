import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// MUI
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// MD components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDAlert from 'components/MDAlert';

// Layout
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';

// Services & Components
import studentViewService from 'services/studentViewService';
import ViewOnlyProfileTabs from 'components/StudentProfile/ViewOnlyProfileTabs';
import ProtectedRoute from 'components/ProtectedRoute';

function StudentProfileViewContent() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const s = await studentViewService.getStudentById(studentId);
        setStudent(s);
      } catch (err) {
        setError(err?.message || 'Failed to load student');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

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
                  <Skeleton variant="rectangular" height={300} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
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
            <Grid item>
              <Tooltip title="Back to Student Management">
                <IconButton onClick={() => navigate('/student-management')} color="primary">
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item xs>
              <MDBox>
                <MDTypography variant="h4" fontWeight="medium">
                  {student?.personalInfo?.fullName || student?.fullName || 'Student Profile'}
                </MDTypography>
                <MDTypography variant="button" color="text">
                  ID: {student?.studentId || student?._id}
                </MDTypography>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {error && (
          <MDAlert color="error" dismissible>
            {error}
          </MDAlert>
        )}

        {/* Content */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ViewOnlyProfileTabs student={student} />
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default function StudentProfileViewPage() {
  return (
    <ProtectedRoute requiredRoles={['placement_staff']}>
      <StudentProfileViewContent />
    </ProtectedRoute>
  );
}