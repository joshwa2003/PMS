import api from './api';

// Service for viewing a student's profile by ID (staff access)
const studentViewService = {
  // Fetch a single student by ID for placement access roles
  async getStudentById(studentId) {
    try {
      const response = await api.get(`/students/${studentId}`);
      // Support different response shapes
      if (response?.success && response?.student) return response.student;
      if (response?.data?.success && response?.data?.student) return response.data.student;
      // Some APIs may just return the student object
      if (response?.student) return response.student;
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default studentViewService;