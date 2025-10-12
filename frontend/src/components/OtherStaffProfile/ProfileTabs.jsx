import React from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { Person, Work, ContactPhone, PhotoCamera, Category } from '@mui/icons-material';
import { useOtherStaffProfile } from '../../context/OtherStaffProfileContext';
import BasicInfoForm from './BasicInfoForm';
import ProfessionalDetailsForm from './ProfessionalDetailsForm';
import ContactDetailsForm from './ContactDetailsForm';
import ProfileImageForm from './ProfileImageForm';
function ProfileTabs() {
  const { activeTab, setActiveTab } = useOtherStaffProfile();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = [
    {
      label: 'Basic Info',
      icon: <Person />,
      component: <BasicInfoForm />
    },
    {
      label: 'Professional',
      icon: <Work />,
      component: <ProfessionalDetailsForm />
    },
    {
      label: 'Contact',
      icon: <ContactPhone />,
      component: <ContactDetailsForm />
    },
    {
      label: 'Profile Image',
      icon: <PhotoCamera />,
      component: <ProfileImageForm />
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tab Headers */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
              minWidth: 120,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            },
            '& .MuiTab-root.Mui-selected': {
              color: 'primary.main',
              fontWeight: 600,
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
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
                '& .MuiTab-iconWrapper': {
                  marginRight: 1,
                  marginBottom: 0,
                },
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabs.map((tab, index) => (
        <Box
          key={index}
          role="tabpanel"
          hidden={activeTab !== index}
          id={`other-staff-profile-tabpanel-${index}`}
          aria-labelledby={`other-staff-profile-tab-${index}`}
        >
          {activeTab === index && (
            <Box>
              {tab.component}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

export default ProfileTabs;
