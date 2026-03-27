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

import { useState, useEffect, useMemo } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";

// S.A. Engineering College React components
import MDBox from "components/MDBox";

// S.A. Engineering College React example components
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// S.A. Engineering College React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

// S.A. Engineering College React Dark Mode themes
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// S.A. Engineering College React routes
import routes from "routes";

// S.A. Engineering College React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";
import { AuthProvider } from "context/AuthContext";
import { JobProvider } from "context/JobContext";
import { ApplicationResponseProvider, useApplicationResponse } from "context/ApplicationResponseContext";

// Application Response Modal
import ApplicationResponseModal from "components/ApplicationResponseModal";

// Images
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  return (
    <AuthProvider>
      <JobProvider>
        <ApplicationResponseProvider>
          <AppContent 
            direction={direction}
            rtlCache={rtlCache}
            darkMode={darkMode}
            layout={layout}
            sidenavColor={sidenavColor}
            transparentSidenav={transparentSidenav}
            whiteSidenav={whiteSidenav}
            brandDark={brandDark}
            brandWhite={brandWhite}
            routes={routes}
            handleOnMouseEnter={handleOnMouseEnter}
            handleOnMouseLeave={handleOnMouseLeave}
            configsButton={configsButton}
            getRoutes={getRoutes}
          />
        </ApplicationResponseProvider>
      </JobProvider>
    </AuthProvider>
  );
}

// Separate component to access ApplicationResponse context
function AppContent({ 
  direction, 
  rtlCache, 
  darkMode, 
  layout, 
  sidenavColor, 
  transparentSidenav, 
  whiteSidenav, 
  brandDark, 
  brandWhite, 
  routes, 
  handleOnMouseEnter, 
  handleOnMouseLeave, 
  configsButton, 
  getRoutes 
}) {
  const { pendingResponse, showModal, submitResponse, loading, error, checkForPendingResponses, isInitialCheckComplete } = useApplicationResponse();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug logging for App.js - only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 App.js render - Modal state:', { showModal, pendingResponse, loading, error });
  }

  const handleModalSubmit = async (responseData) => {
    const result = await submitResponse(responseData);
    if (result.success) {
      console.log('✅ Application response submitted successfully');
    }
  };

  // Periodic check for pending responses every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!showModal) {
        checkForPendingResponses();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [showModal, checkForPendingResponses]);

  // Block navigation when modal is shown
  useEffect(() => {
    if (showModal) {
      // Prevent browser back/forward
      const handlePopState = (e) => {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
        alert('You must respond to the application confirmation before navigating.');
      };
      
      // Add state to history to prevent back navigation
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
      
      // Prevent page unload
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'You must respond to the application confirmation before leaving.';
        return 'You must respond to the application confirmation before leaving.';
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [showModal, navigate, location]);

  return (
    <>
      {direction === "rtl" ? (
        <CacheProvider value={rtlCache}>
          <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
            <CssBaseline />
            
            {/* Show modal overlay that blocks everything when response is required */}
            {showModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  zIndex: 9997,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div style={{ color: 'white', textAlign: 'center', fontSize: '18px', padding: '20px' }}>
                  Please respond to the application confirmation to continue...
                </div>
              </div>
            )}
            
            {/* Show a full-screen loading if initial check is not complete */}
            {!isInitialCheckComplete && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <CircularProgress color="info" />
                <div style={{ marginTop: '20px', color: darkMode ? 'white' : 'black', fontSize: '18px' }}>
                  Checking application status...
                </div>
              </div>
            )}
            
            <div style={{ display: (!isInitialCheckComplete || showModal) ? 'none' : 'block' }}>
              {layout === "dashboard" && (
                <>
                  <Sidenav
                    color={sidenavColor}
                    brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
                    brandName="S.A. Engineering College"
                    routes={routes}
                    onMouseEnter={handleOnMouseEnter}
                    onMouseLeave={handleOnMouseLeave}
                  />
                  <Configurator />
                  {configsButton}
                </>
              )}
              {layout === "student-profile" && (
                <>
                  <Configurator />
                  {configsButton}
                </>
              )}
              {layout === "administrator-profile" && (
                <>
                  <Configurator />
                  {configsButton}
                </>
              )}
              {layout === "vr" && <Configurator />}
              <Routes>
                {getRoutes(routes)}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
            
            {/* Global Application Response Modal - Always on top */}
            <ApplicationResponseModal
              open={showModal}
              jobData={pendingResponse?.jobData}
              onSubmit={handleModalSubmit}
              loading={loading}
              error={error}
            />
          </ThemeProvider>
        </CacheProvider>
      ) : (
        <ThemeProvider theme={darkMode ? themeDark : theme}>
          <CssBaseline />
          
          {/* Show modal overlay that blocks everything when response is required */}
          {showModal && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                zIndex: 9997,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{ color: 'white', textAlign: 'center', fontSize: '18px', padding: '20px' }}>
                Please respond to the application confirmation to continue...
              </div>
            </div>
          )}
          
          {/* Show a full-screen loading if initial check is not complete */}
          {!isInitialCheckComplete && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}
            >
              <CircularProgress color="info" />
              <div style={{ marginTop: '20px', color: darkMode ? 'white' : 'black', fontSize: '18px' }}>
                Checking application status...
              </div>
            </div>
          )}
          
          <div style={{ display: (!isInitialCheckComplete || showModal) ? 'none' : 'block' }}>
            {layout === "dashboard" && (
              <>
                <Sidenav
                  color={sidenavColor}
                  brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
                  brandName="S.A. Engineering College"
                  routes={routes}
                  onMouseEnter={handleOnMouseEnter}
                  onMouseLeave={handleOnMouseLeave}
                />
                <Configurator />
                {configsButton}
              </>
            )}
            {layout === "student-profile" && (
              <>
                <Configurator />
                {configsButton}
              </>
            )}
            {layout === "administrator-profile" && (
              <>
                <Configurator />
                {configsButton}
              </>
            )}
            {layout === "vr" && <Configurator />}
            <Routes>
              {getRoutes(routes)}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
          
          {/* Global Application Response Modal - Always on top */}
          <ApplicationResponseModal
            open={showModal}
            jobData={pendingResponse?.jobData}
            onSubmit={handleModalSubmit}
            loading={loading}
            error={error}
          />
        </ThemeProvider>
      )}
    </>
  );
}
