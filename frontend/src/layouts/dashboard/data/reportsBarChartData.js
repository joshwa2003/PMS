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

// Default data structure for the bar chart
const defaultData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: { label: "Job Postings", data: [0, 0, 0, 0, 0, 0, 0] },
};

/**
 * Formats job posting data for the bar chart
 * @param {Array} jobPostingData - Array of job posting data by day
 * @returns {Object} Formatted data for the bar chart
 */
export const formatJobPostingData = (jobPostingData) => {
  if (!jobPostingData || !Array.isArray(jobPostingData) || jobPostingData.length === 0) {
    return defaultData;
  }

  // Map the data to the chart format
  const labels = jobPostingData.map(item => item.day || "");
  const data = jobPostingData.map(item => item.count || 0);

  return {
    labels,
    datasets: { label: "Job Postings", data },
  };
};

export default defaultData;
