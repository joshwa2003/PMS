import React, { useState } from 'react';
import { IconButton, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { Visibility as VisibilityIcon, Close as CloseIcon } from '@mui/icons-material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

const GoogleDrivePreview = ({ link, title = "Document Preview", showPreview = true }) => {
  const [open, setOpen] = useState(false);

  // Convert Google Drive share link to embed link
  const getEmbedUrl = (shareUrl) => {
    if (!shareUrl) return null;
    
    // Extract file ID from various Google Drive URL formats
    let fileId = null;
    
    // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    const viewMatch = shareUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (viewMatch) {
      fileId = viewMatch[1];
    }
    
    // Format: https://drive.google.com/open?id=FILE_ID
    const openMatch = shareUrl.match(/[?&]id=([a-zA-Z0-9-_]+)/);
    if (openMatch) {
      fileId = openMatch[1];
    }
    
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    
    return null;
  };

  // Convert Google Drive share link to direct image URL for images using backend proxy
  const getDirectImageUrl = (shareUrl) => {
    if (!shareUrl) return null;

    let fileId = null;

    const viewMatch = shareUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (viewMatch) {
      fileId = viewMatch[1];
    }

    const openMatch = shareUrl.match(/[?&]id=([a-zA-Z0-9-_]+)/);
    if (openMatch) {
      fileId = openMatch[1];
    }

    if (fileId) {
      // Use backend proxy to avoid CORS issues
      return `/api/google-drive-image?id=${fileId}`;
    }

    return null;
  };

  // Simple check if the link is an image based on extension
  const isImageLink = (url) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(url);
  };

  const embedUrl = getEmbedUrl(link);
  const directImageUrl = getDirectImageUrl(link);
  const showImagePreview = isImageLink(link);

  if (!link) return null;

  const handlePreviewClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <MDBox>
      {showPreview && (embedUrl || directImageUrl) ? (
        <MDBox>
          {/* Inline Preview */}
          <MDBox 
            sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              overflow: 'hidden',
              mb: 2,
              textAlign: 'center'
            }}
          >
            {showImagePreview && directImageUrl ? (
              <img
                src={directImageUrl}
                alt={title}
                style={{ maxWidth: '100%', maxHeight: 400, display: 'inline-block' }}
              />
            ) : (
              <iframe
                src={embedUrl}
                width="100%"
                height="400"
                frameBorder="0"
                title={title}
                style={{ display: 'block' }}
              />
            )}
          </MDBox>
          
          {/* Action Buttons */}
          <MDBox display="flex" gap={1} alignItems="center" justifyContent="center">
            <MDButton
              variant="outlined"
              color="info"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={handlePreviewClick}
            >
              Full Preview
            </MDButton>
            <MDButton
              variant="text"
              color="primary"
              size="small"
              onClick={() => window.open(link, '_blank')}
            >
              Open in Google Drive
            </MDButton>
          </MDBox>
        </MDBox>
      ) : (
        // Fallback: Just show link with preview button
        <MDBox display="flex" alignItems="center" gap={1}>
          <MDTypography variant="body2" color="text">
            📄 Document: {' '}
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              View Document
            </a>
          </MDTypography>
          {(embedUrl || directImageUrl) && (
            <IconButton size="small" onClick={handlePreviewClick} color="primary">
              <VisibilityIcon fontSize="small" />
            </IconButton>
          )}
        </MDBox>
      )}

      {/* Full Screen Preview Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h6">{title}</MDTypography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </MDBox>
        </DialogTitle>
        <DialogContent sx={{ p: 0, textAlign: 'center' }}>
          {showImagePreview && directImageUrl ? (
            <img
              src={directImageUrl}
              alt={title}
              style={{ maxWidth: '100%', maxHeight: '100%', display: 'inline-block' }}
            />
          ) : embedUrl ? (
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              title={title}
            />
          ) : (
            <MDBox p={3} textAlign="center">
              <MDTypography variant="body1" color="text">
                Preview not available. 
                <a href={link} target="_blank" rel="noopener noreferrer">
                  Open in Google Drive
                </a>
              </MDTypography>
            </MDBox>
          )}
        </DialogContent>
      </Dialog>
    </MDBox>
  );
};

export default GoogleDrivePreview;
