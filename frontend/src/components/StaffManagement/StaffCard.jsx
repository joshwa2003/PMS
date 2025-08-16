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
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import { useStaffManagement } from 'context/StaffManagementContext';
import { useAuth } from 'context/AuthContext';

const StaffCard = ({ staff, onEdit, onDelete }) => {
  const { 
    getRoleDisplayName, 
    getDepartmentDisplayName, 
    getStaffStatusColor, 
    getStaffStatusText,
    formatLastLogin,
    deleteStaff,
    loading
  } = useStaffManagement();
  
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
      onEdit(staff);
    }
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteStaff(staff.id);
      setDeleteDialogOpen(false);
      if (onDelete) {
        onDelete(staff.id);
      }
    } catch (error) {
      // Error handled by context
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const getStatusIcon = () => {
    if (!staff.isActive) {
      return <CancelIcon color="error" fontSize="small" />;
    }
    if (!staff.isVerified) {
      return <WarningIcon color="warning" fontSize="small" />;
    }
    return <CheckCircleIcon color="success" fontSize="small" />;
  };

  const getInitials = () => {
    return `${staff.firstName?.charAt(0) || ''}${staff.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Check if current user can delete (admin and placement_director can delete)
  const canDelete = user?.role === 'admin' || user?.role === 'placement_director';

  return (
    <>
      <Card 
        sx={{ 
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3
          }
        }}
      >
        <CardContent>
          {/* Header with avatar and menu */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'primary.main',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}
              >
                {getInitials()}
              </Avatar>
              
              <Box>
                <MDTypography variant="h6" fontWeight="medium">
                  {staff.fullName}
                </MDTypography>
                <Box display="flex" alignItems="center" gap={1}>
                  {getStatusIcon()}
                  <Typography variant="body2" color="text.secondary">
                    {getStaffStatusText(staff)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ mt: -1 }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* Role and Department */}
          <Box mb={2}>
            <Chip
              label={getRoleDisplayName(staff.role)}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ mr: 1, mb: 1 }}
            />
            <Chip
              label={getDepartmentDisplayName(staff.department)}
              color="secondary"
              variant="outlined"
              size="small"
              sx={{ mb: 1 }}
            />
          </Box>

          {/* Staff Details */}
          <Box space={1}>
            {/* Email */}
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <EmailIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" noWrap>
                {staff.email}
              </Typography>
            </Box>

            {/* Phone */}
            {staff.phone && (
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {staff.phone}
                </Typography>
              </Box>
            )}

            {/* Employee ID */}
            {staff.employeeId && (
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <BadgeIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {staff.employeeId}
                </Typography>
              </Box>
            )}

            {/* Designation */}
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" noWrap>
                {staff.designation}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Footer with last login and created date */}
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Last Login: {formatLastLogin(staff.lastLogin)}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Created: {new Date(staff.createdAt).toLocaleDateString()}
            </Typography>
          </Box>

          {/* Admin Notes Preview */}
          {staff.adminNotes && (
            <Box mt={2}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Admin Notes:
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {staff.adminNotes}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Staff
        </MenuItem>
        
        {canDelete && (
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete Staff
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="medium">
            Delete Staff Member
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" mb={2}>
            Are you sure you want to delete <strong>{staff.fullName}</strong>?
          </Typography>
          
          <Typography variant="body2" color="text.secondary" mb={2}>
            This action cannot be undone. The staff member will lose access to the system immediately.
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
              Staff Details:
            </Typography>
            <Typography variant="body2">
              • Email: {staff.email}
            </Typography>
            <Typography variant="body2">
              • Role: {getRoleDisplayName(staff.role)}
            </Typography>
            <Typography variant="body2">
              • Department: {getDepartmentDisplayName(staff.department)}
            </Typography>
            {staff.employeeId && (
              <Typography variant="body2">
                • Employee ID: {staff.employeeId}
              </Typography>
            )}
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
            {loading ? 'Deleting...' : 'Delete Staff'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StaffCard;
