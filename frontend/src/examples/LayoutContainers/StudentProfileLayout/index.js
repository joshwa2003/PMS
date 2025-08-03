/**
=========================================================
* S.A. Engineering College React - v2.2.0
=========================================================

* Student Profile Layout - Custom layout for student profile pages
* Replaces the main sidebar with student profile navigation
*/

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// S.A. Engineering College React components
import MDBox from "components/MDBox";

// S.A. Engineering College React context
import { useMaterialUIController, setLayout } from "context";

// Student Profile Sidebar
import StudentProfileSidenav from "examples/StudentProfileSidenav";

function StudentProfileLayout({ children }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "student-profile");
  }, [pathname]);

  return (
    <>
      <StudentProfileSidenav />
      <MDBox
        sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
          p: 3,
          position: "relative",

          [breakpoints.up("xl")]: {
            marginLeft: miniSidenav ? pxToRem(120) : pxToRem(274),
            transition: transitions.create(["margin-left", "margin-right"], {
              easing: transitions.easing.easeInOut,
              duration: transitions.duration.standard,
            }),
          },
        })}
      >
        {children}
      </MDBox>
    </>
  );
}

// Typechecking props for the StudentProfileLayout
StudentProfileLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default StudentProfileLayout;
