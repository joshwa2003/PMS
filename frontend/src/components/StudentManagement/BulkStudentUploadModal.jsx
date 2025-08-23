import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDAvatar from 'components/MDAvatar';
import MDBadge from 'components/MDBadge';
import DataTable from 'examples/Tables/DataTable';
import { useStudentManagement } from 'context/StudentManagementContext';

const BulkStudentUploadModal = ({ open, onClose, onSuccess }) => {
  const { createBulkStudents, loading } = useStudentManagement();
  
  const [dragActive, setDragActive] = useState(false);
  const [uploadedData, setUploadedData] = useState([]);
  const [validationResults, setValidationResults] = useState([]);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Processing
  const [uploadProgress, setUploadProgress] = useState(0);

  // Batch selection state
  const [batchData, setBatchData] = useState({
    joiningYear: new Date().getFullYear(),
    courseType: 'UG'
  });


  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!['xlsx', 'xls', 'csv'].includes(fileExtension)) {
      alert('Please upload an Excel (.xlsx, .xls) or CSV (.csv) file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          alert('The uploaded file is empty or has no data');
          return;
        }

        // Validate and process data
        const processedData = processExcelData(jsonData);
        setUploadedData(processedData.validData);
        setValidationResults(processedData.validationResults);
        setStep(2);
      } catch (error) {
        console.error('Error reading file:', error);
        alert('Error reading file. Please make sure it\'s a valid Excel or CSV file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processExcelData = (data) => {
    const validData = [];
    const validationResults = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // Excel row number (accounting for header)
      const errors = [];
      const warnings = [];

      // Validate required fields (First Name, Last Name, and Email)
      if (!row['First Name']?.trim()) errors.push('First Name is required');
      if (!row['Last Name']?.trim()) errors.push('Last Name is required');
      if (!row['Email']?.trim()) errors.push('Email is required');

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (row['Email'] && !emailRegex.test(row['Email'].trim())) {
        errors.push('Invalid email format');
      }

      const processedRow = {
        firstName: row['First Name']?.trim() || '',
        lastName: row['Last Name']?.trim() || '',
        email: row['Email']?.trim() || ''
      };

      validationResults.push({
        rowNumber,
        data: processedRow,
        errors,
        warnings,
        isValid: errors.length === 0
      });

      if (errors.length === 0) {
        validData.push(processedRow);
      }
    });

    return { validData, validationResults };
  };

  // Calculate batch code based on joining year and course type
  const calculateBatchCode = (joiningYear, courseType) => {
    const courseDurations = {
      'UG': 4,
      'PG': 2,
      'Diploma': 3,
      'Certificate': 1
    };
    
    const duration = courseDurations[courseType] || 4;
    const endYear = joiningYear + duration;
    return `${joiningYear}-${endYear}`;
  };

  const handleBatchDataChange = (field) => (event) => {
    const value = event.target.value;
    setBatchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Generate year options (current year - 5 to current year + 2)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 5; year <= currentYear + 2; year++) {
      years.push(year);
    }
    return years;
  };

  const handleBulkUpload = async () => {
    if (uploadedData.length === 0) {
      alert('No valid data to upload');
      return;
    }

    setStep(3);
    setUploadProgress(0);

    let progressInterval;

    try {
      // Simulate progress for better UX
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Include batch data with student data
      const uploadDataWithBatch = {
        studentData: uploadedData,
        batchInfo: {
          joiningYear: batchData.joiningYear,
          courseType: batchData.courseType,
          batchCode: calculateBatchCode(batchData.joiningYear, batchData.courseType)
        }
      };

      console.log('🔍 Frontend: Uploading student data with batch:', uploadDataWithBatch);
      
      const response = await createBulkStudents(uploadDataWithBatch);
      console.log('✅ Frontend: Upload response:', response);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Show success message with details
      const successMessage = response.results 
        ? `Successfully created ${response.results.totalSuccessful} students. ${response.results.totalFailed > 0 ? `${response.results.totalFailed} failed.` : ''} Welcome emails are being sent in the background.`
        : 'Students created successfully! Welcome emails are being sent in the background.';

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(response);
        }
        
        // Show detailed results if there were any failures
        if (response.results && response.results.totalFailed > 0) {
          const failedDetails = response.results.failed.map(f => `Row ${f.index}: ${f.error}`).join('\n');
          alert(`${successMessage}\n\nFailed entries:\n${failedDetails}`);
        } else {
          alert(successMessage);
        }
        
        handleClose();
      }, 1000);

    } catch (error) {
      console.error('❌ Frontend: Bulk upload error:', error);
      console.error('❌ Frontend: Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: error.request ? 'Request made but no response' : 'No request made'
      });
      
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setStep(2); // Go back to preview step
      
      // More specific error handling
      let errorMessage = 'Error uploading student data. Please try again.';
      let showDetailedError = false;
      
      if (error.message && error.message.includes('timeout')) {
        errorMessage = 'Upload is taking longer than expected. This might be due to email sending. Please check if students were created and try again if needed.';
      } else if (error.response) {
        // Server responded with error status
        console.log('🔍 Frontend: Server response error:', error.response.data);
        
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to create students.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid data provided.';
          
          // Log additional debugging info for 400 errors
          console.log('🔍 Frontend: 400 Error details:', {
            receivedKeys: error.response.data?.receivedKeys,
            receivedType: error.response.data?.receivedType,
            isArray: error.response.data?.isArray,
            dataType: error.response.data?.dataType,
            length: error.response.data?.length
          });
          
          // Check if there are detailed results in the error response
          if (error.response.data?.results) {
            showDetailedError = true;
            const results = error.response.data.results;
            errorMessage += `\n\nResults: ${results.totalSuccessful} successful, ${results.totalFailed} failed.`;
            
            if (results.failed && results.failed.length > 0) {
              const failedDetails = results.failed.slice(0, 5).map(f => `Row ${f.index}: ${f.error}`).join('\n');
              errorMessage += `\n\nFirst few errors:\n${failedDetails}`;
              if (results.failed.length > 5) {
                errorMessage += `\n... and ${results.failed.length - 5} more errors.`;
              }
            }
          }
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.response.data?.message || 'An error occurred while uploading student data.';
        }
      } else if (error.request) {
        // Network error or timeout
        console.log('🔍 Frontend: Network error - no response received');
        errorMessage = 'Network error or timeout. The upload might still be processing. Please check your connection and refresh the page to see if students were created.';
      } else if (error.message) {
        // Error from our service layer
        console.log('🔍 Frontend: Service layer error:', error.message);
        errorMessage = error.message;
      } else {
        // Other error
        console.log('🔍 Frontend: Unknown error type');
        errorMessage = 'An unexpected error occurred.';
      }
      
      alert(errorMessage);
      
      // If some students were created successfully, refresh the data
      if (showDetailedError && error.response.data?.results?.totalSuccessful > 0) {
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(error.response.data);
          }
        }, 2000);
      }
    }
  };

  const handleDownloadTemplate = () => {
    // Create sample data for the template
    const sampleData = [
      {
        'First Name': 'John',
        'Last Name': 'Doe',
        'Email': 'john.doe@example.com'
      },
      {
        'First Name': 'Jane',
        'Last Name': 'Smith',
        'Email': 'jane.smith@example.com'
      }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(sampleData);

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    // Generate and download the file
    XLSX.writeFile(workbook, 'student_upload_template.xlsx');
  };

  const handleClose = () => {
    setStep(1);
    setUploadedData([]);
    setValidationResults([]);
    setUploadProgress(0);
    setDragActive(false);
    // Reset batch data to defaults
    setBatchData({
      joiningYear: new Date().getFullYear(),
      courseType: 'UG'
    });
    onClose();
  };

  // Table data formatter for bulk upload preview
  const getBulkUploadTableData = () => {
    const defaultAvatar = "https://ui-avatars.com/api/?name=";

    const StudentMember = ({ name, email, rowNumber }) => (
      <MDBox display="flex" alignItems="center" lineHeight={1}>
        <MDAvatar 
          src={`${defaultAvatar}${encodeURIComponent(name || 'Student')}&size=40&background=4CAF50&color=ffffff`} 
          name={name} 
          size="sm" 
        />
        <MDBox ml={2} lineHeight={1}>
          <MDTypography display="block" variant="button" fontWeight="medium">
            {name}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            {email}
          </MDTypography>
          <MDTypography variant="caption" color="text" display="block">
            Row: {rowNumber}
          </MDTypography>
        </MDBox>
      </MDBox>
    );

    const Contact = ({ email }) => (
      <MDBox lineHeight={1} textAlign="left">
        <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
          {email}
        </MDTypography>
      </MDBox>
    );

    const getStatusBadge = (result) => {
      let badgeContent, color;
      
      if (result.errors.length > 0) {
        badgeContent = "error";
        color = "error";
      } else if (result.warnings.length > 0) {
        badgeContent = "warning";
        color = "warning";
      } else {
        badgeContent = "valid";
        color = "success";
      }

      return (
        <MDBox ml={-1}>
          <MDBadge 
            badgeContent={badgeContent} 
            color={color} 
            variant="gradient" 
            size="sm" 
          />
        </MDBox>
      );
    };

    const Issues = ({ result }) => (
      <MDBox>
        {result.errors.length === 0 && result.warnings.length === 0 ? (
          <MDTypography variant="caption" color="success" fontWeight="medium">
            No Issues
          </MDTypography>
        ) : (
          <MDBox>
            {result.errors.map((error, i) => (
              <Chip key={`error-${i}`} label={error} color="error" size="small" sx={{ mr: 0.5, mb: 0.5 }} />
            ))}
            {result.warnings.map((warning, i) => (
              <Chip key={`warning-${i}`} label={warning} color="warning" size="small" sx={{ mr: 0.5, mb: 0.5 }} />
            ))}
          </MDBox>
        )}
      </MDBox>
    );

    return {
      columns: [
        { Header: "student", accessor: "student", width: "35%", align: "left" },
        { Header: "contact", accessor: "contact", align: "left" },
        { Header: "status", accessor: "status", align: "center" },
        { Header: "issues", accessor: "issues", align: "left" },
      ],

      rows: validationResults.map((result, index) => ({
        student: (
          <StudentMember
            name={`${result.data.firstName} ${result.data.lastName}`}
            email={result.data.email}
            rowNumber={result.rowNumber}
          />
        ),
        contact: (
          <Contact
            email={result.data.email}
          />
        ),
        status: getStatusBadge(result),
        issues: <Issues result={result} />,
      })),
    };
  };

  const validCount = validationResults.filter(r => r.isValid).length;
  const errorCount = validationResults.filter(r => r.errors.length > 0).length;
  const warningCount = validationResults.filter(r => r.warnings.length > 0 && r.errors.length === 0).length;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { 
          minHeight: '80vh',
          borderRadius: '16px'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h5" fontWeight="medium">
            Bulk Student Upload
          </MDTypography>
          <IconButton onClick={handleClose} sx={{ minWidth: 'auto', p: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {step === 1 && (
          <Box>
            {/* Batch Selection Section */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
              <MDBox display="flex" alignItems="center" mb={2}>
                <SchoolIcon sx={{ color: '#4CAF50', mr: 1 }} />
                <MDTypography variant="h6" fontWeight="medium">
                  Batch Information
                </MDTypography>
              </MDBox>
              
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Joining Year</InputLabel>
                    <Select
                      value={batchData.joiningYear}
                      onChange={handleBatchDataChange('joiningYear')}
                      label="Joining Year"
                    >
                      {generateYearOptions().map(year => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Course Type</InputLabel>
                    <Select
                      value={batchData.courseType}
                      onChange={handleBatchDataChange('courseType')}
                      label="Course Type"
                    >
                      <MenuItem value="UG">UG (4 Years)</MenuItem>
                      <MenuItem value="PG">PG (2 Years)</MenuItem>
                      <MenuItem value="Diploma">Diploma (3 Years)</MenuItem>
                      <MenuItem value="Certificate">Certificate (1 Year)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, backgroundColor: '#e8f5e8', textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Generated Batch
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {calculateBatchCode(batchData.joiningYear, batchData.courseType)} {batchData.courseType}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  All students in the uploaded file will be assigned to the <strong>{calculateBatchCode(batchData.joiningYear, batchData.courseType)} {batchData.courseType}</strong> batch.
                </Typography>
              </Alert>
            </Paper>

            {/* Download Template Button */}
            <Box display="flex" justifyContent="center" mb={3}>
              <MDButton
                variant="outlined"
                color="info"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadTemplate}
              >
                Download Sample Template
              </MDButton>
            </Box>

            {/* Upload Instructions */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="medium" mb={1}>
                Upload Instructions:
              </Typography>
              <Typography variant="body2" component="div">
                • Select the batch information above first<br/>
                • Download the sample template to get started<br/>
                • Upload an Excel (.xlsx, .xls) or CSV file with student data<br/>
                • Required columns: First Name, Last Name, Email<br/>
                • Make sure all email addresses are valid and unique<br/>
                • Students will receive welcome emails with login credentials
              </Typography>
            </Alert>

            {/* File Upload Area */}
            <Paper
              sx={{
                border: `2px dashed ${dragActive ? '#4CAF50' : '#ccc'}`,
                borderRadius: '12px',
                p: 4,
                textAlign: 'center',
                backgroundColor: dragActive ? '#f0fff4' : '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <UploadIcon sx={{ fontSize: 48, color: '#4CAF50', mb: 2 }} />
              <Typography variant="h6" mb={1}>
                Drag and drop your Excel file here
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                or click to browse files
              </Typography>
              <MDButton variant="outlined" color="success">
                Choose File
              </MDButton>
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
            </Paper>
          </Box>
        )}

        {step === 2 && (
          <Box>
            {/* Validation Summary */}
            <Box display="flex" gap={2} mb={3}>
              <Chip 
                icon={<CheckIcon />} 
                label={`${validCount} Valid`} 
                color="success" 
                variant="outlined" 
              />
              <Chip 
                icon={<ErrorIcon />} 
                label={`${errorCount} Errors`} 
                color="error" 
                variant="outlined" 
              />
              <Chip 
                icon={<WarningIcon />} 
                label={`${warningCount} Warnings`} 
                color="warning" 
                variant="outlined" 
              />
            </Box>

            {/* Data Preview using same table structure as main Student Management */}
            <Typography variant="h6" mb={2}>Data Preview:</Typography>
            
            {/* Green Header Bar - same as main table */}
            <MDBox
              mx={0}
              mt={2}
              py={3}
              px={2}
              variant="gradient"
              bgColor="success"
              borderRadius="lg"
              coloredShadow="success"
            >
              <MDBox display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6" color="white">
                  Student Data Preview
                </MDTypography>
              </MDBox>
            </MDBox>

            <MDBox pt={3}>
              <DataTable
                table={getBulkUploadTableData()}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries={false}
                noEndBorder
                canSearch={false}
              />
            </MDBox>

            {errorCount > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {errorCount} rows have errors and will be skipped. Only {validCount} valid records will be imported.
              </Alert>
            )}
          </Box>
        )}

        {step === 3 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" mb={3}>
              Uploading Student Data...
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              sx={{ mb: 2, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary">
              {uploadProgress}% Complete
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        {step === 1 && (
          <Button 
            onClick={handleClose} 
            variant="outlined"
            sx={{ 
              color: '#4CAF50', 
              borderColor: '#4CAF50',
              '&:hover': {
                backgroundColor: '#f0fff4',
                borderColor: '#4CAF50'
              }
            }}
          >
            Cancel
          </Button>
        )}
        
        {step === 2 && (
          <>
            <Button 
              onClick={() => setStep(1)} 
              variant="outlined"
              sx={{ 
                color: '#4CAF50', 
                borderColor: '#4CAF50',
                '&:hover': {
                  backgroundColor: '#f0fff4',
                  borderColor: '#4CAF50'
                }
              }}
            >
              Back
            </Button>
            <MDButton
              variant="gradient"
              color="success"
              onClick={handleBulkUpload}
              disabled={validCount === 0 || loading}
            >
              Add {validCount} Students
            </MDButton>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkStudentUploadModal;
