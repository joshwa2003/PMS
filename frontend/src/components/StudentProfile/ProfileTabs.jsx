import React from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';

// @mui material components
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

// @mui icons
import PersonIcon from "@mui/icons-material/Person";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CodeIcon from "@mui/icons-material/Code";
import LanguageIcon from "@mui/icons-material/Language";
import TranslateIcon from "@mui/icons-material/Translate";
import StarIcon from "@mui/icons-material/Star";
import DescriptionIcon from "@mui/icons-material/Description";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";

// S.A. Engineering College React components
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";
import MDAlert from "../MDAlert";
import MDButton from "../MDButton";

// Student Profile Form Components
import BasicInfoForm from "./BasicInfoForm";
import ContactDetailsForm from "./ContactDetailsForm";
import AcademicDetailsForm from "./AcademicDetailsForm";
import CareerProfileForm from "./CareerProfileForm";
import PlacementInfoForm from "./PlacementInfoForm";
import SkillsCertificationsForm from "./SkillsCertificationsForm";
import ProjectsInternshipsForm from "./ProjectsInternshipsForm";
import OnlineProfilesForm from "./OnlineProfilesForm";
import LanguageProficiencyForm from "./LanguageProficiencyForm";
import AccomplishmentsForm from "./AccomplishmentsForm";
import ProfileSummaryForm from "./ProfileSummaryForm";
import ResumeUpload from "./ResumeUpload";

function ProfileTabs() {
  const {
    activeTab,
    setActiveTab,
    error,
    clearError,
    hasUnsavedChanges,
    goToNextTab,
    goToPreviousTab
  } = useStudentProfile();

  const tabs = [
    {
      label: "Basic Info",
      shortLabel: "Basic",
      icon: <PersonIcon />,
      component: <BasicInfoForm />,
      category: "Personal"
    },
    {
      label: "Contact Details",
      shortLabel: "Contact",
      icon: <ContactPhoneIcon />,
      component: <ContactDetailsForm />,
      category: "Personal"
    },
    {
      label: "Academic Details",
      shortLabel: "Academic",
      icon: <SchoolIcon />,
      component: <AcademicDetailsForm />,
      category: "Education"
    },
    {
      label: "Career Profile",
      shortLabel: "Career",
      icon: <WorkIcon />,
      component: <CareerProfileForm />,
      category: "Professional"
    },
    {
      label: "Placement Info",
      shortLabel: "Placement",
      icon: <BusinessCenterIcon />,
      component: <PlacementInfoForm />,
      category: "Professional"
    },
    {
      label: "Skills & Certifications",
      shortLabel: "Skills",
      icon: <EmojiEventsIcon />,
      component: <SkillsCertificationsForm />,
      category: "Professional"
    },
    {
      label: "Projects & Internships",
      shortLabel: "Projects",
      icon: <CodeIcon />,
      component: <ProjectsInternshipsForm />,
      category: "Experience"
    },
    {
      label: "Online Profiles",
      shortLabel: "Online",
      icon: <LanguageIcon />,
      component: <OnlineProfilesForm />,
      category: "Professional"
    },
    {
      label: "Language Proficiency",
      shortLabel: "Languages",
      icon: <TranslateIcon />,
      component: <LanguageProficiencyForm />,
      category: "Skills"
    },
    {
      label: "Accomplishments",
      shortLabel: "Awards",
      icon: <StarIcon />,
      component: <AccomplishmentsForm />,
      category: "Experience"
    },
    {
      label: "Profile Summary",
      shortLabel: "Summary",
      icon: <DescriptionIcon />,
      component: <ProfileSummaryForm />,
      category: "Final"
    },
    {
      label: "Resume Upload",
      shortLabel: "Resume",
      icon: <CloudUploadIcon />,
      component: <ResumeUpload />,
      category: "Final"
    }
  ];

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  return (
    <Card>
      {/* Content Header */}
      <MDBox p={3} pb={0}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDBox>
            <MDTypography variant="h5" fontWeight="medium" color="info">
              {tabs[activeTab]?.label}
            </MDTypography>
            <MDTypography variant="body2" color="text" mt={0.5}>
              Step {activeTab + 1} of {tabs.length}
            </MDTypography>
          </MDBox>
          
          <MDBox display="flex" alignItems="center" gap={1}>
            <Tooltip title="Previous Section">
              <span>
                <IconButton 
                  onClick={goToPreviousTab}
                  disabled={activeTab === 0}
                  color="info"
                >
                  <NavigateBeforeIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Next Section">
              <span>
                <IconButton 
                  onClick={goToNextTab}
                  disabled={activeTab === tabs.length - 1}
                  color="info"
                >
                  <NavigateNextIcon />
                </IconButton>
              </span>
            </Tooltip>
          </MDBox>
        </MDBox>

        {hasUnsavedChanges && (
          <MDBox mb={2}>
            <MDAlert color="warning" dismissible={false}>
              <MDTypography variant="body2">
                You have unsaved changes. Don't forget to save your progress!
              </MDTypography>
            </MDAlert>
          </MDBox>
        )}

        {error && (
          <MDBox mb={2}>
            <MDAlert color="error" dismissible onClose={clearError}>
              {error}
            </MDAlert>
          </MDBox>
        )}
      </MDBox>

      <Divider />

      {/* Tab Content */}
      <MDBox p={3}>
        <Box
          role="tabpanel"
          id={`student-profile-tabpanel-${activeTab}`}
          aria-labelledby={`student-profile-tab-${activeTab}`}
        >
          {tabs[activeTab]?.component}
        </Box>
      </MDBox>

      {/* Navigation Footer */}
      <Divider />
      <MDBox p={3} pt={2}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDButton
            variant="outlined"
            color="info"
            onClick={goToPreviousTab}
            disabled={activeTab === 0}
            startIcon={<NavigateBeforeIcon />}
          >
            Previous
          </MDButton>
          
          <MDBox display="flex" alignItems="center" gap={1}>
            {tabs.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: index === activeTab ? 'info.main' : 
                                 index < activeTab ? 'success.main' : 'grey.300',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.2)',
                  },
                }}
                onClick={() => handleTabChange(index)}
              />
            ))}
          </MDBox>

          <MDButton
            variant="gradient"
            color="info"
            onClick={goToNextTab}
            disabled={activeTab === tabs.length - 1}
            endIcon={<NavigateNextIcon />}
          >
            {activeTab === tabs.length - 1 ? 'Complete' : 'Next'}
          </MDButton>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default ProfileTabs;
