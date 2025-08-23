import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Close, Download, Visibility, Email } from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import MDInput from 'components/MDInput';

// Services
import departmentWiseStudentService from 'services/departmentWiseStudentService';

const StudentListModal = ({ open, onClose, department }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch students when modal opens or filters change
  useEffect(() => {
    if (open && department) {
      fetchStudents();
    }
  }, [open, department, page, rowsPerPage, searchTerm, statusFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };

      const response = await departmentWiseStudentService.getDepartmentStudents(department.id, params);
      
      if (response.success) {
        setStudents(response.data.students);
        setTotalStudents(response.data.pagination.total);
      } else {
        setError(response.message || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0); // Reset to first page when filtering
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportCSV = async () => {
    try {
      const allStudentsParams = {
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 1000 // Get all students for export
      };

      const response = await departmentWiseStudentService.getDepartmentStudents(department.id, allStudentsParams);
      
      if (response.success) {
        departmentWiseStudentService.exportToCSV(response.data.students, `${department.name}_students`);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const getStatusColor = (status) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!department) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDBox>
            <MDTypography variant="h4" fontWeight="medium">
              Students in {department.name}
            </MDTypography>
            <MDTypography variant="body2" color="text" mt={0.5}>
              Placement Staff: {department.placementStaff?.firstName} {department.placementStaff?.lastName}
              {department.placementStaff?.email && ` (${department.placementStaff.email})`}
            </MDTypography>
          </MDBox>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </MDBox>
      </DialogTitle>

      <DialogContent>
        <MDBox mb={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <MDInput
                fullWidth
                placeholder="Search students..."
                value={searchTerm}
                onChange={handleSearchChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Filter by Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Placed">Placed</MenuItem>
                  <MenuItem value="Unplaced">Unplaced</MenuItem>
                  <MenuItem value="Multiple Offers">Multiple Offers</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <MDButton
                variant="outlined"
                color="info"
                startIcon={<Download />}
                onClick={handleExportCSV}
                fullWidth
              >
                Export CSV
              </MDButton>
            </Grid>
          </Grid>
        </MDBox>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <MDBox display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </MDBox>
        ) : (
          <Card>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <MDTypography variant="caption" fontWeight="bold" textTransform="uppercase">
                          Name
                        </MDTypography>
                      </TableCell>
                      <TableCell>
                        <MDTypography variant="caption" fontWeight="bold" textTransform="uppercase">
                          Student ID
                        </MDTypography>
                      </TableCell>
                      <TableCell>
                        <MDTypography variant="caption" fontWeight="bold" textTransform="uppercase">
                          Email
                        </MDTypography>
                      </TableCell>
                      <TableCell>
                        <MDTypography variant="caption" fontWeight="bold" textTransform="uppercase">
                          Program
                        </MDTypography>
                      </TableCell>
                      <TableCell>
                        <MDTypography variant="caption" fontWeight="bold" textTransform="uppercase">
                          CGPA
                        </MDTypography>
                      </TableCell>
                      <TableCell>
                        <MDTypography variant="caption" fontWeight="bold" textTransform="uppercase">
                          Placement Status
                        </MDTypography>
                      </TableCell>
                      <TableCell>
                        <MDTypography variant="caption" fontWeight="bold" textTransform="uppercase">
                          Last Updated
                        </MDTypography>
                      </TableCell>
                      <TableCell align="center">
                        <MDTypography variant="caption" fontWeight="bold" textTransform="uppercase">
                          Actions
                        </MDTypography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student._id} hover>
                        <TableCell>
                          <MDBox>
                            <MDTypography variant="button" fontWeight="medium">
                              {student.personalInfo?.fullName || `${student.firstName} ${student.lastName}`}
                            </MDTypography>
                          </MDBox>
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="caption">
                            {student.studentId || 'N/A'}
                          </MDTypography>
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="caption">
                            {student.email || student.contact?.email || 'N/A'}
                          </MDTypography>
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="caption">
                            {student.academic?.program || 'N/A'}
                          </MDTypography>
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="caption">
                            {student.academic?.cgpa || 'N/A'}
                          </MDTypography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={student.placement?.placementStatus || 'Unplaced'}
                            color={getStatusColor(student.placement?.placementStatus)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="caption">
                            {formatDate(student.profileLastUpdated || student.updatedAt)}
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDBox display="flex" justifyContent="center" gap={1}>
                            <Tooltip title="View Profile">
                              <IconButton size="small" color="info">
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {student.email && (
                              <Tooltip title="Send Email">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => window.open(`mailto:${student.email}`)}
                                >
                                  <Email fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </MDBox>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {students.length === 0 && !loading && (
                <MDBox textAlign="center" py={4}>
                  <MDTypography variant="body2" color="text">
                    No students found matching your criteria.
                  </MDTypography>
                </MDBox>
              )}

              <TablePagination
                component="div"
                count={totalStudents}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions>
        <MDBox display="flex" justifyContent="space-between" width="100%" px={2} pb={1}>
          <MDTypography variant="body2" color="text">
            Total: {totalStudents} students
            {department.studentStats && (
              <>
                {' | '}
                Placed: {department.studentStats.placed || 0}
                {' | '}
                Unplaced: {department.studentStats.unplaced || 0}
              </>
            )}
          </MDTypography>
          <MDButton onClick={onClose} color="secondary">
            Close
          </MDButton>
        </MDBox>
      </DialogActions>
    </Dialog>
  );
};

export default StudentListModal;
