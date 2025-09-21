import { useState, useEffect } from "react";
import { useAuth } from "context/AuthContext";
import userService from "services/userService";
import administratorProfileService from "services/administratorProfileService";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { Link as LinkIcon } from "@mui/icons-material";
import Visibility from "@mui/icons-material/Visibility";
import Info from "@mui/icons-material/Info";

// S.A. Engineering College React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import GoogleDrivePreview from "components/GoogleDrivePreview";

function ProfileForm() {
  const { user, updateUser, updateProfilePicture } = useAuth();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });
  
  // Google Drive image upload states
  const [imageUploadDialog, setImageUploadDialog] = useState(false);
  const [googleDriveUrl, setGoogleDriveUrl] = useState('');
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [imageUploadSuccess, setImageUploadSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);

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
      case 'director':
      case 'staff':
      case 'hod':
        // Administrator fields
        roleData.employeeId = userData.employeeId || "";
        roleData.designation = userData.designation || "";
        roleData.mobileNumber = userData.mobileNumber || "";
        roleData.gender = userData.gender || "";
        roleData.profilePhotoUrl = userData.profilePhotoUrl || "";
        roleData.status = userData.status || "active";
        roleData.dateOfJoining = userData.dateOfJoining || "";
        roleData.registrationDate = userData.registrationDate || "";
        roleData.lastLoginAt = userData.lastLoginAt || "";
        roleData.authProvider = userData.authProvider || "local";
        roleData.accessLevel = userData.accessLevel || "admin";
        roleData.officeLocation = userData.officeLocation || "";
        roleData.createdBy = userData.createdBy || "";
        roleData.adminNotes = userData.adminNotes || "";
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

  // Google Drive image upload functions
  const validateGoogleDriveUrl = (url) => {
    if (!url || !url.trim()) {
      return 'Please enter a Google Drive URL';
    }

    const googleDrivePatterns = [
      /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/,
      /^https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9-_]+)/
    ];

    const isValid = googleDrivePatterns.some(pattern => pattern.test(url.trim()));
    
    if (!isValid) {
      return 'Please provide a valid Google Drive share link';
    }

    return null;
  };

  const handleGoogleDriveUrlChange = (e) => {
    const url = e.target.value;
    setGoogleDriveUrl(url);
    setImageUploadError('');
    setImageUploadSuccess('');
    
    // Show preview if URL looks valid
    if (url && validateGoogleDriveUrl(url) === null) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  };

  const handleImageUpload = async () => {
    // Clear previous messages
    setImageUploadError('');
    setImageUploadSuccess('');

    // Validate URL
    const error = validateGoogleDriveUrl(googleDriveUrl);
    if (error) {
      setImageUploadError(error);
      return;
    }

    setIsUpdatingImage(true);

    try {
      // Check if user has administrator role for the specialized API
      const allowedRoles = ['admin', 'director', 'staff', 'hod'];
      if (allowedRoles.includes(user.role)) {
        // Use administrator profile service for admin users
        const result = await administratorProfileService.updateProfileImage(googleDriveUrl.trim());
        
          if (result.success) {
            setImageUploadSuccess('Profile image updated successfully!');
            
            // Update the user's profile picture in AuthContext immediately
            if (updateProfilePicture) {
              // Use the thumbnail URL for better display
              const thumbnailUrl = result.thumbnailUrl || result.profilePhotoUrl;
              // Convert to direct Google Drive image URL for proper display
              const directImageUrl = getGoogleDriveThumbnail(thumbnailUrl);
              updateProfilePicture(directImageUrl);
            }
            
            // Update the form data to reflect the new image
            if (user) {
              user.profilePicture = getGoogleDriveThumbnail(result.thumbnailUrl || result.profilePhotoUrl);
            }
            
            // Update formData state to trigger re-render of Avatar with new image
            setFormData(prev => ({
              ...prev,
              profilePicture: getGoogleDriveThumbnail(result.thumbnailUrl || result.profilePhotoUrl)
            }));
            
            // Close dialog and refresh after a short delay
            setTimeout(() => {
              setImageUploadDialog(false);
              setGoogleDriveUrl('');
              setShowPreview(false);
              setImageUploadSuccess('');
              
              // Force a complete page refresh to ensure image updates
              window.location.reload();
            }, 1500);
          } else {
            setImageUploadError(result.error || 'Failed to update profile image');
          }
      } else {
        // For other user types, use the generic user service
        // Note: This would need to be implemented in userService if needed
        setImageUploadError('Profile image upload is currently only available for administrators');
      }
    } catch (error) {
      console.error('Profile image update error:', error);
      setImageUploadError(error.message || 'An error occurred while updating profile image');
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const getGoogleDriveThumbnail = (url) => {
    if (!url) return null;

    // Handle different Google Drive URL formats
    let fileId = null;

    // Extract file ID from various Google Drive URL formats
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9-_]+)/,
      /[?&]id=([a-zA-Z0-9-_]+)/,
      /\/open\?id=([a-zA-Z0-9-_]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        fileId = match[1];
        break;
      }
    }

    if (fileId) {
      // Use backend proxy URL to avoid CSP issues
      return `/api/proxy/google-drive-image?id=${fileId}`;
    }

    return url;
  };

  // Helper function to extract file ID and return backend proxy URL
  const getGoogleDriveProxyUrl = (shareUrl) => {
    if (!shareUrl) return null;
    let fileId = null;
    const viewMatch = shareUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (viewMatch) {
      fileId = viewMatch[1];
    } else {
      const openMatch = shareUrl.match(/[?&]id=([a-zA-Z0-9-_]+)/);
      if (openMatch) {
        fileId = openMatch[1];
      }
    }
    if (fileId) {
      return `/api/google-drive-image?id=${fileId}&t=${Date.now()}`;
    }
    return null;
  };

  const getSharingInstructions = () => [
    '1. Open your image file in Google Drive',
    '2. Right-click and select "Share"',
    '3. Click "Change to anyone with the link"',
    '4. Set permission to "Viewer"',
    '5. Click "Copy link" and paste it below'
  ];

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Administrator',
      placement_director: 'Placement Director',
      placement_staff: 'Placement Staff',
      department_hod: 'Department HOD',
      other_staff: 'Other Staff',
      student: 'Student',
      alumni: 'Alumni',
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
            src={user.profilePicture ? getGoogleDriveProxyUrl(user.profilePicture) : null}
            alt={user.fullName}
            sx={{ width: 100, height: 100, mr: 3 }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-profile.png'; // fallback image path
            }}
          >
            {!user.profilePicture && user.firstName?.[0]}
          </Avatar>
          <IconButton
            onClick={() => setImageUploadDialog(true)}
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

        {/* Google Drive Image Upload Dialog */}
        <Dialog 
          open={imageUploadDialog} 
          onClose={() => setImageUploadDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <MDTypography variant="h6" fontWeight="medium">
              Update Profile Image
            </MDTypography>
          </DialogTitle>
          
          <DialogContent>
            <MDBox mb={3}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Upload with Google Drive Link
              </MDTypography>

              <MDBox mb={2}>
                <MDInput
                  type="url"
                  label="Google Drive Image URL"
                  value={googleDriveUrl}
                  onChange={handleGoogleDriveUrlChange}
                  fullWidth
                  placeholder="https://drive.google.com/file/d/..."
                  InputProps={{
                    startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  error={!!imageUploadError}
                  helperText={imageUploadError}
                />
              </MDBox>

              <MDBox display="flex" gap={1} mb={2}>
                <MDButton
                  variant="gradient"
                  color="info"
                  onClick={handleImageUpload}
                  disabled={!googleDriveUrl || isUpdatingImage}
                  startIcon={isUpdatingImage ? <CircularProgress size={16} /> : <PhotoCamera />}
                  fullWidth
                >
                  {isUpdatingImage ? 'Updating...' : 'Update Profile Image'}
                </MDButton>
                
                {googleDriveUrl && (
                  <MDButton
                    variant="outlined"
                    color="info"
                    onClick={() => setShowPreview(!showPreview)}
                    startIcon={<Visibility />}
                  >
                    {showPreview ? 'Hide' : 'Preview'}
                  </MDButton>
                )}
              </MDBox>

              {/* Success Message */}
              {imageUploadSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {imageUploadSuccess}
                </Alert>
              )}

              {/* Preview Section */}
              {showPreview && googleDriveUrl && !imageUploadError && (
                <MDBox mb={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Preview
                  </MDTypography>
                  <GoogleDrivePreview 
                    link={googleDriveUrl} 
                    title="Profile Image Preview"
                    showPreview={true}
                  />
                </MDBox>
              )}

              {/* Instructions */}
              <Alert severity="info" icon={<Info />}>
                <MDTypography variant="h6" fontWeight="medium" mb={1}>
                  How to share your Google Drive image:
                </MDTypography>
                <MDBox component="ol" pl={2}>
                  {getSharingInstructions().map((instruction, index) => (
                    <MDBox component="li" key={index} mb={0.5}>
                      <MDTypography variant="body2">
                        {instruction}
                      </MDTypography>
                    </MDBox>
                  ))}
                </MDBox>
              <MDTypography variant="body2" mt={1} fontWeight="medium" color="warning">
                Note: Make sure your image file is accessible to anyone with the link for it to display properly.
              </MDTypography>
              </Alert>
            </MDBox>
          </DialogContent>
          
          <DialogActions>
            <MDButton 
              onClick={() => {
                setImageUploadDialog(false);
                setGoogleDriveUrl('');
                setShowPreview(false);
                setImageUploadError('');
                setImageUploadSuccess('');
              }}
              color="secondary"
            >
              Close
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
    </Card>
  );
}

export default ProfileForm;
