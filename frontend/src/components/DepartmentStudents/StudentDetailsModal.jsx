import React from 'react';
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
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Person as PersonIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDButton from 'components/MDButton';

const StudentDetailsModal = ({ 
  open, 
  onClose, 
  student, 
  onEditStudent, 
  onDeleteStudent,
  canEdit = false,
  canDelete = false 
}) => {
  if (!student) return null;

  // Helper function to get initials
  const getInitials = (student) => {
    const name = student.name || '';
    const parts = name.split(' ');
    return parts.length >= 2 ? 
      `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase() :
      name.charAt(0).toUpperCase();
  };

  // Helper function to get placement status color
  const getPlacementStatusColor = (status) => {
    switch (status) {
      case 'Placed':
        return '#4caf50';
      case 'Multiple Offers':
        return '#2196f3';
      case 'Unplaced':
      default:
        return '#ff9800';
    }
  };

  // Helper function to get placement status icon
  const getPlacementStatusIcon = (status) => {
    switch (status) {
      case 'Placed':
        return '✅';
      case 'Multiple Offers':
        return '⭐';
      case 'Unplaced':
      default:
        return '⏰';
    }
  };

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
          overflow: 'hidden'
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
            <Typography variant="h3" fontWeight="bold" mb={1}>
              {student.name || 'N/A'}
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
            
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {student.studentId} • {student.program || 'Program Not Specified'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Enhanced Content */}
      <DialogContent sx={{ p: 0 }}>
        <Box p={4}>
          <Grid container spacing={4}>
            {/* Personal Information Card */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  height: '100%'
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
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                      Full Name
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem' }}>
                      {student.name || 'Not specified'}
                    </Typography>
                  </Box>

                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                      Student ID
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem', fontFamily: 'monospace' }}>
                      {student.studentId || 'Not specified'}
                    </Typography>
                  </Box>

                  {student.registrationNumber && (
                    <Box mb={3}>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                        Registration Number
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem', fontFamily: 'monospace' }}>
                        {student.registrationNumber}
                      </Typography>
                    </Box>
                  )}

                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                      Email Address
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem', color: '#1976d2' }}>
                      {student.email || 'Not specified'}
                    </Typography>
                  </Box>

                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
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
                      <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </Typography>
                    </Box>
                  </Box>
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
                  border: '1px solid #e0e0e0',
                  height: '100%'
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
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                      Program
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem' }}>
                      {student.program || 'Not specified'}
                    </Typography>
                  </Box>

                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                      Department
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem' }}>
                      {student.department || 'Not specified'}
                    </Typography>
                  </Box>

                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
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
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                      Placement Status
                    </Typography>
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <Typography variant="body1" sx={{ fontSize: '1.2rem', mr: 1 }}>
                        {getPlacementStatusIcon(student.placementStatus)}
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 'medium' }}>
                        {student.placementStatus || 'Unplaced'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Record Information Card */}
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
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
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                      Created Date
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem' }}>
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
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                      Last Updated
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontSize: '1.1rem' }}>
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
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          Close
        </Button>
        
        <Box display="flex" gap={2}>
          {canEdit && onEditStudent && (
            <MDButton
              variant="gradient"
              color="info"
              size="large"
              onClick={() => {
                onClose();
                onEditStudent(student);
              }}
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
          )}
          
          {canDelete && onDeleteStudent && (
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
