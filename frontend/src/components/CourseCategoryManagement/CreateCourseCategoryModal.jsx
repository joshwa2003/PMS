import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import { useCourseCategory } from 'context/CourseCategoryContext';

const CreateCourseCategoryModal = ({ open, onClose, onSuccess }) => {
  const { createCategory, validateCategoryData, loading } = useCourseCategory();
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
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
    
    // Validate form data
    const validation = validateCategoryData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const response = await createCategory(formData);
      
      // Reset form
      setFormData({
        name: '',
        description: ''
      });
      setErrors({});
      setSubmitError('');

      // Call success callback
      if (onSuccess) {
        onSuccess(response);
      }

      // Close modal
      onClose();
    } catch (error) {
      setSubmitError(error.message || 'Failed to create course category');
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: '',
      description: ''
    });
    setErrors({});
    setSubmitError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
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
            Add New Course Category
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
              Create a new course category to organize academic programs.
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
              label="Course Category Name"
              placeholder="e.g., UG, PG, Ph.D"
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
              label="Description (Optional)"
              placeholder="Brief description of the course category"
              value={formData.description}
              onChange={handleInputChange('description')}
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={3}
              disabled={loading}
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
            color="success"
            disabled={loading || !formData.name.trim()}
            sx={{
              minWidth: '120px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {loading && <CircularProgress size={16} color="inherit" />}
            {loading ? 'Creating...' : 'Create Category'}
          </MDButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateCourseCategoryModal;
