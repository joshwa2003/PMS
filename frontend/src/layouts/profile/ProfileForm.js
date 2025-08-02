import { useState, useEffect } from "react";
import { useAuth } from "context/AuthContext";
import userService from "services/userService";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

// S.A. Engineering College React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

function ProfileForm() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
        designation: user.designation || "",
        bio: user.bio || "",
        // Role-specific fields
        ...getRoleSpecificData(user)
      });
    }
  }, [user]);

  const getRoleSpecificData = (userData) => {
    const roleData = {};
    
    switch (userData.role) {
      case 'admin':
        roleData.employeeId = userData.employeeId || "";
        roleData.designation = userData.designation || "";
        break;
      case 'placement_director':
        roleData.employeeId = userData.employeeId || "";
        roleData.designation = userData.designation || "";
        break;
      case 'placement_staff':
        roleData.employeeId = userData.employeeId || "";
        roleData.designation = userData.designation || "";
        break;
      case 'department_hod':
        roleData.employeeId = userData.employeeId || "";
        roleData.designation = userData.designation || "";
        break;
      case 'other_staff':
        roleData.employeeId = userData.employeeId || "";
        roleData.designation = userData.designation || "";
        break;
      case 'student':
        roleData.studentId = userData.studentId || "";
        roleData.batch = userData.batch || "";
        roleData.cgpa = userData.cgpa || "";
        break;
      case 'alumni':
        roleData.studentId = userData.studentId || "";
        roleData.graduationYear = userData.graduationYear || "";
        roleData.currentCompany = userData.currentCompany || "";
        roleData.currentPosition = userData.currentPosition || "";
        break;
      case 'company_hr':
        roleData.companyName = userData.companyName || "";
        roleData.companyWebsite = userData.companyWebsite || "";
        roleData.hrPosition = userData.hrPosition || "";
        break;
      default:
        break;
    }
    
    return roleData;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updatedUser = await userService.updateProfile(formData);
      updateUser(updatedUser);
      setAlert({
        show: true,
        message: "Profile updated successfully!",
        type: "success"
      });
    } catch (error) {
      setAlert({
        show: true,
        message: error.response?.data?.message || "Failed to update profile",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Administrator',
      placement_director: 'Placement Director',
      placement_staff: 'Placement Staff',
      department_hod: 'Department HOD',
      other_staff: 'Other Staff',
      student: 'Student',
      alumni: 'Alumni',
      company_hr: 'Company HR',
    };
    return roleNames[role] || role;
  };

  const renderRoleSpecificFields = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
      case 'placement_director':
      case 'placement_staff':
      case 'department_hod':
      case 'other_staff':
        return (
          <>
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Employee ID"
                value={formData.employeeId || ""}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Designation"
                value={formData.designation || ""}
                onChange={(e) => handleInputChange('designation', e.target.value)}
                fullWidth
              />
            </Grid>
          </>
        );

      case 'student':
        return (
          <>
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Student ID"
                value={formData.studentId || ""}
                onChange={(e) => handleInputChange('studentId', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Batch"
                value={formData.batch || ""}
                onChange={(e) => handleInputChange('batch', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                type="number"
                label="CGPA"
                value={formData.cgpa || ""}
                onChange={(e) => handleInputChange('cgpa', e.target.value)}
                fullWidth
                inputProps={{ min: 0, max: 10, step: 0.01 }}
              />
            </Grid>
          </>
        );

      case 'alumni':
        return (
          <>
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Student ID"
                value={formData.studentId || ""}
                onChange={(e) => handleInputChange('studentId', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                type="number"
                label="Graduation Year"
                value={formData.graduationYear || ""}
                onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Current Company"
                value={formData.currentCompany || ""}
                onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Current Position"
                value={formData.currentPosition || ""}
                onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                fullWidth
              />
            </Grid>
          </>
        );

      case 'company_hr':
        return (
          <>
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Company Name"
                value={formData.companyName || ""}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Company Website"
                value={formData.companyWebsite || ""}
                onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="HR Position"
                value={formData.hrPosition || ""}
                onChange={(e) => handleInputChange('hrPosition', e.target.value)}
                fullWidth
              />
            </Grid>
          </>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <MDBox p={3} textAlign="center">
        <MDTypography variant="h6">Loading...</MDTypography>
      </MDBox>
    );
  }

  return (
    <Card>
      <MDBox p={3}>
        {alert.show && (
          <MDAlert color={alert.type} dismissible onClose={() => setAlert({ ...alert, show: false })}>
            {alert.message}
          </MDAlert>
        )}

        {/* Profile Header */}
        <MDBox display="flex" alignItems="center" mb={3}>
          <MDBox position="relative">
            <Avatar
              src={user.profilePicture}
              alt={user.fullName}
              sx={{ width: 100, height: 100, mr: 3 }}
            >
              {!user.profilePicture && user.firstName?.[0]}
            </Avatar>
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 20,
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': { backgroundColor: 'primary.dark' }
              }}
              size="small"
            >
              <PhotoCamera fontSize="small" />
            </IconButton>
          </MDBox>
          <MDBox>
            <MDTypography variant="h4" fontWeight="medium">
              {user.fullName}
            </MDTypography>
            <MDTypography variant="body2" color="text">
              {getRoleDisplayName(user.role)}
            </MDTypography>
            <MDTypography variant="body2" color="text">
              {user.email}
            </MDTypography>
          </MDBox>
        </MDBox>

        <Divider />

        {/* Profile Form */}
        <MDBox component="form" onSubmit={handleSubmit} mt={3}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Basic Information
              </MDTypography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="First Name"
                value={formData.firstName || ""}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Last Name"
                value={formData.lastName || ""}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <MDInput
                type="email"
                label="Email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange('email', e.target.value)}
                fullWidth
                required
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    cursor: 'not-allowed',
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <MDInput
                type="tel"
                label="Phone Number"
                value={formData.phone || ""}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Department"
                value={formData.department || ""}
                onChange={(e) => handleInputChange('department', e.target.value)}
                fullWidth
              />
            </Grid>

            {/* Role-specific fields */}
            <Grid item xs={12}>
              <MDTypography variant="h6" fontWeight="medium" mb={2} mt={2}>
                {getRoleDisplayName(user.role)} Information
              </MDTypography>
            </Grid>
            
            {renderRoleSpecificFields()}

            {/* Bio */}
            <Grid item xs={12}>
              <MDInput
                type="text"
                label="Bio"
                value={formData.bio || ""}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                fullWidth
                multiline
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <MDBox mt={3} display="flex" justifyContent="flex-end">
                <MDButton
                  variant="gradient"
                  color="info"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Profile"}
                </MDButton>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default ProfileForm;
