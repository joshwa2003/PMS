import React, { memo } from 'react';
import {
  Box,
  Checkbox,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDBadge from 'components/MDBadge';

// Memoized row component for performance
const StudentRow = memo(({ student, isSelected, onToggleSelection, onDeleteStudent }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        padding: '8px 16px',
        backgroundColor: isSelected ? '#f5f5f5' : 'white',
        '&:hover': {
          backgroundColor: '#fafafa'
        },
        minHeight: '72px'
      }}
    >
      {/* Checkbox */}
      <Box sx={{ flex: '0 0 60px', display: 'flex', alignItems: 'center' }}>
        <Checkbox
          checked={isSelected}
          onChange={() => onToggleSelection(student.id)}
          sx={{ padding: 0 }}
        />
      </Box>

      {/* Student Info */}
      <Box sx={{ flex: '1 1 25%', display: 'flex', alignItems: 'center' }}>
        <MDBox display="flex" alignItems="center">
          <MDBox
            width="40px"
            height="40px"
            borderRadius="50%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            color="white"
            bgColor={student.isActive ? "success" : "error"}
            mr={2}
          >
            {student.fullName?.charAt(0)?.toUpperCase() || "S"}
          </MDBox>
          <MDBox display="flex" flexDirection="column">
            <MDTypography variant="button" fontWeight="medium">
              {student.fullName || "Unknown"}
            </MDTypography>
            <MDTypography variant="caption" color="text">
              {student.studentId || "No ID"}
            </MDTypography>
          </MDBox>
        </MDBox>
      </Box>

      {/* Department */}
      <Box sx={{ flex: '0 0 15%' }}>
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {student.department?.name || "N/A"}
        </MDTypography>
      </Box>

      {/* Status */}
      <Box sx={{ flex: '0 0 10%' }}>
        <MDBadge
          badgeContent={student.isActive ? "Active" : "Inactive"}
          color={student.isActive ? "success" : "error"}
          variant="gradient"
          size="sm"
        />
      </Box>

      {/* Placement */}
      <Box sx={{ flex: '0 0 15%' }}>
        <MDBadge
          badgeContent={student.placementStatus || "Not Placed"}
          color={student.placementStatus === "Placed" ? "success" : "warning"}
          variant="gradient"
          size="sm"
        />
      </Box>

      {/* Last Login */}
      <Box sx={{ flex: '0 0 15%' }}>
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : "Never"}
        </MDTypography>
      </Box>

      {/* Actions */}
      <Box sx={{ flex: '0 0 10%', display: 'flex', gap: 1 }}>
        <Tooltip title="View Student">
          <IconButton size="small" color="info">
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Student">
          <IconButton 
            size="small" 
            color="error"
            onClick={() => onDeleteStudent(student)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
});

StudentRow.displayName = 'StudentRow';

const OptimizedStudentTable = ({
  students = [],
  selectedStudents = [],
  onToggleSelection,
  onDeleteStudent,
  height = 600
}) => {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Table Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          padding: '12px 16px',
          borderBottom: '2px solid #e0e0e0',
          fontWeight: 'bold',
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}
      >
        <Box sx={{ flex: '0 0 60px' }}>
          <MDTypography variant="caption" fontWeight="bold">Select</MDTypography>
        </Box>
        <Box sx={{ flex: '1 1 25%' }}>
          <MDTypography variant="caption" fontWeight="bold">Student</MDTypography>
        </Box>
        <Box sx={{ flex: '0 0 15%' }}>
          <MDTypography variant="caption" fontWeight="bold">Department</MDTypography>
        </Box>
        <Box sx={{ flex: '0 0 10%' }}>
          <MDTypography variant="caption" fontWeight="bold">Status</MDTypography>
        </Box>
        <Box sx={{ flex: '0 0 15%' }}>
          <MDTypography variant="caption" fontWeight="bold">Placement</MDTypography>
        </Box>
        <Box sx={{ flex: '0 0 15%' }}>
          <MDTypography variant="caption" fontWeight="bold">Last Login</MDTypography>
        </Box>
        <Box sx={{ flex: '0 0 10%' }}>
          <MDTypography variant="caption" fontWeight="bold">Actions</MDTypography>
        </Box>
      </Box>

      {/* Scrollable Student List */}
      <Box
        sx={{
          height: height,
          overflowY: 'auto',
          overflowX: 'hidden',
          // Enable GPU acceleration for smooth scrolling
          willChange: 'transform',
          transform: 'translateZ(0)',
          // Optimize scrolling performance
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {students.map((student) => (
          <StudentRow
            key={student.id}
            student={student}
            isSelected={selectedStudents.includes(student.id)}
            onToggleSelection={onToggleSelection}
            onDeleteStudent={onDeleteStudent}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default OptimizedStudentTable;
