import api from '../services/api';

class StudentApi {
  // Get current student's profile
  async getProfile() {
    try {
      const response = await api.get('/students/profile');
      
      if (response.success) {
        return response.student;
      }
      
      throw new Error(response.message || 'Failed to fetch student profile');
    } catch (error) {
      throw error;
    }
  }

  // Update student profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/students/profile', profileData);
      
      if (response.success) {
        return response.student;
      }
      
      throw new Error(response.message || 'Failed to update student profile');
    } catch (error) {
      throw error;
    }
  }

  // Upload profile image
  async uploadProfileImage(file) {
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await api.post('/students/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to upload profile image');
    } catch (error) {
      throw error;
    }
  }

  // Upload resume
  async uploadResume(file) {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await api.post('/students/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to upload resume');
    } catch (error) {
      throw error;
    }
  }

  // Get all students (Admin/Placement staff only)
  async getAllStudents(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/students?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch students');
    } catch (error) {
      throw error;
    }
  }

  // Get student by ID (Admin/Placement staff only)
  async getStudentById(studentId) {
    try {
      const response = await api.get(`/students/${studentId}`);
      
      if (response.success) {
        return response.student;
      }
      
      throw new Error(response.message || 'Failed to fetch student');
    } catch (error) {
      throw error;
    }
  }

  // Update placement status (Placement staff only)
  async updatePlacementStatus(studentId, placementData) {
    try {
      const response = await api.put(`/students/${studentId}/placement`, placementData);
      
      if (response.success) {
        return response.student;
      }
      
      throw new Error(response.message || 'Failed to update placement status');
    } catch (error) {
      throw error;
    }
  }

  // Get student statistics (Admin/Placement staff only)
  async getStudentStats() {
    try {
      const response = await api.get('/students/stats');
      
      if (response.success) {
        return response.stats;
      }
      
      throw new Error(response.message || 'Failed to fetch student statistics');
    } catch (error) {
      throw error;
    }
  }

  // Delete student (Admin only)
  async deleteStudent(studentId) {
    try {
      const response = await api.delete(`/students/${studentId}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to delete student');
    } catch (error) {
      throw error;
    }
  }

  // Utility methods for data processing
  formatStudentData(student) {
    return {
      id: student._id,
      studentId: student.studentId,
      registrationNumber: student.registrationNumber,
      fullName: student.personalInfo?.fullName,
      email: student.contact?.email,
      phone: student.contact?.phone,
      department: student.academic?.department,
      program: student.academic?.program,
      yearOfStudy: student.academic?.yearOfStudy,
      cgpa: student.academic?.cgpa,
      placementStatus: student.placement?.placementStatus,
      profileCompletionPercentage: student.profileCompletionPercentage,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt
    };
  }

  // Get department display name
  getDepartmentDisplayName(department) {
    const departmentNames = {
      CSE: 'Computer Science & Engineering',
      ECE: 'Electronics & Communication Engineering',
      EEE: 'Electrical & Electronics Engineering',
      MECH: 'Mechanical Engineering',
      CIVIL: 'Civil Engineering',
      IT: 'Information Technology'
    };
    return departmentNames[department] || department;
  }

  // Get placement status color
  getPlacementStatusColor(status) {
    const statusColors = {
      'Unplaced': 'warning',
      'Placed': 'success',
      'Multiple Offers': 'info'
    };
    return statusColors[status] || 'secondary';
  }

  // Get profile completion color
  getProfileCompletionColor(percentage) {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 40) return 'warning';
    return 'error';
  }

  // Validate student data
  validateStudentData(data) {
    const errors = [];

    // Only validate if we're creating a new profile (has required fields)
    const isNewProfile = data.studentId || data.registrationNumber || data.personalInfo?.fullName;
    
    if (isNewProfile) {
      // Basic validation for new profiles
      if (!data.studentId || (typeof data.studentId === 'string' && data.studentId.trim().length === 0)) {
        errors.push('Student ID is required');
      }

      if (!data.registrationNumber || (typeof data.registrationNumber === 'string' && data.registrationNumber.trim().length === 0)) {
        errors.push('Registration number is required');
      }

      if (!data.personalInfo?.fullName || (typeof data.personalInfo.fullName === 'string' && data.personalInfo.fullName.trim().length < 2)) {
        errors.push('Full name must be at least 2 characters long');
      }
    }

    // Optional field validations
    if (data.contact?.email && data.contact.email.trim() !== '') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact.email)) {
        errors.push('Please provide a valid email address');
      }
    }

    if (data.contact?.phone && data.contact.phone.trim() !== '') {
      const cleanPhone = data.contact.phone.replace(/\s/g, '');
      if (!/^[0-9]{10}$/.test(cleanPhone)) {
        errors.push('Phone number must be exactly 10 digits');
      }
    }

    if (data.contact?.pincode && data.contact.pincode.trim() !== '') {
      if (!/^[0-9]{6}$/.test(data.contact.pincode)) {
        errors.push('Pincode must be exactly 6 digits');
      }
    }

    if (data.academic?.cgpa !== null && data.academic?.cgpa !== undefined && data.academic?.cgpa !== '') {
      const cgpa = parseFloat(data.academic.cgpa);
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
        errors.push('CGPA must be between 0 and 10');
      }
    }

    if (data.academic?.backlogs !== null && data.academic?.backlogs !== undefined && data.academic?.backlogs !== '') {
      const backlogs = parseInt(data.academic.backlogs);
      if (isNaN(backlogs) || backlogs < 0) {
        errors.push('Backlogs must be a non-negative integer');
      }
    }

    if (data.academic?.yearOfStudy !== null && data.academic?.yearOfStudy !== undefined && data.academic?.yearOfStudy !== '') {
      const year = parseInt(data.academic.yearOfStudy);
      if (isNaN(year) || year < 1 || year > 5) {
        errors.push('Year of study must be between 1 and 5');
      }
    }

    if (data.academic?.currentSemester !== null && data.academic?.currentSemester !== undefined && data.academic?.currentSemester !== '') {
      const semester = parseInt(data.academic.currentSemester);
      if (isNaN(semester) || semester < 1 || semester > 10) {
        errors.push('Current semester must be between 1 and 10');
      }
    }

    return errors;
  }

  // Get required fields for profile completion
  getRequiredFields() {
    return [
      'studentId',
      'registrationNumber',
      'personalInfo.fullName',
      'personalInfo.dateOfBirth',
      'personalInfo.gender',
      'contact.phone',
      'contact.email',
      'contact.permanentAddress',
      'academic.department',
      'academic.program',
      'academic.specialization',
      'academic.cgpa',
      'academic.yearOfStudy',
      'academic.currentSemester'
    ];
  }

  // Calculate profile completion percentage
  calculateProfileCompletion(studentData) {
    const requiredFields = this.getRequiredFields();
    let completedFields = 0;

    requiredFields.forEach(field => {
      const fieldValue = this.getNestedValue(studentData, field);
      if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
        completedFields++;
      }
    });

    return Math.round((completedFields / requiredFields.length) * 100);
  }

  // Helper method to get nested object values
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  // Format date for display
  formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Format currency (CTC)
  formatCurrency(amount) {
    if (!amount) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}

// Create and export singleton instance
const studentApi = new StudentApi();
export default studentApi;
