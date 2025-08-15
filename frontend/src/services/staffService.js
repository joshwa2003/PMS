import api from './api';

class StaffService {
  // Create new staff member (Admin and Placement Director only)
  async createStaff(staffData) {
    try {
      const response = await api.post('/users/staff', staffData);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to create staff member');
    } catch (error) {
      throw error;
    }
  }

  // Create multiple staff members at once (Admin and Placement Director only)
  async createBulkStaff(staffDataArray) {
    try {
      const response = await api.post('/users/staff/bulk', { staffData: staffDataArray });
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to create bulk staff members');
    } catch (error) {
      throw error;
    }
  }

  // Get all staff members (Admin and Placement Director only)
  async getAllStaff(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/users/staff?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch staff members');
    } catch (error) {
      throw error;
    }
  }

  // Update staff member (Admin and Placement Director only)
  async updateStaff(staffId, staffData) {
    try {
      const response = await api.put(`/users/staff/${staffId}`, staffData);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to update staff member');
    } catch (error) {
      throw error;
    }
  }

  // Update staff status only (Admin and Placement Director only)
  async updateStaffStatus(staffId, isActive) {
    try {
      const response = await api.patch(`/users/staff/${staffId}/status`, { isActive });
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to update staff status');
    } catch (error) {
      throw error;
    }
  }

  // Delete staff member (Admin only)
  async deleteStaff(staffId) {
    try {
      const response = await api.delete(`/users/staff/${staffId}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to delete staff member');
    } catch (error) {
      throw error;
    }
  }

  // Delete multiple staff members (Admin only)
  async deleteBulkStaff(staffIds) {
    try {
      const response = await api.delete('/users/staff/bulk', {
        data: { staffIds }
      });
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to delete staff members');
    } catch (error) {
      throw error;
    }
  }

  // Get staff by role
  async getStaffByRole(role, params = {}) {
    try {
      const queryParams = new URLSearchParams({ ...params, role }).toString();
      const response = await api.get(`/users/staff?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch staff by role');
    } catch (error) {
      throw error;
    }
  }

  // Get staff by department
  async getStaffByDepartment(department, params = {}) {
    try {
      const queryParams = new URLSearchParams({ ...params, department }).toString();
      const response = await api.get(`/users/staff?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch staff by department');
    } catch (error) {
      throw error;
    }
  }

  // Role-specific staff fetching methods
  async getPlacementStaff(params = {}) {
    return this.getStaffByRole('placement_staff', params);
  }

  async getDepartmentHODs(params = {}) {
    return this.getStaffByRole('department_hod', params);
  }

  async getOtherStaff(params = {}) {
    return this.getStaffByRole('other_staff', params);
  }

  // Department-specific staff fetching methods
  async getCSEStaff(params = {}) {
    return this.getStaffByDepartment('CSE', params);
  }

  async getECEStaff(params = {}) {
    return this.getStaffByDepartment('ECE', params);
  }

  async getEEEStaff(params = {}) {
    return this.getStaffByDepartment('EEE', params);
  }

  async getMECHStaff(params = {}) {
    return this.getStaffByDepartment('MECH', params);
  }

  async getCIVILStaff(params = {}) {
    return this.getStaffByDepartment('CIVIL', params);
  }

  async getITStaff(params = {}) {
    return this.getStaffByDepartment('IT', params);
  }

  async getAdminStaff(params = {}) {
    return this.getStaffByDepartment('ADMIN', params);
  }

  // Utility methods for staff data processing
  formatStaffData(staff) {
    return {
      id: staff.id,
      name: staff.fullName,
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      role: staff.role,
      department: staff.department,
      designation: staff.designation,
      employeeId: staff.employeeId,
      phone: staff.phone,
      isActive: staff.isActive,
      isVerified: staff.isVerified,
      lastLogin: staff.lastLogin,
      createdAt: staff.createdAt,
      adminNotes: staff.adminNotes
    };
  }

  // Get role display name
  getRoleDisplayName(role) {
    const roleNames = {
      placement_staff: 'Placement Staff',
      department_hod: 'Department HOD',
      other_staff: 'Other Staff'
    };
    return roleNames[role] || role;
  }

  // Get department display name (dynamic version)
  async getDepartmentDisplayName(department) {
    try {
      const departments = await this.getAvailableDepartments();
      const foundDept = departments.find(dept => 
        dept.value === department || 
        dept.code === department ||
        dept.value === department?.toUpperCase() ||
        dept.value === department?.toLowerCase()
      );
      if (foundDept) {
        return foundDept.label || foundDept.name;
      }
    } catch (error) {
      console.error('Error fetching departments for display name:', error);
    }
    
    // Fallback to hardcoded mapping
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

  // Synchronous version for backward compatibility
  getDepartmentDisplayNameSync(department) {
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

  // Get staff status badge color
  getStaffStatusColor(staff) {
    if (!staff.isActive) return 'error';
    if (!staff.isVerified) return 'warning';
    return 'success';
  }

  // Get staff status text
  getStaffStatusText(staff) {
    if (!staff.isActive) return 'Inactive';
    if (!staff.isVerified) return 'Unverified';
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

  // Validate staff data with dynamic department validation
  async validateStaffData(staffData, isUpdate = false) {
    const errors = [];

    if (!isUpdate || staffData.firstName) {
      if (!staffData.firstName || staffData.firstName.trim().length < 2) {
        errors.push('First name must be at least 2 characters long');
      }
    }

    if (!isUpdate || staffData.lastName) {
      if (!staffData.lastName || staffData.lastName.trim().length < 2) {
        errors.push('Last name must be at least 2 characters long');
      }
    }

    if (!isUpdate || staffData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!staffData.email || !emailRegex.test(staffData.email)) {
        errors.push('Please provide a valid email address');
      }
    }

    if (!isUpdate && !staffData.role) {
      errors.push('Role is required');
    }

    // Dynamic department validation
    if (!isUpdate && !staffData.department) {
      errors.push('Department is required');
    } else if (staffData.department) {
      try {
        const availableDepartments = await this.getAvailableDepartments();
        const validDepartmentCodes = availableDepartments.map(dept => dept.code);
        if (!validDepartmentCodes.includes(staffData.department)) {
          errors.push(`Invalid department code. Valid codes are: ${validDepartmentCodes.join(', ')}`);
        }
      } catch (error) {
        console.error('Error validating department:', error);
        errors.push('Unable to validate department. Please try again.');
      }
    }

    if (!isUpdate && !staffData.designation) {
      errors.push('Designation is required');
    }

    if (staffData.phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(staffData.phone)) {
        errors.push('Phone number must be exactly 10 digits');
      }
    }

    if (staffData.employeeId && staffData.employeeId.length < 3) {
      errors.push('Employee ID must be at least 3 characters long');
    }

    return errors;
  }

  // Synchronous validation (fallback)
  validateStaffDataSync(staffData, isUpdate = false) {
    const errors = [];

    if (!isUpdate || staffData.firstName) {
      if (!staffData.firstName || staffData.firstName.trim().length < 2) {
        errors.push('First name must be at least 2 characters long');
      }
    }

    if (!isUpdate || staffData.lastName) {
      if (!staffData.lastName || staffData.lastName.trim().length < 2) {
        errors.push('Last name must be at least 2 characters long');
      }
    }

    if (!isUpdate || staffData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!staffData.email || !emailRegex.test(staffData.email)) {
        errors.push('Please provide a valid email address');
      }
    }

    if (!isUpdate && !staffData.role) {
      errors.push('Role is required');
    }

    if (!isUpdate && !staffData.department) {
      errors.push('Department is required');
    }

    if (!isUpdate && !staffData.designation) {
      errors.push('Designation is required');
    }

    if (staffData.phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(staffData.phone)) {
        errors.push('Phone number must be exactly 10 digits');
      }
    }

    if (staffData.employeeId && staffData.employeeId.length < 3) {
      errors.push('Employee ID must be at least 3 characters long');
    }

    return errors;
  }

  // Generate employee ID suggestion
  generateEmployeeIdSuggestion(department, role) {
    const deptCode = (department || 'UNK').substring(0, 3).toUpperCase();
    const roleCode = role === 'placement_staff' ? 'PS' : 
                    role === 'department_hod' ? 'HOD' : 'OS';
    const randomNum = Math.floor(Math.random() * 999) + 1;
    return `${deptCode}${roleCode}${randomNum.toString().padStart(3, '0')}`;
  }

  // Role assignment methods
  async assignRole(staffId, role, assignedBy) {
    try {
      const response = await api.post(`/users/staff/${staffId}/assign-role`, {
        role,
        assignedBy
      });
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to assign role');
    } catch (error) {
      throw error;
    }
  }

  // Bulk role assignment
  async assignBulkRoles(assignments) {
    try {
      const results = [];
      
      for (const assignment of assignments) {
        try {
          const result = await this.assignRole(
            assignment.staffId, 
            assignment.role, 
            assignment.assignedBy
          );
          results.push({
            staffId: assignment.staffId,
            success: true,
            result
          });
        } catch (error) {
          results.push({
            staffId: assignment.staffId,
            success: false,
            error: error.message
          });
        }
      }
      
      return {
        success: true,
        results,
        totalProcessed: assignments.length,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length
      };
    } catch (error) {
      throw error;
    }
  }

  // Generate Excel template with dynamic departments
  async generateExcelTemplate() {
    try {
      const departments = await this.getAvailableDepartments();
      const departmentCodes = departments.map(dept => dept.code).join(', ');
      
      // Create template data
      const templateData = {
        headers: [
          'First Name*',
          'Last Name*', 
          'Department*',
          'Email*',
          'Phone',
          'Employee ID',
          'Designation',
          'Admin Notes'
        ],
        sampleData: [
          [
            'John',
            'Doe',
            departments[0]?.code || 'CSE',
            'john.doe@example.com',
            '9876543210',
            'CSE001',
            'Assistant Professor',
            'Sample staff member'
          ]
        ],
        validationNotes: [
          '* Required fields',
          `Valid Department Codes: ${departmentCodes}`,
          'Phone: 10-digit number',
          'Employee ID: Minimum 3 characters',
          'Role will be assigned later through the system'
        ]
      };
      
      return templateData;
    } catch (error) {
      console.error('Error generating Excel template:', error);
      throw error;
    }
  }

  // Get available roles for staff creation
  getAvailableRoles() {
    return [
      { value: 'placement_staff', label: 'Placement Staff' },
      { value: 'department_hod', label: 'Department HOD' },
      { value: 'other_staff', label: 'Other Staff' }
    ];
  }

  // Get available departments (dynamic)
  async getAvailableDepartments() {
    try {
      const response = await api.get('/departments');
      if (response.success && response.departments) {
        return response.departments.map(dept => ({
          value: dept.code,
          label: `${dept.name} (${dept.code})`,
          id: dept._id,
          name: dept.name,
          code: dept.code
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  }

  // Get available departments synchronously (fallback)
  getAvailableDepartmentsSync() {
    return [
      { value: 'CSE', label: 'Computer Science & Engineering' },
      { value: 'ECE', label: 'Electronics & Communication Engineering' },
      { value: 'EEE', label: 'Electrical & Electronics Engineering' },
      { value: 'MECH', label: 'Mechanical Engineering' },
      { value: 'CIVIL', label: 'Civil Engineering' },
      { value: 'IT', label: 'Information Technology' },
      { value: 'ADMIN', label: 'Administration' },
      { value: 'HR', label: 'Human Resources' },
      { value: 'OTHER', label: 'Other' }
    ];
  }

  // Get common designations by role
  getCommonDesignations(role) {
    const designations = {
      placement_staff: [
        'Placement Coordinator',
        'Training & Placement Officer',
        'Assistant Placement Officer',
        'Placement Executive',
        'Career Counselor'
      ],
      department_hod: [
        'Head of Department',
        'Professor & HOD',
        'Associate Professor & HOD',
        'Assistant Professor & HOD'
      ],
      other_staff: [
        'Administrative Officer',
        'Office Assistant',
        'Data Entry Operator',
        'Clerk',
        'Assistant'
      ]
    };
    
    return designations[role] || [];
  }
}

// Create and export singleton instance
const staffService = new StaffService();
export default staffService;
