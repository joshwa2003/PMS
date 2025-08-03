import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React context
import { useMaterialUIController, setLayout } from "context";

// Placement Director Profile Sidebar
import PlacementDirectorProfileSidenav from "examples/PlacementDirectorProfileSidenav";

/**
 * Placement Director Profile Layout - Custom layout for placement director profile pages
 * Replaces the main sidebar with placement director profile navigation
 */
function PlacementDirectorProfileLayout({ children }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "placement-director-profile");
  }, [pathname]);

  return (
    <>
      <PlacementDirectorProfileSidenav />
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

// Typechecking props for the PlacementDirectorProfileLayout
PlacementDirectorProfileLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PlacementDirectorProfileLayout;
