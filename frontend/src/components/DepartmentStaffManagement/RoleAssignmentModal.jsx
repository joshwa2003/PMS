import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// @mui material components
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// @mui icons
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import EmailIcon from '@mui/icons-material/Email';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

// Context
import { useDepartmentStaff } from 'context/DepartmentStaffContext';

// Services
import departmentStaffService from 'services/departmentStaffService';

const RoleAssignmentModal = ({ open, onClose, onSuccess }) => {
  const {
    selectedStaff,
    loading,
    assignStaffRole
  } = useDepartmentStaff();

  // Local state
  const [selectedRole, setSelectedRole] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Get the staff member to assign role to
  const staffMember = selectedStaff.length === 1 ? selectedStaff[0] : null;

  // Available roles
  const availableRoles = departmentStaffService.getAvailableRoles();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setSelectedRole(staffMember?.role || '');
      setError('');
    } else {
      setSelectedRole('');
      setError('');
    }
  }, [open, staffMember]);

  // Handle role change
  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    setError('');
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!staffMember || !selectedRole) {
      setError('Please select a role');
      return;
    }

    // Validate role assignment
    const validationErrors = departmentStaffService.validateRoleAssignment(
      staffMember.id, 
      selectedRole
    );

    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await assignStaffRole(staffMember.id, selectedRole);

      if (response.success) {
        const message = `Role assigned successfully to ${staffMember.fullName}. ${
          response.emailResult?.success ? 'Welcome email sent.' : 'Email will be sent separately.'
        }`;
        onSuccess(message);
      }
    } catch (error) {
      setError(error.message || 'Failed to assign role');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (!submitting) {
      onClose();
    }
  };

  if (!staffMember) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <AssignmentIndIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="span">
            Assign Role
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <MDBox>
          {/* Staff Member Info */}
          <Box 
            display="flex" 
            alignItems="center" 
            p={2} 
            bgcolor="grey.50" 
            borderRadius={2}
            mb={3}
          >
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
              {staffMember.firstName?.[0]}{staffMember.lastName?.[0]}
            </Avatar>
            <Box flex={1}>
              <MDTypography variant="h6" fontWeight="medium">
                {staffMember.fullName}
              </MDTypography>
              <MDTypography variant="body2" color="text">
                {staffMember.email}
              </MDTypography>
              {staffMember.employeeId && (
                <MDTypography variant="caption" color="text">
                  Employee ID: {staffMember.employeeId}
                </MDTypography>
              )}
              <Box mt={1} display="flex" gap={1}>
                <Chip
                  label={departmentStaffService.getRoleDisplayName(staffMember.role)}
                  color={departmentStaffService.getRoleColor(staffMember.role)}
                  size="small"
                  variant="outlined"
                />
                {staffMember.emailSent ? (
                  <Chip
                    icon={<EmailIcon />}
                    label="Email Sent"
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                ) : (
                  <Chip
                    icon={<EmailIcon />}
                    label="Email Pending"
                    color="warning"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>

          {/* Role Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Role</InputLabel>
            <Select
              value={selectedRole}
              label="Select Role"
              onChange={handleRoleChange}
              disabled={submitting}
            >
              {availableRoles.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  <Box display="flex" alignItems="center" width="100%">
                    <Box flex={1}>
                      <Typography variant="body1">
                        {role.label}
                      </Typography>
                    </Box>
                    <Chip
                      label={role.label}
                      color={role.color}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Email Notification Info */}
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Important:</strong> After assigning the role, a welcome email will be sent to the staff member 
              with their login credentials and role information.
            </Typography>
          </Alert>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Current Status */}
          <Box bgcolor="grey.50" p={2} borderRadius={2}>
            <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
              Current Status:
            </MDTypography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Role Assigned:</Typography>
                <Typography variant="body2" color={staffMember.roleAssignedAt ? 'success.main' : 'warning.main'}>
                  {staffMember.roleAssignedAt ? 'Yes' : 'No'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Email Sent:</Typography>
                <Typography variant="body2" color={staffMember.emailSent ? 'success.main' : 'warning.main'}>
                  {staffMember.emailSent ? 'Yes' : 'No'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Account Status:</Typography>
                <Typography variant="body2" color={staffMember.isActive ? 'success.main' : 'error.main'}>
                  {staffMember.isActive ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </MDBox>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <MDButton
          variant="outlined"
          color="secondary"
          onClick={handleCancel}
          disabled={submitting}
        >
          Cancel
        </MDButton>
        <MDButton
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={submitting || !selectedRole || selectedRole === staffMember.role}
          startIcon={submitting ? <CircularProgress size={20} /> : <AssignmentIndIcon />}
        >
          {submitting ? 'Assigning...' : 'Assign Role & Send Email'}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

RoleAssignmentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default RoleAssignmentModal;
