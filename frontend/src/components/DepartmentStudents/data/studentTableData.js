import React from 'react';
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Checkbox
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

const studentTableData = (
  students,
  handleViewDetails,
  handleEditStudent,
  handleDeleteStudent,
  handleToggleStatus,
  selectionProps = null
) => {
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
        return 'success';
      case 'Multiple Offers':
        return 'info';
      case 'Unplaced':
      default:
        return 'warning';
    }
  };

  // Helper function to get placement status icon
  const getPlacementStatusIcon = (status) => {
    switch (status) {
      case 'Placed':
        return <CheckCircleIcon fontSize="small" />;
      case 'Multiple Offers':
        return <StarIcon fontSize="small" />;
      case 'Unplaced':
      default:
        return <ScheduleIcon fontSize="small" />;
    }
  };

  // Define columns
  const columns = [
    // Checkbox column (if selection is enabled)
    ...(selectionProps ? [{
      Header: '',
      accessor: 'checkbox',
      width: '50px',
      align: 'center'
    }] : []),
    {
      Header: 'Student',
      accessor: 'student',
      width: '300px',
      align: 'left'
    },
    {
      Header: 'Student ID',
      accessor: 'studentId',
      width: '120px',
      align: 'center'
    },
    {
      Header: 'Email',
      accessor: 'email',
      width: '250px',
      align: 'left'
    },
    {
      Header: 'Program',
      accessor: 'program',
      width: '150px',
      align: 'center'
    },
    {
      Header: 'CGPA',
      accessor: 'cgpa',
      width: '80px',
      align: 'center'
    },
    {
      Header: 'Placement Status',
      accessor: 'placementStatus',
      width: '150px',
      align: 'center'
    },
    {
      Header: 'Status',
      accessor: 'status',
      width: '100px',
      align: 'center'
    },
    {
      Header: 'Last Updated',
      accessor: 'lastUpdated',
      width: '130px',
      align: 'center'
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      width: '120px',
      align: 'center'
    }
  ];

  // Generate rows
  const rows = students.map((student) => {
    const isSelected = selectionProps?.selectedStudents?.includes(student.id) || false;

    return {
      // Checkbox (if selection is enabled)
      ...(selectionProps ? {
        checkbox: (
          <Checkbox
            checked={isSelected}
            onChange={() => selectionProps.toggleStudentSelection(student.id)}
            size="small"
            sx={{
              color: 'primary.main',
              '&.Mui-checked': {
                color: 'primary.main'
              }
            }}
          />
        )
      } : {}),

      // Student info with avatar
      student: (
        <MDBox display="flex" alignItems="center" lineHeight={1}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
              fontSize: '0.875rem',
              fontWeight: 'bold',
              mr: 2
            }}
          >
            {getInitials(student)}
          </Avatar>
          <MDBox>
            <MDTypography variant="button" fontWeight="medium">
              {student.name || 'N/A'}
            </MDTypography>
            {student.registrationNumber && (
              <MDTypography variant="caption" color="text" display="block">
                Reg: {student.registrationNumber}
              </MDTypography>
            )}
          </MDBox>
        </MDBox>
      ),

      // Student ID
      studentId: (
        <MDBox textAlign="center">
          <MDTypography variant="caption" fontWeight="medium" color="text">
            {student.studentId || 'N/A'}
          </MDTypography>
        </MDBox>
      ),

      // Email
      email: (
        <MDBox>
          <MDTypography variant="caption" color="text">
            {student.email || 'N/A'}
          </MDTypography>
        </MDBox>
      ),

      // Program
      program: (
        <MDBox textAlign="center">
          <MDTypography variant="caption" color="text">
            {student.program || 'Not Specified'}
          </MDTypography>
        </MDBox>
      ),

      // CGPA
      cgpa: (
        <MDBox textAlign="center">
          <MDTypography 
            variant="caption" 
            fontWeight="medium"
            color={student.cgpa >= 8 ? 'success' : student.cgpa >= 6 ? 'warning' : 'error'}
          >
            {student.cgpa || 'N/A'}
          </MDTypography>
        </MDBox>
      ),

      // Placement Status
      placementStatus: (
        <MDBox textAlign="center">
          <Chip
            icon={getPlacementStatusIcon(student.placementStatus)}
            label={student.placementStatus || 'Unplaced'}
            color={getPlacementStatusColor(student.placementStatus)}
            size="small"
            variant="filled"
            sx={{
              fontWeight: 'medium',
              '& .MuiChip-icon': {
                fontSize: '0.875rem'
              }
            }}
          />
        </MDBox>
      ),

      // Active Status
      status: (
        <MDBox textAlign="center">
          <Chip
            label={student.isActive ? 'Active' : 'Inactive'}
            color={student.isActive ? 'success' : 'error'}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 'medium' }}
          />
        </MDBox>
      ),

      // Last Updated
      lastUpdated: (
        <MDBox textAlign="center">
          <MDTypography variant="caption" color="text">
            {student.createdAt ? 
              new Date(student.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 
              'N/A'
            }
          </MDTypography>
        </MDBox>
      ),

      // Actions
      actions: (
        <MDBox display="flex" alignItems="center" justifyContent="center" gap={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="info"
              onClick={() => handleViewDetails(student)}
              sx={{
                '&:hover': {
                  backgroundColor: 'info.light',
                  color: 'white'
                }
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {handleEditStudent && (
            <Tooltip title="Edit Student">
              <IconButton
                size="small"
                color="warning"
                onClick={() => handleEditStudent(student)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'warning.light',
                    color: 'white'
                  }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {handleDeleteStudent && (
            <Tooltip title="Delete Student">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteStudent(student)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'white'
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </MDBox>
      )
    };
  });

  return { columns, rows };
};

export default studentTableData;
