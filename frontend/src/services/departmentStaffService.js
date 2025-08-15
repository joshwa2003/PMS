  import api from './api';

class DepartmentStaffService {
  // Get staff by department
  async getStaffByDepartment(departmentId, params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/users/staff/department/${departmentId}?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch staff by department');
    } catch (error) {
      throw error;
    }
  }

  // Assign role to staff member and trigger email
  async assignStaffRole(staffId, role) {
    try {
      const response = await api.post(`/users/staff/${staffId}/assign-role`, { role });
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to assign staff role');
    } catch (error) {
      throw error;
    }
  }

  // Get all departments with staff counts
  async getDepartmentsWithStaffCounts() {
    try {
      // First get all departments
      const departmentsResponse = await api.get('/departments');
      
      if (!departmentsResponse.success) {
        throw new Error('Failed to fetch departments');
      }

      // Get staff counts for each department
      const departmentsWithCounts = await Promise.all(
        departmentsResponse.departments.map(async (department) => {
          try {
            const staffResponse = await this.getStaffByDepartment(department.id, { limit: 1 });
            return {
              ...department,
              staffCount: staffResponse.pagination ? staffResponse.pagination.totalStaff : 0,
              activeStaffCount: staffResponse.staff ? staffResponse.staff.filter(s => s.isActive).length : 0
            };
          } catch (error) {
            console.error(`Error getting staff count for department ${department.name}:`, error);
            return {
              ...department,
              staffCount: 0,
              activeStaffCount: 0
            };
          }
        })
      );

      return {
        success: true,
        departments: departmentsWithCounts
      };
    } catch (error) {
      throw error;
    }
  }

  // Get staff statistics by department
  async getStaffStatsByDepartment(departmentId) {
    try {
      // Get all staff for the department
      const allStaffResponse = await this.getStaffByDepartment(departmentId, { limit: 1000 });
      
      if (!allStaffResponse.success) {
        throw new Error('Failed to fetch staff statistics');
      }

      const staff = allStaffResponse.staff || [];
      
      const stats = {
        total: staff.length,
        active: staff.filter(s => s.isActive).length,
        inactive: staff.filter(s => !s.isActive).length,
        verified: staff.filter(s => s.isVerified).length,
        unverified: staff.filter(s => !s.isVerified).length,
        emailSent: staff.filter(s => s.emailSent).length,
        emailPending: staff.filter(s => !s.emailSent).length,
        roleAssigned: staff.filter(s => s.roleAssignedAt).length,
        rolePending: staff.filter(s => !s.roleAssignedAt).length,
        byRole: {
          placement_staff: staff.filter(s => s.role === 'placement_staff').length,
          department_hod: staff.filter(s => s.role === 'department_hod').length,
          other_staff: staff.filter(s => s.role === 'other_staff').length
        }
      };

      return {
        success: true,
        stats,
        department: allStaffResponse.department
      };
    } catch (error) {
      throw error;
    }
  }

  // Bulk assign roles to multiple staff members
  async bulkAssignRoles(assignments) {
    try {
      const results = {
        successful: [],
        failed: [],
        totalProcessed: assignments.length,
        successCount: 0,
        failureCount: 0
      };

      for (const assignment of assignments) {
        try {
          const result = await this.assignStaffRole(assignment.staffId, assignment.role);
          
          if (result.success) {
            results.successful.push({
              staffId: assignment.staffId,
              role: assignment.role,
              staff: result.staff
            });
            results.successCount++;
          } else {
            results.failed.push({
              staffId: assignment.staffId,
              role: assignment.role,
              error: result.message || 'Failed to assign role'
            });
            results.failureCount++;
          }
        } catch (error) {
          results.failed.push({
            staffId: assignment.staffId,
            role: assignment.role,
            error: error.message || 'Failed to assign role'
          });
          results.failureCount++;
        }
      }

      return {
        success: true,
        results
      };
    } catch (error) {
      throw error;
    }
  }

  // Format staff data for display
  formatStaffData(staff) {
    return {
      id: staff.id,
      name: staff.fullName,
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      role: staff.role,
      department: staff.department,
      departmentCode: staff.departmentCode,
      designation: staff.designation,
      employeeId: staff.employeeId,
      phone: staff.phone,
      isActive: staff.isActive,
      isVerified: staff.isVerified,
      emailSent: staff.emailSent,
      emailSentAt: staff.emailSentAt,
      roleAssignedAt: staff.roleAssignedAt,
      roleAssignedBy: staff.roleAssignedBy,
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

  // Get role color for badges
  getRoleColor(role) {
    const roleColors = {
      placement_staff: 'info',
      department_hod: 'success',
      other_staff: 'secondary'
    };
    return roleColors[role] || 'secondary';
  }

  // Get staff status color
  getStaffStatusColor(staff) {
    if (!staff.isActive) return 'error';
    if (!staff.emailSent) return 'warning';
    if (!staff.roleAssignedAt) return 'info';
    if (!staff.isVerified) return 'warning';
    return 'success';
  }

  // Get staff status text
  getStaffStatusText(staff) {
    if (!staff.isActive) return 'Inactive';
    if (!staff.roleAssignedAt) return 'Role Pending';
    if (!staff.emailSent) return 'Email Pending';
    if (!staff.isVerified) return 'Unverified';
    return 'Active';
  }

  // Format date for display
  formatDate(dateString) {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
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

  // Get available roles for assignment
  getAvailableRoles() {
    return [
      { value: 'placement_staff', label: 'Placement Staff', color: 'info' },
      { value: 'department_hod', label: 'Department HOD', color: 'success' },
      { value: 'other_staff', label: 'Other Staff', color: 'secondary' }
    ];
  }

  // Validate role assignment
  validateRoleAssignment(staffId, role) {
    const errors = [];

    if (!staffId) {
      errors.push('Staff ID is required');
    }

    if (!role) {
      errors.push('Role is required');
    }

    const validRoles = ['placement_staff', 'department_hod', 'other_staff'];
    if (role && !validRoles.includes(role)) {
      errors.push('Invalid role selected');
    }

    return errors;
  }

  // Generate Excel template for bulk staff upload with departments
  async generateBulkStaffTemplate() {
    try {
      // Get all active departments
      const departmentsResponse = await api.get('/departments?isActive=true');
      
      if (!departmentsResponse.success) {
        throw new Error('Failed to fetch departments for template');
      }

      const departments = departmentsResponse.departments || [];
      const departmentCodes = departments.map(dept => dept.code).join(', ');

      // Create template data
      const templateData = {
        headers: [
          'firstName',
          'lastName', 
          'email',
          'department', // This will be validated against dynamic departments
          'role',
          'designation',
          'employeeId',
          'phone',
          'adminNotes'
        ],
        sampleData: [
          {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            department: departments.length > 0 ? departments[0].code : 'CSE',
            role: 'placement_staff',
            designation: 'Placement Coordinator',
            employeeId: 'EMP001',
            phone: '9876543210',
            adminNotes: 'Sample staff member'
          }
        ],
        validDepartments: departments.map(dept => ({
          code: dept.code,
          name: dept.name
        })),
        validRoles: [
          'placement_staff',
          'department_hod', 
          'other_staff'
        ],
        instructions: [
          'Fill in all required fields: firstName, lastName, email, department',
          `Valid department codes: ${departmentCodes}`,
          'Valid roles: placement_staff, department_hod, other_staff',
          'Phone should be 10 digits',
          'Employee ID should be unique',
          'Emails will be sent only after role assignment'
        ]
      };

      return {
        success: true,
        template: templateData
      };
    } catch (error) {
      throw error;
    }
  }
}

// Create and export singleton instance
const departmentStaffService = new DepartmentStaffService();
export default departmentStaffService;
