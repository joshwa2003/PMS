import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React context
import { useMaterialUIController, setLayout } from "context";

// Department HOD Profile Sidebar
import DepartmentHODProfileSidenav from "examples/DepartmentHODProfileSidenav";

/**
 * Department HOD Profile Layout - Custom layout for department HOD profile pages
 * Replaces the main sidebar with department HOD profile navigation
 */
function DepartmentHODProfileLayout({ children }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "department-hod-profile");
  }, [pathname]);

  return (
    <>
      <DepartmentHODProfileSidenav />
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

// Typechecking props for the DepartmentHODProfileLayout
DepartmentHODProfileLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DepartmentHODProfileLayout;
