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
  FormControlLabel,
  Switch
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import { useCourseCategory } from 'context/CourseCategoryContext';

const EditCourseCategoryModal = ({ open, onClose, onSuccess, category }) => {
  const { updateCategory, validateCategoryData, loading } = useCourseCategory();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Initialize form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        isActive: category.isActive !== undefined ? category.isActive : true
      });
      setErrors({});
      setSubmitError('');
    }
  }, [category]);

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
    
    if (!category) return;

    // Validate form data
    const validation = validateCategoryData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const response = await updateCategory(category.id, formData);
      
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
      setSubmitError(error.message || 'Failed to update course category');
    }
  };

  const handleClose = () => {
    // Reset form when closing
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        isActive: category.isActive !== undefined ? category.isActive : true
      });
    }
    setErrors({});
    setSubmitError('');
    onClose();
  };

  if (!category) return null;

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
            Edit Course Category
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
              Update the course category information.
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
              sx={{ mb: 2 }}
            />

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
            disabled={loading || !formData.name.trim()}
            sx={{
              minWidth: '120px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {loading && <CircularProgress size={16} color="inherit" />}
            {loading ? 'Updating...' : 'Update Category'}
          </MDButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditCourseCategoryModal;
