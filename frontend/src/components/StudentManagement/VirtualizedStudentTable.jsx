import React from 'react';
import { List as VirtualList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
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

const VirtualizedStudentTable = ({
  students = [],
  selectedStudents = [],
  onToggleSelection,
  onDeleteStudent,
  height = 600
}) => {
  // Row renderer for each student
  const Row = ({ index, style }) => {
    const student = students[index];
    if (!student) return null;
    
    const isSelected = selectedStudents.includes(student.id);

    return (
      <Box
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
          padding: '8px 16px',
          backgroundColor: isSelected ? '#f5f5f5' : 'white',
          '&:hover': {
            backgroundColor: '#fafafa'
          }
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
  };

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
          fontWeight: 'bold'
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

      {/* Virtualized List */}
      <Box sx={{ width: '100%', height: height }}>
        <AutoSizer>
          {({ height: autoHeight, width }) => (
            <VirtualList
              height={autoHeight}
              itemCount={students.length}
              itemSize={72}
              width={width}
              overscanCount={5}
            >
              {Row}
            </VirtualList>
          )}
        </AutoSizer>
      </Box>
    </Paper>
  );
};

export default VirtualizedStudentTable;
