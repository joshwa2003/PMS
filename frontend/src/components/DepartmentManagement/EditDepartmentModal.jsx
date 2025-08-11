import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import { useDepartment } from 'context/DepartmentContext';

const EditDepartmentModal = ({ open, onClose, onSuccess, department }) => {
  const { 
    updateDepartment, 
    validateDepartmentData, 
    fetchPlacementStaffOptions,
    placementStaffOptions,
    loading 
  } = useDepartment();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    placementStaff: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Initialize form data when department changes
  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || '',
        code: department.code || '',
        description: department.description || '',
        placementStaff: department.placementStaff?._id || department.placementStaff || '',
        isActive: department.isActive !== undefined ? department.isActive : true
      });
      setErrors({});
      setSubmitError('');
    }
  }, [department]);

  // Fetch placement staff options when modal opens
  useEffect(() => {
    if (open) {
      fetchPlacementStaffOptions();
    }
  }, [open]); // Removed fetchPlacementStaffOptions from dependencies

  const handleInputChange = (field) => (event) => {
    const value = field === 'isActive' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!department) return;

    // Validate form data
    const validation = validateDepartmentData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const response = await updateDepartment(department.id, formData);
      
      // Reset form
      setErrors({});
      setSubmitError('');

      // Call success callback
      if (onSuccess) {
        onSuccess(response);
      }

      // Close modal
      onClose();
    } catch (error) {
      setSubmitError(error.message || 'Failed to update department');
    }
  };

  const handleClose = () => {
    // Reset form when closing
    if (department) {
      setFormData({
        name: department.name || '',
        code: department.code || '',
        description: department.description || '',
        placementStaff: department.placementStaff?._id || department.placementStaff || '',
        isActive: department.isActive !== undefined ? department.isActive : true
      });
    }
    setErrors({});
    setSubmitError('');
    onClose();
  };

  if (!department) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.15)'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h5" fontWeight="medium">
            Edit Department
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

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <MDBox mb={2}>
            <MDTypography variant="body2" color="text" mb={1}>
              Update the department information and placement staff assignment.
            </MDTypography>
          </MDBox>

          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <MDBox mb={3}>
            <TextField
              fullWidth
              label="Department Name"
              placeholder="e.g., Computer Science Engineering"
              value={formData.name}
              onChange={handleInputChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              required
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Department Code"
              placeholder="e.g., CSE"
              value={formData.code}
              onChange={handleInputChange('code')}
              error={!!errors.code}
              helperText={errors.code}
              required
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Description (Optional)"
              placeholder="Brief description of the department"
              value={formData.description}
              onChange={handleInputChange('description')}
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={3}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <FormControl 
              fullWidth 
              error={!!errors.placementStaff}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              <InputLabel>Placement Staff Assignment *</InputLabel>
              <Select
                value={formData.placementStaff}
                onChange={handleInputChange('placementStaff')}
                label="Placement Staff Assignment *"
                required
              >
                <MenuItem value="">
                  <em>Select Placement Staff</em>
                </MenuItem>
                {placementStaffOptions.map((staff) => (
                  <MenuItem key={staff._id} value={staff._id}>
                    {staff.firstName} {staff.lastName} ({staff.email})
                  </MenuItem>
                ))}
              </Select>
              {errors.placementStaff && (
                <MDTypography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.placementStaff}
                </MDTypography>
              )}
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={handleInputChange('isActive')}
                  disabled={loading}
                  color="success"
                />
              }
              label={
                <MDTypography variant="body2">
                  {formData.isActive ? 'Active' : 'Inactive'}
                </MDTypography>
              }
            />
          </MDBox>

          <MDBox>
            <MDTypography variant="caption" color="text.secondary">
              * Required fields
            </MDTypography>
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
            type="submit"
            variant="gradient"
            color="info"
            disabled={loading || !formData.name.trim() || !formData.code.trim() || !formData.placementStaff}
            sx={{
              minWidth: '120px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {loading && <CircularProgress size={16} color="inherit" />}
            {loading ? 'Updating...' : 'Update Department'}
          </MDButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditDepartmentModal;
