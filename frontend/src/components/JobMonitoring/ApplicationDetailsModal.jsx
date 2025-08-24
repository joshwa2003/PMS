import React from 'react';
import { Modal, Box, Typography } from '@mui/material';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';

const ApplicationDetailsModal = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2
      }}>
        <Typography variant="h6" component="h2" mb={2}>
          Application Details
        </Typography>
        <MDBox mt={3} display="flex" justifyContent="flex-end">
          <MDButton variant="outlined" color="secondary" onClick={onClose}>
            Close
          </MDButton>
        </MDBox>
      </Box>
    </Modal>
  );
};

export default ApplicationDetailsModal;
