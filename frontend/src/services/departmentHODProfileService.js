import api from './api';

class DepartmentHODProfileService {
  // Get own department HOD profile
  async getProfile() {
    try {
      const response = await api.get('/department-hod-profiles/profile');
      
      if (response.success) {
        return response.profile;
      }
      
      throw new Error(response.message || 'Failed to fetch department HOD profile');
    } catch (error) {
      throw error;
    }
  }

  // Update own department HOD profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/department-hod-profiles/profile', profileData);
      
      if (response.success) {
        return response.profile;
      }
      
      throw new Error(response.message || 'Failed to update department HOD profile');
    } catch (error) {
      throw error;
    }
  }

  // Get department HOD profile by ID (Admin only)
  async getProfileById(profileId) {
    try {
      const response = await api.get(`/department-hod-profiles/${profileId}`);
      
      if (response.success) {
        return response.profile;
      }
      
      throw new Error(response.message || 'Failed to fetch department HOD profile');
    } catch (error) {
      throw error;
    }
  }

  // Get all department HOD profiles (Admin only)
  async getAllProfiles(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/department-hod-profiles?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch department HOD profiles');
    } catch (error) {
      throw error;
    }
  }

  // Delete department HOD profile (Admin only)
  async deleteProfile(profileId) {
    try {
      const response = await api.delete(`/department-hod-profiles/${profileId}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to delete department HOD profile');
    } catch (error) {
      throw error;
    }
  }

  // Get department HOD profile statistics (Admin only)
  async getProfileStats() {
    try {
      const response = await api.get('/department-hod-profiles/stats');
      
      if (response.success) {
        return response.stats;
      }
      
      throw new Error(response.message || 'Failed to fetch department HOD profile statistics');
    } catch (error) {
      throw error;
    }
  }

  // Upload profile image
  async uploadProfileImage(file) {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('profileImage', file);
      
      // Get token for authorization
      const token = localStorage.getItem('pms_token');
      
      // Use fetch for file upload since axios has issues with FormData
      const response = await fetch(`${api.defaults.baseURL}/department-hod-profiles/upload-profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to upload profile image');
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get profiles by department head of
  async getProfilesByDepartmentHeadOf(departmentHeadOf, params = {}) {
    try {
      const queryParams = new URLSearchParams({ ...params, departmentHeadOf }).toString();
      const response = await api.get(`/department-hod-profiles?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch department HOD profiles by department head of');
    } catch (error) {
      throw error;
    }
  }

  // Get profiles by department
  async getProfilesByDepartment(department, params = {}) {
    try {
      const queryParams = new URLSearchParams({ ...params, department }).toString();
      const response = await api.get(`/department-hod-profiles?${queryParams}`);
      
      if (response.success) {
        return response;
      }
      
      throw new Error(response.message || 'Failed to fetch department HOD profiles by department');
    } catch (error) {
      throw error;
    }
  }

  // Utility methods for profile data processing
  formatProfileData(profile) {
    return {
      id: profile.id,
      employeeId: profile.employeeId,
      fullName: profile.fullName,
      email: profile.email,
      mobileNumber: profile.mobileNumber,
      role: profile.role,
      department: profile.department,
      departmentHeadOf: profile.departmentHeadOf,
      designation: profile.designation,
      status: profile.status,
      profileCompletion: profile.profileCompletion,
      isProfileComplete: profile.isProfileComplete,
      dateOfJoining: profile.dateOfJoining,
      yearsAsHOD: profile.yearsAsHOD,
      numberOfFacultyManaged: profile.numberOfFacultyManaged,
      officeRoomNo: profile.officeRoomNo,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };
  }

  // Get role display name
  getRoleDisplayName(role) {
    const roleNames = {
      admin: 'Administrator',
      director: 'Director',
      staff: 'Staff',
      hod: 'Head of Department',
      other: 'Other',
      student: 'Student',
      alumni: 'Alumni',
      company: 'Company'
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

  // Get profile status badge color
  getProfileStatusColor(profile) {
    if (profile.status === 'inactive') return 'error';
    if (profile.status === 'deleted') return 'error';
    if (!profile.isProfileComplete) return 'warning';
    return 'success';
  }

  // Get profile status text
  getProfileStatusText(profile) {
    if (profile.status === 'inactive') return 'Inactive';
    if (profile.status === 'deleted') return 'Deleted';
    if (!profile.isProfileComplete) return 'Incomplete';
    return 'Active';
  }

  // Calculate profile completion percentage
  calculateProfileCompletion(profile) {
    const requiredFields = [
      'employeeId',
      'name.firstName',
      'name.lastName',
      'email',
      'mobileNumber',
      'gender',
      'role',
      'department',
      'designation',
      'dateOfJoining',
      'departmentHeadOf',
      'officeRoomNo',
      'yearsAsHOD',
      'academicBackground',
      'numberOfFacultyManaged',
      'responsibilities'
    ];
    
    const optionalFields = [
      'profilePhotoUrl',
      'subjectsTaught',
      'meetingSlots',
      'calendarLink',
      'contact.alternatePhone',
      'contact.emergencyContact',
      'contact.address.street',
      'contact.address.city',
      'contact.address.state',
      'contact.address.pincode',
      'adminNotes'
    ];
    
    let completedRequired = 0;
    let completedOptional = 0;
    
    // Check required fields
    requiredFields.forEach(field => {
      const value = this.getNestedValue(profile, field);
      if (value !== undefined && value !== null && value !== '') {
        completedRequired++;
      }
    });
    
    // Check optional fields
    optionalFields.forEach(field => {
      const value = this.getNestedValue(profile, field);
      if (value !== undefined && value !== null && value !== '' && 
          (!Array.isArray(value) || value.length > 0)) {
        completedOptional++;
      }
    });
    
    // Calculate completion percentage (70% for required, 30% for optional)
    const requiredPercentage = (completedRequired / requiredFields.length) * 70;
    const optionalPercentage = (completedOptional / optionalFields.length) * 30;
    
    return Math.round(requiredPercentage + optionalPercentage);
  }

  // Helper function to get nested values
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  // Validate profile data
  validateProfileData(profileData, isUpdate = false) {
    const errors = [];

    if (!isUpdate || profileData.employeeId) {
      if (!profileData.employeeId || profileData.employeeId.trim().length < 3) {
        errors.push('Employee ID must be at least 3 characters long');
      }
    }

    if (!isUpdate || profileData.name?.firstName) {
      if (!profileData.name?.firstName || profileData.name.firstName.trim().length < 2) {
        errors.push('First name must be at least 2 characters long');
      }
    }

    if (!isUpdate || profileData.name?.lastName) {
      if (!profileData.name?.lastName || profileData.name.lastName.trim().length < 2) {
        errors.push('Last name must be at least 2 characters long');
      }
    }

    if (!isUpdate || profileData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!profileData.email || !emailRegex.test(profileData.email)) {
        errors.push('Please provide a valid email address');
      }
    }

    if (!isUpdate || profileData.mobileNumber) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!profileData.mobileNumber || !phoneRegex.test(profileData.mobileNumber)) {
        errors.push('Mobile number must be exactly 10 digits');
      }
    }

    if (!isUpdate || profileData.role) {
      const validRoles = ['admin', 'director', 'staff', 'hod', 'other', 'student', 'alumni', 'company'];
      if (!profileData.role || !validRoles.includes(profileData.role)) {
        errors.push('Please select a valid role');
      }
    }

    if (!isUpdate || profileData.department) {
      const validDepartments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'ADMIN', 'HR', 'OTHER'];
      if (!profileData.department || !validDepartments.includes(profileData.department)) {
        errors.push('Please select a valid department');
      }
    }

    if (!isUpdate || profileData.departmentHeadOf) {
      const validDepartmentsHeadOf = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];
      if (!profileData.departmentHeadOf || !validDepartmentsHeadOf.includes(profileData.departmentHeadOf)) {
        errors.push('Please select a valid department to head');
      }
    }

    if (!isUpdate || profileData.yearsAsHOD !== undefined) {
      if (profileData.yearsAsHOD < 0 || profileData.yearsAsHOD > 50) {
        errors.push('Years as HOD must be between 0 and 50');
      }
    }

    if (!isUpdate || profileData.numberOfFacultyManaged !== undefined) {
      if (profileData.numberOfFacultyManaged < 0 || profileData.numberOfFacultyManaged > 200) {
        errors.push('Number of faculty managed must be between 0 and 200');
      }
    }

    if (!isUpdate || profileData.calendarLink) {
      const urlRegex = /^https?:\/\/.+/;
      if (profileData.calendarLink && !urlRegex.test(profileData.calendarLink)) {
        errors.push('Calendar link must be a valid URL');
      }
    }

    return errors;
  }

  // Get subjects taught as string
  getSubjectsTaughtString(subjectsTaught) {
    if (!Array.isArray(subjectsTaught) || subjectsTaught.length === 0) {
      return 'No subjects specified';
    }
    return subjectsTaught.join(', ');
  }

  // Get meeting slots as string
  getMeetingSlotsString(meetingSlots) {
    if (!Array.isArray(meetingSlots) || meetingSlots.length === 0) {
      return 'No meeting slots specified';
    }
    return meetingSlots.join(', ');
  }

  // Parse subjects taught from string
  parseSubjectsTaught(subjectsString) {
    if (!subjectsString || subjectsString.trim() === '') {
      return [];
    }
    return subjectsString.split(',').map(subject => subject.trim()).filter(subject => subject !== '');
  }

  // Parse meeting slots from string
  parseMeetingSlots(slotsString) {
    if (!slotsString || slotsString.trim() === '') {
      return [];
    }
    return slotsString.split(',').map(slot => slot.trim()).filter(slot => slot !== '');
  }
}

// Create and export singleton instance
const departmentHODProfileService = new DepartmentHODProfileService();
export default departmentHODProfileService;
