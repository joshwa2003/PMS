import React from 'react';
import { Modal, Box, Typography } from '@mui/material';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';

const DeleteConfirmationModal = ({ open, onClose, onConfirm, jobTitle }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2
      }}>
        <Typography variant="h6" component="h2" mb={2}>
          Delete Job
        </Typography>
        <Typography variant="body1" mb={3}>
          Are you sure you want to delete "{jobTitle}"?
        </Typography>
        
        <MDBox display="flex" justifyContent="flex-end" gap={2}>
          <MDButton variant="outlined" color="secondary" onClick={onClose}>
            Cancel
          </MDButton>
          <MDButton variant="gradient" color="error" onClick={onConfirm}>
            Delete
          </MDButton>
        </MDBox>
      </Box>
    </Modal>
  );
};

export default DeleteConfirmationModal;
