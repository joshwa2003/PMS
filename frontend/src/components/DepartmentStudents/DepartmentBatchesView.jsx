import React from 'react';
import {
  Card,
  Grid,
  IconButton,
  Tooltip,
  Chip,
  Box,
  Typography
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDBadge from 'components/MDBadge';
import DataTable from 'examples/Tables/DataTable';

// Services
import studentManagementService from 'services/studentManagementService';

const DepartmentBatchesView = ({ department, batches, loading, error, onBatchSelect, onRefresh }) => {
  
  const handleViewBatch = (batch) => {
    if (onBatchSelect) {
      onBatchSelect(batch);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  // Helper functions for batch data formatting (reusing from studentManagementService)
  const getBatchStatusColor = (batch) => {
    if (!batch) return 'secondary';
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (batch.isGraduated) return 'success';
    if (batch.endYear < currentYear || (batch.endYear === currentYear && currentMonth > 3)) return 'warning';
    return 'info';
  };

  const formatBatchYear = (batch) => {
    if (!batch) return '';
    return `${batch.startYear}-${batch.endYear}`;
  };

  const getBatchStatusText = (batch) => {
    if (!batch) return 'Unknown';
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (batch.isGraduated) return 'Alumni';
    if (batch.endYear < currentYear || (batch.endYear === currentYear && currentMonth > 3)) return 'Completed';
    return 'Active';
  };

  const calculateBatchPlacementRate = (batch) => {
    if (!batch || !batch.stats || batch.stats.totalStudents === 0) return 0;
    
    const placedCount = (batch.stats.placement?.placed || 0) + (batch.stats.placement?.multipleOffers || 0);
    return Math.round((placedCount / batch.stats.totalStudents) * 100);
  };

  // Table data formatter
  const getBatchTableData = () => {
    const BatchInfo = ({ batch }) => (
      <MDBox display="flex" alignItems="center" lineHeight={1}>
        <MDBox
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="40px"
          height="40px"
          borderRadius="50%"
          sx={{ 
            backgroundColor: `${getBatchStatusColor(batch)}.main`,
            color: 'white'
          }}
        >
          <SchoolIcon fontSize="small" />
        </MDBox>
        <MDBox ml={2} lineHeight={1}>
          <MDTypography display="block" variant="button" fontWeight="medium">
            {batch.batchCode}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            {batch.courseType} • {batch.courseDuration} Years
          </MDTypography>
        </MDBox>
      </MDBox>
    );

    const YearRange = ({ batch }) => (
      <MDBox lineHeight={1} textAlign="left">
        <MDTypography display="block" variant="button" fontWeight="medium">
          {formatBatchYear(batch)}
        </MDTypography>
        <MDTypography variant="caption" color="text">
          {getBatchStatusText(batch)}
        </MDTypography>
      </MDBox>
    );

    const StudentStats = ({ batch }) => (
      <MDBox display="flex" alignItems="center" gap={1}>
        <MDBox textAlign="center">
          <MDTypography variant="h6" fontWeight="bold" color="info">
            {batch.stats?.totalStudents || 0}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            Total
          </MDTypography>
        </MDBox>
        <MDBox textAlign="center">
          <MDTypography variant="h6" fontWeight="bold" color="success">
            {(batch.stats?.placement?.placed || 0) + (batch.stats?.placement?.multipleOffers || 0)}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            Placed
          </MDTypography>
        </MDBox>
      </MDBox>
    );

    const PlacementRate = ({ batch }) => {
      const rate = calculateBatchPlacementRate(batch);
      const color = rate >= 80 ? 'success' : rate >= 60 ? 'warning' : rate >= 40 ? 'info' : 'error';
      
      return (
        <MDBox textAlign="center">
          <MDBadge 
            badgeContent={`${rate}%`} 
            color={color} 
            variant="gradient" 
            size="lg" 
          />
        </MDBox>
      );
    };

    const Actions = ({ batch }) => (
      <MDBox display="flex" alignItems="center" gap={0.5}>
        <Tooltip title="View Students">
          <span>
            <IconButton
              size="small"
              onClick={() => handleViewBatch(batch)}
              disabled={loading}
              color="info"
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </MDBox>
    );

    return {
      columns: [
        { Header: "batch", accessor: "batch", width: "30%", align: "left" },
        { Header: "year range", accessor: "yearRange", align: "left" },
        { Header: "students", accessor: "students", align: "center" },
        { Header: "placement rate", accessor: "placementRate", align: "center" },
        { Header: "actions", accessor: "actions", align: "center" },
      ],

      rows: batches.map((batch) => ({
        batch: <BatchInfo batch={batch} />,
        yearRange: <YearRange batch={batch} />,
        students: <StudentStats batch={batch} />,
        placementRate: <PlacementRate batch={batch} />,
        actions: <Actions batch={batch} />,
      })),
    };
  };

  return (
    <Card>
      <MDBox p={3}>
        {/* Header */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDBox>
            <MDTypography variant="h6" fontWeight="medium">
              Batch Years
            </MDTypography>
            <MDTypography variant="body2" color="text">
              {batches.length} batch{batches.length !== 1 ? 'es' : ''} found in {department?.name}
            </MDTypography>
          </MDBox>
          <MDBox display="flex" gap={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </MDBox>
        </MDBox>

        {/* Error Display */}
        {error && (
          <MDBox mb={3}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </MDBox>
        )}

        {/* Data Table */}
        {batches.length > 0 ? (
          <DataTable
            table={getBatchTableData()}
            isSorted={false}
            entriesPerPage={false}
            showTotalEntries={false}
            noEndBorder
            canSearch={false}
          />
        ) : (
          <MDBox textAlign="center" py={4}>
            <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <MDTypography variant="h6" color="text">
              {loading ? 'Loading batches...' : 'No batches found'}
            </MDTypography>
            <MDTypography variant="body2" color="text">
              {loading 
                ? 'Please wait while we fetch the batch information.'
                : `No batch years are available for ${department?.name || 'this department'}.`
              }
            </MDTypography>
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
};

export default DepartmentBatchesView;
