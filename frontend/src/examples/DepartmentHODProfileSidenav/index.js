import { useEffect } from "react";

// react-router-dom components
import { useLocation, NavLink } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";

// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";

// Department HOD Profile Context
import { useDepartmentHODProfile } from "context/DepartmentHODProfileContext";

/**
 * Department HOD Profile Sidenav - Dedicated sidebar for department HOD profile pages
 * Replaces the main sidebar when in department HOD profile section
 */
function DepartmentHODProfileSidenav({ color, brand, brandName, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;
  const location = useLocation();
  const collapseName = location.pathname.replace("/", "");

  // Department HOD Profile Context
  const {
    profile,
    activeTab,
    setActiveTab,
    getProfileCompletion
  } = useDepartmentHODProfile();

  let textColor = "white";

  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => setMiniSidenav(dispatch, true);

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

  // Profile navigation items
  const profileNavItems = [
    {
      type: "collapse",
      name: "Basic Information",
      key: "basic-info",
      icon: <Icon fontSize="small">person</Icon>,
      tabIndex: 0,
    },
    {
      type: "collapse", 
      name: "Contact Details",
      key: "contact-details",
      icon: <Icon fontSize="small">contact_phone</Icon>,
      tabIndex: 1,
    },
    {
      type: "collapse",
      name: "Professional Details", 
      key: "professional-details",
      icon: <Icon fontSize="small">work</Icon>,
      tabIndex: 2,
    },
    {
      type: "collapse",
      name: "HOD Specific",
      key: "hod-specific",
      icon: <Icon fontSize="small">school</Icon>,
      tabIndex: 3,
    },
  ];

  // Render all the routes from the routes.js (All the visible items on the Sidenav)
  const renderRoutes = profileNavItems.map(({ type, name, icon, key, tabIndex }) => {
    let returnValue;

    if (type === "collapse") {
      returnValue = (
        <SidenavCollapse
          name={name}
          icon={icon}
          active={activeTab === tabIndex}
          onClick={() => setActiveTab(tabIndex)}
          key={key}
        />
      );
    }

    return returnValue;
  });

  const profileCompletion = getProfileCompletion();

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
        <MDBox component={NavLink} to="/dashboard" display="flex" alignItems="center">
          {brand && <MDBox component="img" src={brand} alt="Brand" width="2rem" />}
          <MDBox
            width={!brandName && "100%"}
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
          >
            <MDTypography component="h6" variant="button" fontWeight="medium" color={textColor}>
              {brandName || "Department HOD Profile"}
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

      {/* Profile Completion Section */}
      <MDBox px={2} py={1}>
        <MDBox mb={1}>
          <MDTypography variant="caption" color={textColor} fontWeight="medium">
            Profile Completion
          </MDTypography>
        </MDBox>
        <MDBox
          bgColor={profileCompletion === 100 ? "success" : profileCompletion >= 70 ? "warning" : "error"}
          borderRadius="lg"
          py={1}
          px={2}
          mb={1}
        >
          <MDTypography variant="caption" color="white" fontWeight="bold">
            {profileCompletion}% Complete
          </MDTypography>
        </MDBox>
        {profile && (
          <MDBox mb={1}>
            <MDTypography variant="caption" color={textColor}>
              {profile.fullName || 'Department HOD'}
            </MDTypography>
            <br />
            <MDTypography variant="caption" color={textColor} opacity={0.8}>
              {profile.departmentDisplayName || profile.departmentHeadOf}
            </MDTypography>
          </MDBox>
        )}
      </MDBox>

      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />

      <List>{renderRoutes}</List>

      <MDBox p={2} mt="auto">
        <MDButton
          component={NavLink}
          to="/dashboard"
          variant="gradient"
          color={sidenavColor}
          fullWidth
        >
          Back to Dashboard
        </MDButton>
      </MDBox>
    </SidenavRoot>
  );
}

// Setting default values for the props of DepartmentHODProfileSidenav
DepartmentHODProfileSidenav.defaultProps = {
  color: "info",
  brand: "",
};

// Typechecking props for the DepartmentHODProfileSidenav
DepartmentHODProfileSidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string,
};

export default DepartmentHODProfileSidenav;
