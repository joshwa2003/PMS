import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Chip,
  Collapse,
  IconButton,
  Alert,
  Skeleton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  School as SchoolIcon,
  Groups as GroupsIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';

// Services
import { batchService } from 'services/batchService';

const BatchSelector = ({ 
  selectedDepartments = [], 
  selectedBatches = [], 
  onBatchChange,
  error = null,
  disabled = false 
}) => {
  const [batchesByDepartment, setBatchesByDepartment] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedDepartments, setExpandedDepartments] = useState({});
  const [fetchError, setFetchError] = useState(null);

  // Test function to check API connectivity
  const testBatchAPI = async () => {
    try {
      console.log('🧪 Testing batch API connectivity...');
      const response = await batchService.getAllBatches();
      console.log('✅ Batch API test successful:', response);
    } catch (error) {
      console.error('❌ Batch API test failed:', error);
    }
  };

  // Fetch batches when departments change
  useEffect(() => {
    // Run API test on first load
    if (selectedDepartments && selectedDepartments.length > 0) {
      testBatchAPI();
    }

    const fetchBatches = async () => {
      if (!selectedDepartments || selectedDepartments.length === 0) {
        setBatchesByDepartment({});
        return;
      }

      setLoading(true);
      setFetchError(null);
      
      try {
        console.log('🔍 Fetching batches for departments:', selectedDepartments);
        const response = await batchService.getBatchesByDepartments(selectedDepartments);
        console.log('📦 Batch API response:', response);
        console.log('📦 Response.data:', response.data);
        console.log('📦 Object.keys(response.data):', Object.keys(response.data || {}));
        
        // The API interceptor returns response.data, so the actual batch data is in response.data
        const batchData = response.data || response;
        console.log('📦 Actual batch data:', batchData);
        console.log('📦 Object.keys(batchData):', Object.keys(batchData || {}));
        setBatchesByDepartment(batchData);
        
        // Auto-expand departments that have batches
        const newExpanded = {};
        Object.keys(batchData || {}).forEach(deptId => {
          newExpanded[deptId] = true;
        });
        setExpandedDepartments(newExpanded);
      } catch (error) {
        console.error('❌ Error fetching batches:', error);
        console.error('❌ Error response:', error.response?.data);
        setFetchError(error.message || 'Failed to fetch batches');
        setBatchesByDepartment({});
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [selectedDepartments]);

  // Handle batch selection
  const handleBatchToggle = (batchId) => {
    if (disabled) return;

    const newSelectedBatches = selectedBatches.includes(batchId)
      ? selectedBatches.filter(id => id !== batchId)
      : [...selectedBatches, batchId];
    
    onBatchChange(newSelectedBatches);
  };

  // Handle department expand/collapse
  const handleDepartmentToggle = (departmentId) => {
    setExpandedDepartments(prev => ({
      ...prev,
      [departmentId]: !prev[departmentId]
    }));
  };

  // Handle select all batches for a department
  const handleSelectAllDepartmentBatches = (departmentId, batches) => {
    if (disabled) return;

    const departmentBatchIds = batches.map(batch => batch._id);
    const allSelected = departmentBatchIds.every(id => selectedBatches.includes(id));
    
    let newSelectedBatches;
    if (allSelected) {
      // Deselect all batches from this department
      newSelectedBatches = selectedBatches.filter(id => !departmentBatchIds.includes(id));
    } else {
      // Select all batches from this department
      const batchesToAdd = departmentBatchIds.filter(id => !selectedBatches.includes(id));
      newSelectedBatches = [...selectedBatches, ...batchesToAdd];
    }
    
    onBatchChange(newSelectedBatches);
  };

  // Get selected batch count for a department
  const getSelectedBatchCount = (batches) => {
    const departmentBatchIds = batches.map(batch => batch._id);
    return departmentBatchIds.filter(id => selectedBatches.includes(id)).length;
  };

  // Check if all batches in a department are selected
  const areAllBatchesSelected = (batches) => {
    const departmentBatchIds = batches.map(batch => batch._id);
    return departmentBatchIds.length > 0 && departmentBatchIds.every(id => selectedBatches.includes(id));
  };

  // Check if some batches in a department are selected
  const areSomeBatchesSelected = (batches) => {
    const departmentBatchIds = batches.map(batch => batch._id);
    return departmentBatchIds.some(id => selectedBatches.includes(id));
  };

  if (!selectedDepartments || selectedDepartments.length === 0) {
    return (
      <MDBox mt={2}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <MDTypography variant="body2">
            Please select departments first to choose specific batches.
          </MDTypography>
        </Alert>
      </MDBox>
    );
  }

  if (loading) {
    return (
      <MDBox mt={2}>
        <Grid container spacing={2}>
          {[1, 2].map((item) => (
            <Grid item xs={12} key={item}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
                  <Box sx={{ mt: 2 }}>
                    {[1, 2, 3].map((batch) => (
                      <Skeleton key={batch} variant="rectangular" height={40} sx={{ mt: 1, borderRadius: 1 }} />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </MDBox>
    );
  }

  if (fetchError) {
    return (
      <MDBox mt={2}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <MDTypography variant="body2">
            {fetchError}
          </MDTypography>
          <MDTypography variant="caption" color="text" sx={{ mt: 1, display: 'block' }}>
            Please check the browser console for more details. Make sure you're logged in.
          </MDTypography>
        </Alert>
      </MDBox>
    );
  }

  const departmentEntries = Object.entries(batchesByDepartment);
  
  console.log('🎯 BatchSelector render state:', {
    batchesByDepartment,
    departmentEntries,
    departmentEntriesLength: departmentEntries.length,
    loading,
    fetchError
  });

  if (departmentEntries.length === 0) {
    return (
      <MDBox mt={2}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <MDTypography variant="body2">
            No active batches found for the selected departments.
          </MDTypography>
        </Alert>
      </MDBox>
    );
  }

  return (
    <MDBox mt={2}>
      <Grid container spacing={2}>
        {departmentEntries.map(([departmentId, departmentData]) => {
          const { department, batches } = departmentData;
          const isExpanded = expandedDepartments[departmentId];
          const selectedCount = getSelectedBatchCount(batches);
          const allSelected = areAllBatchesSelected(batches);
          const someSelected = areSomeBatchesSelected(batches);

          return (
            <Grid item xs={12} key={departmentId}>
              <Card 
                sx={{ 
                  borderRadius: 2,
                  border: someSelected ? '2px solid' : '1px solid',
                  borderColor: someSelected ? 'info.main' : 'grey.300',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <CardContent sx={{ pb: isExpanded ? 2 : '16px !important' }}>
                  {/* Department Header */}
                  <MDBox 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="space-between"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleDepartmentToggle(departmentId)}
                  >
                    <MDBox display="flex" alignItems="center" gap={1}>
                      <SchoolIcon color="info" />
                      <MDBox>
                        <MDTypography variant="h6" fontWeight="medium" color="dark">
                          {department.name}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          {batches.length} batch{batches.length !== 1 ? 'es' : ''} available
                          {selectedCount > 0 && (
                            <Chip 
                              label={`${selectedCount} selected`}
                              size="small" 
                              color="info" 
                              sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                            />
                          )}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                    
                    <MDBox display="flex" alignItems="center" gap={1}>
                      {batches.length > 1 && (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={allSelected}
                              indeterminate={someSelected && !allSelected}
                              onChange={() => handleSelectAllDepartmentBatches(departmentId, batches)}
                              disabled={disabled}
                              size="small"
                            />
                          }
                          label={
                            <MDTypography variant="caption" color="text">
                              Select All
                            </MDTypography>
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <IconButton size="small" disabled={disabled}>
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </MDBox>
                  </MDBox>

                  {/* Batch List */}
                  <Collapse in={isExpanded}>
                    <MDBox mt={2}>
                      <Grid container spacing={1}>
                        {batches.map((batch) => (
                          <Grid item xs={12} sm={6} md={4} key={batch._id}>
                            <Card 
                              variant="outlined" 
                              sx={{ 
                                cursor: disabled ? 'default' : 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                backgroundColor: selectedBatches.includes(batch._id) 
                                  ? 'info.light' 
                                  : 'transparent',
                                borderColor: selectedBatches.includes(batch._id) 
                                  ? 'info.main' 
                                  : 'grey.300',
                                '&:hover': disabled ? {} : {
                                  borderColor: 'info.main',
                                  backgroundColor: 'info.light'
                                }
                              }}
                              onClick={() => handleBatchToggle(batch._id)}
                            >
                              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <MDBox display="flex" alignItems="center" justifyContent="space-between">
                                  <MDBox display="flex" alignItems="center" gap={1}>
                                    <GroupsIcon 
                                      fontSize="small" 
                                      color={selectedBatches.includes(batch._id) ? 'info' : 'action'}
                                    />
                                    <MDBox>
                                      <MDTypography 
                                        variant="subtitle2" 
                                        fontWeight="medium"
                                        color={selectedBatches.includes(batch._id) ? 'info' : 'dark'}
                                      >
                                        {batch.batchCode}
                                      </MDTypography>
                                      <MDTypography variant="caption" color="text">
                                        {batch.courseType} • {batch.academicStatus}
                                      </MDTypography>
                                      {batch.totalStudents > 0 && (
                                        <MDTypography variant="caption" color="text" display="block">
                                          {batch.totalStudents} students
                                        </MDTypography>
                                      )}
                                    </MDBox>
                                  </MDBox>
                                  <Checkbox
                                    checked={selectedBatches.includes(batch._id)}
                                    disabled={disabled}
                                    size="small"
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={() => handleBatchToggle(batch._id)}
                                  />
                                </MDBox>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </MDBox>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Error Display */}
      {error && (
        <MDBox mt={2}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            <MDTypography variant="body2">
              {error}
            </MDTypography>
          </Alert>
        </MDBox>
      )}

      {/* Selected Batches Summary */}
      {selectedBatches.length > 0 && (
        <MDBox mt={2}>
          <Card sx={{ borderRadius: 2, backgroundColor: 'info.light' }}>
            <CardContent>
              <MDTypography variant="subtitle2" fontWeight="medium" color="info" gutterBottom>
                Selected Batches ({selectedBatches.length})
              </MDTypography>
              <MDBox display="flex" flexWrap="wrap" gap={1}>
                {selectedBatches.map((batchId) => {
                  // Find batch info
                  let batchInfo = null;
                  Object.values(batchesByDepartment).forEach(({ batches }) => {
                    const found = batches.find(b => b._id === batchId);
                    if (found) batchInfo = found;
                  });
                  
                  return batchInfo ? (
                    <Chip
                      key={batchId}
                      label={`${batchInfo.batchCode} (${batchInfo.courseType})`}
                      size="small"
                      color="info"
                      onDelete={disabled ? undefined : () => handleBatchToggle(batchId)}
                    />
                  ) : null;
                })}
              </MDBox>
            </CardContent>
          </Card>
        </MDBox>
      )}
    </MDBox>
  );
};

export default BatchSelector;
