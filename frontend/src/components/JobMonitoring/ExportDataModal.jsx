import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Divider,
  Alert
} from '@mui/material';
import {
  GetApp as ExportIcon,
  Description as PdfIcon,
  TableChart as ExcelIcon,
  InsertDriveFile as CsvIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';

function ExportDataModal({ open, job, onClose }) {
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [includeApplications, setIncludeApplications] = useState(true);
  const [includeAnalytics, setIncludeAnalytics] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Handle format change
  const handleFormatChange = (event) => {
    setExportFormat(event.target.value);
  };

  // Handle date range change
  const handleDateChange = (field) => (event) => {
    setDateRange(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Handle export
  const handleExport = async () => {
    if (!job) return;

    setIsExporting(true);
    
    try {
      // Prepare export data
      const exportData = {
        job: {
          id: job._id,
          title: job.title,
          company: job.company?.name,
          location: job.location,
          deadline: job.deadline,
          status: job.status,
          salary: job.salary,
          description: job.description,
          requirements: job.requirements,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt
        },
        exportOptions: {
          format: exportFormat,
          includeApplications,
          includeAnalytics,
          dateRange: dateRange.startDate && dateRange.endDate ? dateRange : null
        }
      };

      // Simulate export process (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `job_${job.title.replace(/\s+/g, '_')}_${timestamp}.${exportFormat}`;

      // Create and download file (mock implementation)
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Close modal after successful export
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      // Handle error (could show error message)
    } finally {
      setIsExporting(false);
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    setExportFormat('csv');
    setDateRange({ startDate: '', endDate: '' });
    setIncludeApplications(true);
    setIncludeAnalytics(false);
    setIsExporting(false);
    onClose();
  };

  // Get format icon
  const getFormatIcon = (format) => {
    switch (format) {
      case 'pdf':
        return <PdfIcon fontSize="small" />;
      case 'excel':
        return <ExcelIcon fontSize="small" />;
      case 'csv':
      default:
        return <CsvIcon fontSize="small" />;
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 600 },
        maxHeight: '90vh',
        bgcolor: 'background.paper',
        boxShadow: 24,
        borderRadius: 2,
        overflow: 'auto'
      }}>
        <MDBox p={4}>
          {/* Header */}
          <MDBox display="flex" alignItems="center" mb={3}>
            <ExportIcon sx={{ mr: 1, color: 'info.main' }} />
            <MDTypography variant="h5" fontWeight="medium">
              Export Job Data
            </MDTypography>
          </MDBox>

          {/* Job Info */}
          {job && (
            <MDBox mb={3}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <MDTypography variant="button" fontWeight="medium">
                  Exporting data for: {job.title}
                </MDTypography>
                <br />
                <MDTypography variant="caption" color="text">
                  {job.company?.name} • {job.location}
                </MDTypography>
              </Alert>
            </MDBox>
          )}

          {/* Export Format */}
          <MDBox mb={3}>
            <FormControl component="fieldset">
              <FormLabel component="legend">
                <MDTypography variant="button" fontWeight="medium" color="text">
                  Export Format
                </MDTypography>
              </FormLabel>
              <RadioGroup
                value={exportFormat}
                onChange={handleFormatChange}
                sx={{ mt: 1 }}
              >
                <FormControlLabel
                  value="csv"
                  control={<Radio size="small" />}
                  label={
                    <MDBox display="flex" alignItems="center">
                      {getFormatIcon('csv')}
                      <MDTypography variant="button" sx={{ ml: 1 }}>
                        CSV (Comma Separated Values)
                      </MDTypography>
                    </MDBox>
                  }
                />
                <FormControlLabel
                  value="excel"
                  control={<Radio size="small" />}
                  label={
                    <MDBox display="flex" alignItems="center">
                      {getFormatIcon('excel')}
                      <MDTypography variant="button" sx={{ ml: 1 }}>
                        Excel Spreadsheet
                      </MDTypography>
                    </MDBox>
                  }
                />
                <FormControlLabel
                  value="pdf"
                  control={<Radio size="small" />}
                  label={
                    <MDBox display="flex" alignItems="center">
                      {getFormatIcon('pdf')}
                      <MDTypography variant="button" sx={{ ml: 1 }}>
                        PDF Report
                      </MDTypography>
                    </MDBox>
                  }
                />
              </RadioGroup>
            </FormControl>
          </MDBox>

          <Divider sx={{ my: 2 }} />

          {/* Date Range */}
          <MDBox mb={3}>
            <MDTypography variant="button" fontWeight="medium" color="text" mb={2} display="block">
              Date Range (Optional)
            </MDTypography>
            <MDBox display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <TextField
                label="Start Date"
                type="date"
                value={dateRange.startDate}
                onChange={handleDateChange('startDate')}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
              <TextField
                label="End Date"
                type="date"
                value={dateRange.endDate}
                onChange={handleDateChange('endDate')}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </MDBox>
          </MDBox>

          {/* Data Options */}
          <MDBox mb={3}>
            <MDTypography variant="button" fontWeight="medium" color="text" mb={2} display="block">
              Include Data
            </MDTypography>
            <FormControl component="fieldset">
              <RadioGroup>
                <FormControlLabel
                  control={
                    <Radio
                      checked={includeApplications}
                      onChange={(e) => setIncludeApplications(e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <MDTypography variant="button">
                      Student Applications
                    </MDTypography>
                  }
                />
                <FormControlLabel
                  control={
                    <Radio
                      checked={includeAnalytics}
                      onChange={(e) => setIncludeAnalytics(e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <MDTypography variant="button">
                      Analytics & Statistics
                    </MDTypography>
                  }
                />
              </RadioGroup>
            </FormControl>
          </MDBox>

          <Divider sx={{ my: 2 }} />

          {/* Actions */}
          <MDBox display="flex" justifyContent="flex-end" gap={2}>
            <MDButton
              variant="outlined"
              color="secondary"
              onClick={handleClose}
              disabled={isExporting}
            >
              Cancel
            </MDButton>
            <MDButton
              variant="gradient"
              color="info"
              onClick={handleExport}
              disabled={isExporting || !job}
              startIcon={<ExportIcon />}
            >
              {isExporting ? 'Exporting...' : 'Export Data'}
            </MDButton>
          </MDBox>
        </MDBox>
      </Box>
    </Modal>
  );
}

// Default props
ExportDataModal.defaultProps = {
  open: false,
  job: null,
  onClose: () => {},
};

// Prop types
ExportDataModal.propTypes = {
  open: PropTypes.bool,
  job: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    company: PropTypes.shape({
      name: PropTypes.string,
    }),
    location: PropTypes.string,
    deadline: PropTypes.string,
    status: PropTypes.string,
    salary: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    description: PropTypes.string,
    requirements: PropTypes.array,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
  onClose: PropTypes.func,
};

export default ExportDataModal;
