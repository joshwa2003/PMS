import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon
} from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import { useCourseCategory } from 'context/CourseCategoryContext';
import { useAuth } from 'context/AuthContext';

const CourseCategoryCard = ({ category, onEdit, onDelete }) => {
  const { 
    getCategoryStatusColor, 
    getCategoryStatusText,
    formatCreationDate,
    toggleCategoryStatus,
    loading
  } = useCourseCategory();
  
  const { user } = useAuth();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    if (onEdit) {
      onEdit(category);
    }
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (onDelete) {
        await onDelete(category.id);
      }
      setDeleteDialogOpen(false);
    } catch (error) {
      // Error handled by context
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleToggleStatus = async () => {
    handleMenuClose();
    try {
      await toggleCategoryStatus(category.id);
    } catch (error) {
      // Error handled by context
    }
  };

  const getStatusIcon = () => {
    if (category.isActive) {
      return <CheckCircleIcon color="success" fontSize="small" />;
    }
    return <CancelIcon color="error" fontSize="small" />;
  };

  // Check if current user can manage categories (only admin)
  const canManage = user?.role === 'admin';

  return (
    <>
      <Card 
        sx={{ 
          height: '100%',
          minHeight: '280px',
          transition: 'all 0.3s ease',
          position: 'relative',
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            borderColor: '#1976d2'
          }
        }}
      >
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header with menu */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <SchoolIcon sx={{ fontSize: '2rem', color: '#1976d2' }} />
              {getStatusIcon()}
            </Box>

            {canManage && (
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{ 
                  color: '#666',
                  backgroundColor: '#f5f5f5',
                  '&:hover': {
                    backgroundColor: '#e0e0e0'
                  }
                }}
              >
                <MoreVertIcon />
              </IconButton>
            )}
          </Box>

          {/* Category Name */}
          <Box flex={1} display="flex" flexDirection="column" justifyContent="center" mb={2}>
            <MDTypography 
              variant="h4" 
              fontWeight="bold" 
              color="dark"
              textAlign="center"
              mb={1}
              sx={{
                wordBreak: 'break-word',
                color: '#344767'
              }}
            >
              {category.name}
            </MDTypography>

            {category.description && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                textAlign="center"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.4
                }}
              >
                {category.description}
              </Typography>
            )}
          </Box>

          {/* Status and Creation Info */}
          <Box>
            <Box display="flex" justifyContent="center" mb={2}>
              <Chip
                label={getCategoryStatusText(category)}
                color={category.isActive ? 'success' : 'error'}
                variant="filled"
                sx={{
                  fontWeight: 'bold',
                  '& .MuiChip-label': { px: 2 }
                }}
              />
            </Box>

            <Typography 
              variant="caption" 
              color="text.secondary" 
              display="block"
              textAlign="center"
            >
              Created: {formatCreationDate(category.createdAt)}
            </Typography>

            {category.createdBy && (
              <Typography 
                variant="caption" 
                color="text.secondary" 
                display="block"
                textAlign="center"
              >
                By: {category.createdBy.firstName} {category.createdBy.lastName}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Action Menu */}
      {canManage && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit Category
          </MenuItem>
          
          <MenuItem onClick={handleToggleStatus}>
            {category.isActive ? (
              <ToggleOffIcon fontSize="small" sx={{ mr: 1 }} />
            ) : (
              <ToggleOnIcon fontSize="small" sx={{ mr: 1 }} />
            )}
            {category.isActive ? 'Deactivate' : 'Activate'}
          </MenuItem>
          
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete Category
          </MenuItem>
        </Menu>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="medium">
            Delete Course Category
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" mb={2}>
            Are you sure you want to delete the course category <strong>"{category.name}"</strong>?
          </Typography>
          
          <Typography variant="body2" color="text.secondary" mb={2}>
            This action cannot be undone. All associated data will be permanently removed.
          </Typography>

          <Box 
            sx={{ 
              backgroundColor: 'error.light', 
              color: 'error.contrastText',
              p: 2, 
              borderRadius: 1,
              mb: 2
            }}
          >
            <Typography variant="body2" fontWeight="medium">
              Category Details:
            </Typography>
            <Typography variant="body2">
              • Name: {category.name}
            </Typography>
            {category.description && (
              <Typography variant="body2">
                • Description: {category.description}
              </Typography>
            )}
            <Typography variant="body2">
              • Status: {getCategoryStatusText(category)}
            </Typography>
            <Typography variant="body2">
              • Created: {formatCreationDate(category.createdAt)}
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Category'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CourseCategoryCard;
