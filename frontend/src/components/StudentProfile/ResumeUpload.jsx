import React, { useState, useRef } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";

// @mui icons
import LinkIcon from "@mui/icons-material/Link";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";

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
    updateResume,
    goToPreviousTab
  } = useStudentProfile();

  const [googleDriveUrl, setGoogleDriveUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const validateGoogleDriveUrl = (url) => {
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'URL is required' };
    }

    // Remove whitespace
    url = url.trim();

    // Check if it's a Google Drive URL
    const googleDrivePatterns = [
      /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/,
      /^https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9-_]+)/,
      /^https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9-_]+)/,
      /^https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /^https:\/\/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9-_]+)/
    ];

    const isValidGoogleDriveUrl = googleDrivePatterns.some(pattern => pattern.test(url));

    if (!isValidGoogleDriveUrl) {
      return { 
        isValid: false, 
        error: 'Please provide a valid Google Drive share link' 
      };
    }

    return { isValid: true, url };
  };

  const handleGoogleDriveSubmit = async () => {
    if (!googleDriveUrl.trim()) {
      setUploadError('Please enter a Google Drive URL');
      return;
    }

    const validation = validateGoogleDriveUrl(googleDriveUrl);
    if (!validation.isValid) {
      setUploadError(validation.error);
      return;
    }

    setUploadError('');
    setUploadSuccess('');
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      const result = await updateResume(googleDriveUrl);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setUploadSuccess('Resume link saved successfully!');
        setGoogleDriveUrl('');
        // Save the profile with updated resume info
        await saveProfile();
      } else {
        setUploadError(result.error || 'Failed to save resume link');
        setUploadProgress(0);
      }
    } catch (error) {
      setUploadError(error.message || 'Failed to save resume link');
      setUploadProgress(0);
    } finally {
      setIsProcessing(false);
    }
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

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDBox display="flex" alignItems="center" mb={2}>
          <LinkIcon sx={{ mr: 1, color: '#1976d2' }} />
          <MDTypography variant="h6" fontWeight="medium">
            Resume Upload
          </MDTypography>
        </MDBox>
        <MDTypography variant="body2" color="text" mb={2}>
          Share your resume using a Google Drive link. Make sure your file is publicly accessible.
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

        {/* Google Drive URL Input */}
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <MDBox mb={2}>
              <MDTypography variant="h6" fontWeight="medium" mb={1}>
                {currentResumeLink ? 'Update Resume Link' : 'Add Resume Link'}
              </MDTypography>
              <MDTypography variant="body2" color="text" mb={2}>
                Paste your Google Drive share link below
              </MDTypography>
            </MDBox>
            
            <MDBox mb={2}>
              <TextField
                fullWidth
                label="Google Drive URL"
                placeholder="https://drive.google.com/file/d/your-file-id/view?usp=sharing"
                value={googleDriveUrl}
                onChange={(e) => setGoogleDriveUrl(e.target.value)}
                variant="outlined"
                disabled={isProcessing}
                InputProps={{
                  startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                helperText="Make sure your Google Drive file is shared publicly or with appropriate permissions"
              />
            </MDBox>

            <MDBox display="flex" justifyContent="flex-end">
              <MDButton
                variant="gradient"
                color="info"
                onClick={handleGoogleDriveSubmit}
                disabled={isProcessing || !googleDriveUrl.trim()}
                startIcon={<DescriptionIcon />}
              >
                {isProcessing ? 'Processing...' : 'Save Resume Link'}
              </MDButton>
            </MDBox>
          </Card>
        </Grid>

        {/* Processing Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <MDBox mb={1}>
                <MDTypography variant="body2" fontWeight="medium">
                  Processing Resume Link... {uploadProgress}%
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

        {/* Google Drive Sharing Instructions */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              How to Share Your Resume from Google Drive
            </MDTypography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <MDTypography variant="body2" fontWeight="medium" mb={1} color="info">
                  📋 Step-by-Step Instructions:
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  1. Upload your resume to Google Drive
                  <br />
                  2. Right-click on your resume file
                  <br />
                  3. Select "Share" from the menu
                  <br />
                  4. Click "Change to anyone with the link"
                  <br />
                  5. Set permission to "Viewer"
                  <br />
                  6. Click "Copy link" and paste it above
                </MDTypography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <MDTypography variant="body2" fontWeight="medium" mb={1} color="success">
                  ✅ Best Practices:
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  • Use PDF format for your resume
                  <br />
                  • Ensure the file is publicly accessible
                  <br />
                  • Use a professional filename
                  <br />
                  • Keep your resume updated
                  <br />
                  • Test the link before submitting
                  <br />
                  • Don't delete the file from Google Drive
                </MDTypography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Important Notes */}
        <Grid item xs={12}>
          <Card sx={{ 
            p: 2, 
            bgcolor: 'light.main',
            border: '1px solid',
            borderColor: 'warning.main',
            backgroundColor: 'rgba(251, 140, 0, 0.08)'
          }}>
            <MDBox display="flex" alignItems="center" mb={1}>
              <InfoIcon sx={{ mr: 1, color: 'warning.main' }} />
              <MDTypography variant="body2" color="warning" fontWeight="medium">
                Important Notes:
              </MDTypography>
            </MDBox>
            <MDTypography variant="body2" color="text">
              • Your Google Drive link will be stored and used by placement coordinators
              <br />
              • Make sure the file remains accessible - don't delete it from Google Drive
              <br />
              • You can update the link anytime by entering a new URL
              <br />
              • The system will validate your link to ensure it's a valid Google Drive URL
              <br />
              • For best results, use PDF format for your resume
              <br />
              • Test your link in an incognito window to ensure it's publicly accessible
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
              onClick={async () => {
                const result = await saveProfile();
                if (result.success) {
                  // Show success message (could be improved with a toast notification)
                  alert('Profile completed successfully!');
                  // Optionally navigate to next tab or page here
                  // goToNextTab();
                } else {
                  // Show error message (could be improved with a toast notification)
                  alert('Failed to complete profile. Please check the form and try again.');
                }
              }}
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
