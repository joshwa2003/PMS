import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MDBox from './MDBox';
import MDTypography from './MDTypography';

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [], 
  fallbackPath = '/authentication/sign-in' 
}) => {
  const { isAuthenticated, isLoading, user, hasAnyRole, hasPermission } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <MDBox
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <MDTypography variant="h6" color="text">
          Loading...
        </MDTypography>
      </MDBox>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <MDBox
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        textAlign="center"
        p={3}
      >
        <MDTypography variant="h4" color="error" mb={2}>
          Access Denied
        </MDTypography>
        <MDTypography variant="body1" color="text" mb={2}>
          You don't have permission to access this page.
        </MDTypography>
        <MDTypography variant="body2" color="text">
          Required roles: {requiredRoles.join(', ')}
        </MDTypography>
        <MDTypography variant="body2" color="text">
          Your role: {user?.role}
        </MDTypography>
      </MDBox>
    );
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(permission => 
      hasPermission(permission)
    );

    if (!hasRequiredPermission) {
      return (
        <MDBox
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          textAlign="center"
          p={3}
        >
          <MDTypography variant="h4" color="error" mb={2}>
            Access Denied
          </MDTypography>
          <MDTypography variant="body1" color="text" mb={2}>
            You don't have the required permissions to access this page.
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Required permissions: {requiredPermissions.join(', ')}
          </MDTypography>
        </MDBox>
      );
    }
  }

  // Render the protected component
  return children;
};

export default ProtectedRoute;
