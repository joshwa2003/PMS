import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// @mui material components
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';

// @mui icons
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoIcon from '@mui/icons-material/Info';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

// Services
import staffService from 'services/staffService';

// Utility libraries
import * as XLSX from 'xlsx';

const BulkStaffUpload = ({ open, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [departments, setDepartments] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      fetchDepartments();
    }
  }, [open]);

  const fetchDepartments = async () => {
    try {
      const availableDepartments = await staffService.getAvailableDepartments();
      setDepartments(availableDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadResults(null);
      setValidationErrors([]);
      setShowResults(false);
      parseExcelFile(selectedFile);
    }
  };

  const parseExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          setValidationErrors(['Excel file must contain at least a header row and one data row']);
          return;
        }

        const headers = jsonData[0];
        const expectedHeaders = [
          'First Name',
          'Last Name', 
          'Department',
          'Email',
          'Phone',
          'Employee ID',
          'Designation',
          'Admin Notes'
        ];

        // Validate headers
        const headerErrors = [];
        expectedHeaders.slice(0, 4).forEach((header, index) => {
          if (!headers[index] || !headers[index].toString().toLowerCase().includes(header.toLowerCase())) {
            headerErrors.push(`Column ${index + 1} should be "${header}"`);
          }
        });

        if (headerErrors.length > 0) {
          setValidationErrors([
            'Invalid Excel format. Please use the correct template.',
            ...headerErrors
          ]);
          return;
        }

        // Parse data rows
        const staffData = [];
        const errors = [];
        const validDepartmentCodes = departments.map(dept => dept.code);

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row.length === 0 || !row[0]) continue; // Skip empty rows

          const staffMember = {
            firstName: row[0]?.toString().trim(),
            lastName: row[1]?.toString().trim(),
            department: row[2]?.toString().trim().toUpperCase(),
            email: row[3]?.toString().trim().toLowerCase(),
            phone: row[4]?.toString().trim(),
            employeeId: row[5]?.toString().trim(),
            designation: row[6]?.toString().trim(),
            adminNotes: row[7]?.toString().trim()
          };

          // Validate required fields
          const rowErrors = [];
          if (!staffMember.firstName) rowErrors.push('First Name is required');
          if (!staffMember.lastName) rowErrors.push('Last Name is required');
          if (!staffMember.email) rowErrors.push('Email is required');
          if (!staffMember.department) rowErrors.push('Department is required');

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (staffMember.email && !emailRegex.test(staffMember.email)) {
            rowErrors.push('Invalid email format');
          }

          // Validate department code
          if (staffMember.department && !validDepartmentCodes.includes(staffMember.department)) {
            rowErrors.push(`Invalid department code. Valid codes: ${validDepartmentCodes.join(', ')}`);
          }

          // Validate phone number
          if (staffMember.phone) {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(staffMember.phone)) {
              rowErrors.push('Phone must be 10 digits');
            }
          }

          if (rowErrors.length > 0) {
            errors.push({
              row: i + 1,
              data: staffMember,
              errors: rowErrors
            });
          } else {
            staffData.push({
              ...staffMember,
              row: i + 1
            });
          }
        }

        setPreviewData(staffData);
        setValidationErrors(errors);
        setShowPreview(true);

      } catch (error) {
        console.error('Error parsing Excel file:', error);
        setValidationErrors(['Error reading Excel file. Please ensure it is a valid Excel file.']);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (!previewData.length) return;

    setUploading(true);
    try {
      // Remove row numbers from data before sending
      const cleanedData = previewData.map(({ row, ...staff }) => staff);
      
      const response = await staffService.createBulkStaff(cleanedData);
      setUploadResults(response.results);
      setShowResults(true);
      
      if (response.results.successCount > 0) {
        onSuccess && onSuccess(response.results);
      }
    } catch (error) {
      console.error('Error uploading staff:', error);
      setValidationErrors([error.message || 'Failed to upload staff data']);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const templateData = await staffService.generateExcelTemplate();
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create main sheet with headers and sample data
      const wsData = [
        templateData.headers,
        ...templateData.sampleData
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Add validation notes sheet
      const notesData = [
        ['Validation Notes'],
        ...templateData.validationNotes.map(note => [note])
      ];
      const notesWs = XLSX.utils.aoa_to_sheet(notesData);
      
      XLSX.utils.book_append_sheet(wb, ws, 'Staff Template');
      XLSX.utils.book_append_sheet(wb, notesWs, 'Instructions');
      
      // Download file
      XLSX.writeFile(wb, 'staff_bulk_upload_template.xlsx');
    } catch (error) {
      console.error('Error generating template:', error);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setValidationErrors([]);
    setUploadResults(null);
    setShowPreview(false);
    setShowResults(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const getStatusColor = (success) => success ? 'success' : 'error';
  const getStatusIcon = (success) => success ? <CheckCircleIcon /> : <ErrorIcon />;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <CloudUploadIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="span">
            Bulk Staff Upload
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <MDBox>
          {/* Instructions */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                Two-Phase Staff Creation Process:
              </Typography>
              <Typography variant="body2" component="div">
                1. Upload staff data with department validation (no emails sent)<br/>
                2. Assign roles individually or in bulk to trigger welcome emails<br/>
                3. Use the Departments section to manage staff by department
              </Typography>
            </Box>
          </Alert>

          {/* Template Download */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Step 1: Download Template
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Download the Excel template with current department codes
              </Typography>
            </Box>
            <MDButton
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
            >
              Download Template
            </MDButton>
          </Box>

          {/* File Upload */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Step 2: Upload Filled Template
            </Typography>
            <Box
              sx={{
                border: '2px dashed',
                borderColor: file ? 'success.main' : 'grey.300',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: file ? 'success.50' : 'grey.50',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50'
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
              />
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                {file ? file.name : 'Click to select Excel file'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported formats: .xlsx, .xls
              </Typography>
            </Box>
          </Box>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Box mb={3}>
              <Alert severity="error">
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  Validation Errors:
                </Typography>
                {validationErrors.map((error, index) => (
                  <Typography key={index} variant="body2" component="div">
                    {typeof error === 'string' ? error : (
                      <>Row {error.row}: {error.errors.join(', ')}</>
                    )}
                  </Typography>
                ))}
              </Alert>
            </Box>
          )}

          {/* Preview Data */}
          {showPreview && previewData.length > 0 && (
            <Box mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Preview Data ({previewData.length} valid records)
                </Typography>
                <IconButton
                  onClick={() => setShowPreview(!showPreview)}
                  size="small"
                >
                  {showPreview ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              <Collapse in={showPreview}>
                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Employee ID</TableCell>
                        <TableCell>Designation</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewData.slice(0, 10).map((staff, index) => (
                        <TableRow key={index}>
                          <TableCell>{staff.firstName} {staff.lastName}</TableCell>
                          <TableCell>{staff.email}</TableCell>
                          <TableCell>
                            <Chip label={staff.department} size="small" color="primary" />
                          </TableCell>
                          <TableCell>{staff.phone}</TableCell>
                          <TableCell>{staff.employeeId}</TableCell>
                          <TableCell>{staff.designation}</TableCell>
                        </TableRow>
                      ))}
                      {previewData.length > 10 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography variant="body2" color="text.secondary">
                              ... and {previewData.length - 10} more records
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Collapse>
            </Box>
          )}

          {/* Upload Progress */}
          {uploading && (
            <Box mb={3}>
              <Typography variant="body2" gutterBottom>
                Uploading staff data...
              </Typography>
              <LinearProgress />
            </Box>
          )}

          {/* Upload Results */}
          {showResults && uploadResults && (
            <Box mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Upload Results
                </Typography>
                <Box display="flex" gap={1}>
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={`${uploadResults.successCount} Success`}
                    color="success"
                    size="small"
                  />
                  <Chip
                    icon={<ErrorIcon />}
                    label={`${uploadResults.failureCount} Failed`}
                    color="error"
                    size="small"
                  />
                </Box>
              </Box>

              {uploadResults.failedStaff?.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Failed Records:
                  </Typography>
                  {uploadResults.failedStaff.slice(0, 5).map((failed, index) => (
                    <Typography key={index} variant="body2" component="div">
                      Row {failed.rowNumber}: {failed.error}
                    </Typography>
                  ))}
                  {uploadResults.failedStaff.length > 5 && (
                    <Typography variant="body2" color="text.secondary">
                      ... and {uploadResults.failedStaff.length - 5} more errors
                    </Typography>
                  )}
                </Alert>
              )}

              {uploadResults.successCount > 0 && (
                <Alert severity="success">
                  <Typography variant="body2">
                    Successfully created {uploadResults.successCount} staff members. 
                    You can now assign roles to trigger welcome emails in the Departments section.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </MDBox>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <MDButton
          variant="outlined"
          color="secondary"
          onClick={handleClose}
        >
          Close
        </MDButton>
        
        {previewData.length > 0 && validationErrors.length === 0 && !showResults && (
          <MDButton
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={uploading}
            startIcon={<CloudUploadIcon />}
          >
            {uploading ? 'Uploading...' : `Upload ${previewData.length} Staff Members`}
          </MDButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

BulkStaffUpload.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default BulkStaffUpload;
