import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert
} from '@mui/material';
import { Publish as PublishIcon, UnpublishedOutlined as UnpublishIcon } from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

const PublishConfirmationModal = ({ 
  open, 
  job, 
  action, // 'publish' or 'unpublish'
  onClose, 
  onConfirm,
  loading = false 
}) => {
  if (!job) return null;

  const isPublish = action === 'publish';
  const title = isPublish ? 'Publish Job' : 'Unpublish Job';
  const icon = isPublish ? <PublishIcon /> : <UnpublishIcon />;
  const actionText = isPublish ? 'publish' : 'unpublish';
  const buttonColor = isPublish ? 'success' : 'warning';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24
        }
      }}
    >
      <DialogTitle>
        <MDBox display="flex" alignItems="center" gap={2}>
          {icon}
          <MDTypography variant="h5" fontWeight="medium">
            {title}
          </MDTypography>
        </MDBox>
      </DialogTitle>

      <DialogContent>
        <MDBox mb={2}>
          <MDTypography variant="body1" color="text">
            Are you sure you want to {actionText} this job?
          </MDTypography>
        </MDBox>

        <MDBox 
          p={2} 
          bgcolor="grey.100" 
          borderRadius={2}
          mb={2}
        >
          <MDTypography variant="h6" fontWeight="medium" mb={1}>
            {job.title}
          </MDTypography>
          <MDTypography variant="body2" color="text" mb={0.5}>
            <strong>Company:</strong> {job.company?.name}
          </MDTypography>
          <MDTypography variant="body2" color="text" mb={0.5}>
            <strong>Location:</strong> {job.location}
          </MDTypography>
          <MDTypography variant="body2" color="text" mb={0.5}>
            <strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}
          </MDTypography>
          <MDTypography variant="body2" color="text">
            <strong>Current Status:</strong> {job.status}
          </MDTypography>
        </MDBox>

        {isPublish ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Publishing this job will:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Make it visible to students in Job Opportunities</li>
                <li>Create job applications for eligible students</li>
                <li>Send notifications to relevant departments</li>
                <li>Change status from Draft to Active</li>
              </ul>
            </Typography>
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Unpublishing this job will:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Hide it from students in Job Opportunities</li>
                <li>Change status from Active to Draft</li>
                <li>Keep existing applications intact</li>
                <li>Allow you to make further edits</li>
              </ul>
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <MDButton
          variant="outlined"
          color="secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </MDButton>
        <MDButton
          variant="gradient"
          color={buttonColor}
          onClick={onConfirm}
          disabled={loading}
          startIcon={icon}
        >
          {loading ? `${actionText.charAt(0).toUpperCase() + actionText.slice(1)}ing...` : `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Job`}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

export default PublishConfirmationModal;
