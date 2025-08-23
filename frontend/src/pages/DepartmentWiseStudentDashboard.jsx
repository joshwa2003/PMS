import React from 'react';

// Material Dashboard 2 React example components
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';

// Dashboard components
import DepartmentWiseStudentDashboard from 'components/DepartmentWiseStudentDashboard/DepartmentWiseStudentDashboard';

function DepartmentWiseStudentDashboardPage() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <DepartmentWiseStudentDashboard />
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default DepartmentWiseStudentDashboardPage;
