import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link as LinkIcon } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import { getGoogleDriveDirectImageUrl, getGoogleDriveThumbnail } from 'utils/googleDriveUtils';
import administratorProfileService from 'services/administratorProfileService';
import studentApi from 'api/studentApi';
import { useAuth } from 'context/AuthContext';

function ProfileImageDriveSection({ title = 'Profile Image (Google Drive)', initialUrl = '' }) {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [editing, setEditing] = useState(false);

  // Initialize from saved value when provided by parent (e.g., from database)
  useEffect(() => {
    if (initialUrl && initialUrl !== savedUrl) {
      setSavedUrl(initialUrl);
      setUrl('');
      setSuccess('');
      setError('');
      setEditing(false);
    }
  }, [initialUrl]);

  const directUrl = getGoogleDriveDirectImageUrl(savedUrl);
  const previewUrl = getGoogleDriveThumbnail(savedUrl);

  const handleOpen = () => {
    if (savedUrl) window.open(savedUrl, '_blank');
  };

  const handleDownload = async () => {
    if (!directUrl) return;
    try {
      setDownloading(true);
      const response = await fetch(directUrl, { credentials: 'omit' });
      const blob = await response.blob();
      const urlObject = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
      a.href = urlObject;
      a.download = `profile-image.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(urlObject);
    } finally {
      setDownloading(false);
    }
  };

  const handleChange = (e) => {
    setUrl(e.target.value);
    setError('');
  };

  const handleSave = async () => {
    if (!url || !/^https:\/\/drive\.google\.com\//.test(url)) {
      setError('Please enter a valid Google Drive link');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const link = url.trim();
      if (user?.role === 'student') {
        const result = await studentApi.updateProfileImage(link);
        if (!result?.success) throw new Error(result?.message || 'Failed to save link');
      } else {
        await administratorProfileService.updateProfileImage(link);
      }
      setSavedUrl(link);
      setSuccess('Profile image link saved.');
      setEditing(false);
      setUrl('');
    } catch (e) {
      setError(e.message || 'Failed to save link');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" fontWeight="medium" mb={2}>{title}</MDTypography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {!editing ? (
              <MDBox sx={{ maxWidth: 380, mx: 'auto' }}>
                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={() => setEditing(true)}
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                      sx={{ height: 44, borderRadius: 2 }}
                    >
                      Upload
                    </MDButton>
                  </Grid>
                  <Grid item xs={12}>
                    <MDButton
                      variant="outlined"
                      color="info"
                      startIcon={<VisibilityIcon />}
                      onClick={handleOpen}
                      disabled={!savedUrl}
                      fullWidth
                      sx={{ height: 44, borderRadius: 2 }}
                    >
                      View in Drive
                    </MDButton>
                  </Grid>
                  <Grid item xs={12}>
                    <MDButton
                      variant="contained"
                      color="info"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownload}
                      disabled={!directUrl}
                      fullWidth
                      sx={{ height: 44, borderRadius: 2 }}
                    >
                      {downloading ? 'Downloading...' : 'Download'}
                    </MDButton>
                  </Grid>
                </Grid>
                {success && (
                  <Box mt={2}>
                    <Alert severity="success">{success}</Alert>
                  </Box>
                )}
              </MDBox>
            ) : (
              <MDBox sx={{ maxWidth: 420, mx: 'auto' }}>
                <MDInput
                  type="url"
                  label="Google Drive Image URL"
                  value={url}
                  onChange={handleChange}
                  fullWidth
                  placeholder="https://drive.google.com/file/d/..."
                  InputProps={{ startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                  error={!!error}
                  helperText={error}
                />
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <MDButton variant="gradient" color="info" onClick={handleSave} disabled={!url || saving} fullWidth sx={{ height: 44, borderRadius: 2 }}>
                      {saving ? 'Saving...' : 'Save'}
                    </MDButton>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDButton variant="outlined" color="secondary" onClick={() => { setEditing(false); setUrl(''); setError(''); }} fullWidth sx={{ height: 44, borderRadius: 2 }}>
                      Cancel
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: 2, textAlign: 'center', minHeight: 220 }}>
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 300, display: 'inline-block', borderRadius: 8 }} />
              ) : (
                <Typography variant="body2" color="text.secondary">Enter a Google Drive image link to preview</Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </MDBox>
    </Card>
  );
}

export default ProfileImageDriveSection;


