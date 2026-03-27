/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
/**
=========================================================
* S.A. Engineering College React - v2.2.0
=========================================================

* Staff Management Table Data
* Redesigned to match User Management table style
=========================================================
*/

// S.A. Engineering College React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { getGoogleDriveThumbnail } from "../../../utils/googleDriveUtils";
import Checkbox from "@mui/material/Checkbox";
import { useState } from "react";
import { getInitials } from "utils/formatUtils";

export default function staffTableData(staff, onViewDetails, onDeleteStaff, onToggleStatus, selectionProps = null, departments = []) {
  const StaffMember = ({ image, name, email, employeeId }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDAvatar
        src={getGoogleDriveThumbnail(image)}
        name={name}
        size="sm"
        bgColor="info"
        imgProps={{ referrerPolicy: 'no-referrer' }}
        onError={(e) => { e.currentTarget.removeAttribute('src'); }}
      >
        {getInitials(name)}
      </MDAvatar>
      <MDBox ml={2} lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {name}
        </MDTypography>
        <MDTypography variant="caption" color="text">
          {email}
        </MDTypography>
        {employeeId && (
          <MDTypography variant="caption" color="text" display="block">
            ID: {employeeId}
          </MDTypography>
        )}
      </MDBox>
    </MDBox>
  );

  const Role = ({ role, department }) => (
    <MDBox lineHeight={1} textAlign="left">
      <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
        {getRoleDisplayName(role)}
      </MDTypography>
      <MDTypography variant="caption" color="text">
        {getDepartmentDisplayName(department)}
      </MDTypography>
    </MDBox>
  );

  const Contact = ({ email, phone }) => (
    <MDBox lineHeight={1} textAlign="left">
      <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
        {email}
      </MDTypography>
      {phone && (
        <MDTypography variant="caption" color="text">
          {phone}
        </MDTypography>
      )}
    </MDBox>
  );

  const ActionMenu = ({ staffMember }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleViewDetails = () => {
      onViewDetails(staffMember);
      handleClose();
    };


    const handleDelete = () => {
      onDeleteStaff(staffMember);
      handleClose();
    };

    const handleToggleStatus = () => {
      onToggleStatus(staffMember);
      handleClose();
    };

    return (
      <>
        <IconButton
          size="small"
          onClick={handleClick}
          sx={{ color: 'text.secondary' }}
        >
          <Icon>more_vert</Icon>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleViewDetails}>
            <Icon sx={{ mr: 1 }}>visibility</Icon>
            View Details
          </MenuItem>
          {onToggleStatus && (
            <MenuItem onClick={handleToggleStatus}>
              <Icon sx={{ mr: 1 }}>
                {staffMember.isActive ? 'toggle_off' : 'toggle_on'}
              </Icon>
              {staffMember.isActive ? 'Deactivate' : 'Activate'}
            </MenuItem>
          )}
          {onDeleteStaff && (
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <Icon sx={{ mr: 1 }}>delete</Icon>
              Delete Staff
            </MenuItem>
          )}
        </Menu>
      </>
    );
  };

  // Helper functions
  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Administrator',
      placement_director: 'Placement Director',
      placement_staff: 'Placement Staff',
      department_hod: 'Department HOD',
      other_staff: 'Other Staff',
      student: 'Student',

    };
    return roleNames[role] || role;
  };

  const getDepartmentDisplayName = (department) => {
    // Handle both ObjectId and department code cases
    if (!department) return 'Not Assigned';

    // Check if it's an ObjectId or code
    const isObjectId = typeof department === 'string' && department.length === 24 && /^[0-9a-fA-F]{24}$/.test(department);

    // Try to find in dynamic departments list first
    if (departments && departments.length > 0) {
      const foundDept = departments.find(dept =>
        // Match by ID if it's an ObjectId
        (isObjectId && dept.id === department) ||
        // Match by value/code
        dept.value === department ||
        dept.code === department ||
        dept.value === department?.toUpperCase() ||
        dept.value === department?.toLowerCase()
      );

      if (foundDept) {
        return foundDept.label || foundDept.name;
      }
    }

    // If it's an ObjectId and we couldn't find it in the list, try to lookup by ID from hardcoded map (unlikely to work but safe fallback)
    // Or just return the ID if we really can't find it (better than crashing)
    if (isObjectId) {
      return department;
    }

    // Fallback to hardcoded mapping for backward compatibility (for codes like CSE, ECE)
    const departmentNames = {
      CSE: 'Computer Science & Engineering',
      ECE: 'Electronics & Communication Engineering',
      EEE: 'Electrical & Electronics Engineering',
      MECH: 'Mechanical Engineering',
      CIVIL: 'Civil Engineering',
      IT: 'Information Technology',
      MCA: 'Master of Computer Applications',
      MBA: 'Master of Business Administration',
      ADMIN: 'Administration',
      HR: 'Human Resources',
      OTHER: 'Other',
      // Lowercase versions for backward compatibility
      cse: 'Computer Science & Engineering',
      ece: 'Electronics & Communication Engineering',
      eee: 'Electrical & Electronics Engineering',
      mech: 'Mechanical Engineering',
      civil: 'Civil Engineering',
      it: 'Information Technology',
      mca: 'Master of Computer Applications',
      mba: 'Master of Business Administration',
      admin: 'Administration',
      hr: 'Human Resources',
      other: 'Other',
      // Common abbreviations
      'AI&DS': 'Artificial Intelligence & Data Science',
      'AI&ML': 'Artificial Intelligence & Machine Learning',
    };
    return departmentNames[department] || department;
  };

  const getStatusBadge = (staffMember) => {
    // Determine status based on staff member data
    const isActive = staffMember.isActive !== false; // Default to active if not specified

    return (
      <MDBox ml={-1}>
        <MDBadge
          badgeContent={isActive ? "active" : "inactive"}
          color={isActive ? "success" : "dark"}
          variant="gradient"
          size="sm"
        />
      </MDBox>
    );
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  // Selection checkbox component
  const SelectionCheckbox = ({ staffMember }) => {
    if (!selectionProps) return null;

    const { selectedStaff, toggleStaffSelection } = selectionProps;
    const isSelected = selectedStaff.includes(staffMember.id);

    return (
      <Checkbox
        checked={isSelected}
        onChange={() => toggleStaffSelection(staffMember.id)}
        size="small"
        sx={{
          color: 'text.secondary',
          '&.Mui-checked': {
            color: 'primary.main'
          }
        }}
      />
    );
  };

  // Build columns array based on whether selection is enabled
  const columns = [];

  // Add selection column if selection props are provided
  if (selectionProps) {
    columns.push({ Header: "", accessor: "selection", width: "5%", align: "center" });
  }

  // Add standard columns
  columns.push(
    { Header: "staff member", accessor: "staffMember", width: selectionProps ? "40%" : "45%", align: "left" },
    { Header: "role", accessor: "role", align: "left" },
    { Header: "contact", accessor: "contact", align: "left" },
    { Header: "status", accessor: "status", align: "center" },
    { Header: "joined", accessor: "joined", align: "center" },
    { Header: "action", accessor: "action", align: "center" }
  );

  return {
    columns,
    rows: staff.map((staffMember) => {
      const row = {
        staffMember: (
          <StaffMember
            image={staffMember.profilePicture || staffMember.profilePhotoUrl}
            name={staffMember.fullName}
            email={staffMember.email}
            employeeId={staffMember.employeeId}
          />
        ),
        role: (
          <Role
            role={staffMember.role}
            department={staffMember.department}
          />
        ),
        contact: (
          <Contact
            email={staffMember.email}
            phone={staffMember.phone}
          />
        ),
        status: getStatusBadge(staffMember),
        joined: (
          <MDTypography component="span" variant="caption" color="text" fontWeight="medium">
            {formatJoinDate(staffMember.createdAt)}
          </MDTypography>
        ),
        action: <ActionMenu staffMember={staffMember} />,
      };

      // Add selection checkbox if selection props are provided
      if (selectionProps) {
        row.selection = <SelectionCheckbox staffMember={staffMember} />;
      }

      return row;
    }),
  };
}
