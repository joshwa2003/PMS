import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Collapse
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Visibility, Edit } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import axios from 'axios';

function DepartmentWiseStudentDashboard() {
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState({});
  const [students, setStudents] = useState({});
  const [expandedDepartment, setExpandedDepartment] = useState(null);
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [loading, setLoading] = useState({
    departments: false,
    batches: {},
    students: {}
  });
  const [error, setError] = useState(null);

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch departments from API
  const fetchDepartments = async () => {
    setLoading(prev => ({ ...prev, departments: true }));
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to load departments. Please try again later.');
    } finally {
      setLoading(prev => ({ ...prev, departments: false }));
    }
  };

  // Fetch batches for a specific department
  const fetchBatches = async (departmentId) => {
    if (batches[departmentId]) {
      // Batches already loaded, just toggle visibility
      setExpandedDepartment(expandedDepartment === departmentId ? null : departmentId);
      return;
    }

    setLoading(prev => ({ 
      ...prev, 
      batches: { ...prev.batches, [departmentId]: true } 
    }));
    
    try {
      const response = await axios.get(`/api/departments/${departmentId}/batches`);
      setBatches(prev => ({ ...prev, [departmentId]: response.data }));
      setExpandedDepartment(departmentId);
      setError(null);
    } catch (err) {
      console.error(`Error fetching batches for department ${departmentId}:`, err);
      setError('Failed to load batches. Please try again later.');
    } finally {
      setLoading(prev => ({ 
        ...prev, 
        batches: { ...prev.batches, [departmentId]: false } 
      }));
    }
  };

  // Fetch students for a specific batch in a department
  const fetchStudents = async (departmentId, batchId) => {
    const batchKey = `${departmentId}-${batchId}`;
    
    if (students[batchKey]) {
      // Students already loaded, just toggle visibility
      setExpandedBatch(expandedBatch === batchKey ? null : batchKey);
      return;
    }

    setLoading(prev => ({ 
      ...prev, 
      students: { ...prev.students, [batchKey]: true } 
    }));
    
    try {
      const response = await axios.get(`/api/departments/${departmentId}/batches/${batchId}/students`);
      setStudents(prev => ({ ...prev, [batchKey]: response.data }));
      setExpandedBatch(batchKey);
      setError(null);
    } catch (err) {
      console.error(`Error fetching students for batch ${batchId} in department ${departmentId}:`, err);
      setError('Failed to load students. Please try again later.');
    } finally {
      setLoading(prev => ({ 
        ...prev, 
        students: { ...prev.students, [batchKey]: false } 
      }));
    }
  };

  // Handle view/edit student action
  const handleStudentAction = (action, studentId) => {
    console.log(`${action} student with ID: ${studentId}`);
    // Implement navigation or modal for viewing/editing student
  };

  if (error) {
    return (
      <MDBox display="flex" justifyContent="center" p={3}>
        <Typography color="error">{error}</Typography>
      </MDBox>
    );
  }

  return (
    <MDBox p={3}>
      <MDTypography variant="h5" mb={3}>Department-wise Student Dashboard</MDTypography>
      
      {/* Departments Table */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="5%"></TableCell>
              <TableCell>Department Name</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading.departments ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No departments found
                </TableCell>
              </TableRow>
            ) : (
              departments.map((department) => (
                <React.Fragment key={department._id}>
                  <TableRow>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => fetchBatches(department._id)}
                      >
                        {expandedDepartment === department._id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{department.name}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => fetchBatches(department._id)}
                      >
                        View Batches
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Batches Table (Collapsible) */}
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                      <Collapse in={expandedDepartment === department._id} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                          <Typography variant="h6" gutterBottom component="div">
                            Batches
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell width="5%"></TableCell>
                                <TableCell>Batch Name</TableCell>
                                <TableCell align="right">Action</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {loading.batches[department._id] ? (
                                <TableRow>
                                  <TableCell colSpan={3} align="center">
                                    <CircularProgress size={20} />
                                  </TableCell>
                                </TableRow>
                              ) : batches[department._id]?.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={3} align="center">
                                    No batches found for this department
                                  </TableCell>
                                </TableRow>
                              ) : (
                                batches[department._id]?.map((batch) => (
                                  <React.Fragment key={batch._id}>
                                    <TableRow>
                                      <TableCell>
                                        <IconButton
                                          size="small"
                                          onClick={() => fetchStudents(department._id, batch._id)}
                                        >
                                          {expandedBatch === `${department._id}-${batch._id}` ? 
                                            <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                        </IconButton>
                                      </TableCell>
                                      <TableCell>{batch.name}</TableCell>
                                      <TableCell align="right">
                                        <Button
                                          variant="contained"
                                          color="primary"
                                          size="small"
                                          onClick={() => fetchStudents(department._id, batch._id)}
                                        >
                                          View Students
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                    
                                    {/* Students Table (Collapsible) */}
                                    <TableRow>
                                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                                        <Collapse 
                                          in={expandedBatch === `${department._id}-${batch._id}`} 
                                          timeout="auto" 
                                          unmountOnExit
                                        >
                                          <Box sx={{ margin: 2 }}>
                                            <Typography variant="h6" gutterBottom component="div">
                                              Students
                                            </Typography>
                                            <Table size="small">
                                              <TableHead>
                                                <TableRow>
                                                  <TableCell>Roll No</TableCell>
                                                  <TableCell>Name</TableCell>
                                                  <TableCell>Email</TableCell>
                                                  <TableCell>Status</TableCell>
                                                  <TableCell align="right">Actions</TableCell>
                                                </TableRow>
                                              </TableHead>
                                              <TableBody>
                                                {loading.students[`${department._id}-${batch._id}`] ? (
                                                  <TableRow>
                                                    <TableCell colSpan={5} align="center">
                                                      <CircularProgress size={20} />
                                                    </TableCell>
                                                  </TableRow>
                                                ) : students[`${department._id}-${batch._id}`]?.length === 0 ? (
                                                  <TableRow>
                                                    <TableCell colSpan={5} align="center">
                                                      No students found for this batch
                                                    </TableCell>
                                                  </TableRow>
                                                ) : (
                                                  students[`${department._id}-${batch._id}`]?.map((student) => (
                                                    <TableRow key={student._id}>
                                                      <TableCell>{student.rollNo}</TableCell>
                                                      <TableCell>{student.name}</TableCell>
                                                      <TableCell>{student.email}</TableCell>
                                                      <TableCell>{student.status}</TableCell>
                                                      <TableCell align="right">
                                                        <IconButton
                                                          size="small"
                                                          onClick={() => handleStudentAction('view', student._id)}
                                                        >
                                                          <Visibility fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                          size="small"
                                                          onClick={() => handleStudentAction('edit', student._id)}
                                                        >
                                                          <Edit fontSize="small" />
                                                        </IconButton>
                                                      </TableCell>
                                                    </TableRow>
                                                  ))
                                                )}
                                              </TableBody>
                                            </Table>
                                          </Box>
                                        </Collapse>
                                      </TableCell>
                                    </TableRow>
                                  </React.Fragment>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MDBox>
  );
}

export default DepartmentWiseStudentDashboard;