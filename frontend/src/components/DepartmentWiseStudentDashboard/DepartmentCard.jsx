import React from 'react';
import PropTypes from 'prop-types';

// @mui material components
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import Icon from '@mui/material/Icon';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDBadge from 'components/MDBadge';

// Services
import departmentWiseStudentService from 'services/departmentWiseStudentService';

function DepartmentCard({ department, onViewStudents, colorVariant = 'primary' }) {
  const { statistics, placementStaff } = department;
  const formattedStats = departmentWiseStudentService.formatDepartmentStatistics(statistics);

  const handleViewStudents = () => {
    if (onViewStudents) {
      onViewStudents(department);
    }
  };

  const getPlacementRateColor = (rate) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'info';
    if (rate >= 40) return 'warning';
    return 'error';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Department Header */}
        <MDBox display="flex" alignItems="center" mb={2}>
          <MDBox
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="3rem"
            height="3rem"
            borderRadius="50%"
            bgColor={colorVariant}
            color="white"
            mr={2}
          >
            <Icon fontSize="medium">school</Icon>
          </MDBox>
          <MDBox>
            <MDTypography variant="h6" fontWeight="medium" color="text">
              {department.name}
            </MDTypography>
            <MDTypography variant="caption" color="text" fontWeight="regular">
              {department.code}
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* Department Description */}
        {department.description && (
          <MDBox mb={2}>
            <MDTypography variant="body2" color="text" fontWeight="regular">
              {department.description.length > 100 
                ? `${department.description.substring(0, 100)}...` 
                : department.description
              }
            </MDTypography>
          </MDBox>
        )}

        {/* Placement Staff Info */}
        <MDBox mb={2}>
          <MDBox display="flex" alignItems="center" mb={1}>
            <Icon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }}>
              person
            </Icon>
            <MDTypography variant="button" fontWeight="medium" color="text">
              Placement Staff:
            </MDTypography>
          </MDBox>
          {placementStaff ? (
            <MDBox ml={3}>
              <MDTypography variant="body2" color="text" fontWeight="regular">
                {placementStaff.name}
              </MDTypography>
              <MDTypography variant="caption" color="text" fontWeight="regular">
                {placementStaff.email}
              </MDTypography>
            </MDBox>
          ) : (
            <MDBox ml={3}>
              <Chip 
                label="No Staff Assigned" 
                size="small" 
                color="warning" 
                variant="outlined"
              />
            </MDBox>
          )}
        </MDBox>

        {/* Statistics */}
        <MDBox>
          <MDBox display="flex" alignItems="center" mb={1}>
            <Icon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }}>
              analytics
            </Icon>
            <MDTypography variant="button" fontWeight="medium" color="text">
              Student Statistics:
            </MDTypography>
          </MDBox>
          
          <Grid container spacing={1} sx={{ ml: 2 }}>
            <Grid item xs={6}>
              <MDBox textAlign="center" p={1}>
                <MDTypography variant="h4" fontWeight="bold" color={colorVariant}>
                  {formattedStats?.total || 0}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Total Students
                </MDTypography>
              </MDBox>
            </Grid>
            
            <Grid item xs={6}>
              <MDBox textAlign="center" p={1}>
                <MDTypography 
                  variant="h4" 
                  fontWeight="bold" 
                  color={getPlacementRateColor(formattedStats?.placementRate || 0)}
                >
                  {formattedStats?.placementRateText || '0%'}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Placement Rate
                </MDTypography>
              </MDBox>
            </Grid>
            
            <Grid item xs={4}>
              <MDBox textAlign="center" p={0.5}>
                <MDTypography variant="h6" fontWeight="bold" color="success">
                  {formattedStats?.placed || 0}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Placed
                </MDTypography>
              </MDBox>
            </Grid>
            
            <Grid item xs={4}>
              <MDBox textAlign="center" p={0.5}>
                <MDTypography variant="h6" fontWeight="bold" color="warning">
                  {formattedStats?.unplaced || 0}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Unplaced
                </MDTypography>
              </MDBox>
            </Grid>
            
            <Grid item xs={4}>
              <MDBox textAlign="center" p={0.5}>
                <MDTypography variant="h6" fontWeight="bold" color="info">
                  {formattedStats?.multipleOffers || 0}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Multiple
                </MDTypography>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </CardContent>

      <CardActions sx={{ pt: 0, pb: 2, px: 2 }}>
        <MDButton
          variant="gradient"
          color={colorVariant}
          size="small"
          fullWidth
          onClick={handleViewStudents}
          startIcon={<Icon>visibility</Icon>}
        >
          View Students
        </MDButton>
      </CardActions>
    </Card>
  );
}

DepartmentCard.propTypes = {
  department: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    description: PropTypes.string,
    placementStaff: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      email: PropTypes.string,
    }),
    statistics: PropTypes.shape({
      total: PropTypes.number,
      placed: PropTypes.number,
      unplaced: PropTypes.number,
      multipleOffers: PropTypes.number,
    }),
  }).isRequired,
  onViewStudents: PropTypes.func.isRequired,
  colorVariant: PropTypes.oneOf([
    'primary',
    'secondary',
    'info',
    'success',
    'warning',
    'error',
    'dark',
  ]),
};

export default DepartmentCard;
