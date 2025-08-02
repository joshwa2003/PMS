# Original Project Backup - Material Dashboard React

This file contains the backup of the original Material Dashboard React project before converting it to Placement Management System (PMS).

## Original Project Structure
- **Framework**: React 18.2.0 with Material-UI
- **Template**: Material Dashboard 2 React by Creative Tim
- **Features**: Dashboard, Tables, Billing, RTL, Notifications, Profile, Sign In/Up

## Original Routes Configuration
```javascript
const routes = [
  { name: "Dashboard", key: "dashboard", route: "/dashboard" },
  { name: "Tables", key: "tables", route: "/tables" },
  { name: "Billing", key: "billing", route: "/billing" },
  { name: "RTL", key: "rtl", route: "/rtl" },
  { name: "Notifications", key: "notifications", route: "/notifications" },
  { name: "Profile", key: "profile", route: "/profile" },
  { name: "Sign In", key: "sign-in", route: "/authentication/sign-in" },
  { name: "Sign Up", key: "sign-up", route: "/authentication/sign-up" }
];
```

## Original Dependencies
- @mui/material: 5.12.3
- @mui/icons-material: 5.11.16
- react-router-dom: 6.11.0
- chart.js: 4.3.0
- react-chartjs-2: 5.2.0

## Original Authentication
- Basic UI components only
- No backend integration
- No role-based access control
- Static sign-in/sign-up forms

## Conversion Notes
- Converting to Placement Management System (PMS)
- Adding 8 roles: Admin, Placement Directors, Placement Staff, Department HOD, Other Staff, Students, Alumni, Company HR
- Implementing Node.js/Express.js backend
- Adding MongoDB database integration
- Creating role-based authentication system

## Backup Date
Created on: $(date)

## Original File Locations
- Main App: src/App.js
- Routes: src/routes.js
- Sign In: src/layouts/authentication/sign-in/index.js
- Sign Up: src/layouts/authentication/sign-up/index.js
- Dashboard: src/layouts/dashboard/index.js
- All components preserved in their original state before modification
