import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { 
  Person, 
  Work, 
  ContactPhone, 
  AdminPanelSettings 
} from '@mui/icons-material';
import MDBox from 'components/MDBox';
import { usePlacementStaffProfile } from '../../context/PlacementStaffProfileContext';

// Import form components
import BasicInfoForm from './BasicInfoForm';
import ProfessionalDetailsForm from './ProfessionalDetailsForm';
import ContactDetailsForm from './ContactDetailsForm';
import AdministrativeNotesForm from './AdministrativeNotesForm';

function ProfileTabs() {
  const { activeTab, setActiveTab } = usePlacementStaffProfile();

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
      label: 'Admin Notes',
      icon: <AdminPanelSettings />,
      component: <AdministrativeNotesForm />
    }
  ];

  return (
    <MDBox>
      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
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
            '& .MuiTab-root.Mui-selected': {
              color: 'primary.main',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
              height: 3,
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                alignItems: 'center'
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <MDBox>
        {tabs[activeTab]?.component}
      </MDBox>
    </MDBox>
  );
}

export default ProfileTabs;
