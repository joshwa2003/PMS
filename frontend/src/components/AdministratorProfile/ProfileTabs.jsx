import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { Person, Work, ContactPhone, Notes, PhotoCamera } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import { useAdministratorProfile } from '../../context/AdministratorProfileContext';

// Administrator Profile Form Components
import ProfileHeader from "./ProfileHeader";
import BasicInfoForm from "./BasicInfoForm";
import ProfessionalDetailsForm from "./ProfessionalDetailsForm";
import ContactDetailsForm from "./ContactDetailsForm";
import AdministrativeNotesForm from "./AdministrativeNotesForm";
import ProfileImageForm from "./ProfileImageForm";

function ProfileTabs() {
  const {
    activeTab,
    setActiveTab,
    isLoading,
    error
  } = useAdministratorProfile();

  const handleTabChange = (event, newValue) => {
    console.log('Tab changed to:', newValue);
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
    },
    {
      label: "Profile Image",
      icon: <PhotoCamera />,
      component: <ProfileImageForm />
    },
    {
      label: "Notes",
      icon: <Notes />,
      component: <AdministrativeNotesForm />
    }
  ];

  console.log('ProfileTabs render - activeTab:', activeTab, 'tabs length:', tabs.length);

  if (isLoading) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <MDTypography variant="h6">Loading administrator profile...</MDTypography>
      </MDBox>
    );
  }

  if (error) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <MDTypography variant="h6" color="error">Error: {error}</MDTypography>
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
          id={`administrator-profile-tabpanel-${index}`}
          aria-labelledby={`administrator-profile-tab-${index}`}
        >
          {activeTab === index && (
            <MDBox>
              {console.log(`Rendering tab ${index}: ${tab.label}`, tab.component)}
              {tab.component}
            </MDBox>
          )}
        </Box>
      ))}
    </MDBox>
  );
}

export default ProfileTabs;
