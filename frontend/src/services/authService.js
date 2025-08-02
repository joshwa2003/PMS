import api from './api';

class AuthService {
  // Login user
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.success && response.token) {
        // Store token and user data
        localStorage.setItem('pms_token', response.token);
        localStorage.setItem('pms_user', JSON.stringify(response.user));
        return response;
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      throw error;
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.success && response.token) {
        // Store token and user data
        localStorage.setItem('pms_token', response.token);
        localStorage.setItem('pms_user', JSON.stringify(response.user));
        return response;
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('pms_token');
      localStorage.removeItem('pms_user');
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      
      if (response.success) {
        // Update stored user data
        localStorage.setItem('pms_user', JSON.stringify(response.user));
        return response.user;
      }
      
      throw new Error(response.message || 'Failed to get user profile');
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      if (response.success) {
        // Update stored user data
        localStorage.setItem('pms_user', JSON.stringify(response.user));
        return response;
      }
      
      throw new Error(response.message || 'Profile update failed');
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword, confirmPassword) {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Password change failed');
    } catch (error) {
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('pms_token');
    const user = localStorage.getItem('pms_user');
    return !!(token && user);
  }

  // Get stored user data
  getCurrentUserData() {
    try {
      const userData = localStorage.getItem('pms_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('pms_token');
  }

  // Check if user has specific role
  hasRole(role) {
    const user = this.getCurrentUserData();
    return user?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    const user = this.getCurrentUserData();
    return roles.includes(user?.role);
  }

  // Check if user has specific permission
  hasPermission(permission) {
    const user = this.getCurrentUserData();
    return user?.permissions?.includes(permission);
  }

  // Get user's role-based permissions
  getUserPermissions() {
    const user = this.getCurrentUserData();
    return user?.permissions || [];
  }

  // Role-based access control helpers
  isAdmin() {
    return this.hasRole('admin');
  }

  isPlacementDirector() {
    return this.hasRole('placement_director');
  }

  isPlacementStaff() {
    return this.hasRole('placement_staff');
  }

  isDepartmentHOD() {
    return this.hasRole('department_hod');
  }

  isOtherStaff() {
    return this.hasRole('other_staff');
  }

  isStudent() {
    return this.hasRole('student');
  }

  isAlumni() {
    return this.hasRole('alumni');
  }

  // Check if user is staff member (any staff role)
  isStaff() {
    return this.hasAnyRole(['admin', 'placement_director', 'placement_staff', 'department_hod', 'other_staff']);
  }

  // Check if user can manage users
  canManageUsers() {
    return this.hasPermission('manage_users') || this.isAdmin();
  }

  // Check if user can manage jobs
  canManageJobs() {
    return this.hasPermission('manage_jobs') || this.hasAnyRole(['admin', 'placement_director', 'placement_staff']);
  }

  // Check if user can view reports
  canViewReports() {
    return this.hasPermission('view_reports') || this.hasAnyRole(['admin', 'placement_director', 'department_hod']);
  }

  // Get user's department
  getUserDepartment() {
    const user = this.getCurrentUserData();
    return user?.department;
  }

  // Check if user belongs to specific department
  belongsToDepartment(department) {
    return this.getUserDepartment() === department;
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
