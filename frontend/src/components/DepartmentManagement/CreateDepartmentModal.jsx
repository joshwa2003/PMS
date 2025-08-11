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
  MenuItem
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import { useDepartment } from 'context/DepartmentContext';
import { useCourseCategory } from 'context/CourseCategoryContext';

const CreateDepartmentModal = ({ open, onClose, onSuccess }) => {
  const { 
    createDepartment, 
    validateDepartmentData, 
    generateDepartmentCodeSuggestion,
    loading 
  } = useDepartment();
  
  const {
    categories: courseCategories,
    fetchCategories: fetchCourseCategories
  } = useCourseCategory();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    courseCategory: ''
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Fetch course categories when modal opens
  useEffect(() => {
    if (open) {
      fetchCourseCategories();
    }
  }, [open, fetchCourseCategories]);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Auto-generate code when name changes
      if (field === 'name' && value) {
        newData.code = generateDepartmentCodeSuggestion(value);
      }

      return newData;
    });

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
    const validation = validateDepartmentData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const response = await createDepartment(formData);
      
      // Reset form
      setFormData({
        name: '',
        code: '',
        description: '',
        courseCategory: ''
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
      console.error('Error in CreateDepartmentModal:', error);
      
      // Check if it's a server error (500) which might indicate the department was created
      // but there was an issue with the response
      if (error.message && error.message.includes('500')) {
        setSubmitError('Department may have been created successfully. Please check the department list and refresh if needed.');
        
        // Auto-close modal after showing the message for a few seconds
        setTimeout(() => {
          // Reset form
          setFormData({
            name: '',
            code: '',
            description: '',
            courseCategory: ''
          });
          setErrors({});
          setSubmitError('');
          
          // Call success callback to refresh the list
          if (onSuccess) {
            onSuccess({ success: true, message: 'Department creation status unclear - please check the list' });
          }
          
          // Close modal
          onClose();
        }, 3000);
      } else {
        setSubmitError(error.message || 'Failed to create department');
      }
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: '',
      code: '',
      description: '',
      courseCategory: ''
    });
    setErrors({});
    setSubmitError('');
    onClose();
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
          boxShadow: '0 24px 48px rgba(0,0,0,0.15)'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h5" fontWeight="medium">
            Add New Department
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
              Create a new department with course category assignment.
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
              helperText={errors.code || 'Auto-generated from department name'}
              required
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <FormControl 
              fullWidth 
              error={!!errors.courseCategory}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              <InputLabel>Course Category *</InputLabel>
              <Select
                value={formData.courseCategory}
                onChange={handleInputChange('courseCategory')}
                label="Course Category *"
                required
              >
                <MenuItem value="">
                  <em>Select Course Category</em>
                </MenuItem>
                {courseCategories
                  .filter(category => category.isActive) // Only show active categories
                  .map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
              </Select>
              {errors.courseCategory && (
                <MDTypography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.courseCategory}
                </MDTypography>
              )}
            </FormControl>

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
          </MDBox>

          <MDBox>
            <MDTypography variant="caption" color="text" sx={{ color: 'text.secondary' }}>
              * Required fields
            </MDTypography>
            <MDTypography variant="caption" color="info" display="block" sx={{ mt: 1 }}>
              Note: Placement staff assignment can be managed separately after creating the department.
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
            disabled={loading || !formData.name.trim() || !formData.code.trim() || !formData.courseCategory}
            sx={{
              minWidth: '120px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {loading && <CircularProgress size={16} color="inherit" />}
            {loading ? 'Creating...' : 'Create Department'}
          </MDButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateDepartmentModal;
