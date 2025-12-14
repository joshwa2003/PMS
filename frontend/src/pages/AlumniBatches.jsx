import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Grid,
    IconButton,
    Box,
    Alert,
    CircularProgress,
    MenuItem,
    FormControl,
    Select,
    InputLabel,
    Card
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    School as SchoolIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

// Custom components
import DepartmentBatchesView from 'components/DepartmentStudents/DepartmentBatchesView';

// Services
import departmentWiseStudentService from 'services/departmentWiseStudentService';

// Context
import { useAuth } from 'context/AuthContext';

const AlumniBatches = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [department, setDepartment] = useState(null);
    const [departmentList, setDepartmentList] = useState([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial Data Fetch
    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);

                if (user?.role === 'placement_staff' && user.department) {
                    // Placement Staff: Fixed department
                    const deptId = user.department._id || user.department.id || user.department;
                    setSelectedDepartmentId(deptId);
                    await fetchAlumniBatches(deptId);
                } else if (['admin', 'placement_director'].includes(user?.role)) {
                    // Admin/Director: Fetch all departments
                    const response = await departmentWiseStudentService.getAllDepartments();
                    if (response.success && response.data) {
                        // API might return data directly or wrapped in data.departments
                        const depts = Array.isArray(response.data)
                            ? response.data
                            : (response.data.departments || []);

                        setDepartmentList(depts);

                        // Select first department by default if available
                        if (depts.length > 0) {
                            const defaultDeptId = depts[0]._id || depts[0].id;
                            setSelectedDepartmentId(defaultDeptId);
                            setDepartment(depts[0]);
                            await fetchAlumniBatches(defaultDeptId);
                        } else {
                            setLoading(false); // No departments found
                        }
                    }
                } else {
                    setError('Unauthorized access');
                    setLoading(false);
                }
            } catch (err) {
                console.error('Initialization error:', err);
                setError('Failed to load initial data');
                setLoading(false);
            }
        };

        init();
    }, [user]);

    // Fetch alumni batches for a specific department
    const fetchAlumniBatches = async (deptId) => {
        try {
            setLoading(true);
            setError(null);

            if (!deptId) {
                setLoading(false);
                return;
            }

            const response = await departmentWiseStudentService.getDepartmentAlumniBatches(deptId);

            if (response.success) {
                setBatches(response.data || []);
                // If department object is not set (e.g. for placement staff init), try to set it
                // For Directors, we set it onChange. For Staff, we might need to rely on user object.
                if (user?.role === 'placement_staff') {
                    setDepartment(user.department || { name: 'Department' });
                }
                // For admin, it's already set in init or handleChange
            } else {
                setError(response.message || 'Failed to fetch alumni batches');
            }
        } catch (error) {
            console.error('Error fetching alumni batches:', error);
            setError('Failed to fetch alumni batches');
        } finally {
            setLoading(false);
        }
    };

    const handleDepartmentChange = async (event) => {
        const newDeptId = event.target.value;
        setSelectedDepartmentId(newDeptId);

        // Find department object for display name
        const selectedDept = departmentList.find(d => (d._id || d.id) === newDeptId);
        if (selectedDept) {
            setDepartment(selectedDept);
        }

        await fetchAlumniBatches(newDeptId);
    };

    // Handle batch selection
    const handleBatchSelect = (batch) => {
        if (!selectedDepartmentId) return;
        navigate(`/department-students/${selectedDepartmentId}/${batch._id || batch.id}`);
    };

    // Handle refresh
    const handleRefresh = () => {
        if (selectedDepartmentId) {
            fetchAlumniBatches(selectedDepartmentId);
        }
    };

    if (loading && !batches.length && !departmentList.length) {
        // Show full spinner only on initial load
        return (
            <DashboardLayout>
                <DashboardNavbar />
                <MDBox py={3}>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                        <CircularProgress />
                    </Box>
                </MDBox>
            </DashboardLayout>
        );
    }

    // Checking strictly for error might block UI if we just want to show "No batches"
    // But if it's a real error (like 403 or network), show alert.

    const showDepartmentSelector = ['admin', 'placement_director'].includes(user?.role);

    return (
        <DashboardLayout>
            <DashboardNavbar
                customTitle="Alumni Batches"
            />
            <MDBox py={3}>
                {/* Header */}
                <MDBox mb={3}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item>
                            <IconButton
                                onClick={() => navigate('/dashboard')}
                                sx={{
                                    mr: 1,
                                    backgroundColor: 'rgba(0,0,0,0.04)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0,0,0,0.08)'
                                    }
                                }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                        </Grid>
                        <Grid item xs>
                            <MDTypography variant="h4" fontWeight="medium">
                                Alumni Batches
                            </MDTypography>
                            <MDTypography variant="body2" color="text" mt={1}>
                                Graduated Batches for {department?.name || 'Department'}
                            </MDTypography>
                        </Grid>

                        {/* Department Selector for Admin/Director */}
                        {showDepartmentSelector && (
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth variant="outlined" size="small" sx={{ minWidth: 200 }}>
                                    <InputLabel id="dept-select-label">Select Department</InputLabel>
                                    <Select
                                        labelId="dept-select-label"
                                        value={selectedDepartmentId}
                                        onChange={handleDepartmentChange}
                                        label="Select Department"
                                        sx={{ height: 44 }}
                                    >
                                        {departmentList.map((dept) => (
                                            <MenuItem key={dept._id || dept.id} value={dept._id || dept.id}>
                                                {dept.name} ({dept.code})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>
                </MDBox>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Batches View */}
                {selectedDepartmentId ? (
                    <DepartmentBatchesView
                        department={department}
                        batches={batches}
                        loading={loading}
                        error={null} // Handle error above
                        onBatchSelect={handleBatchSelect}
                        onRefresh={handleRefresh}
                    />
                ) : (
                    !loading && (
                        <Alert severity="info">
                            Please select a department to view alumni batches.
                        </Alert>
                    )
                )}
            </MDBox>
        </DashboardLayout>
    );
};

export default AlumniBatches;
