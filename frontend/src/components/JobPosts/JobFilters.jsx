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
  Clear as ClearIcon
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
    { value: 'deadline', label: 'Deadline' },
    { value: 'company.name', label: 'Company Name' },
    { value: 'title', label: 'Job Title' }
  ];

  return (
    <Card sx={{ borderRadius: 2, height: 'fit-content' }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <MDBox display="flex" alignItems="center" gap={1} mb={3}>
          <FilterIcon sx={{ color: 'info.main', fontSize: 20 }} />
          <MDTypography variant="h6" fontWeight="medium" color="dark">
            Filters
          </MDTypography>
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

        {/* Results Count */}
        <MDBox mb={3} p={2} sx={{ backgroundColor: '#f8f9fa', borderRadius: 1 }}>
          <MDTypography variant="body2" color="text" textAlign="center">
            <strong>{totalJobs}</strong> job{totalJobs !== 1 ? 's' : ''} found
          </MDTypography>
        </MDBox>

        {/* Search Bar */}
        <MDBox mb={3}>
          <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
            Search
          </MDTypography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search jobs, companies, skills..."
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: localFilters.search && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => handleFilterChange('search', '')}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              }
            }}
          />
        </MDBox>

        <Divider sx={{ mb: 3 }} />

        {/* Job Type Filter */}
        <MDBox mb={3}>
          <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
            Job Type
          </MDTypography>
          <FormControl fullWidth size="small">
            <Select
              value={localFilters.jobType || ''}
              onChange={(e) => handleFilterChange('jobType', e.target.value)}
              displayEmpty
              sx={{ borderRadius: 1 }}
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
        <MDBox mb={3}>
          <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
            Location
          </MDTypography>
          <FormControl fullWidth size="small">
            <Select
              value={localFilters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              displayEmpty
              sx={{ borderRadius: 1 }}
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
          <FormControl fullWidth size="small">
            <Select
              value={localFilters.company || ''}
              onChange={(e) => handleFilterChange('company', e.target.value)}
              displayEmpty
              sx={{ borderRadius: 1 }}
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
          <FormControl fullWidth size="small">
            <Select
              value={localFilters.sortBy || 'createdAt'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              sx={{ borderRadius: 1 }}
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
          <MDBox display="flex" flexDirection="column" gap={1}>
            <Chip
              label="Full-time Jobs"
              clickable
              color={localFilters.jobType === 'Full-time' ? 'primary' : 'default'}
              onClick={() => handleFilterChange('jobType', 
                localFilters.jobType === 'Full-time' ? '' : 'Full-time'
              )}
              size="small"
              sx={{ justifyContent: 'flex-start' }}
            />
            <Chip
              label="Internships"
              clickable
              color={localFilters.jobType === 'Internship' ? 'primary' : 'default'}
              onClick={() => handleFilterChange('jobType', 
                localFilters.jobType === 'Internship' ? '' : 'Internship'
              )}
              size="small"
              sx={{ justifyContent: 'flex-start' }}
            />
            <Chip
              label="Remote Work"
              clickable
              color={localFilters.location === 'Remote' ? 'primary' : 'default'}
              onClick={() => handleFilterChange('location', 
                localFilters.location === 'Remote' ? '' : 'Remote'
              )}
              size="small"
              sx={{ justifyContent: 'flex-start' }}
            />
            <Chip
              label="Latest Jobs"
              clickable
              color={localFilters.sortBy === 'createdAt' ? 'primary' : 'default'}
              onClick={() => {
                handleFilterChange('sortBy', 'createdAt');
                handleFilterChange('sortOrder', 'desc');
              }}
              size="small"
              sx={{ justifyContent: 'flex-start' }}
            />
            <Chip
              label="Deadline Soon"
              clickable
              color={localFilters.sortBy === 'deadline' ? 'primary' : 'default'}
              onClick={() => {
                handleFilterChange('sortBy', 'deadline');
                handleFilterChange('sortOrder', 'asc');
              }}
              size="small"
              sx={{ justifyContent: 'flex-start' }}
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
