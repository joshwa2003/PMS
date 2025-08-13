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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDAvatar from 'components/MDAvatar';
import MDBadge from 'components/MDBadge';
import DataTable from 'examples/Tables/DataTable';
import { useStaffManagement } from 'context/StaffManagementContext';

const BulkStaffUploadModal = ({ open, onClose, onSuccess }) => {
  const { createBulkStaff, loading } = useStaffManagement();
  
  const [dragActive, setDragActive] = useState(false);
  const [uploadedData, setUploadedData] = useState([]);
  const [validationResults, setValidationResults] = useState([]);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Processing
  const [uploadProgress, setUploadProgress] = useState(0);

  // Expected Excel columns (only first 3 are required)
  const expectedColumns = [
    'First Name',
    'Last Name', 
    'Email',
    'Role',
    'Department',
    'Designation',
    'Employee ID',
    'Phone'
  ];

  const roleMapping = {
    'Department HOD': 'department_hod',
    'Placement Staff': 'placement_staff',
    'Other Staff': 'other_staff'
  };

  const departmentMapping = {
    'Computer Science Engineering': 'CSE',
    'Electronics & Communication Engineering': 'ECE',
    'Electrical & Electronics Engineering': 'EEE',
    'Mechanical Engineering': 'MECH',
    'Civil Engineering': 'CIVIL',
    'Information Technology': 'IT',
    'Administration': 'ADMIN',
    'Human Resources': 'HR',
    'Other': 'OTHER'
  };

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

      // Validate required fields (only First Name, Last Name, and Email)
      if (!row['First Name']?.trim()) errors.push('First Name is required');
      if (!row['Last Name']?.trim()) errors.push('Last Name is required');
      if (!row['Email']?.trim()) errors.push('Email is required');

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (row['Email'] && !emailRegex.test(row['Email'].trim())) {
        errors.push('Invalid email format');
      }

      // Validate phone number (if provided)
      if (row['Phone'] && !/^[0-9]{10}$/.test(row['Phone'].toString().trim())) {
        warnings.push('Phone number should be 10 digits');
      }

      // Map role and department (optional fields)
      const mappedRole = row['Role'] ? (roleMapping[row['Role']] || row['Role']?.toLowerCase().replace(/\s+/g, '_')) : 'other_staff';
      const mappedDepartment = row['Department'] ? (departmentMapping[row['Department']] || row['Department']) : 'OTHER';

      // Only validate role if provided
      if (row['Role'] && mappedRole && !['department_hod', 'placement_staff', 'other_staff'].includes(mappedRole)) {
        errors.push('Invalid role. Must be: Department HOD, Placement Staff, or Other Staff');
      }

      const processedRow = {
        firstName: row['First Name']?.trim() || '',
        lastName: row['Last Name']?.trim() || '',
        email: row['Email']?.trim() || '',
        role: mappedRole || '',
        department: mappedDepartment || '',
        designation: row['Designation']?.trim() || '',
        employeeId: row['Employee ID']?.trim() || '',
        phone: row['Phone']?.toString().trim() || '',
        isActive: true,
        isVerified: false
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

      // Set a timeout for the upload operation
      const uploadPromise = createBulkStaff(uploadedData);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout - operation took too long')), 60000); // 60 second timeout
      });

      const response = await Promise.race([uploadPromise, timeoutPromise]);
      
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setUploadProgress(100);

      // Show success message
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(response);
        }
        handleClose();
      }, 1000);

    } catch (error) {
      console.error('Bulk upload error:', error);
      
      // Clear progress interval if it exists
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      setStep(2); // Go back to preview step
      setUploadProgress(0); // Reset progress
      
      // More specific error handling
      let errorMessage = 'Error uploading staff data. Please try again.';
      
      if (error.message === 'Upload timeout - operation took too long') {
        errorMessage = 'Upload is taking longer than expected. The staff members may have been created successfully. Please check the staff list and try again if needed.';
      } else if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to create staff members.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid data provided.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.response.data?.message || 'An error occurred while uploading staff data.';
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        // Other error
        errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      alert(errorMessage);
    }
  };

  const handleClose = () => {
    setStep(1);
    setUploadedData([]);
    setValidationResults([]);
    setUploadProgress(0);
    setDragActive(false);
    onClose();
  };

  // Helper functions for table data formatting (same as staffTableData.js)
  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Administrator',
      placement_director: 'Placement Director',
      placement_staff: 'Placement Staff',
      department_hod: 'Department HOD',
      other_staff: 'Other Staff',
      student: 'Student',
      alumni: 'Alumni',
    };
    return roleNames[role] || role;
  };

  const getDepartmentDisplayName = (department) => {
    const departmentNames = {
      CSE: 'Computer Science & Engineering',
      ECE: 'Electronics & Communication Engineering',
      EEE: 'Electrical & Electronics Engineering',
      MECH: 'Mechanical Engineering',
      CIVIL: 'Civil Engineering',
      IT: 'Information Technology',
      ADMIN: 'Administration',
      HR: 'Human Resources',
      OTHER: 'Other'
    };
    return departmentNames[department] || department;
  };

  // Table data formatter for bulk upload preview
  const getBulkUploadTableData = () => {
    const defaultAvatar = "https://ui-avatars.com/api/?name=";

    const StaffMember = ({ name, email, rowNumber }) => (
      <MDBox display="flex" alignItems="center" lineHeight={1}>
        <MDAvatar 
          src={`${defaultAvatar}${encodeURIComponent(name || 'Staff')}&size=40&background=2196F3&color=ffffff`} 
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

    const Role = ({ role, department }) => (
      <MDBox lineHeight={1} textAlign="left">
        <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
          {getRoleDisplayName(role)}
        </MDTypography>
        <MDTypography variant="caption" color="text">
          {getDepartmentDisplayName(department)}
        </MDTypography>
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
        { Header: "staff member", accessor: "staffMember", width: "35%", align: "left" },
        { Header: "role", accessor: "role", align: "left" },
        { Header: "contact", accessor: "contact", align: "left" },
        { Header: "status", accessor: "status", align: "center" },
        { Header: "issues", accessor: "issues", align: "left" },
      ],

      rows: validationResults.map((result, index) => ({
        staffMember: (
          <StaffMember
            name={`${result.data.firstName} ${result.data.lastName}`}
            email={result.data.email}
            rowNumber={result.rowNumber}
          />
        ),
        role: (
          <Role
            role={result.data.role}
            department={result.data.department}
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
            Bulk Staff Upload
          </MDTypography>
          <IconButton onClick={handleClose} sx={{ minWidth: 'auto', p: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {step === 1 && (
          <Box>
            {/* Upload Instructions */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="medium" mb={1}>
                Upload Instructions:
              </Typography>
              <Typography variant="body2" component="div">
                • Upload an Excel (.xlsx, .xls) or CSV file with staff data<br/>
                • Required columns: First Name, Last Name, Email<br/>
                • Optional columns: Role, Department, Designation, Employee ID, Phone<br/>
                • If Role is provided, it must be: Department HOD, Placement Staff, or Other Staff<br/>
                • If Role/Department are not provided, defaults will be used (Other Staff/Other)
              </Typography>
            </Alert>

            {/* File Upload Area */}
            <Paper
              sx={{
                border: `2px dashed ${dragActive ? '#1976d2' : '#ccc'}`,
                borderRadius: '12px',
                p: 4,
                textAlign: 'center',
                backgroundColor: dragActive ? '#f3f7ff' : '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <UploadIcon sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
              <Typography variant="h6" mb={1}>
                Drag and drop your Excel file here
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                or click to browse files
              </Typography>
              <MDButton variant="outlined" color="info">
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

            {/* Data Preview using same table structure as main Staff Management */}
            <Typography variant="h6" mb={2}>Data Preview:</Typography>
            
            {/* Blue Header Bar - same as main table */}
            <MDBox
              mx={0}
              mt={2}
              py={3}
              px={2}
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              coloredShadow="info"
            >
              <MDBox display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6" color="white">
                  Staff Data Preview
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
              {uploadProgress === 100 ? 'Upload Complete!' : 'Uploading Staff Data...'}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              sx={{ mb: 2, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary">
              {uploadProgress}% Complete
            </Typography>
            {uploadProgress < 100 && (
              <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                This may take a few moments for large uploads...
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        {step === 1 && (
          <Button 
            onClick={handleClose} 
            variant="outlined"
            sx={{ 
              color: '#1976d2', 
              borderColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#f3f7ff',
                borderColor: '#1976d2'
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
                color: '#1976d2', 
                borderColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#f3f7ff',
                  borderColor: '#1976d2'
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
              Add {validCount} Staff Members
            </MDButton>
          </>
        )}
        
        {step === 3 && (
          <Button 
            onClick={handleClose} 
            variant="outlined"
            sx={{ 
              color: '#1976d2', 
              borderColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#f3f7ff',
                borderColor: '#1976d2'
              }
            }}
          >
            {uploadProgress === 100 ? 'Close' : 'Cancel'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkStaffUploadModal;
