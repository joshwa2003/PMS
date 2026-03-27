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
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import ProfilePage from "layouts/profile/ProfilePage";
import StudentProfile from "pages/StudentProfile";
import AdministratorProfile from "pages/AdministratorProfile";
import PlacementDirectorProfile from "pages/PlacementDirectorProfile";
import PlacementStaffProfile from "pages/PlacementStaffProfile";
import DepartmentHODProfile from "pages/DepartmentHODProfile";
import OtherStaffProfile from "pages/OtherStaffProfile";
import PlacementDirectorStudentProfile from "pages/PlacementDirectorStudentProfile";
import StaffManagement from "pages/StaffManagement";
import StudentManagement from "pages/StudentManagement";
import CourseCategoryManagement from "pages/CourseCategoryManagement";
import DepartmentManagement from "pages/DepartmentManagement";
import DepartmentStaffManagement from "pages/DepartmentStaffManagement";
import DepartmentsOverview from "pages/DepartmentsOverview";
import DepartmentWiseStudentDashboard from "pages/DepartmentWiseStudentDashboard";
import DepartmentStudents from "pages/DepartmentStudents";
import DepartmentBatches from "pages/DepartmentBatches";
import AlumniBatches from "pages/AlumniBatches";
import JobManagementNew from "pages/JobManagementNew";
import CreateJobPageEnhanced from "pages/CreateJobPageEnhanced";
import JobMonitoring from "pages/JobMonitoring";
import JobAnalytics from "pages/JobAnalytics";
import JobBatchAnalytics from "pages/JobBatchAnalytics";
import JobBatchStudents from "pages/JobBatchStudents";
import DepartmentApplications from "pages/DepartmentApplications";
import AllJobApplications from "pages/AllJobApplications";
import JobPosts from "pages/JobPosts";
import JobDetailPage from "pages/JobDetailPage";
import AppliedJobs from "pages/AppliedJobs";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import ForgotPassword from "layouts/authentication/forgot-password";
import FirstLoginPasswordReset from "layouts/authentication/first-login-password-reset";
import PlacementDirectorManagement from "pages/PlacementDirectorManagement";

