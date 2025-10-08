import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { Person, Work, ContactPhone } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import { usePlacementDirectorProfile } from '../../context/PlacementDirectorProfileContext';

// Placement Director Profile Form Components
import ProfileHeader from "./ProfileHeader";
import BasicInfoForm from "./BasicInfoForm";
import ProfessionalDetailsForm from "./ProfessionalDetailsForm";
import ContactDetailsForm from "./ContactDetailsForm";

function ProfileTabs() {
  const {
    activeTab,
    setActiveTab,
    isLoading,
    error
  } = usePlacementDirectorProfile();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = [
    {
      label: "Basic Info",
      icon: <Person />,
      component: <BasicInfoForm />
    },
    {
      label: "Professional",
      icon: <Work />,
      component: <ProfessionalDetailsForm />
    },
    {
      label: "Contact",
      icon: <ContactPhone />,
      component: <ContactDetailsForm />
    }
  ];

  if (isLoading) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <MDBox>Loading placement director profile...</MDBox>
      </MDBox>
    );
  }

  if (error) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <MDBox color="error.main">Error: {error}</MDBox>
      </MDBox>
    );
  }

  return (
    <MDBox>
      {/* Profile Header */}
      <MDBox mb={3}>
        <ProfileHeader />
      </MDBox>

      {/* Navigation Tabs */}
      <MDBox mb={3}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 60,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            },
            '& .MuiTabs-indicator': {
              height: 3,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
              sx={{
                '& .MuiSvgIcon-root': {
                  marginRight: 1,
                  marginBottom: '0 !important',
                },
              }}
            />
          ))}
        </Tabs>
      </MDBox>

      {/* Tab Content */}
      {tabs.map((tab, index) => (
        <Box
          key={index}
          role="tabpanel"
          hidden={activeTab !== index}
          id={`placement-director-profile-tabpanel-${index}`}
          aria-labelledby={`placement-director-profile-tab-${index}`}
        >
          {activeTab === index && (
            <MDBox>
              {tab.component}
            </MDBox>
          )}
        </Box>
      ))}
    </MDBox>
  );
}

export default ProfileTabs;
