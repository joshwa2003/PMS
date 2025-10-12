import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  InputAdornment,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from '../examples/Navbars/DashboardNavbar';
import placementDirectorManagementService from '../services/placementDirectorManagementService';

// S.A. Engineering College React components
import MDBox from "../components/MDBox";
import MDTypography from "../components/MDTypography";
import MDButton from "../components/MDButton";

// S.A. Engineering College React example components
import DataTableHeadCell from "../examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "../examples/Tables/DataTable/DataTableBodyCell";

const PlacementDirectorManagement = () => {
  const { user } = useAuth();
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDirectors, setTotalDirectors] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [stats, setStats] = useState(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    phone: '',
    adminNotes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      setError('Access denied. Administrator privileges required.');
      setLoading(false);
      return;
    }

    loadDirectors();
    loadStats();
  }, [isAdmin, page, rowsPerPage, searchTerm, filterStatus]);

  const loadDirectors = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { isActive: filterStatus === 'active' })
      };

      const response = await placementDirectorManagementService.getAllPlacementDirectors(params);
      
      if (response.success) {
        setDirectors(response.directors || []);
        setTotalDirectors(response.pagination?.totalDirectors || 0);
      } else {
        setError(response.message || 'Failed to load placement directors');
      }
    } catch (err) {
      setError(err.message || 'Failed to load placement directors');
    } finally {
      setLoading(false);
    }
  };


  const loadStats = async () => {
    try {
      const response = await placementDirectorManagementService.getPlacementDirectorStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleCreateDirector = async () => {
    try {
      const validation = placementDirectorManagementService.validatePlacementDirectorData(formData);
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        return;
      }

      const response = await placementDirectorManagementService.createPlacementDirector(formData);
      
      if (response.success) {
        setSuccess('Placement Director created successfully! Welcome email sent.');
        setCreateDialogOpen(false);
        resetForm();
        loadDirectors();
        loadStats();
      } else {
        setError(response.message || 'Failed to create placement director');
      }
    } catch (err) {
      setError(err.message || 'Failed to create placement director');
    }
  };

  const handleEditDirector = async () => {
    try {
      const validation = placementDirectorManagementService.validatePlacementDirectorData(formData);
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        return;
      }

      const response = await placementDirectorManagementService.updatePlacementDirector(
        selectedDirector.id,
        formData
      );
      
      if (response.success) {
        setSuccess('Placement Director updated successfully!');
        setEditDialogOpen(false);
        resetForm();
        loadDirectors();
        loadStats();
      } else {
        setError(response.message || 'Failed to update placement director');
      }
    } catch (err) {
      setError(err.message || 'Failed to update placement director');
    }
  };

  const handleDeleteDirector = async () => {
    try {
      const response = await placementDirectorManagementService.deletePlacementDirector(selectedDirector.id);
      
      if (response.success) {
        setSuccess('Placement Director deleted successfully!');
        setDeleteDialogOpen(false);
        setSelectedDirector(null);
        loadDirectors();
        loadStats();
      } else {
        setError(response.message || 'Failed to delete placement director');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete placement director');
    }
  };

  const handleResendEmail = async (director) => {
    try {
      const response = await placementDirectorManagementService.resendWelcomeEmail(director.id);
      
      if (response.success) {
        setSuccess('Welcome email sent successfully!');
        loadDirectors();
      } else {
        setError(response.message || 'Failed to send welcome email');
      }
    } catch (err) {
      setError(err.message || 'Failed to send welcome email');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      employeeId: '',
      phone: '',
      adminNotes: ''
    });
    setFormErrors({});
    setSelectedDirector(null);
  };

  const openEditDialog = (director) => {
    setSelectedDirector(director);
    setFormData({
      firstName: director.firstName || '',
      lastName: director.lastName || '',
      email: director.email || '',
      employeeId: director.employeeId || '',
      phone: director.phone || '',
      adminNotes: director.adminNotes || ''
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (director) => {
    setSelectedDirector(director);
    setDeleteDialogOpen(true);
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            Access denied. Administrator privileges required to manage placement directors.
          </Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            Placement Director Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ 
              background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #E55A2B 0%, #E8851A 100%)' }
            }}
          >
            Add Placement Director
          </Button>
        </Box>

        {/* Statistics Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.total}</Typography>
                      <Typography variant="body2">Total Directors</Typography>
                    </Box>
                    <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.active}</Typography>
                      <Typography variant="body2">Active Directors</Typography>
                    </Box>
                    <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.verified}</Typography>
                      <Typography variant="body2">Verified Directors</Typography>
                    </Box>
                    <EmailIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.recent}</Typography>
                      <Typography variant="body2">Recent (30 days)</Typography>
                    </Box>
                    <BusinessIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  placeholder="Search directors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadDirectors}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Directors Table */}
        <Card>
          {loading ? (
            <MDBox p={4} textAlign="center">
              <CircularProgress />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                Loading placement directors...
              </Typography>
            </MDBox>
          ) : (
            <>
              {/* Blue Header Bar - Same as Staff Management */}
              <MDBox
                mx={2}
                mt={2}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDBox display="flex" justifyContent="space-between" alignItems="center">
                  <MDTypography variant="h6" color="white">
                    Placement Directors Table
                  </MDTypography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Refresh">
                      <IconButton onClick={loadDirectors} disabled={loading} sx={{ color: 'white' }}>
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </MDBox>
              </MDBox>

              <MDBox pt={3}>
                <TableContainer sx={{ boxShadow: "none" }}>
                  <Table>
                    <MDBox component="thead">
                      <TableRow>
                        <DataTableHeadCell width="30%" align="left">
                          Name
                        </DataTableHeadCell>
                        <DataTableHeadCell width="25%" align="left">
                          Email
                        </DataTableHeadCell>
                        <DataTableHeadCell width="15%" align="center">
                          Status
                        </DataTableHeadCell>
                        <DataTableHeadCell width="15%" align="center">
                          Verified
                        </DataTableHeadCell>
                        <DataTableHeadCell width="15%" align="center">
                          Actions
                        </DataTableHeadCell>
                      </TableRow>
                    </MDBox>
                    <TableBody>
                      {directors.map((director) => {
                        const getInitials = (director) => {
                          return `${director.firstName?.charAt(0) || ''}${director.lastName?.charAt(0) || ''}`.toUpperCase();
                        };

                        return (
                          <TableRow key={director.id}>
                            <DataTableBodyCell align="left">
                              <MDBox display="flex" alignItems="center" gap={2}>
                                <Avatar
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: '#1976d2',
                                    fontSize: '0.875rem',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {getInitials(director)}
                                </Avatar>
                                <MDBox>
                                  <MDTypography 
                                    variant="button" 
                                    fontWeight="medium"
                                    sx={{ 
                                      fontSize: '0.875rem',
                                      lineHeight: 1.4
                                    }}
                                  >
                                    {director.firstName} {director.lastName}
                                  </MDTypography>
                                  {director.employeeId && (
                                    <MDTypography 
                                      variant="caption" 
                                      color="text"
                                      sx={{ 
                                        fontSize: '0.75rem',
                                        display: 'block'
                                      }}
                                    >
                                      ID: {director.employeeId}
                                    </MDTypography>
                                  )}
                                </MDBox>
                              </MDBox>
                            </DataTableBodyCell>
                            <DataTableBodyCell align="left">
                              <MDTypography 
                                variant="caption" 
                                color="text"
                                sx={{ 
                                  fontSize: '0.875rem'
                                }}
                              >
                                {director.email}
                              </MDTypography>
                            </DataTableBodyCell>
                            <DataTableBodyCell align="center">
                              <Chip
                                label={director.isActive ? 'Active' : 'Inactive'}
                                color={director.isActive ? 'success' : 'error'}
                                size="small"
                                sx={{
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  height: '24px'
                                }}
                              />
                            </DataTableBodyCell>
                            <DataTableBodyCell align="center">
                              <Chip
                                label={director.isVerified ? 'Verified' : 'Unverified'}
                                color={director.isVerified ? 'success' : 'warning'}
                                size="small"
                                sx={{
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  height: '24px'
                                }}
                              />
                            </DataTableBodyCell>
                            <DataTableBodyCell align="center">
                              <MDBox sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                <Tooltip title="Edit Director">
                                  <IconButton
                                    size="small"
                                    onClick={() => openEditDialog(director)}
                                    sx={{ 
                                      color: '#1976d2',
                                      '&:hover': {
                                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                      }
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Resend Welcome Email">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleResendEmail(director)}
                                    sx={{ 
                                      color: '#0288d1',
                                      '&:hover': {
                                        backgroundColor: 'rgba(2, 136, 209, 0.04)'
                                      }
                                    }}
                                  >
                                    <EmailIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Director">
                                  <IconButton
                                    size="small"
                                    onClick={() => openDeleteDialog(director)}
                                    sx={{ 
                                      color: '#d32f2f',
                                      '&:hover': {
                                        backgroundColor: 'rgba(211, 47, 47, 0.04)'
                                      }
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </MDBox>
                            </DataTableBodyCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                <Box mt={2} mb={2}>
                  <TablePagination
                    component="div"
                    count={totalDirectors}
                    page={page}
                    onPageChange={(event, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(event) => {
                      setRowsPerPage(parseInt(event.target.value, 10));
                      setPage(0);
                    }}
                    sx={{
                      '& .MuiTablePagination-toolbar': {
                        paddingLeft: 2,
                        paddingRight: 2
                      },
                      '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                        color: '#344767',
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                </Box>
              </MDBox>
            </>
          )}
        </Card>

        {/* Create Director Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Placement Director</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  error={!!formErrors.employeeId}
                  helperText={formErrors.employeeId}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Admin Notes"
                  multiline
                  rows={3}
                  value={formData.adminNotes}
                  onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                  error={!!formErrors.adminNotes}
                  helperText={formErrors.adminNotes}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateDirector} variant="contained">
              Create Director
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Director Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Placement Director</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  error={!!formErrors.employeeId}
                  helperText={formErrors.employeeId}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Admin Notes"
                  multiline
                  rows={3}
                  value={formData.adminNotes}
                  onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                  error={!!formErrors.adminNotes}
                  helperText={formErrors.adminNotes}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditDirector} variant="contained">
              Update Director
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the placement director{' '}
              <strong>
                {selectedDirector?.firstName} {selectedDirector?.lastName}
              </strong>
              ? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteDirector} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Snackbars */}
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
        >
          <Alert onClose={() => setSuccess('')} severity="success">
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert onClose={() => setError('')} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
};

export default PlacementDirectorManagement;
