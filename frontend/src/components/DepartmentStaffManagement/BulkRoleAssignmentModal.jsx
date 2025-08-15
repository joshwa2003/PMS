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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Divider from '@mui/material/Divider';

// @mui icons
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EmailIcon from '@mui/icons-material/Email';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

// Context
import { useDepartmentStaff } from 'context/DepartmentStaffContext';

// Services
import departmentStaffService from 'services/departmentStaffService';

const BulkRoleAssignmentModal = ({ open, onClose, onSuccess, selectedStaff }) => {
  const {
    loading,
    bulkAssignRoles
  } = useDepartmentStaff();

  // Local state
  const [selectedRole, setSelectedRole] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  // Available roles
  const availableRoles = departmentStaffService.getAvailableRoles();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setSelectedRole('');
      setError('');
      setResults(null);
    }
  }, [open]);

  // Handle role change
  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    setError('');
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedRole || selectedStaff.length === 0) {
      setError('Please select a role');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Prepare assignments
      const assignments = selectedStaff.map(staff => ({
        staffId: staff.id,
        role: selectedRole
      }));

      const response = await bulkAssignRoles(assignments);

      if (response.success) {
        setResults(response.results);
        
        // If all successful, close modal after a delay
        if (response.results.failureCount === 0) {
          setTimeout(() => {
            onSuccess(response.results);
          }, 2000);
        }
      }
    } catch (error) {
      setError(error.message || 'Failed to assign roles');
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

  // Handle close after results
  const handleCloseWithResults = () => {
    if (results) {
      onSuccess(results);
    } else {
      onClose();
    }
  };

  if (selectedStaff.length === 0) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <GroupAddIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="span">
            Bulk Role Assignment
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <MDBox>
          {!results ? (
            <>
              {/* Selected Staff Count */}
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  You are about to assign roles to <strong>{selectedStaff.length}</strong> staff members.
                  Welcome emails will be sent to staff members who haven't received them yet.
                </Typography>
              </Alert>

              {/* Role Selection */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Select Role for All Selected Staff</InputLabel>
                <Select
                  value={selectedRole}
                  label="Select Role for All Selected Staff"
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

              {/* Selected Staff List */}
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Selected Staff Members ({selectedStaff.length})
              </MDTypography>

              <Box 
                sx={{ 
                  maxHeight: 300, 
                  overflow: 'auto',
                  border: 1,
                  borderColor: 'grey.300',
                  borderRadius: 2
                }}
              >
                <List>
                  {selectedStaff.map((staff, index) => (
                    <React.Fragment key={staff.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {staff.firstName?.[0]}{staff.lastName?.[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={staff.fullName}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {staff.email}
                              </Typography>
                              {staff.employeeId && (
                                <Typography variant="caption" color="text.secondary">
                                  ID: {staff.employeeId}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
                            <Chip
                              label={departmentStaffService.getRoleDisplayName(staff.role)}
                              color={departmentStaffService.getRoleColor(staff.role)}
                              size="small"
                              variant="outlined"
                            />
                            {staff.emailSent ? (
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
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < selectedStaff.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </>
          ) : (
            /* Results Display */
            <Box>
              <Alert 
                severity={results.failureCount === 0 ? 'success' : 'warning'} 
                sx={{ mb: 3 }}
              >
                <Typography variant="body2">
                  Bulk role assignment completed: <strong>{results.successCount}</strong> successful, 
                  <strong> {results.failureCount}</strong> failed out of <strong>{results.totalProcessed}</strong> total.
                </Typography>
              </Alert>

              {/* Successful Assignments */}
              {results.successful.length > 0 && (
                <Box mb={3}>
                  <MDTypography variant="h6" fontWeight="medium" color="success" mb={2}>
                    Successfully Assigned ({results.successful.length})
                  </MDTypography>
                  <Box 
                    sx={{ 
                      maxHeight: 200, 
                      overflow: 'auto',
                      border: 1,
                      borderColor: 'success.main',
                      borderRadius: 2,
                      bgcolor: 'success.50'
                    }}
                  >
                    <List dense>
                      {results.successful.map((result, index) => (
                        <React.Fragment key={result.staffId}>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'success.main' }}>
                                {result.staff.firstName?.[0]}{result.staff.lastName?.[0]}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={result.staff.fullName}
                              secondary={`Role: ${departmentStaffService.getRoleDisplayName(result.role)}`}
                            />
                          </ListItem>
                          {index < results.successful.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                </Box>
              )}

              {/* Failed Assignments */}
              {results.failed.length > 0 && (
                <Box>
                  <MDTypography variant="h6" fontWeight="medium" color="error" mb={2}>
                    Failed Assignments ({results.failed.length})
                  </MDTypography>
                  <Box 
                    sx={{ 
                      maxHeight: 200, 
                      overflow: 'auto',
                      border: 1,
                      borderColor: 'error.main',
                      borderRadius: 2,
                      bgcolor: 'error.50'
                    }}
                  >
                    <List dense>
                      {results.failed.map((result, index) => (
                        <React.Fragment key={result.staffId}>
                          <ListItem>
                            <ListItemText
                              primary={`Staff ID: ${result.staffId}`}
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="error">
                                    Role: {departmentStaffService.getRoleDisplayName(result.role)}
                                  </Typography>
                                  <Typography variant="caption" color="error">
                                    Error: {result.error}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < results.failed.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </MDBox>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        {!results ? (
          <>
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
              disabled={submitting || !selectedRole}
              startIcon={submitting ? <CircularProgress size={20} /> : <GroupAddIcon />}
            >
              {submitting ? 'Assigning Roles...' : `Assign Role to ${selectedStaff.length} Staff`}
            </MDButton>
          </>
        ) : (
          <MDButton
            variant="contained"
            color="primary"
            onClick={handleCloseWithResults}
            fullWidth
          >
            Close
          </MDButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

BulkRoleAssignmentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  selectedStaff: PropTypes.array.isRequired
};

export default BulkRoleAssignmentModal;
