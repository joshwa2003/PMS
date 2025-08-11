import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Avatar,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import { useDepartment } from 'context/DepartmentContext';

const PlacementStaffAssignmentModal = ({ open, onClose, department, onSuccess }) => {
  const { 
    fetchPlacementStaffOptions,
    placementStaffOptions,
    updateDepartment,
    loading 
  } = useDepartment();
  
  const [selectedStaff, setSelectedStaff] = useState('');
  const [currentStaff, setCurrentStaff] = useState(null);
  const [submitError, setSubmitError] = useState('');

  // Initialize current staff when modal opens
  useEffect(() => {
    if (open && department) {
      fetchPlacementStaffOptions();
      // Initialize with existing placement staff (single staff member)
      if (department.placementStaff) {
        if (typeof department.placementStaff === 'object') {
          setCurrentStaff(department.placementStaff);
          setSelectedStaff(department.placementStaff._id);
        } else {
          // If it's just an ID, find the staff member from options
          setSelectedStaff(department.placementStaff);
        }
      } else {
        setCurrentStaff(null);
        setSelectedStaff('');
      }
    }
  }, [open, department]); // Removed fetchPlacementStaffOptions from dependencies

  // Update current staff when selected staff changes
  useEffect(() => {
    if (selectedStaff && placementStaffOptions.length > 0) {
      const staff = placementStaffOptions.find(s => s._id === selectedStaff);
      setCurrentStaff(staff || null);
    } else {
      setCurrentStaff(null);
    }
  }, [selectedStaff, placementStaffOptions]);

  const handleSubmit = async () => {
    try {
      await updateDepartment(department.id, {
        ...department,
        placementStaff: selectedStaff || null
      });

      // Call success callback
      if (onSuccess) {
        onSuccess({
          ...department,
          placementStaff: currentStaff
        });
      }

      // Close modal
      onClose();
    } catch (error) {
      console.error('Error in PlacementStaffAssignmentModal:', error);
      
      // Check if it's a server error (500) which might indicate the update was successful
      // but there was an issue with the response
      if (error.message && error.message.includes('500')) {
        setSubmitError('Assignment may have been updated successfully. Please check the department list and refresh if needed.');
        
        // Auto-close modal after showing the message for a few seconds
        setTimeout(() => {
          // Call success callback to refresh the list
          if (onSuccess) {
            onSuccess({
              ...department,
              placementStaff: currentStaff
            });
          }
          
          // Close modal
          onClose();
        }, 3000);
      } else {
        setSubmitError(error.message || 'Failed to update placement staff assignment');
      }
    }
  };

  const handleClose = () => {
    setSelectedStaff('');
    setCurrentStaff(null);
    setSubmitError('');
    onClose();
  };

  const handleClearStaff = () => {
    setSelectedStaff('');
    setCurrentStaff(null);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
          minHeight: '400px'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h5" fontWeight="medium">
            Placement Staff Assignment
          </MDTypography>
          <Button
            onClick={handleClose}
            sx={{ minWidth: 'auto', p: 1 }}
            disabled={loading}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <MDBox mb={2}>
          <MDTypography variant="body2" color="text" mb={1}>
            Assign a placement staff member to manage <strong>{department?.name}</strong> department.
          </MDTypography>
        </MDBox>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        {/* Staff Selection Section */}
        <MDBox mb={3}>
          <MDTypography variant="h6" fontWeight="medium" mb={2}>
            Select Placement Staff
          </MDTypography>
          
          <Box display="flex" gap={2} alignItems="center">
            <FormControl 
              fullWidth 
              disabled={loading}
              sx={{ flex: 1 }}
            >
              <InputLabel>Select Placement Staff</InputLabel>
              <Select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                label="Select Placement Staff"
              >
                <MenuItem value="">
                  <em>No staff assigned</em>
                </MenuItem>
                {placementStaffOptions.map((staff) => (
                  <MenuItem key={staff._id} value={staff._id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {staff.firstName?.charAt(0)}{staff.lastName?.charAt(0)}
                      </Avatar>
                      {staff.firstName} {staff.lastName} ({staff.email})
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {selectedStaff && (
              <MDButton
                variant="outlined"
                color="error"
                onClick={handleClearStaff}
                disabled={loading}
                startIcon={<ClearIcon />}
                sx={{ minWidth: '120px' }}
              >
                Clear
              </MDButton>
            )}
          </Box>
        </MDBox>

        <Divider sx={{ my: 3 }} />

        {/* Current Assignment Section */}
        <MDBox>
          <MDTypography variant="h6" fontWeight="medium" mb={2}>
            Current Assignment
          </MDTypography>

          {currentStaff ? (
            <Card sx={{ bgcolor: 'background.paper', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    {currentStaff.firstName?.charAt(0)}{currentStaff.lastName?.charAt(0)}
                  </Avatar>
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="h6" fontWeight="medium">
                        {currentStaff.firstName} {currentStaff.lastName}
                      </Typography>
                      <Chip 
                        label={currentStaff.role === 'placement_director' ? 'Placement Director' : 'Placement Staff'} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      {currentStaff.email}
                    </Typography>
                    {currentStaff.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {currentStaff.phone}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 4, 
                backgroundColor: '#f8f9fa', 
                borderRadius: 2,
                border: '2px dashed #dee2e6'
              }}
            >
              <PersonIcon sx={{ fontSize: '3rem', color: 'text.secondary', mb: 1 }} />
              <Typography variant="h6" color="text.secondary" mb={1}>
                No Staff Assigned
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select a placement staff member to manage this department's placement activities.
              </Typography>
            </Box>
          )}
        </MDBox>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          color="inherit"
          disabled={loading}
          sx={{ mr: 1 }}
        >
          Cancel
        </Button>
        
        <MDButton
          onClick={handleSubmit}
          variant="gradient"
          color="success"
          disabled={loading}
          sx={{
            minWidth: '140px',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          {loading && <CircularProgress size={16} color="inherit" />}
          {loading ? 'Updating...' : 'Update Assignment'}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

export default PlacementStaffAssignmentModal;
