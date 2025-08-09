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
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useState } from "react";

// Default avatar for staff members without profile pictures
const defaultAvatar = "https://ui-avatars.com/api/?name=";

export default function staffTableData(staff, onViewDetails, onEditStaff, onDeleteStaff, onToggleStatus) {
  const StaffMember = ({ image, name, email, employeeId }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDAvatar 
        src={image || `${defaultAvatar}${encodeURIComponent(name || 'Staff')}&size=40&background=2196F3&color=ffffff`} 
        name={name} 
        size="sm" 
      />
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

    const handleEdit = () => {
      onEditStaff(staffMember);
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
          <MenuItem onClick={handleEdit}>
            <Icon sx={{ mr: 1 }}>edit</Icon>
            Edit Staff
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
      alumni: 'Alumni',
    };
    return roleNames[role] || role;
  };

  const getDepartmentDisplayName = (department) => {
    const departmentNames = {
      cse: 'Computer Science & Engineering',
      ece: 'Electronics & Communication Engineering',
      eee: 'Electrical & Electronics Engineering',
      mech: 'Mechanical Engineering',
      civil: 'Civil Engineering',
      it: 'Information Technology',
      administration: 'Administration',
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

  return {
    columns: [
      { Header: "staff member", accessor: "staffMember", width: "45%", align: "left" },
      { Header: "role", accessor: "role", align: "left" },
      { Header: "contact", accessor: "contact", align: "left" },
      { Header: "status", accessor: "status", align: "center" },
      { Header: "joined", accessor: "joined", align: "center" },
      { Header: "action", accessor: "action", align: "center" },
    ],

    rows: staff.map((staffMember) => ({
      staffMember: (
        <StaffMember
          image={staffMember.profilePicture}
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
    })),
  };
}
