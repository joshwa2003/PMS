import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  IconButton,
  Divider,
  Box
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Laptop as RemoteIcon,
  AccessTime as TimeIcon,
  Timeline as TrendingIcon
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

const JobFilters = ({
  filters,
  onFilterChange,
  availableFilters = {},
  loading = false,
  totalJobs = 0
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      jobType: '',
      location: '',
      company: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = localFilters.search || localFilters.jobType ||
    localFilters.location || localFilters.company;

  const sortOptions = [
    { value: 'createdAt', label: 'Latest First' },
    { value: 'company.name', label: 'Company Name' },
    { value: 'title', label: 'Job Title' }
  ];

  return (
    <Card sx={{
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e5e5e5'
    }}>
      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <MDBox display="flex" alignItems="center" gap={1.5} mb={3}>
          <MDBox
            sx={{
              p: 0.75,
              borderRadius: '8px',
              bgcolor: 'rgba(25, 118, 210, 0.1)',
              border: '1px solid rgba(25, 118, 210, 0.2)'
            }}
          >
            <FilterIcon sx={{ fontSize: 18, color: '#1976d2' }} />
          </MDBox>
          <MDTypography variant="h6" fontWeight="bold" sx={{ fontSize: '16px' }}>
            Filters
          </MDTypography>
          <Chip
            label={`${totalJobs} job${totalJobs !== 1 ? 's' : ''}`}
            size="small"
            sx={{
              ml: 'auto',
              fontSize: '11px',
              height: 22,
              bgcolor: '#f0f0f0',
              color: '#666',
              border: '1px solid #ddd'
            }}
          />
          {hasActiveFilters && (
            <MDButton
              variant="text"
              color="secondary"
              size="small"
              onClick={handleClearFilters}
              sx={{ ml: 'auto', minWidth: 'auto', p: 0.5 }}
            >
              <ClearIcon fontSize="small" />
            </MDButton>
          )}
        </MDBox>


        {/* Search Bar */}
        <MDBox mb={2.5}>
          <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1} sx={{ fontSize: '13px' }}>
            Search
          </MDTypography>
          <TextField
            fullWidth
            placeholder="Search jobs, companies, skills..."
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#888', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: localFilters.search && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleFilterChange('search', '')}
                    sx={{ color: '#888' }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                  borderWidth: '1px',
                },
              },
            }}
          />
        </MDBox>

        <MDBox mb={2.5}>
          <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1} sx={{ fontSize: '13px' }}>
            Job Type
          </MDTypography>
          <FormControl fullWidth>
            <Select
              value={localFilters.jobType || ''}
              onChange={(e) => handleFilterChange('jobType', e.target.value)}
              displayEmpty
              sx={{
                borderRadius: '8px',
                height: '45px', // Fixed height for consistency
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                  borderWidth: '1px',
                },
              }}
            >
              <MenuItem value="">All Types</MenuItem>
              {availableFilters.jobTypes?.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </MDBox>

        {/* Location Filter */}
        <MDBox mb={2.5}>
          <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1} sx={{ fontSize: '13px' }}>
            Location
          </MDTypography>
          <FormControl fullWidth>
            <Select
              value={localFilters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              displayEmpty
              sx={{
                borderRadius: '8px',
                height: '45px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                  borderWidth: '1px',
                },
              }}
            >
              <MenuItem value="">All Locations</MenuItem>
              {availableFilters.locations?.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </MDBox>

        {/* Company Filter */}
        <MDBox mb={3}>
          <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
            Company
          </MDTypography>
          <FormControl fullWidth>
            <Select
              value={localFilters.company || ''}
              onChange={(e) => handleFilterChange('company', e.target.value)}
              displayEmpty
              sx={{
                borderRadius: '8px',
                height: '45px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                  borderWidth: '1px',
                },
              }}
            >
              <MenuItem value="">All Companies</MenuItem>
              {availableFilters.companies?.map((company) => (
                <MenuItem key={company} value={company}>
                  {company}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </MDBox>

        <Divider sx={{ mb: 3 }} />

        {/* Sort By */}
        <MDBox mb={3}>
          <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
            Sort By
          </MDTypography>
          <FormControl fullWidth>
            <Select
              value={localFilters.sortBy || 'createdAt'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              sx={{
                borderRadius: '8px',
                height: '45px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                  borderWidth: '1px',
                },
              }}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </MDBox>

        <Divider sx={{ mb: 3 }} />

        {/* Quick Filter Buttons */}
        <MDBox mb={3}>
          <MDTypography variant="body2" fontWeight="medium" color="dark" mb={2}>
            Quick Filters
          </MDTypography>
          <MDBox display="flex" flexWrap="wrap" gap={1}>
            <Chip
              icon={<WorkIcon style={{ fontSize: 18 }} />}
              label="Full-time"
              clickable
              color="primary"
              variant={localFilters.jobType === 'Full-time' ? 'filled' : 'outlined'}
              onClick={() => handleFilterChange('jobType',
                localFilters.jobType === 'Full-time' ? '' : 'Full-time'
              )}
              sx={{
                borderRadius: '8px',
                border: '1px solid',
                borderColor: localFilters.jobType === 'Full-time' ? 'primary.main' : '#e0e0e0',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }
              }}
            />
            <Chip
              icon={<SchoolIcon style={{ fontSize: 18 }} />}
              label="Internships"
              clickable
              color="info"
              variant={localFilters.jobType === 'Internship' ? 'filled' : 'outlined'}
              onClick={() => handleFilterChange('jobType',
                localFilters.jobType === 'Internship' ? '' : 'Internship'
              )}
              sx={{
                borderRadius: '8px',
                border: '1px solid',
                borderColor: localFilters.jobType === 'Internship' ? 'info.main' : '#e0e0e0',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }
              }}
            />
            <Chip
              icon={<RemoteIcon style={{ fontSize: 18 }} />}
              label="Remote"
              clickable
              color="success"
              variant={localFilters.location === 'Remote' ? 'filled' : 'outlined'}
              onClick={() => handleFilterChange('location',
                localFilters.location === 'Remote' ? '' : 'Remote'
              )}
              sx={{
                borderRadius: '8px',
                border: '1px solid',
                borderColor: localFilters.location === 'Remote' ? 'success.main' : '#e0e0e0',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }
              }}
            />
            <Chip
              icon={<TrendingIcon style={{ fontSize: 18 }} />}
              label="Latest"
              clickable
              color="warning"
              variant={localFilters.sortBy === 'createdAt' ? 'filled' : 'outlined'}
              onClick={() => {
                handleFilterChange('sortBy', 'createdAt');
                handleFilterChange('sortOrder', 'desc');
              }}
              sx={{
                borderRadius: '8px',
                border: '1px solid',
                borderColor: localFilters.sortBy === 'createdAt' ? 'warning.main' : '#e0e0e0',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }
              }}
            />
            <Chip
              icon={<TimeIcon style={{ fontSize: 18 }} />}
              label="Urgent"
              clickable
              color="error"
              variant={localFilters.sortBy === 'deadline' ? 'filled' : 'outlined'}
              onClick={() => {
                handleFilterChange('sortBy', 'deadline');
                handleFilterChange('sortOrder', 'asc');
              }}
              sx={{
                borderRadius: '8px',
                border: '1px solid',
                borderColor: localFilters.sortBy === 'deadline' ? 'error.main' : '#e0e0e0',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }
              }}
            />
          </MDBox>
        </MDBox>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <>
            <Divider sx={{ mb: 2 }} />
            <MDBox>
              <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
                Active Filters
              </MDTypography>
              <MDBox display="flex" flexDirection="column" gap={1}>
                {localFilters.search && (
                  <Chip
                    label={`"${localFilters.search}"`}
                    onDelete={() => handleFilterChange('search', '')}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}

                {localFilters.jobType && (
                  <Chip
                    label={localFilters.jobType}
                    onDelete={() => handleFilterChange('jobType', '')}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}

                {localFilters.location && (
                  <Chip
                    label={localFilters.location}
                    onDelete={() => handleFilterChange('location', '')}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}

                {localFilters.company && (
                  <Chip
                    label={localFilters.company}
                    onDelete={() => handleFilterChange('company', '')}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </MDBox>
            </MDBox>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default JobFilters;
