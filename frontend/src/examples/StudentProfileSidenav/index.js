/**
=========================================================
* S.A. Engineering College React - v2.2.0
=========================================================

* Student Profile Sidenav - Dedicated sidebar for student profile pages
* Replaces the main sidebar when in student profile section
*/

import { useEffect } from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import Avatar from "@mui/material/Avatar";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";

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
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// S.A. Engineering College React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

// S.A. Engineering College React context
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";

// Auth context
import { useAuth } from "context/AuthContext";

// Student Profile Context
import { useStudentProfile } from "context/StudentProfileContext";

// Images
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

const ProfileSidenavCollapse = ({ icon, name, active, onClick, ownerState }) => {
  return (
    <ListItem component="li">
      <MDBox
        onClick={onClick}
        sx={(theme) => {
          const { palette, transitions, boxShadows, borders, functions } = theme;
          const { transparentSidenav, whiteSidenav, darkMode, sidenavColor } = ownerState;

          const { white, transparent, dark, grey, gradients } = palette;
          const { md } = boxShadows;
          const { borderRadius } = borders;
          const { pxToRem, rgba, linearGradient } = functions;

          return {
            background: active
              ? linearGradient(gradients[sidenavColor].main, gradients[sidenavColor].state)
              : transparent.main,
            color:
              (transparentSidenav && !darkMode && !active) || (whiteSidenav && !active)
                ? dark.main
                : white.main,
            display: "flex",
            alignItems: "center",
            width: "100%",
            padding: `${pxToRem(8)} ${pxToRem(10)}`,
            margin: `${pxToRem(1.5)} ${pxToRem(16)}`,
            borderRadius: borderRadius.md,
            cursor: "pointer",
            userSelect: "none",
            whiteSpace: "nowrap",
            boxShadow: active && !whiteSidenav && !darkMode && !transparentSidenav ? md : "none",
            transition: transitions.create(["box-shadow", "background-color"], {
              easing: transitions.easing.easeInOut,
              duration: transitions.duration.shorter,
            }),

            "&:hover, &:focus": {
              backgroundColor: !active ? (
                transparentSidenav && !darkMode
                  ? grey[300]
                  : rgba(whiteSidenav ? grey[400] : white.main, 0.2)
              ) : undefined,
            },
          };
        }}
      >
        <ListItemIcon
          sx={(theme) => {
            const { palette, transitions, borders, functions } = theme;
            const { transparentSidenav, whiteSidenav, darkMode } = ownerState;
            const { white, dark } = palette;
            const { borderRadius } = borders;
            const { pxToRem } = functions;

            return {
              minWidth: pxToRem(32),
              minHeight: pxToRem(32),
              color:
                (transparentSidenav && !darkMode && !active) || (whiteSidenav && !active)
                  ? dark.main
                  : white.main,
              borderRadius: borderRadius.md,
              display: "grid",
              placeItems: "center",
              transition: transitions.create("margin", {
                easing: transitions.easing.easeInOut,
                duration: transitions.duration.standard,
              }),
            };
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={name}
          sx={(theme) => {
            const { typography, functions } = theme;
            const { size, fontWeightRegular, fontWeightLight } = typography;
            const { pxToRem } = functions;

            return {
              marginLeft: pxToRem(10),
              "& span": {
                fontWeight: active ? fontWeightRegular : fontWeightLight,
                fontSize: size.sm,
                lineHeight: 0,
              },
            };
          }}
        />
      </MDBox>
    </ListItem>
  );
};

function StudentProfileSidenav({ color, brand, brandName, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;
  const location = useLocation();
  const navigate = useNavigate();
  
  // Auth context
  const { user } = useAuth();

  // Student Profile Context
  const {
    activeTab,
    setActiveTab,
    getProfileCompletion
  } = useStudentProfile();

  const profileCompletion = getProfileCompletion();

  let textColor = "white";

  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Administrator',
      placement_director: 'Placement Director',
      placement_staff: 'Placement Staff',
      department_hod: 'Department HOD',
      other_staff: 'Other Staff',
      student: 'Student',
      alumni: 'Alumni',
    };
    return roleNames[role] || role;
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 40) return 'warning';
    return 'error';
  };


  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const tabs = [
    {
      label: "Basic Info",
      shortLabel: "Basic",
      icon: <PersonIcon />,
      category: "Personal"
    },
    {
      label: "Contact Details",
      shortLabel: "Contact",
      icon: <ContactPhoneIcon />,
      category: "Personal"
    },
    {
      label: "Academic Details",
      shortLabel: "Academic",
      icon: <SchoolIcon />,
      category: "Education"
    },
    {
      label: "Career Profile",
      shortLabel: "Career",
      icon: <WorkIcon />,
      category: "Professional"
    },
    {
      label: "Placement Info",
      shortLabel: "Placement",
      icon: <BusinessCenterIcon />,
      category: "Professional"
    },
    {
      label: "Skills & Certifications",
      shortLabel: "Skills",
      icon: <EmojiEventsIcon />,
      category: "Professional"
    },
    {
      label: "Projects & Internships",
      shortLabel: "Projects",
      icon: <CodeIcon />,
      category: "Experience"
    },
    {
      label: "Online Profiles",
      shortLabel: "Online",
      icon: <LanguageIcon />,
      category: "Professional"
    },
    {
      label: "Language Proficiency",
      shortLabel: "Languages",
      icon: <TranslateIcon />,
      category: "Skills"
    },
    {
      label: "Accomplishments",
      shortLabel: "Awards",
      icon: <StarIcon />,
      category: "Experience"
    },
    {
      label: "Profile Summary",
      shortLabel: "Summary",
      icon: <DescriptionIcon />,
      category: "Final"
    },
    {
      label: "Resume Upload",
      shortLabel: "Resume",
      icon: <CloudUploadIcon />,
      category: "Final"
    }
  ];

  const groupedTabs = tabs.reduce((acc, tab, index) => {
    const category = tab.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ ...tab, index });
    return acc;
  }, {});

  const ownerState = { transparentSidenav, whiteSidenav, darkMode, sidenavColor };

  useEffect(() => {
    // A function that sets the mini state of the sidenav.
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }

    /** 
     The event listener that's calling the handleMiniSidenav function when resizing the window.
    */
    window.addEventListener("resize", handleMiniSidenav);

    // Call the handleMiniSidenav function to set the state with the initial value.
    handleMiniSidenav();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      <MDBox pt={3} pb={1} px={4} textAlign="center">
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <MDTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </MDTypography>
        </MDBox>
        <MDBox component={NavLink} to="/" display="flex" alignItems="center">
          {(brand || brandWhite) && <MDBox component="img" src={brand || ((transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite)} alt="Brand" width="2rem" />}
          <MDBox
            width={!brandName && "100%"}
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
          >
            <MDTypography component="h6" variant="button" fontWeight="medium" color={textColor}>
              {brandName || "S.A. Engineering College"}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />
      
      {/* User Profile Section */}
      {user && (
        <>
          <MDBox px={3} py={2}>
            <MDBox display="flex" alignItems="center" mb={1}>
              <Avatar
                src={user.profilePicture}
                alt={user.fullName || `${user.firstName} ${user.lastName}`}
                sx={{ 
                  width: miniSidenav ? 32 : 48, 
                  height: miniSidenav ? 32 : 48,
                  mr: miniSidenav ? 0 : 2
                }}
              >
                {!user.profilePicture && (user.firstName?.[0] || 'U')}
              </Avatar>
              {!miniSidenav && (
                <MDBox>
                  <MDTypography variant="button" fontWeight="medium" color={textColor} noWrap>
                    {user.fullName || `${user.firstName} ${user.lastName}`}
                  </MDTypography>
                  <MDTypography variant="caption" color={textColor} display="block" noWrap>
                    {getRoleDisplayName(user.role)}
                  </MDTypography>
                  <MDTypography variant="caption" color={textColor} display="block" noWrap>
                    {user.email}
                  </MDTypography>
                </MDBox>
              )}
            </MDBox>
          </MDBox>
          <Divider
            light={
              (!darkMode && !whiteSidenav && !transparentSidenav) ||
              (darkMode && !transparentSidenav && whiteSidenav)
            }
          />
        </>
      )}

      {/* Profile Progress Section */}
      <MDBox px={3} py={2}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h6" fontWeight="medium" color={textColor}>
            Profile Progress
          </MDTypography>
          <Chip
            label={`${profileCompletion}%`}
            color={getCompletionColor(profileCompletion)}
            variant="filled"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </MDBox>
        
        <MDBox mb={2}>
          <LinearProgress
            variant="determinate"
            value={profileCompletion}
            color={getCompletionColor(profileCompletion)}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: transparentSidenav || whiteSidenav ? 'grey.200' : 'rgba(255, 255, 255, 0.2)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
              },
            }}
          />
        </MDBox>

        
      </MDBox>

      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />

      {/* Navigation Menu */}
      <MDBox>
        {Object.entries(groupedTabs).map(([category, categoryTabs]) => (
          <MDBox key={category}>
            <MDTypography
              color={textColor}
              display="block"
              variant="caption"
              fontWeight="bold"
              textTransform="uppercase"
              pl={3}
              mt={2}
              mb={1}
              ml={1}
              opacity={0.6}
            >
              {category}
            </MDTypography>
            <List sx={{ py: 0 }}>
              {categoryTabs.map((tab) => (
                <ProfileSidenavCollapse
                  key={tab.index}
                  icon={tab.icon}
                  name={tab.shortLabel}
                  active={activeTab === tab.index}
                  onClick={() => handleTabChange(tab.index)}
                  ownerState={ownerState}
                />
              ))}
            </List>
            {category !== 'Final' && (
              <Divider
                light={
                  (!darkMode && !whiteSidenav && !transparentSidenav) ||
                  (darkMode && !transparentSidenav && whiteSidenav)
                }
              />
            )}
          </MDBox>
        ))}
      </MDBox>

      {/* Go to Dashboard Section */}
      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />
      
      <MDBox px={3} py={2}>
        <MDButton
          variant="gradient"
          color="info"
          fullWidth
          onClick={handleGoToDashboard}
          startIcon={<ArrowBackIcon />}
        >
          Go to Dashboard
        </MDButton>
      </MDBox>
    </SidenavRoot>
  );
}

// Setting default values for the props of StudentProfileSidenav
StudentProfileSidenav.defaultProps = {
  color: "info",
  brand: "",
};

// Typechecking props for the StudentProfileSidenav
StudentProfileSidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string,
};

export default StudentProfileSidenav;
