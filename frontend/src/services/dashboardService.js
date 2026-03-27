import api from './api';

class DashboardService {
  // Get dashboard summary statistics
  async getDashboardSummary() {
    try {
      const response = await api.get('/dashboard/summary');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get recent job postings with application counts
  async getRecentJobPostings(limit = 5) {
    try {
      const response = await api.get(`/jobs?limit=${limit}&sortBy=createdAt&sortOrder=desc`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get job application statistics
  async getJobApplicationStats() {
    try {
      const response = await api.get('/jobs/applications/stats');
      return response;
    } catch (error) {
      console.error("Error fetching job application stats:", error);
      return { success: false, data: null, error: error.message };
    }
  }

  // Get daily active students
  async getDailyActiveStudents() {
    try {
      const response = await api.get('/dashboard/daily-active-students');
      return response;
    } catch (error) {
      console.error("Error fetching student activity:", error);
      return { success: false, data: null, error: error.message };
    }
  }
  
  // Get job posting statistics
  async getJobPostingStats() {
    try {
      const response = await api.get('/jobs/postings/stats');
      return response;
    } catch (error) {
      console.error("Error fetching job posting stats:", error);
      return { success: false, data: null, error: error.message };
    }
  }
}

const dashboardService = new DashboardService();
export default dashboardService;