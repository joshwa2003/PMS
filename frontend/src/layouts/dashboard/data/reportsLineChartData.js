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

// Default data structure for the line charts
const defaultData = {
  jobApplications: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: { label: "Job Applications", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  },
  activeStudents: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: { label: "Active Students", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  },
};

/**
 * Formats job application data for the line chart
 * @param {Array} applicationData - Array of job application data by month/day
 * @returns {Object} Formatted data for the line chart
 */
export const formatJobApplicationData = (applicationData) => {
  if (!applicationData || !Array.isArray(applicationData) || applicationData.length === 0) {
    return defaultData.jobApplications;
  }

  // Map the data to the chart format
  const labels = applicationData.map(item => item.period || "");
  const data = applicationData.map(item => item.count || 0);

  return {
    labels,
    datasets: { label: "Job Applications", data },
  };
};

/**
 * Formats active students data for the line chart
 * @param {Array} activeStudentsData - Array of active students data by month/day
 * @returns {Object} Formatted data for the line chart
 */
export const formatActiveStudentsData = (activeStudentsData) => {
  if (!activeStudentsData || !Array.isArray(activeStudentsData) || activeStudentsData.length === 0) {
    return defaultData.activeStudents;
  }

  // Map the data to the chart format
  const labels = activeStudentsData.map(item => item.period || "");
  const data = activeStudentsData.map(item => item.count || 0);

  return {
    labels,
    datasets: { label: "Active Students", data },
  };
};

export default defaultData;
