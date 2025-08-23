import api, { bulkApi } from './api';

class StudentManagementService {
  // Create new student (Placement Staff only)
  async createStudent(studentData) {
    try {
      const response = await api.post('/student-management/students', studentData);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to create student');
    } catch (error) {
      throw error;
    }
  }

  // Create multiple students at once (Placement Staff only)
  async createBulkStudents(uploadDataWithBatch) {
    try {
      console.log('🔍 Service: Creating bulk students');
      console.log('🔍 Service: Input data:', uploadDataWithBatch);
      
      // Handle both old format (array) and new format (object with studentData and batchInfo)
      let requestBody;
      if (Array.isArray(uploadDataWithBatch)) {
        // Old format - just student data array
        requestBody = { studentData: uploadDataWithBatch };
        console.log('🔍 Service: Using legacy format (array only)');
      } else if (uploadDataWithBatch.studentData && Array.isArray(uploadDataWithBatch.studentData)) {
        // New format - object with studentData and batchInfo
        requestBody = uploadDataWithBatch;
        console.log('🔍 Service: Using new format with batch info');
        console.log('🔍 Service: Batch info:', uploadDataWithBatch.batchInfo);
      } else {
        throw new Error('Invalid data format. Expected array or object with studentData property.');
      }

      console.log('🔍 Service: Request body:', requestBody);
      console.log('🚀 Service: Using bulkApi with extended timeout for bulk operations');
      
      // Use bulkApi instead of regular api for extended timeout (5 minutes vs 30 seconds)
      const response = await bulkApi.post('/student-management/students/bulk', requestBody);
      console.log('✅ Service: Response received:', response);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to create bulk students');
    } catch (error) {
      console.error('❌ Service: Error in createBulkStudents:', error);
      
      // Provide more specific error messages for common issues
      if (error.message && error.message.includes('timeout')) {
        throw new Error('The bulk upload is taking longer than expected. This might be due to email sending. Please check if students were created and try again if needed.');
      }
      
      throw error;
    }
  }

