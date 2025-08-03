import React, { useState, useRef } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";

// @mui icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DeleteIcon from "@mui/icons-material/Delete";

// S.A. Engineering College React components
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";
import MDButton from "../MDButton";
import MDAlert from "../MDAlert";

function ResumeUpload() {
  const {
    formData,
    updateFormData,
    saveProfile,
    isSaving,
    getFieldValue,
    uploadResume,
    goToPreviousTab
  } = useStudentProfile();

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadError('Please select a PDF file only.');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setUploadError('File size must be less than 5MB.');
      return;
    }

    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploadError('');
    setUploadSuccess('');
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadResume(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setUploadSuccess('Resume uploaded successfully!');
        // Save the profile with updated resume info
        await saveProfile();
      } else {
        setUploadError(result.error || 'Failed to upload resume');
        setUploadProgress(0);
      }
    } catch (error) {
      setUploadError(error.message || 'Failed to upload resume');
      setUploadProgress(0);
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleRemoveResume = () => {
    updateFormData('placement.resumeLink', '');
    updateFormData('placement.resumeLastUpdated', '');
    setUploadSuccess('');
    setUploadError('');
    setUploadProgress(0);
  };

  const currentResumeLink = getFieldValue('placement.resumeLink');
  const resumeLastUpdated = getFieldValue('placement.resumeLastUpdated');

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDBox display="flex" alignItems="center" mb={2}>
          <CloudUploadIcon sx={{ mr: 1, color: '#1976d2' }} />
          <MDTypography variant="h6" fontWeight="medium">
            Resume Upload
          </MDTypography>
        </MDBox>
        <MDTypography variant="body2" color="text" mb={2}>
          Upload your latest resume in PDF format (Maximum size: 5MB)
        </MDTypography>
      </MDBox>

      <Grid container spacing={3}>
        {/* Current Resume Status */}
        {currentResumeLink && (
          <Grid item xs={12}>
            <Card sx={{ 
              p: 2, 
              mb: 2, 
              bgcolor: 'light.main',
              border: '1px solid',
              borderColor: 'success.main',
              backgroundColor: 'rgba(76, 175, 80, 0.08)'
            }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center">
                <MDBox display="flex" alignItems="center">
                  <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                  <MDBox>
                    <MDTypography variant="body2" color="success" fontWeight="medium">
                      Resume Uploaded Successfully
                    </MDTypography>
                    {resumeLastUpdated && (
                      <MDTypography variant="body2" color="text" fontSize="0.875rem">
                        Last updated: {new Date(resumeLastUpdated).toLocaleDateString()}
                      </MDTypography>
                    )}
                  </MDBox>
                </MDBox>
                <MDBox>
                  <MDButton
                    variant="outlined"
                    color="success"
                    size="small"
                    component="a"
                    href={currentResumeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mr: 1 }}
                  >
                    View Resume
                  </MDButton>
                  <MDButton
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={handleRemoveResume}
                  >
                    Remove
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        )}

        {/* Upload Area */}
        <Grid item xs={12}>
          <Card
            sx={{
              p: 4,
              border: isDragging ? '2px dashed #1976d2' : '2px dashed #ccc',
              bgcolor: isDragging ? 'info.main' : 'grey.50',
              opacity: isDragging ? 0.1 : 1,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#1976d2',
                bgcolor: 'info.main',
                opacity: 0.05
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <MDBox textAlign="center">
              <CloudUploadIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
              <MDTypography variant="h6" fontWeight="medium" mb={1}>
                {currentResumeLink ? 'Upload New Resume' : 'Upload Your Resume'}
              </MDTypography>
              <MDTypography variant="body2" color="text" mb={2}>
                Drag and drop your PDF file here, or click to browse
              </MDTypography>
              <MDButton
                variant="outlined"
                color="info"
                startIcon={<DescriptionIcon />}
              >
                Choose PDF File
              </MDButton>
            </MDBox>
          </Card>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
        </Grid>

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <MDBox mb={1}>
                <MDTypography variant="body2" fontWeight="medium">
                  Uploading Resume... {uploadProgress}%
                </MDTypography>
              </MDBox>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                color="info"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Card>
          </Grid>
        )}

        {/* Success Message */}
        {uploadSuccess && (
          <Grid item xs={12}>
            <MDAlert color="success" dismissible onClose={() => setUploadSuccess('')}>
              <MDBox display="flex" alignItems="center">
                <CheckCircleIcon sx={{ mr: 1 }} />
                {uploadSuccess}
              </MDBox>
            </MDAlert>
          </Grid>
        )}

        {/* Error Message */}
        {uploadError && (
          <Grid item xs={12}>
            <MDAlert color="error" dismissible onClose={() => setUploadError('')}>
              <MDBox display="flex" alignItems="center">
                <ErrorIcon sx={{ mr: 1 }} />
                {uploadError}
              </MDBox>
            </MDAlert>
          </Grid>
        )}

        {/* Upload Guidelines */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Resume Upload Guidelines
            </MDTypography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <MDTypography variant="body2" fontWeight="medium" mb={1} color="success">
                  ✅ Best Practices:
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  • Use PDF format only
                  <br />
                  • Keep file size under 5MB
                  <br />
                  • Use a clear, professional filename
                  <br />
                  • Ensure text is readable and well-formatted
                  <br />
                  • Include updated contact information
                  <br />
                  • Highlight relevant skills and experiences
                </MDTypography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <MDTypography variant="body2" fontWeight="medium" mb={1} color="error">
                  ❌ Avoid:
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  • Image files (JPG, PNG) instead of PDF
                  <br />
                  • Files larger than 5MB
                  <br />
                  • Password-protected PDFs
                  <br />
                  • Scanned documents with poor quality
                  <br />
                  • Outdated or irrelevant information
                  <br />
                  • Unprofessional email addresses
                </MDTypography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Resume Tips */}
        <Grid item xs={12}>
          <Card sx={{ 
            p: 2, 
            bgcolor: 'light.main',
            border: '1px solid',
            borderColor: 'warning.main',
            backgroundColor: 'rgba(251, 140, 0, 0.08)'
          }}>
            <MDTypography variant="body2" color="warning" fontWeight="medium" mb={1}>
              💡 Pro Tips for Your Resume:
            </MDTypography>
            <MDTypography variant="body2" color="text">
              • Tailor your resume for each job application
              <br />
              • Use action verbs to describe your experiences
              <br />
              • Quantify your achievements with numbers when possible
              <br />
              • Keep it concise - ideally 1-2 pages for fresh graduates
              <br />
              • Proofread carefully for spelling and grammar errors
              <br />
              • Update regularly with new skills and experiences
            </MDTypography>
          </Card>
        </Grid>

        {/* Navigation Buttons */}
        <Grid item xs={12}>
          <MDBox mt={3} display="flex" justifyContent="space-between">
            <MDButton
              variant="outlined"
              color="info"
              onClick={goToPreviousTab}
            >
              Previous
            </MDButton>
            <MDButton
              variant="gradient"
              color="success"
              disabled={isSaving}
              onClick={() => saveProfile()}
            >
              {isSaving ? "Saving..." : "Complete Profile"}
            </MDButton>
          </MDBox>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default ResumeUpload;
