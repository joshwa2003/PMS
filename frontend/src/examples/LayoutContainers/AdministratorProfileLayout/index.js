import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React context
import { useMaterialUIController, setLayout } from "context";

// Administrator Profile Sidebar
import AdministratorProfileSidenav from "examples/AdministratorProfileSidenav";

/**
 * Administrator Profile Layout - Custom layout for administrator profile pages
 * Replaces the main sidebar with administrator profile navigation
 */
function AdministratorProfileLayout({ children }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "administrator-profile");
  }, [pathname]);

  return (
    <>
      <AdministratorProfileSidenav />
      <MDBox
        sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
          p: 3,
          position: "relative",
          ml: miniSidenav ? pxToRem(120) : pxToRem(274),
          transition: transitions.create(["margin-left", "margin-right"], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard,
          }),
          [breakpoints.up("xl")]: {
            ml: miniSidenav ? pxToRem(120) : pxToRem(274),
          },
        })}
      >
        {children}
      </MDBox>
    </>
  );
}

// Typechecking props for the AdministratorProfileLayout
AdministratorProfileLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdministratorProfileLayout;
