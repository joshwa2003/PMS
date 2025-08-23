import api from './api';

class DepartmentWiseStudentService {
  // Get department-wise student data for dashboard
  async getDepartmentWiseStudents() {
    try {
      const response = await api.get('/dashboard/department-wise-students');
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch department-wise student data');
    } catch (error) {
      throw error;
    }
  }

  // Get students for a specific department
  async getDepartmentStudents(departmentId, params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/dashboard/department/${departmentId}/students?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch department students');
    } catch (error) {
      throw error;
    }
  }

  // Get dashboard summary statistics
  async getDashboardSummary() {
    try {
      const response = await api.get('/dashboard/summary');
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch dashboard summary');
    } catch (error) {
      throw error;
    }
  }

  // Utility methods for data formatting and display

  // Get placement status color for badges
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

  // Get placement status display text
  getPlacementStatusText(status) {
    const statusMap = {
      'Placed': 'Placed',
      'Unplaced': 'Unplaced',
      'Multiple Offers': 'Multiple Offers'
    };
    return statusMap[status] || status;
  }

  // Calculate placement percentage
  calculatePlacementPercentage(statistics) {
    if (!statistics || statistics.total === 0) return 0;
    
    const placedCount = statistics.placed + statistics.multipleOffers;
    return Math.round((placedCount / statistics.total) * 100);
  }

  // Format department statistics for display
  formatDepartmentStatistics(statistics) {
    if (!statistics) return null;

    const placementRate = this.calculatePlacementPercentage(statistics);
    
    return {
      total: statistics.total || 0,
      placed: statistics.placed || 0,
      unplaced: statistics.unplaced || 0,
      multipleOffers: statistics.multipleOffers || 0,
      placementRate,
      placementRateText: `${placementRate}%`
    };
  }

  // Format student data for table display
  formatStudentForTable(student) {
    return {
      id: student.id,
      studentId: student.studentId,
      registrationNumber: student.registrationNumber,
      name: student.name,
      email: student.email,
      placementStatus: student.placementStatus,
      placementStatusColor: this.getPlacementStatusColor(student.placementStatus),
      placementStatusText: this.getPlacementStatusText(student.placementStatus),
      isActive: student.isActive,
      createdAt: student.createdAt,
      formattedCreatedAt: this.formatDate(student.createdAt)
    };
  }

  // Format date for display
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Format date and time for display
  formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Search and filter students
  filterStudents(students, filters) {
    if (!students || !Array.isArray(students)) return [];

    return students.filter(student => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = `${student.name} ${student.email} ${student.studentId} ${student.registrationNumber}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }

      // Status filter
      if (filters.status && filters.status !== 'all') {
        if (student.placementStatus !== filters.status) return false;
      }

      // Active status filter
      if (filters.activeStatus && filters.activeStatus !== 'all') {
        if (filters.activeStatus === 'active' && !student.isActive) return false;
        if (filters.activeStatus === 'inactive' && student.isActive) return false;
      }

      return true;
    });
  }

  // Sort students
  sortStudents(students, sortBy, sortOrder = 'asc') {
    if (!students || !Array.isArray(students)) return [];

    return [...students].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'studentId':
          aValue = a.studentId;
          bValue = b.studentId;
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'placementStatus':
          aValue = a.placementStatus;
          bValue = b.placementStatus;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Export students data to CSV format
  exportStudentsToCSV(students, departmentName) {
    if (!students || !Array.isArray(students)) return '';

    const headers = ['Student ID', 'Registration Number', 'Name', 'Email', 'Placement Status', 'Active Status', 'Created Date'];
    const csvContent = [
      headers.join(','),
      ...students.map(student => [
        student.studentId,
        student.registrationNumber,
        `"${student.name}"`,
        student.email,
        student.placementStatus,
        student.isActive ? 'Active' : 'Inactive',
        this.formatDate(student.createdAt)
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  // Download CSV file
  downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Export students to CSV (convenience method)
  exportToCSV(students, filename) {
    const csvContent = this.exportStudentsToCSV(students, filename);
    const csvFilename = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    this.downloadCSV(csvContent, csvFilename);
  }

  // Get department color for cards (for visual variety)
  getDepartmentColor(index) {
    const colors = [
      'primary',
      'secondary', 
      'info',
      'success',
      'warning',
      'error',
      'dark'
    ];
    return colors[index % colors.length];
  }

  // Validate search input
  validateSearchInput(searchTerm) {
    if (!searchTerm) return true;
    
    // Allow alphanumeric, spaces, dots, and common symbols
    const validPattern = /^[a-zA-Z0-9\s@._-]*$/;
    return validPattern.test(searchTerm);
  }

  // Get summary statistics text
  getSummaryText(overallStats) {
    if (!overallStats) return '';

    const { students } = overallStats;
    const placementRate = students.total > 0 ? 
      Math.round(((students.placed + students.multipleOffers) / students.total) * 100) : 0;

    return `${students.total} total students across ${overallStats.departments.total} departments with ${placementRate}% placement rate`;
  }

  // Check if user has permission to view dashboard
  hasPermission(userRole) {
    return ['admin', 'placement_director'].includes(userRole);
  }

  // Format large numbers for display
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Get status icon for placement status
  getPlacementStatusIcon(status) {
    switch (status) {
      case 'Placed':
        return 'check_circle';
      case 'Multiple Offers':
        return 'star';
      case 'Unplaced':
      default:
        return 'schedule';
    }
  }
}

// Create and export singleton instance
const departmentWiseStudentService = new DepartmentWiseStudentService();
export default departmentWiseStudentService;