// Protected Route Component
import ProtectedRoute from "components/ProtectedRoute";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  // 1. Dashboard
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

  // 1.5. Department-wise Student Dashboard
  {
    type: "collapse",
    name: "Student Dashboard",
    key: "department-wise-student-dashboard",
    icon: <Icon fontSize="small">analytics</Icon>,
    route: "/department-wise-student-dashboard",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director']}>
        <DepartmentWiseStudentDashboard />
      </ProtectedRoute>
    ),
  },

  // 2. User Management (with Staff Management and Placement Director Management nested inside)
  {
    type: "collapse",
    name: "User Management",
    key: "user-management",
    icon: <Icon fontSize="small">people</Icon>,
    collapse: [
      {
        name: "Placement Director Management",
        key: "placement-director-management",
        route: "/placement-director-management",
        component: (
          <ProtectedRoute requiredRoles={['admin']}>
            <PlacementDirectorManagement />
          </ProtectedRoute>
        ),
        hideForRoles: ['placement_director', 'placement_staff', 'department_hod', 'other_staff', 'student'],
        icon: "manage_accounts",
      },
      {
        name: "Staff Management",
        key: "staff-management",
        route: "/staff-management",
        component: (
          <ProtectedRoute requiredRoles={['admin', 'placement_director']}>
            <StaffManagement />
          </ProtectedRoute>
        ),
        icon: "groups",
      }
    ],
  },

  // 3. Departments (with Course Categories, Department Management, All Departments nested inside)
  {
    type: "collapse",
    name: "Departments",
    key: "departments",
    icon: <Icon fontSize="small">account_tree</Icon>,
    collapse: [
      {
        name: "Course Categories",
        key: "course-category-management",
        route: "/course-category-management",
        component: (
          <ProtectedRoute requiredRoles={['admin', 'placement_director']}>
            <CourseCategoryManagement />
          </ProtectedRoute>
        ),
        icon: "category",
      },
      {
        name: "Department Management",
        key: "department-management",
        route: "/department-management",
        component: (
          <ProtectedRoute requiredRoles={['admin', 'placement_director']}>
            <DepartmentManagement />
          </ProtectedRoute>
        ),
        icon: "business",
      },
      {
        name: "All Departments",
        key: "all-departments",
        route: "/departments",
        component: (
          <ProtectedRoute requiredRoles={['admin', 'placement_director']}>
            <DepartmentsOverview />
          </ProtectedRoute>
        ),
        icon: "view_list",
      }
    ],
  },

  // 4. Administrator Profile
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

  // Job Posts (Public - accessible to all users)
  {
    type: "collapse",
    name: "Job Posts",
    key: "job-posts",
    icon: <Icon fontSize="small">work_outline</Icon>,
    route: "/job-posts",
    component: <JobPosts />,
  },
  // Job Detail Page (hidden from sidebar - accessed via job posts)
  {
    type: "route",
    name: "Job Detail",
    key: "job-detail",
    route: "/job-detail/:jobId",
    component: <JobDetailPage />,
  },

  // Job Management Routes
  {
    type: "collapse",
    name: "Job Management",
    key: "job-management",
    icon: <Icon fontSize="small">work</Icon>,
    route: "/job-management",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director']}>
        <JobManagementNew />
      </ProtectedRoute>
    ),
    hideForRoles: ['student', 'other_staff', 'placement_staff'],
  },
  {
    type: "collapse",
    name: "Job Monitoring",
    key: "job-monitoring",
    icon: <Icon fontSize="small">analytics</Icon>,
    route: "/job-monitoring",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director', 'placement_staff']}>
        <JobMonitoring />
      </ProtectedRoute>
    ),
    hideForRoles: ['student', 'other_staff'],
  },
  // Job Analytics (hidden from sidebar - accessed via job monitoring)
  {
    type: "route",
    name: "Job Analytics",
    key: "job-analytics",
    route: "/job-monitoring/:jobId/analytics",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director', 'placement_staff']}>
        <JobAnalytics />
      </ProtectedRoute>
    ),
  },
  // Job Batch Analytics (hidden from sidebar - for placement staff flow)
  {
    type: "route",
    name: "Job Batch Analytics",
    key: "job-batch-analytics",
    route: "/job-monitoring/:jobId/batches",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director', 'placement_staff']}>
        <JobBatchAnalytics />
      </ProtectedRoute>
    ),
  },
  // Job Batch Students (hidden from sidebar - for placement staff flow)
  {
    type: "route",
    name: "Job Batch Students",
    key: "job-batch-students",
    route: "/job-monitoring/:jobId/batch/:batchId/students",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director', 'placement_staff']}>
        <JobBatchStudents />
      </ProtectedRoute>
    ),
  },
  // Department Applications (hidden from sidebar - accessed via job analytics)
  {
    type: "route",
    name: "Department Applications",
    key: "department-applications",
    route: "/job-monitoring/:jobId/department/:departmentId",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director', 'placement_staff']}>
        <DepartmentApplications />
      </ProtectedRoute>
    ),
  },
  // All Job Applications (hidden from sidebar - accessed via job analytics)
  {
    type: "route",
    name: "All Job Applications",
    key: "all-job-applications",
    route: "/job-monitoring/:jobId/applications",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director', 'placement_staff']}>
        <AllJobApplications />
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
    hideForRoles: ['student', 'placement_director', 'other_staff', 'placement_staff'],
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
    hideForRoles: ['student', 'placement_director', 'other_staff', 'placement_staff'],
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
    type: "route",
    name: "Student Profile",
    key: "student-profile",
    route: "/student-profile",
    component: (
      <ProtectedRoute requiredRoles={['student']}>
        <StudentProfile />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Applied Jobs",
    key: "applied-jobs",
    icon: <Icon fontSize="small">work_history</Icon>,
    route: "/applied-jobs",
    component: (
      <ProtectedRoute requiredRoles={['student']}>
        <AppliedJobs />
      </ProtectedRoute>
    ),
    hideForRoles: ['placement_director', 'other_staff', 'placement_staff'],
  },
  // Staff view of specific student profile (hidden from sidebar)
  {
    type: "route",
    name: "Student Profile View",
    key: "student-profile-view",
    route: "/student-profile/:studentId",
    component: (
      <ProtectedRoute requiredRoles={['placement_staff']}>
        <PlacementDirectorStudentProfile />
      </ProtectedRoute>
    ),
  },
  // Placement Director view of specific student profile (hidden from sidebar)
  {
    type: "route",
    name: "Placement Director Student Profile",
    key: "placement-director-student-profile",
    route: "/placement-director/student-profile/:studentId",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director', 'placement_staff']}>
        <PlacementDirectorStudentProfile />
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
    name: "Student Management",
    key: "student-management",
    icon: <Icon fontSize="small">school</Icon>,
    route: "/student-management",
    component: (
      <ProtectedRoute requiredRoles={['placement_staff']}>
        <StudentManagement />
      </ProtectedRoute>
    ),
    hideForRoles: ['student', 'placement_director', 'other_staff'],
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
    name: "Other Staff Profile",
    key: "other-staff-profile",
    icon: <Icon fontSize="small">badge</Icon>,
    route: "/other-staff-profile",
    component: (
      <ProtectedRoute requiredRoles={['other_staff']}>
        <OtherStaffProfile />
      </ProtectedRoute>
    ),
    hideForRoles: ['admin', 'placement_director', 'placement_staff', 'department_hod', 'student'],
  },
  // Department Staff Management (hidden from sidebar - accessed via departments)
  {
    type: "route",
    name: "Department Staff Management",
    key: "department-staff-management",
    route: "/department-staff/:departmentId",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director']}>
        <DepartmentStaffManagement />
      </ProtectedRoute>
    ),
  },
  // Department Batches (hidden from sidebar - accessed via department dashboard)
  {
    type: "route",
    name: "Department Batches",
    key: "department-batches",
    route: "/department-batches/:departmentId",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director', 'placement_staff']}>
        <DepartmentBatches />
      </ProtectedRoute>
    ),
  },
  // Department Students (hidden from sidebar - accessed via department dashboard)
  {
    type: "route",
    name: "Department Students",
    key: "department-students",
    route: "/department-students/:departmentId",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director', 'placement_staff']}>
        <DepartmentStudents />
      </ProtectedRoute>
    ),
  },
  // Batch Students (hidden from sidebar - accessed via department batches)
  {
    type: "route",
    name: "Batch Students",
    key: "batch-students",
    route: "/department-students/:departmentId/:batchId",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director', 'placement_staff']}>
        <DepartmentStudents />
      </ProtectedRoute>
    ),
  },
  // Alumni Batches (Sidebar Item)
  {
    type: "collapse",
    name: "Alumni Batches",
    key: "alumni-batches",
    icon: <Icon fontSize="small">school</Icon>,
    route: "/alumni-batches",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director', 'placement_staff']}>
        <AlumniBatches />
      </ProtectedRoute>
    ),
    hideForRoles: ['student', 'other_staff'],
  },
  // Create Job Page (hidden from sidebar - accessed via job management)
  {
    type: "route",
    name: "Create Job",
    key: "create-job",
    route: "/job-management/create",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director']}>
        <CreateJobPageEnhanced />
      </ProtectedRoute>
    ),
  },
  // Edit Job Page (hidden from sidebar - accessed via job management)
  {
    type: "route",
    name: "Edit Job",
    key: "edit-job",
    route: "/job-management/edit/:jobId",
    component: (
      <ProtectedRoute requiredRoles={['admin', 'placement_director']}>
        <CreateJobPageEnhanced />
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
    hideForRoles: ['student', 'placement_director', 'other_staff', 'placement_staff'],
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
    hideForRoles: ['student', 'placement_director', 'other_staff', 'placement_staff'],
  },
  // Forgot password route (hidden from sidebar)
  {
    type: "route",
    name: "Forgot Password",
    key: "forgot-password",
    route: "/authentication/forgot-password",
    component: <ForgotPassword />,
  },
  // First login routes (hidden from sidebar)
  {
    type: "route",
    name: "First Login Password Reset",
    key: "first-login-password-reset",
    route: "/authentication/first-login-password-reset",
    component: <FirstLoginPasswordReset />,
  },
];

export default routes;
