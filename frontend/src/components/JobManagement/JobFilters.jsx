import React from 'react';
import { Box } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import { useMaterialUIController } from 'context';

const JobFilters = ({ filters, onFilterChange }) => {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  return (
    <MDBox
      sx={{
        backgroundColor: darkMode ? 'transparent' : 'transparent',
        borderRadius: '12px',
        p: 0,
      }}
    >
      <MDTypography 
        variant="h6" 
        color={darkMode ? "white" : "dark"}
        sx={{ 
          fontSize: '16px',
          fontWeight: 500,
          opacity: 0.8
        }}
      >
        Job Filters Component
      </MDTypography>
    </MDBox>
  );
};

export default JobFilters;
