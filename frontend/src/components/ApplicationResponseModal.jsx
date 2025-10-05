import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  CheckCircle as AppliedIcon,
  Cancel as NotAppliedIcon,
  Work as JobIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDInput from 'components/MDInput';

const ApplicationResponseModal = ({ 
  open, 
  jobData, 
  onSubmit, 
  loading = false, 
  error = null 
}) => {
  const [response, setResponse] = useState(null); // true = applied, false = not applied
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Debug logging
  // Reduce console logging in production
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 ApplicationResponseModal render:', { open, jobData, loading, error });
  }

  const handleSubmit = async () => {
    if (response === null) return;
    
    // If student clicked "No, I Didn't Apply", just close the modal without saving
    if (response === false) {
      console.log('🚫 Student clicked "No, I Didn\'t Apply" - closing modal without saving');
      onSubmit({
        applied: false,
        notes: notes.trim(),
        jobId: jobData?._id || 'unknown',
        skipSave: true // Flag to indicate we should just close without saving
      });
      return;
    }
    
    // Only save to database if they clicked "Yes, I Applied"
    setSubmitting(true);
    try {
      await onSubmit({
        applied: response,
        notes: notes.trim(),
        jobId: jobData?._id || 'unknown'
      });
    } catch (err) {
      console.error('Error submitting response:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResponseSelect = (applied) => {
    setResponse(applied);
  };

  // Don't show modal if job data is invalid
  if (!jobData || !jobData._id || !jobData.title) {
    if (open) {
      console.log('⚠️ Modal should be open but jobData is invalid:', jobData);
      // Auto-close if invalid data
      if (onSubmit) {
        setTimeout(() => {
          onSubmit({ applied: false, notes: 'Invalid job data', jobId: 'invalid' });
        }, 100);
      }
    }
    return null;
  }

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      disableBackdropClick
      PaperProps={{
        sx: {
          borderRadius: '24px',
          boxShadow: (theme) => theme.shadows[10],
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 9998
        }
      }}
      sx={{
        zIndex: 9999,
        '& .MuiDialog-container': {
          zIndex: 9999
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <MDBox display="flex" alignItems="center" gap={2} mb={1}>
          <JobIcon sx={{ color: 'info.main', fontSize: 28 }} />
          <MDTypography variant="h6" fontWeight="bold" color="dark">
            Application Confirmation Required
          </MDTypography>
        </MDBox>
        <MDTypography variant="body2" color="text" sx={{ mt: 1 }}>
          We noticed you clicked "Apply Now" for this job. Please confirm your application status.
        </MDTypography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Job Information */}
        <MDBox 
          p={3} 
          sx={{ 
            backgroundColor: (theme) => theme.palette.grey[50],
            border: 1,
            borderColor: 'divider',
            borderRadius: '16px',
            mb: 3
          }}
        >
          <MDTypography variant="h5" fontWeight="medium" color="dark" gutterBottom>
            {jobData?.title || 'Job Application'}
          </MDTypography>
          <MDTypography variant="body2" color="info" fontWeight="medium">
            {jobData?.company?.name || 'Company'}
          </MDTypography>
          {jobData?.location && (
            <MDTypography variant="caption" color="text" display="block" sx={{ mt: 0.5 }}>
              📍 {jobData.location}
            </MDTypography>
          )}
        </MDBox>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Response Question */}
        <MDBox mb={3}>
          <MDTypography variant="h6" fontWeight="medium" color="dark" gutterBottom>
            Did you apply for this job?
          </MDTypography>
          <MDTypography variant="body2" color="text" sx={{ mb: 2 }}>
            Please select one of the options below. This information helps us track placement activities.
          </MDTypography>

          {/* Response Buttons */}
          <MDBox display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
            <MDButton
              variant={response === true ? "gradient" : "outlined"}
              color="success"
              onClick={() => handleResponseSelect(true)}
              startIcon={<AppliedIcon />}
              fullWidth
              size="large"
              sx={{ 
                height: 56,
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: response === true ? 'bold' : 'medium'
              }}
            >
              Yes, I Applied
            </MDButton>
            
            <MDButton
              variant={response === false ? "gradient" : "outlined"}
              color="error"
              onClick={() => handleResponseSelect(false)}
              startIcon={<NotAppliedIcon />}
              fullWidth
              size="large"
              sx={{ 
                height: 56,
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: response === false ? 'bold' : 'medium'
              }}
            >
              No, I Didn't Apply
            </MDButton>
          </MDBox>
        </MDBox>

        {/* Optional Notes */}
        {response !== null && (
          <MDBox mb={2}>
            <MDTypography variant="body2" color="text" gutterBottom>
              Additional notes (optional):
            </MDTypography>
            <MDInput
              multiline
              rows={3}
              placeholder={
                response 
                  ? "Any comments about your application experience..."
                  : "Reason for not applying (optional)..."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              inputProps={{ maxLength: 500 }}
            />
            <MDTypography variant="caption" color="text" sx={{ mt: 0.5, display: 'block' }}>
              {notes.length}/500 characters
            </MDTypography>
          </MDBox>
        )}

        {/* Important Notice */}
        <Alert 
          severity="warning" 
          sx={{ 
            borderRadius: 2,
            backgroundColor: (theme) => theme.palette.warning.light + '20',
            border: 2,
            borderColor: 'warning.main',
            animation: 'pulse 2s infinite'
          }}
        >
          <MDTypography variant="body2" color="dark" fontWeight="bold">
            <strong>⚠️ MANDATORY RESPONSE REQUIRED</strong>
          </MDTypography>
          <MDTypography variant="body2" color="dark" sx={{ mt: 1 }}>
            You must respond to this application confirmation to continue using the website. 
            This helps our placement team track application activities and provide better support.
          </MDTypography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <MDButton
          variant="gradient"
          color="info"
          onClick={handleSubmit}
          disabled={response === null || submitting || loading}
          startIcon={submitting || loading ? <CircularProgress size={20} color="inherit" /> : null}
          size="large"
          fullWidth
          sx={{ 
            height: 48,
            textTransform: 'none',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {submitting || loading ? 'Submitting...' : 'Submit Response'}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

export default ApplicationResponseModal;
