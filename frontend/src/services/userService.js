import api from './api';

class UserService {
  // Get all users (Admin, Placement Director only)
  async getAllUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/users?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch users');
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await api.get(`/users/${userId}`);
      
      if (response.success) {
        return response.user;
      }
      
      throw new Error(response.message || 'Failed to fetch user');
    } catch (error) {
      throw error;
    }
  }

  // Update own profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      
      if (response.success) {
        return response.user;
      }
      
      throw new Error(response.message || 'Failed to update profile');
    } catch (error) {
      throw error;
    }
  }

  // Update user (Admin)
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to update user');
    } catch (error) {
      throw error;
    }
  }

  // Delete user (Admin only)
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/users/${userId}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to delete user');
    } catch (error) {
      throw error;
    }
  }

  // Get users by role
  async getUsersByRole(role, params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/users/role/${role}?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch users by role');
    } catch (error) {
      throw error;
    }
  }

  // Get users by department
  async getUsersByDepartment(department, params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/users/department/${department}?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch users by department');
    } catch (error) {
      throw error;
    }
  }

  // Search users
  async searchUsers(searchData) {
    try {
      const response = await api.post('/users/search', searchData);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to search users');
    } catch (error) {
      throw error;
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const response = await api.get('/users/stats');
      
      if (response.success) {
        return response.stats;
      }
      
      throw new Error(response.message || 'Failed to fetch user statistics');
    } catch (error) {
      throw error;
    }
  }

  // Role-specific user fetching methods
  async getStudents(params = {}) {
    return this.getUsersByRole('student', params);
  }

  async getAlumni(params = {}) {
    return this.getUsersByRole('alumni', params);
  }

  async getPlacementStaff(params = {}) {
    return this.getUsersByRole('placement_staff', params);
  }

  async getDepartmentHODs(params = {}) {
    return this.getUsersByRole('department_hod', params);
  }

  async getCompanyHRs(params = {}) {
    return this.getUsersByRole('company_hr', params);
  }

  async getAdmins(params = {}) {
    return this.getUsersByRole('admin', params);
  }

  async getPlacementDirectors(params = {}) {
    return this.getUsersByRole('placement_director', params);
  }

  async getOtherStaff(params = {}) {
    return this.getUsersByRole('other_staff', params);
  }

  // Department-specific user fetching methods
  async getCSEUsers(params = {}) {
    return this.getUsersByDepartment('CSE', params);
  }

  async getECEUsers(params = {}) {
    return this.getUsersByDepartment('ECE', params);
  }

  async getEEEUsers(params = {}) {
    return this.getUsersByDepartment('EEE', params);
  }

  async getMECHUsers(params = {}) {
    return this.getUsersByDepartment('MECH', params);
  }

  async getCIVILUsers(params = {}) {
    return this.getUsersByDepartment('CIVIL', params);
  }

  async getITUsers(params = {}) {
    return this.getUsersByDepartment('IT', params);
  }

  // Utility methods for user data processing
  formatUserData(user) {
    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
      isActive: user.isActive,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      // Role-specific data
      ...(user.role === 'student' && {
        studentId: user.studentId,
        batch: user.batch,
        cgpa: user.cgpa
      }),
      ...(user.role === 'alumni' && {
        graduationYear: user.graduationYear,
        currentCompany: user.currentCompany,
        currentPosition: user.currentPosition
      }),
      ...(user.role === 'company_hr' && {
        companyName: user.companyName,
        companyWebsite: user.companyWebsite,
        hrPosition: user.hrPosition
      }),
      ...(['placement_staff', 'department_hod', 'other_staff', 'admin'].includes(user.role) && {
        employeeId: user.employeeId,
        designation: user.designation
      })
    };
  }

  // Get role display name
  getRoleDisplayName(role) {
    const roleNames = {
      admin: 'Administrator',
      placement_director: 'Placement Director',
      placement_staff: 'Placement Staff',
      department_hod: 'Department HOD',
      other_staff: 'Other Staff',
      student: 'Student',
      alumni: 'Alumni',
      company_hr: 'Company HR'
    };
    return roleNames[role] || role;
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
      OTHER: 'Other'
    };
    return departmentNames[department] || department;
  }

  // Get user status badge color
  getUserStatusColor(user) {
    if (!user.isActive) return 'error';
    if (!user.isVerified) return 'warning';
    return 'success';
  }

  // Get user status text
  getUserStatusText(user) {
    if (!user.isActive) return 'Inactive';
    if (!user.isVerified) return 'Unverified';
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

  // Validate user data
  validateUserData(userData, isUpdate = false) {
    const errors = [];

    if (!isUpdate || userData.firstName) {
      if (!userData.firstName || userData.firstName.trim().length < 2) {
        errors.push('First name must be at least 2 characters long');
      }
    }

    if (!isUpdate || userData.lastName) {
      if (!userData.lastName || userData.lastName.trim().length < 2) {
        errors.push('Last name must be at least 2 characters long');
      }
    }

    if (!isUpdate || userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!userData.email || !emailRegex.test(userData.email)) {
        errors.push('Please provide a valid email address');
      }
    }

    if (!isUpdate || userData.phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (userData.phone && !phoneRegex.test(userData.phone)) {
        errors.push('Phone number must be exactly 10 digits');
      }
    }

    if (!isUpdate && !userData.role) {
      errors.push('Role is required');
    }

    return errors;
  }
}

// Create and export singleton instance
const userService = new UserService();
export default userService;
