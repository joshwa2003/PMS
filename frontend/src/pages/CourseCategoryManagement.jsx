import React, { useState, useEffect } from 'react';
import {
  Grid,
  Alert,
  Snackbar,
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Card
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import ComplexStatisticsCard from 'examples/Cards/StatisticsCards/ComplexStatisticsCard';
import CourseCategoryCard from 'components/CourseCategoryManagement/CourseCategoryCard';
import CreateCourseCategoryModal from 'components/CourseCategoryManagement/CreateCourseCategoryModal';
import EditCourseCategoryModal from 'components/CourseCategoryManagement/EditCourseCategoryModal';
import { CourseCategoryProvider, useCourseCategory } from 'context/CourseCategoryContext';
import { useAuth } from 'context/AuthContext';

const CourseCategoryManagementContent = () => {
  const { user } = useAuth();
  const {
    categories,
    loading,
    error,
    stats,
    fetchCategories,
    deleteCategory,
    handleFilterChange,
    filters,
    fetchStats,
    clearError
  } = useCourseCategory();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Local filter state for immediate UI updates
  const [localFilters, setLocalFilters] = useState({
    search: '',
    isActive: ''
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch stats when categories change
  useEffect(() => {
    if (categories.length > 0) {
      fetchStats();
    }
  }, [categories, fetchStats]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleFilterChange(localFilters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [localFilters, handleFilterChange]);

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
  };

  const handleCreateSuccess = (response) => {
    const categoryName = response?.data?.courseCategory?.name || 'Course category';
    setSnackbar({
      open: true,
      message: `${categoryName} created successfully!`,
      severity: 'success'
    });
    
    // Refresh the categories list to show the new category
    fetchCategories();
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingCategory(null);
  };

  const handleEditSuccess = (response) => {
    const categoryName = response?.data?.courseCategory?.name || 'Course category';
    setSnackbar({
      open: true,
      message: `${categoryName} updated successfully!`,
      severity: 'success'
    });
    
    // Refresh the categories list to show the updated category
    fetchCategories();
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const categoryToDelete = categories.find(cat => cat.id === categoryId);
      await deleteCategory(categoryId);
      setSnackbar({
        open: true,
        message: `Course category "${categoryToDelete?.name}" deleted successfully!`,
        severity: 'success'
      });
      
      // Refresh the categories list to reflect the deletion
      fetchCategories();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete course category',
        severity: 'error'
      });
    }
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setLocalFilters(prev => ({
      ...prev,
      search: value
    }));
  };

  const handleStatusFilterChange = (event) => {
    const value = event.target.value;
    setLocalFilters(prev => ({
      ...prev,
      isActive: value
    }));
  };

  const handleClearFilters = () => {
    setLocalFilters({
      search: '',
      isActive: ''
    });
  };

  const handleRefresh = () => {
    fetchCategories();
    handleClearFilters();
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
    clearError();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.isActive !== '') count++;
    return count;
  };

  // Check if user has permission to access course category management
  const hasPermission = user?.role === 'admin';

  if (!hasPermission) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDBox mb={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="error">
                  <MDTypography variant="h6" fontWeight="medium" mb={1}>
                    Access Denied
                  </MDTypography>
                  <MDTypography variant="body2">
                    You don't have permission to access course category management. 
                    Only Administrators can manage course categories.
                  </MDTypography>
                </Alert>
              </Grid>
            </Grid>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <Grid container spacing={3}>
            {/* Analytics Cards */}
            <Grid item xs={12}>
              <MDBox mb={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <MDBox mb={1.5}>
                      <ComplexStatisticsCard
                        color="primary"
                        icon={<CategoryIcon />}
                        title="Total Categories"
                        count={stats.totalCategories}
                        percentage={{
                          color: "success",
                          amount: "",
                          label: "course categories"
                        }}
                      />
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MDBox mb={1.5}>
                      <ComplexStatisticsCard
                        color="success"
                        icon={<CheckCircleIcon />}
                        title="Active Categories"
                        count={stats.activeCategories}
                        percentage={{
                          color: "success",
                          amount: stats.totalCategories > 0 ? `${Math.round((stats.activeCategories / stats.totalCategories) * 100)}%` : "0%",
                          label: "of total categories"
                        }}
                      />
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MDBox mb={1.5}>
                      <ComplexStatisticsCard
                        color="error"
                        icon={<CancelIcon />}
                        title="Inactive Categories"
                        count={stats.inactiveCategories}
                        percentage={{
                          color: "error",
                          amount: stats.totalCategories > 0 ? `${Math.round((stats.inactiveCategories / stats.totalCategories) * 100)}%` : "0%",
                          label: "of total categories"
                        }}
                      />
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MDBox mb={1.5}>
                      <ComplexStatisticsCard
                        color="info"
                        icon={<TrendingUpIcon />}
                        title="Recently Added"
                        count={stats.recentlyAdded}
                        percentage={{
                          color: "info",
                          amount: "+",
                          label: "last 7 days"
                        }}
                      />
                    </MDBox>
                  </Grid>
                </Grid>
              </MDBox>
            </Grid>

            <Grid item xs={12}>
              {/* Header with Action Button */}
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <MDBox>
                  <MDTypography variant="h4" fontWeight="medium" mb={1}>
                    Course Category Management
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    Create and manage course categories like UG, PG, Ph.D for organizing academic programs.
                  </MDTypography>
                </MDBox>
                
                <MDButton
                  variant="gradient"
                  color="success"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreateModal}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    px: 3
                  }}
                >
                  Add Course Category
                </MDButton>
              </MDBox>

              {/* Search and Filters */}
              <Card sx={{ mb: 3 }}>
                <MDBox p={3}>
                  <Grid container spacing={2} alignItems="center">
                    {/* Search */}
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        placeholder="Search course categories..."
                        value={localFilters.search}
                        onChange={handleSearchChange}
                        size="small"
                        sx={{ 
                          height: '40px',
                          '& .MuiOutlinedInput-root': {
                            height: '40px',
                            minHeight: '40px'
                          },
                          '& .MuiOutlinedInput-input': {
                            padding: '8.5px 14px'
                          }
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                          endAdornment: localFilters.search && (
                            <InputAdornment position="end">
                              <Button
                                size="small"
                                onClick={() => setLocalFilters(prev => ({ ...prev, search: '' }))}
                                sx={{ minWidth: 'auto', p: 0.5 }}
                              >
                                <ClearIcon fontSize="small" />
                              </Button>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>

                    {/* Status Filter */}
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth size="small" sx={{ height: '40px' }}>
                        <InputLabel sx={{ 
                          top: '-7px',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}>
                          Status
                        </InputLabel>
                        <Select
                          value={localFilters.isActive}
                          onChange={handleStatusFilterChange}
                          label="Status"
                          sx={{ 
                            height: '40px',
                            minHeight: '40px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            '& .MuiSelect-select': {
                              padding: '10px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              lineHeight: '20px',
                              fontSize: '0.875rem'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderWidth: '1px'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderWidth: '2px'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderWidth: '2px'
                            }
                          }}
                        >
                          <MenuItem value="" sx={{ fontSize: '0.875rem' }}>All Status</MenuItem>
                          <MenuItem value="true" sx={{ fontSize: '0.875rem' }}>Active</MenuItem>
                          <MenuItem value="false" sx={{ fontSize: '0.875rem' }}>Inactive</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Clear Filters */}
                    <Grid item xs={12} md={3}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        onClick={handleClearFilters}
                        disabled={getActiveFiltersCount() === 0}
                        startIcon={<ClearIcon />}
                        sx={{ 
                          height: '40px',
                          minHeight: '40px',
                          padding: '8px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          textTransform: 'none',
                          borderWidth: '1.5px',
                          backgroundColor: 'white',
                          color: '#666',
                          '&:hover': {
                            borderWidth: '1.5px',
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            color: '#333'
                          },
                          '&:disabled': {
                            opacity: 0.5,
                            color: '#999'
                          }
                        }}
                      >
                        Clear ({getActiveFiltersCount()})
                      </Button>
                    </Grid>

                    {/* Refresh */}
                    <Grid item xs={12} md={2}>
                      <Button
                        variant="outlined"
                        color="info"
                        fullWidth
                        onClick={handleRefresh}
                        startIcon={<RefreshIcon />}
                        disabled={loading}
                        sx={{ 
                          height: '40px',
                          minHeight: '40px',
                          padding: '8px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          textTransform: 'none',
                          borderWidth: '1.5px',
                          backgroundColor: 'white',
                          color: '#1976d2',
                          '&:hover': {
                            borderWidth: '1.5px',
                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            color: '#1565c0'
                          },
                          '&:disabled': {
                            opacity: 0.5,
                            color: '#999'
                          }
                        }}
                      >
                        Refresh
                      </Button>
                    </Grid>
                  </Grid>

                  {/* Results Summary */}
                  <MDBox mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Showing {categories.length} course categories
                      {getActiveFiltersCount() > 0 && ' (filtered)'}
                    </Typography>
                  </MDBox>
                </MDBox>
              </Card>

              {/* Course Categories Grid */}
              {loading ? (
                <Card>
                  <MDBox p={4} textAlign="center">
                    <Typography variant="h6" color="text.secondary">
                      Loading course categories...
                    </Typography>
                  </MDBox>
                </Card>
              ) : error ? (
                <Card>
                  <MDBox p={4} textAlign="center">
                    <Typography variant="h6" color="error" mb={2}>
                      Error loading course categories
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {error}
                    </Typography>
                  </MDBox>
                </Card>
              ) : categories.length === 0 ? (
                <Card>
                  <MDBox p={4} textAlign="center">
                    <SchoolIcon sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" mb={1}>
                      No Course Categories Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                      {getActiveFiltersCount() > 0 
                        ? 'No course categories match your current filters.'
                        : 'Get started by creating your first course category.'
                      }
                    </Typography>
                    {getActiveFiltersCount() === 0 && (
                      <MDButton
                        variant="gradient"
                        color="success"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateModal}
                      >
                        Add Course Category
                      </MDButton>
                    )}
                  </MDBox>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {categories.map((category) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
                      <CourseCategoryCard
                        category={category}
                        onEdit={handleEditCategory}
                        onDelete={handleDeleteCategory}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>

      {/* Create Course Category Modal */}
      <CreateCourseCategoryModal
        open={createModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Course Category Modal */}
      <EditCourseCategoryModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
        category={editingCategory}
      />

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </DashboardLayout>
  );
};

// Main component with provider
const CourseCategoryManagement = () => {
  return (
    <CourseCategoryProvider>
      <CourseCategoryManagementContent />
    </CourseCategoryProvider>
  );
};

export default CourseCategoryManagement;
