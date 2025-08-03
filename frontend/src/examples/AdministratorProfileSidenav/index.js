import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
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

// Administrator Profile Context
import { useAdministratorProfile } from "context/AdministratorProfileContext";

/**
 * Administrator Profile Sidenav - Dedicated sidebar for administrator profile pages
 * Replaces the main sidebar when in administrator profile section
 */
function AdministratorProfileSidenav({ color, brand, brandName, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;
  const location = useLocation();
  const collapseName = location.pathname.replace("/", "");

  // Administrator Profile Context
  const {
    activeTab,
    setActiveTab,
    getProfileCompletion
  } = useAdministratorProfile();

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
      active: activeTab === 0,
      onClick: () => setActiveTab(0)
    },
    {
      type: "collapse", 
      name: "Professional Details",
      key: "professional",
      icon: <Icon fontSize="small">work</Icon>,
      active: activeTab === 1,
      onClick: () => setActiveTab(1)
    },
    {
      type: "collapse",
      name: "Contact Details", 
      key: "contact",
      icon: <Icon fontSize="small">contact_phone</Icon>,
      active: activeTab === 2,
      onClick: () => setActiveTab(2)
    },
    {
      type: "collapse",
      name: "Administrative Notes",
      key: "notes", 
      icon: <Icon fontSize="small">notes</Icon>,
      active: activeTab === 3,
      onClick: () => setActiveTab(3)
    }
  ];

  // Main navigation items
  const mainNavItems = [
    {
      type: "collapse",
      name: "Dashboard",
      key: "dashboard",
      icon: <Icon fontSize="small">dashboard</Icon>,
      route: "/dashboard",
      component: <Link to="/dashboard" />
    },
    {
      type: "collapse", 
      name: "Back to Main",
      key: "back-main",
      icon: <Icon fontSize="small">arrow_back</Icon>,
      route: "/dashboard",
      component: <Link to="/dashboard" />
    }
  ];

  const profileCompletion = getProfileCompletion();

  // Render all the routes from the routes.js (All the visible items on the Sidenav)
  const renderRoutes = (routes) =>
    routes.map(({ type, name, icon, title, active, onClick, route, component, key }) => {
      let returnValue;

      if (type === "collapse") {
        returnValue = (
          <SidenavCollapse
            name={name}
            icon={icon}
            active={active}
            onClick={onClick}
            key={key}
          >
            {component}
          </SidenavCollapse>
        );
      } else if (type === "title") {
        returnValue = (
          <MDTypography
            key={key}
            color={textColor}
            display="block"
            variant="caption"
            fontWeight="bold"
            textTransform="uppercase"
            pl={3}
            mt={2}
            mb={1}
            ml={1}
          >
            {title}
          </MDTypography>
        );
      } else if (type === "divider") {
        returnValue = (
          <Divider
            key={key}
            light={
              (!darkMode && !whiteSidenav && !transparentSidenav) ||
              (darkMode && !transparentSidenav && whiteSidenav)
            }
          />
        );
      }

      return returnValue;
    });

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
        <MDBox component={Link} to="/" display="flex" alignItems="center">
          {brand && <MDBox component="img" src={brand} alt="Brand" width="2rem" />}
          <MDBox
            width={!brandName && "100%"}
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
          >
            <MDTypography component="h6" variant="button" fontWeight="medium" color={textColor}>
              {brandName || "Administrator Profile"}
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
      <MDBox px={2} py={2}>
        <MDBox mb={2}>
          <MDTypography variant="caption" color={textColor} fontWeight="medium">
            Profile Completion
          </MDTypography>
          <MDBox
            bgColor={profileCompletion >= 80 ? "success" : profileCompletion >= 60 ? "info" : profileCompletion >= 40 ? "warning" : "error"}
            borderRadius="xl"
            coloredShadow={profileCompletion >= 80 ? "success" : profileCompletion >= 60 ? "info" : profileCompletion >= 40 ? "warning" : "error"}
            sx={{ height: "0.5rem", position: "relative", overflow: "hidden" }}
          >
            <MDBox
              bgColor="white"
              sx={{
                height: "100%",
                width: `${100 - profileCompletion}%`,
                position: "absolute",
                right: 0,
                opacity: 0.3
              }}
            />
          </MDBox>
          <MDTypography variant="caption" color={textColor} mt={0.5}>
            {profileCompletion}% Complete
          </MDTypography>
        </MDBox>
      </MDBox>

      <List>
        {/* Profile Navigation */}
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
        >
          Profile Sections
        </MDTypography>
        {renderRoutes(profileNavItems)}
        
        <Divider
          light={
            (!darkMode && !whiteSidenav && !transparentSidenav) ||
            (darkMode && !transparentSidenav && whiteSidenav)
          }
        />
        
        {/* Main Navigation */}
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
        >
          Navigation
        </MDTypography>
        {renderRoutes(mainNavItems)}
      </List>

      {/* Quick Actions */}
      <MDBox pt={2} pb={2} px={2} mt="auto">
        <MDBox mt={2}>
          <MDButton
            component={Link}
            to="/dashboard"
            variant="gradient"
            color={sidenavColor}
            fullWidth
            size="small"
          >
            Back to Dashboard
          </MDButton>
        </MDBox>
      </MDBox>
    </SidenavRoot>
  );
}

// Setting default values for the props of AdministratorProfileSidenav
AdministratorProfileSidenav.defaultProps = {
  color: "info",
  brand: "",
};

// Typechecking props for the AdministratorProfileSidenav
AdministratorProfileSidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string,
};

export default AdministratorProfileSidenav;
