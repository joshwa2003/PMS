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

import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";

// S.A. Engineering College React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDProgress from "components/MDProgress";

// S.A. Engineering College React examples
import DataTable from "examples/Tables/DataTable";

// Default data
import defaultData from "layouts/dashboard/components/Projects/data";

function Projects({ recentJobs = [] }) {
  const { columns } = defaultData();
  const [menu, setMenu] = useState(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (recentJobs && recentJobs.length > 0) {
      const formattedRows = recentJobs.map(job => {
        // Calculate application percentage
        const totalEligible = job.eligibility?.totalEligible || 100;
        const totalApplied = job.stats?.totalApplications || 0;
        const applicationPercentage = totalEligible > 0 
          ? Math.min(Math.round((totalApplied / totalEligible) * 100), 100) 
          : 0;

        // Format company data
        const Company = () => (
          <MDBox display="flex" alignItems="center" lineHeight={1}>
            <MDAvatar 
              src={job.company?.logo || ""} 
              name={job.company?.name || "Company"} 
              size="sm" 
            />
            <MDTypography variant="button" fontWeight="medium" ml={1} lineHeight={1}>
              {job.title || "Job Title"}
            </MDTypography>
          </MDBox>
        );

        // Format members/applications
        const Applications = () => (
          <MDBox display="flex" py={1}>
            <MDTypography variant="caption" color="text" fontWeight="medium">
              {totalApplied} applications
            </MDTypography>
          </MDBox>
        );

        // Format budget/salary
        const Salary = () => (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {job.salary?.display || "Not specified"}
          </MDTypography>
        );

        // Format completion/application progress
        const Completion = () => (
          <MDBox width="8rem" textAlign="left">
            <MDProgress 
              value={applicationPercentage} 
              color="info" 
              variant="gradient" 
              label={false} 
            />
          </MDBox>
        );

        return {
          companies: <Company />,
          members: <Applications />,
          budget: <Salary />,
          completion: <Completion />,
        };
      });

      setRows(formattedRows);
    }
  }, [recentJobs]);

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  const renderMenu = (
    <Menu
      id="simple-menu"
      anchorEl={menu}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(menu)}
      onClose={closeMenu}
    >
      <MenuItem onClick={closeMenu}>View All Jobs</MenuItem>
      <MenuItem onClick={closeMenu}>Refresh</MenuItem>
    </Menu>
  );

  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDBox>
          <MDTypography variant="h6" gutterBottom>
            Recent Job Postings
          </MDTypography>
          <MDBox display="flex" alignItems="center" lineHeight={0}>
            <Icon
              sx={{
                fontWeight: "bold",
                color: ({ palette: { info } }) => info.main,
                mt: -0.5,
              }}
            >
              work
            </Icon>
            <MDTypography variant="button" fontWeight="regular" color="text">
              &nbsp;<strong>{recentJobs.length}</strong> recent jobs
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox color="text" px={2}>
          <Icon sx={{ cursor: "pointer", fontWeight: "bold" }} fontSize="small" onClick={openMenu}>
            more_vert
          </Icon>
        </MDBox>
        {renderMenu}
      </MDBox>
      <MDBox>
        <DataTable
          table={{ columns, rows }}
          showTotalEntries={false}
          isSorted={false}
          noEndBorder
          entriesPerPage={false}
        />
      </MDBox>
    </Card>
  );
}

// Adding prop types
Projects.propTypes = {
  recentJobs: PropTypes.array,
};

export default Projects;
