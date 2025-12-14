import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Paper,
  Avatar,
  IconButton,
  Chip,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDButton from 'components/MDButton';

// Material Dashboard 2 React context
import { useMaterialUIController } from "context";
import { getGoogleDriveThumbnail } from "utils/googleDriveUtils";

const StudentDetailsModal = ({
  open,
  onClose,
  student,
  onEditStudent,
  onSaveStudent,
  onDeleteStudent,
  canEdit = false,
  canDelete = false
}) => {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);

  // Initialize form data when student changes or modal opens
  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || student.name?.split(' ')[0] || '',
        lastName: student.lastName || student.name?.split(' ').slice(1).join(' ') || '',
        email: student.email || '',
        studentId: student.studentId || '',
        program: (student.program && student.program !== 'Not Specified') ? student.program : (student.profile?.program && student.profile.program !== 'Not Specified') ? student.profile.program : '',
        department: (student.department && student.department !== 'Not Specified') ? student.department : (student.profile?.department && student.profile.department !== 'Not Specified') ? student.profile.department : '',
        cgpa: student.cgpa || student.profile?.cgpa || '',
        placementStatus: student.placementStatus || student.profile?.placementStatus || 'Unplaced',
        isActive: student.isActive !== undefined ? student.isActive : true
      });
      setIsEditing(false); // Reset edit mode when student changes
      setError(null);
    }
  }, [student, open]);

  if (!student) return null;

  // Handle input change
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle save
  const handleSave = async () => {
    try {
      setError(null);
      await onSaveStudent(student.id || student._id, formData);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to save student details');
    }
  };

  // Helper function to get initials
  const getInitials = (student) => {
    const name = student.name || student.fullName || `${student.firstName || ''} ${student.lastName || ''}` || '';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ?
      `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase() :
      name.charAt(0).toUpperCase();
  };

  // Helper function to get placement status color (for display)
  const getPlacementStatusColor = (status) => {
    switch (status) {
      case 'Placed': return '#4caf50';
      case 'Multiple Offers': return '#2196f3';
      case 'Unplaced': default: return '#ff9800';
    }
  };

  const getPlacementStatusIcon = (status) => {
    switch (status) {
      case 'Placed': return '✅';
      case 'Multiple Offers': return '⭐';
      case 'Unplaced': default: return '⏰';
    }
  };

  // Colors for dark/light mode
  const bgColor = darkMode ? '#202940' : '#fff';
  const paperColor = darkMode ? '#1a2035' : '#fff'; // Slightly darker for cards in dark mode
  const textColor = darkMode ? '#fff' : '#344767';
  const subTextColor = darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary';
  const actionBgColor = darkMode ? '#1a2035' : '#f8f9fa';
  const borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e0e0e0';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          bgcolor: bgColor, // Use dynamic background
          color: textColor
        }
      }}
    >
      {/* Enhanced Header with Gradient Background */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          p: 4,
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Student Profile Header */}
        <Box display="flex" alignItems="center" gap={3}>
          <Avatar
            src={getGoogleDriveThumbnail(student.profileImageUrl || student.profileImage || student.userId?.profilePicture || student.profile?.profileImage || student.profilePicture)}
            imgProps={{ referrerPolicy: 'no-referrer' }}
            onError={(e) => { e.currentTarget.removeAttribute('src'); }}
            sx={{
              width: 100,
              height: 100,
              bgcolor: 'rgba(255,255,255,0.2)',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              border: '4px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}
          >
            {getInitials(student)}
          </Avatar>

          <Box flex={1}>
            <Typography variant="h3" fontWeight="bold" mb={1} color="white">
              {student.name || `${student.firstName || ''} ${student.lastName || ''}` || 'N/A'}
            </Typography>

            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Chip
                label={student.isActive ? 'Active' : 'Inactive'}
                sx={{
                  backgroundColor: student.isActive ? '#4caf50' : '#f44336',
                  color: 'white',
                  fontWeight: 'bold',
                  '& .MuiChip-label': { px: 2 }
                }}
              />
              <Chip
                label={student.placementStatus || 'Unplaced'}
                sx={{
                  backgroundColor: getPlacementStatusColor(student.placementStatus),
                  color: 'white',
                  fontWeight: 'bold',
                  '& .MuiChip-label': { px: 2 }
                }}
              />
            </Box>

            <Typography variant="h6" sx={{ opacity: 0.9, color: 'white' }}>
              {student.studentId} • {student.program || 'Program Not Specified'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Enhanced Content */}
      <DialogContent sx={{ p: 0, bgcolor: bgColor }}>
        <Box p={4}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Grid container spacing={4}>
            {/* Personal Information Card */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: `1px solid ${borderColor}`,
                  height: '100%',
                  bgcolor: paperColor,
                  color: textColor
                }}
              >
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar sx={{ bgcolor: '#2196f3', mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    Personal Information
                  </Typography>
                </Box>

                <Box space={3}>
                  {isEditing ? (
                    <>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            margin="normal"
                          // Adding focused styles for dark mode if needed, but default MUI should handle basic inputs mostly OK 
                          // though sometimes standard InputLabel needs care in dark mode if not properly themed.
                          // We rely on standard MUI dark mode behavior for inputs.
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            margin="normal"
                          />
                        </Grid>
                      </Grid>
                      <TextField
                        fullWidth
                        label="Student ID"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        margin="normal"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isActive}
                            onChange={handleChange}
                            name="isActive"
                            color="primary"
                          />
                        }
                        label="Account Active"
                        sx={{ mt: 2, color: textColor }}
                      />
                    </>
                  ) : (
                    <>
                      <Box mb={3}>
                        <Typography variant="subtitle2" color={subTextColor} fontWeight="bold">
                          Full Name
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem', color: textColor }}>
                          {student.name || `${student.firstName || ''} ${student.lastName || ''}` || 'Not specified'}
                        </Typography>
                      </Box>

                      <Box mb={3}>
                        <Typography variant="subtitle2" color={subTextColor} fontWeight="bold">
                          Student ID
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem', fontFamily: 'monospace', color: textColor }}>
                          {student.studentId || 'Not specified'}
                        </Typography>
                      </Box>

                      {student.registrationNumber && (
                        <Box mb={3}>
                          <Typography variant="subtitle2" color={subTextColor} fontWeight="bold">
                            Registration Number
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem', fontFamily: 'monospace', color: textColor }}>
                            {student.registrationNumber}
                          </Typography>
                        </Box>
                      )}

                      <Box mb={3}>
                        <Typography variant="subtitle2" color={subTextColor} fontWeight="bold">
                          Email Address
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem', color: '#1976d2' }}>
                          {student.email || 'Not specified'}
                        </Typography>
                      </Box>

                      <Box mb={3}>
                        <Typography variant="subtitle2" color={subTextColor} fontWeight="bold">
                          Account Status
                        </Typography>
                        <Box display="flex" alignItems="center" mt={0.5}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: student.isActive ? '#4caf50' : '#f44336',
                              mr: 1
                            }}
                          />
                          <Typography variant="body1" sx={{ fontSize: '1.1rem', color: textColor }}>
                            {student.isActive ? 'Active' : 'Inactive'}
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Academic Information Card */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: `1px solid ${borderColor}`,
                  height: '100%',
                  bgcolor: paperColor,
                  color: textColor
                }}
              >
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                    <SchoolIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    Academic Information
                  </Typography>
                </Box>

                <Box space={3}>
                  {isEditing ? (
                    <>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Program</InputLabel>
                        <Select
                          name="program"
                          value={formData.program}
                          label="Program"
                          onChange={handleChange}
                        >
                          <MenuItem value="B.E">B.E</MenuItem>
                          <MenuItem value="B.Tech">B.Tech</MenuItem>
                          <MenuItem value="M.E">M.E</MenuItem>
                          <MenuItem value="M.Tech">M.Tech</MenuItem>
                          <MenuItem value="MBA">MBA</MenuItem>
                          <MenuItem value="MCA">MCA</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        fullWidth
                        label="Department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        margin="normal"
                        helperText="Department Code (e.g., CSE, ECE)"
                      />

                      <TextField
                        fullWidth
                        label="CGPA"
                        name="cgpa"
                        type="number"
                        inputProps={{ step: "0.01", min: "0", max: "10" }}
                        value={formData.cgpa}
                        onChange={handleChange}
                        margin="normal"
                      />

                      <FormControl fullWidth margin="normal">
                        <InputLabel>Placement Status</InputLabel>
                        <Select
                          name="placementStatus"
                          value={formData.placementStatus}
                          label="Placement Status"
                          onChange={handleChange}
                        >
                          <MenuItem value="Unplaced">Unplaced</MenuItem>
                          <MenuItem value="Placed">Placed</MenuItem>
                          <MenuItem value="Multiple Offers">Multiple Offers</MenuItem>
                        </Select>
                      </FormControl>
                    </>
                  ) : (
                    <>
                      <Box mb={3}>
                        <Typography variant="subtitle2" color={subTextColor} fontWeight="bold">
                          Program
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem', color: textColor }}>
                          {student.program || 'Not specified'}
                        </Typography>
                      </Box>

                      <Box mb={3}>
                        <Typography variant="subtitle2" color={subTextColor} fontWeight="bold">
                          Department
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem', color: textColor }}>
                          {student.department || 'Not specified'}
                        </Typography>
                      </Box>

                      <Box mb={3}>
                        <Typography variant="subtitle2" color={subTextColor} fontWeight="bold">
                          CGPA
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            mt: 0.5,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            color: student.cgpa >= 8 ? '#4caf50' : student.cgpa >= 6 ? '#ff9800' : '#f44336'
                          }}
                        >
                          {student.cgpa || 'Not specified'}
                        </Typography>
                      </Box>

                      <Box mb={3}>
                        <Typography variant="subtitle2" color={subTextColor} fontWeight="bold">
                          Placement Status
                        </Typography>
                        <Box display="flex" alignItems="center" mt={0.5}>
                          <Typography variant="body1" sx={{ fontSize: '1.2rem', mr: 1 }}>
                            {getPlacementStatusIcon(student.placementStatus)}
                          </Typography>
                          <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 'medium', color: textColor }}>
                            {student.placementStatus || 'Unplaced'}
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Record Information Card - View Only */}
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: `1px solid ${borderColor}`,
                  bgcolor: paperColor,
                  color: textColor
                }}
              >
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                    <AssignmentIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    Record Information
                  </Typography>
                </Box>

                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color={subTextColor} fontWeight="bold">
                      Created Date
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem', color: textColor }}>
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Not available'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color={subTextColor} fontWeight="bold">
                      Last Updated
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem', color: textColor }}>
                      {student.updatedAt ? new Date(student.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Never'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      {/* Enhanced Action Buttons */}
      <Box
        sx={{
          p: 3,
          backgroundColor: actionBgColor,
          borderTop: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <MDButton
          onClick={onClose}
          variant="outlined"
          color="info"
          size="large"
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          Close
        </MDButton>

        <Box display="flex" gap={2}>
          {canEdit && onSaveStudent && (isEditing ? (
            <>
              <MDButton
                variant="outlined"
                color="secondary"
                size="large"
                onClick={() => setIsEditing(false)}
                startIcon={<CancelIcon />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 3
                }}
              >
                Cancel
              </MDButton>
              <MDButton
                variant="gradient"
                color="success"
                size="large"
                onClick={handleSave}
                startIcon={<SaveIcon />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 3
                }}
              >
                Save Changes
              </MDButton>
            </>
          ) : (
            <MDButton
              variant="gradient"
              color="info"
              size="large"
              onClick={() => setIsEditing(true)}
              startIcon={<EditIcon />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 3
              }}
            >
              Edit Student
            </MDButton>
          ))}

          {!isEditing && canDelete && onDeleteStudent && (
            <MDButton
              variant="gradient"
              color="error"
              size="large"
              onClick={() => {
                onClose();
                onDeleteStudent(student);
              }}
              startIcon={<DeleteIcon />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 3
              }}
            >
              Delete Student
            </MDButton>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};

export default StudentDetailsModal;
