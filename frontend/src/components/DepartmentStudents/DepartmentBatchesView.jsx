import React, { useState } from 'react';
import {
  Card,
  IconButton,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  SchoolOutlined as SchoolOutlinedIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDBadge from 'components/MDBadge';
import DataTable from 'examples/Tables/DataTable';



const DepartmentBatchesView = ({ department, batches, loading, error, onBatchSelect, onRefresh, onTransferBatch }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

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

  const handleOpenTransferDialog = (batch) => {
    setSelectedBatch(batch);
    setOpenDialog(true);
  };

  const handleCloseTransferDialog = () => {
    setOpenDialog(false);
    setSelectedBatch(null);
  };

  const handleConfirmTransfer = () => {
    if (onTransferBatch && selectedBatch) {
      onTransferBatch(selectedBatch._id || selectedBatch.id);
    }
    handleCloseTransferDialog();
  };


  const calculateBatchPlacementRate = (batch) => {
    if (!batch || !batch.statistics || batch.statistics.total === 0) return 0;

    const placedCount = (batch.statistics.placed || 0) + (batch.statistics.multipleOffers || 0);
    return Math.round((placedCount / batch.statistics.total) * 100);
  };

  // Table data formatter
  const getBatchTableData = () => {
    // Debug: Log batch data
    if (batches && batches.length > 0) {
      console.log('getBatchTableData - First batch:', batches[0]);
    }

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
            backgroundColor: batch.isActive ? 'info.main' : 'secondary.main',
            color: 'white'
          }}
        >
          <SchoolIcon fontSize="small" />
        </MDBox>
        <MDBox ml={2} lineHeight={1}>
          <MDTypography display="block" variant="button" fontWeight="medium">
            {batch.name || batch.batchCode || 'N/A'}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            {batch.yearRange || (batch.startYear && batch.endYear ? `${batch.startYear}-${batch.endYear}` : 'N/A')}
          </MDTypography>
        </MDBox>
      </MDBox>
    );

    const YearRange = ({ batch }) => (
      <MDBox lineHeight={1} textAlign="left">
        <MDTypography display="block" variant="button" fontWeight="medium">
          {batch.yearRange || (batch.startYear && batch.endYear ? `${batch.startYear}-${batch.endYear}` : 'N/A')}
        </MDTypography>
        <MDTypography variant="caption" color="text">
          {batch.isActive ? 'Active' : 'Inactive'}
        </MDTypography>
      </MDBox>
    );

    const StudentStats = ({ batch }) => (
      <MDBox display="flex" alignItems="center" gap={1}>
        <MDBox textAlign="center">
          <MDTypography variant="h6" fontWeight="bold" color="info">
            {batch.statistics?.total || 0}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            Total
          </MDTypography>
        </MDBox>
        <MDBox textAlign="center">
          <MDTypography variant="h6" fontWeight="bold" color="success">
            {(batch.statistics?.placed || 0) + (batch.statistics?.multipleOffers || 0)}
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
        {!batch.isGraduated && (
          <Tooltip title="Transfer to Alumni">
            <span>
              <IconButton
                size="small"
                onClick={() => handleOpenTransferDialog(batch)}
                disabled={loading}
                color="warning"
              >
                <SchoolOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}
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
    <>
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

      <Dialog
        open={openDialog}
        onClose={handleCloseTransferDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Transfer Batch to Alumni?"}
        </DialogTitle>
        <DialogContent>
          <Typography id="alert-dialog-description">
            Are you sure you want to transfer the batch <strong>{selectedBatch?.name || selectedBatch?.batchCode}</strong> to Alumni?
            <br /><br />
            <strong style={{ color: 'red' }}>⚠️ This action will prevent all students in this batch from applying to any new jobs.</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransferDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmTransfer} color="warning" autoFocus>
            Yes, Transfer to Alumni
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DepartmentBatchesView;