  // Get all students created by placement staff
  async getAllStudents(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/student-management/students?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch students');
    } catch (error) {
      throw error;
    }
  }

  // Get student statistics for placement staff
  async getStudentStats() {
    try {
      const response = await api.get('/student-management/stats');
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch student statistics');
    } catch (error) {
      throw error;
    }
  }

  // Update student status (verify/unverify, activate/deactivate)
  async updateStudentStatus(studentId, statusData) {
    try {
      const response = await api.put(`/student-management/students/${studentId}/status`, statusData);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to update student status');
    } catch (error) {
      throw error;
    }
  }

  // Delete student
  async deleteStudent(studentId) {
    try {
      const response = await api.delete(`/student-management/students/${studentId}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to delete student');
    } catch (error) {
      throw error;
    }
  }

  // Delete multiple students
  async deleteBulkStudents(studentIds) {
    try {
      console.log('🔍 Service: Deleting bulk students:', studentIds);
      
      const response = await api.delete('/student-management/students/bulk', {
        data: { studentIds }
      });
      
      console.log('✅ Service: Bulk delete response:', response);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to delete students');
    } catch (error) {
      console.error('❌ Service: Error in deleteBulkStudents:', error);
      throw error;
    }
  }

  // Get all batches for placement staff
  async getAllBatches() {
    try {
      const response = await api.get('/student-management/batches');
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch batches');
    } catch (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }
  }

  // Get students for a specific batch
  async getStudentsForBatch(batchId, params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/student-management/batches/${batchId}/students?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch students for batch');
    } catch (error) {
      console.error('Error fetching students for batch:', error);
      throw error;
    }
  }

  // Utility methods for student data processing
  formatStudentData(student) {
    return {
      id: student.id,
      name: student.fullName,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      studentId: student.studentId,
      role: student.role,
      isActive: student.isActive,
      isVerified: student.isVerified,
      lastLogin: student.lastLogin,
      createdAt: student.createdAt,
      profile: student.profile
    };
  }

  // Get placement status display name
  getPlacementStatusDisplayName(status) {
    const statusNames = {
      'Unplaced': 'Unplaced',
      'Placed': 'Placed',
      'Multiple Offers': 'Multiple Offers'
    };
    return statusNames[status] || status;
  }

  // Get placement status badge color
  getPlacementStatusColor(status) {
    switch (status) {
      case 'Placed':
        return 'success';
      case 'Multiple Offers':
        return 'info';
      case 'Unplaced':
      default:
        return 'warning';
    }
  }

  // Get student status badge color
  getStudentStatusColor(student) {
    if (!student.isActive) return 'error';
    if (!student.isVerified) return 'warning';
    return 'success';
  }

  // Get student status text
  getStudentStatusText(student) {
    if (!student.isActive) return 'Inactive';
    if (!student.isVerified) return 'Unverified';
    return 'Active';
  }

  // Format last login date
  formatLastLogin(lastLogin) {
    if (!lastLogin) return 'Never';
    
    const date = new Date(lastLogin);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays <= 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  }

  // Validate student data
  validateStudentData(studentData, isUpdate = false) {
    const errors = [];

    if (!isUpdate || studentData.firstName) {
      if (!studentData.firstName || studentData.firstName.trim().length < 2) {
        errors.push('First name must be at least 2 characters long');
      }
    }

    if (!isUpdate || studentData.lastName) {
      if (!studentData.lastName || studentData.lastName.trim().length < 2) {
        errors.push('Last name must be at least 2 characters long');
      }
    }

    if (!isUpdate || studentData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!studentData.email || !emailRegex.test(studentData.email)) {
        errors.push('Please provide a valid email address');
      }
    }

    return errors;
  }

  // Generate student ID suggestion (for display purposes)
  generateStudentIdSuggestion() {
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 999) + 1;
    return `${currentYear}STU${randomNum.toString().padStart(3, '0')}`;
  }

  // Get department display name
  getDepartmentDisplayName(department) {
    const departmentNames = {
      CSE: 'Computer Science & Engineering',
      ECE: 'Electronics & Communication Engineering',
      EEE: 'Electrical & Electronics Engineering',
      MECH: 'Mechanical Engineering',
      CIVIL: 'Civil Engineering',
      IT: 'Information Technology',
      ADMIN: 'Administration',
      HR: 'Human Resources',
      OTHER: 'Other',
      'Not Specified': 'Not Specified'
    };
    return departmentNames[department] || department;
  }

  // Get program display name
  getProgramDisplayName(program) {
    const programNames = {
      'B.E': 'Bachelor of Engineering',
      'B.Tech': 'Bachelor of Technology',
      'M.E': 'Master of Engineering',
      'M.Tech': 'Master of Technology',
      'MBA': 'Master of Business Administration',
      'MCA': 'Master of Computer Applications',
      'Not Specified': 'Not Specified'
    };
    return programNames[program] || program;
  }

  // Calculate profile completion percentage
  calculateProfileCompletion(student) {
    if (!student.profile) return 0;
    
    let completedFields = 0;
    let totalFields = 10; // Total important fields to check

    // Check basic info
    if (student.firstName && student.lastName) completedFields++;
    if (student.email) completedFields++;
    if (student.studentId) completedFields++;

    // Check profile fields
    const profile = student.profile;
    if (profile.department && profile.department !== 'Not Specified') completedFields++;
    if (profile.program && profile.program !== 'Not Specified') completedFields++;
    if (profile.placementStatus) completedFields++;

    // Additional fields (can be expanded based on student model)
    completedFields += 4; // Assume other fields are partially filled

    return Math.round((completedFields / totalFields) * 100);
  }

  // Format creation date
  formatCreationDate(createdAt) {
    if (!createdAt) return 'Unknown';
    
    const date = new Date(createdAt);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Search and filter utilities
  filterStudents(students, filters) {
    return students.filter(student => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = `${student.firstName} ${student.lastName} ${student.email} ${student.studentId}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }

      // Status filter
      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'active' && !student.isActive) return false;
        if (filters.status === 'inactive' && student.isActive) return false;
        if (filters.status === 'verified' && !student.isVerified) return false;
        if (filters.status === 'unverified' && student.isVerified) return false;
      }

      // Placement status filter
      if (filters.placementStatus && filters.placementStatus !== 'all') {
        if (!student.profile || student.profile.placementStatus !== filters.placementStatus) return false;
      }

      // Department filter
      if (filters.department && filters.department !== 'all') {
        if (!student.profile || student.profile.department !== filters.department) return false;
      }

      return true;
    });
  }

  // Sort students
  sortStudents(students, sortBy, sortOrder = 'asc') {
    return [...students].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'studentId':
          aValue = a.studentId;
          bValue = b.studentId;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'lastLogin':
          aValue = a.lastLogin ? new Date(a.lastLogin) : new Date(0);
          bValue = b.lastLogin ? new Date(b.lastLogin) : new Date(0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Batch utility methods
  formatBatchDisplayName(batch) {
    if (!batch) return 'Unknown Batch';
    return `${batch.batchCode} ${batch.courseType}`;
  }

  getBatchStatusColor(batch) {
    if (!batch) return 'secondary';
    
    if (batch.isGraduated) return 'info';
    if (!batch.isActive) return 'secondary';
    
    // Based on academic status
    const status = batch.academicStatus;
    if (status && status.includes('1st Year')) return 'success';
    if (status && status.includes('2nd Year')) return 'warning';
    if (status && status.includes('3rd Year')) return 'error';
    if (status && status.includes('4th Year')) return 'dark';
    if (status && status.includes('Alumni')) return 'info';
    
    return 'primary';
  }

  getBatchStatusText(batch) {
    if (!batch) return 'Unknown';
    
    if (batch.isGraduated) return 'Alumni';
    if (!batch.isActive) return 'Inactive';
    
    return batch.academicStatus || 'Active';
  }

  formatBatchYear(batch) {
    if (!batch) return 'Unknown';
    return `${batch.startYear}-${batch.endYear}`;
  }

  calculateBatchPlacementRate(batch) {
    if (!batch || !batch.stats) return 0;
    
    const { totalStudents, placement } = batch.stats;
    if (totalStudents === 0) return 0;
    
    const placedCount = (placement.placed || 0) + (placement.multipleOffers || 0);
    return Math.round((placedCount / totalStudents) * 100);
  }
}

// Create and export singleton instance
const studentManagementService = new StudentManagementService();
export default studentManagementService;
