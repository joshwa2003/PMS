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

/** 
  All of the routes for the S.A. Engineering College React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// S.A. Engineering College React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import ProfilePage from "layouts/profile/ProfilePage";
import StudentProfile from "pages/StudentProfile";
import AdministratorProfile from "pages/AdministratorProfile";
import PlacementDirectorProfile from "pages/PlacementDirectorProfile";
import PlacementStaffProfile from "pages/PlacementStaffProfile";
import DepartmentHODProfile from "pages/DepartmentHODProfile";
import StaffManagement from "pages/StaffManagement";
import StudentManagement from "pages/StudentManagement";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";

// Protected Route Component
import ProtectedRoute from "components/ProtectedRoute";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "User Management",
    key: "tables",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/tables",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director', 'placement_staff', 'department_hod']}>
        <Tables />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Job Management",
    key: "billing",
    icon: <Icon fontSize="small">work</Icon>,
    route: "/billing",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director', 'placement_staff']}>
        <Billing />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Reports",
    key: "rtl",
    icon: <Icon fontSize="small">assessment</Icon>,
    route: "/rtl",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director', 'department_hod']}>
        <RTL />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: (
      <ProtectedRoute>
        <Notifications />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Student Profile",
    key: "student-profile",
    icon: <Icon fontSize="small">school</Icon>,
    route: "/student-profile",
    component: (
      <ProtectedRoute requiredRoles={['student']}>
        <StudentProfile />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Administrator Profile",
    key: "administrator-profile",
    icon: <Icon fontSize="small">admin_panel_settings</Icon>,
    route: "/administrator-profile",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'director', 'staff', 'hod']}>
        <AdministratorProfile />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Placement Director Profile",
    key: "placement-director-profile",
    icon: <Icon fontSize="small">business_center</Icon>,
    route: "/placement-director-profile",
    component: (
      <ProtectedRoute requiredRoles={['placement_director']}>
        <PlacementDirectorProfile />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Placement Staff Profile",
    key: "placement-staff-profile",
    icon: <Icon fontSize="small">support_agent</Icon>,
    route: "/placement-staff-profile",
    component: (
      <ProtectedRoute requiredRoles={['placement_staff']}>
        <PlacementStaffProfile />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Staff Management",
    key: "staff-management",
    icon: <Icon fontSize="small">group_add</Icon>,
    route: "/staff-management",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director']}>
        <StaffManagement />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Student Management",
    key: "student-management",
    icon: <Icon fontSize="small">school</Icon>,
    route: "/student-management",
    component: (
      <ProtectedRoute requiredRoles={['placement_staff']}>
        <StudentManagement />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Department HOD Profile",
    key: "department-hod-profile",
    icon: <Icon fontSize="small">school</Icon>,
    route: "/department-hod-profile",
    component: (
      <ProtectedRoute requiredRoles={['department_hod']}>
        <DepartmentHODProfile />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
];

export default routes;
