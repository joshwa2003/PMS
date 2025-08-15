/**
=========================================================
* S.A. Engineering College React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 S.A. Engineering College (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useEffect, useState } from "react";

// react-router-dom components
import { useLocation, NavLink } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import Avatar from "@mui/material/Avatar";
import Collapse from "@mui/material/Collapse";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

// S.A. Engineering College React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// S.A. Engineering College React example components
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";

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

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;
  const location = useLocation();
  const collapseName = location.pathname.replace("/", "");
  
  // Auth context
  const { user } = useAuth();

  // State for managing collapsible menus
  const [openCollapse, setOpenCollapse] = useState({});

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

  // Handle collapsible menu toggle
  const handleCollapseToggle = (key) => {
    setOpenCollapse(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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

  // Filter routes based on user role
  const filteredRoutes = routes.filter(({ key }) => {
    if (!user) return true; // Show all routes if no user (shouldn't happen in protected routes)
    
    // Define role groups
    const systemAdminRoles = ['admin', 'placement_director', 'placement_staff', 'department_hod', 'other_staff'];
    const administratorRoles = ['admin', 'director', 'staff', 'hod'];
    const studentRoles = ['student'];
    
    // Check user role
    const isSystemAdmin = systemAdminRoles.includes(user.role);
    const isAdministrator = administratorRoles.includes(user.role);
    const isStudent = studentRoles.includes(user.role);
    
    // Role-based filtering logic
    switch (key) {
      case 'profile':
        // Hide Profile for System Administrators, show for others
        return !isSystemAdmin;
      
      case 'student-profile':
        // Hide Student Profile for System Administrators, show for students and others
        return !isSystemAdmin;
      
      case 'administrator-profile':
        // Show Administrator Profile only for administrators
        return isAdministrator;
      
      case 'placement-director-profile':
        // Show Placement Director Profile only for placement directors
        return user.role === 'placement_director';
      
      case 'placement-staff-profile':
        // Show Placement Staff Profile only for placement staff
        return user.role === 'placement_staff';

      case 'department-hod-profile':
        // Show Department HOD Profile only for department HODs
        return user.role === 'department_hod';

      case 'staff-management':
        // Show Staff Management only for admin and placement director
        return user.role === 'admin' || user.role === 'placement_director';

      case 'departments':
        // Show Departments only for admin and placement director
        return user.role === 'admin' || user.role === 'placement_director';
      
      default:
        // Show all other routes by default
        return true;
    }
  });

  // Render all the filtered routes from the routes.js (All the visible items on the Sidenav)
  const renderRoutes = filteredRoutes.map(({ type, name, icon, title, noCollapse, key, href, route, collapse }) => {
    let returnValue;

    if (type === "collapse") {
      // Handle collapsible menus with nested routes
      if (collapse && Array.isArray(collapse)) {
        const isOpen = openCollapse[key] || false;
        
        returnValue = (
          <div key={key}>
            {/* Main collapsible item */}
            <ListItem component="li">
              <MDBox
                onClick={() => handleCollapseToggle(key)}
                sx={(theme) => ({
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  margin: "0 8px",
                  backgroundColor: transparentSidenav ? "transparent" : 
                    whiteSidenav ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)",
                  "&:hover": {
                    backgroundColor: transparentSidenav ? "rgba(0,0,0,0.05)" : 
                      whiteSidenav ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)",
                  }
                })}
              >
                <ListItemIcon
                  sx={{
                    minWidth: "36px",
                    color: transparentSidenav || whiteSidenav ? "rgba(0,0,0,0.6)" : "white"
                  }}
                >
                  {typeof icon === "string" ? (
                    <Icon sx={{ fontSize: "1.25rem" }}>{icon}</Icon>
                  ) : (
                    icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={name}
                  sx={{
                    "& .MuiListItemText-primary": {
                      color: transparentSidenav || whiteSidenav ? "rgba(0,0,0,0.8)" : "white",
                      fontSize: "0.875rem",
                      fontWeight: 400,
                      opacity: miniSidenav ? 0 : 1,
                      transition: "opacity 0.3s ease"
                    }
                  }}
                />
                <Icon
                  sx={{
                    color: transparentSidenav || whiteSidenav ? "rgba(0,0,0,0.6)" : "white",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease"
                  }}
                >
                  expand_more
                </Icon>
              </MDBox>
            </ListItem>
            
            {/* Nested items */}
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {collapse.map((nestedRoute) => (
                  <NavLink key={nestedRoute.key} to={nestedRoute.route} style={{ textDecoration: "none" }}>
                    <ListItem component="li" sx={{ pl: 4 }}>
                      <MDBox
                        sx={(theme) => ({
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          margin: "0 8px",
                          backgroundColor: location.pathname === nestedRoute.route ? 
                            (transparentSidenav ? "rgba(0,0,0,0.1)" : 
                             whiteSidenav ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)") : "transparent",
                          "&:hover": {
                            backgroundColor: transparentSidenav ? "rgba(0,0,0,0.05)" : 
                              whiteSidenav ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)",
                          }
                        })}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: "24px",
                            color: transparentSidenav || whiteSidenav ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.8)"
                          }}
                        >
                          <Icon sx={{ fontSize: "1rem" }}>fiber_manual_record</Icon>
                        </ListItemIcon>
                        <ListItemText
                          primary={nestedRoute.name}
                          sx={{
                            "& .MuiListItemText-primary": {
                              color: transparentSidenav || whiteSidenav ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.9)",
                              fontSize: "0.8125rem",
                              fontWeight: location.pathname === nestedRoute.route ? 500 : 400,
                              opacity: miniSidenav ? 0 : 1,
                              transition: "opacity 0.3s ease"
                            }
                          }}
                        />
                      </MDBox>
                    </ListItem>
                  </NavLink>
                ))}
              </List>
            </Collapse>
          </div>
        );
      } else {
        // Handle regular collapse items (existing functionality)
        returnValue = href ? (
          <Link
            href={href}
            key={key}
            target="_blank"
            rel="noreferrer"
            sx={{ textDecoration: "none" }}
          >
            <SidenavCollapse
              name={name}
              icon={icon}
              active={key === collapseName}
              noCollapse={noCollapse}
            />
          </Link>
        ) : (
          <NavLink key={key} to={route}>
            <SidenavCollapse name={name} icon={icon} active={key === collapseName} />
          </NavLink>
        );
      }
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
        <MDBox component={NavLink} to="/" display="flex" alignItems="center">
          {brand && <MDBox component="img" src={brand} alt="Brand" width="2rem" />}
          <MDBox
            width={!brandName && "100%"}
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
          >
            <MDTypography component="h6" variant="button" fontWeight="medium" color={textColor}>
              {brandName}
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
      
      <List>{renderRoutes}</List>
    </SidenavRoot>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
