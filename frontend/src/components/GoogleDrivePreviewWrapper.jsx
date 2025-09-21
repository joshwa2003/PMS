import React from 'react';
import GoogleDrivePreview from './GoogleDrivePreview';

/**
 * Wrapper component to intelligently handle Google Drive links:
 * - For image files: Allow direct image display using backend proxy
 * - For documents: Use iframe preview to avoid Google Drive preview errors
 *
 * Usage: Replace instances of GoogleDrivePreview with GoogleDrivePreviewWrapper
 * or use this component where you want to preview Google Drive images reliably.
 */
const GoogleDrivePreviewWrapper = ({ link, title, showPreview = true }) => {
  // Detect if the link is a Google Drive link
  const isGoogleDriveLink = (url) => {
    if (!url) return false;
    return url.includes('drive.google.com');
  };

  // Detect if the link is an image file based on file extension or URL patterns
  const isImageFile = (url) => {
    if (!url) return false;

    // Check for common image file extensions in the URL
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?|$)/i;
    if (imageExtensions.test(url)) {
      return true;
    }

    // Check for Google Drive image patterns
    // Google Drive images often have specific patterns in their URLs
    const googleDriveImagePatterns = [
      /\/file\/d\/([a-zA-Z0-9-_]+)\/view/,  // Standard Google Drive view link
      /[?&]id=([a-zA-Z0-9-_]+)/,           // Open with ID parameter
    ];

    const hasGoogleDriveImagePattern = googleDriveImagePatterns.some(pattern => pattern.test(url));

    // Additional check: if it's a Google Drive link but doesn't contain document patterns, likely an image
    if (hasGoogleDriveImagePattern) {
      const documentPatterns = [
        /docs\.google\.com\/document/,
        /docs\.google\.com\/spreadsheets/,
        /docs\.google\.com\/presentation/,
        /docs\.google\.com\/forms/
      ];

      const isDocument = documentPatterns.some(pattern => pattern.test(url));
      return !isDocument; // If it's not a document, assume it's an image
    }

    return false;
  };

  // If it's a Google Drive link, determine the appropriate preview method
  if (isGoogleDriveLink(link)) {
    const isImage = isImageFile(link);

    // For images: allow direct display (showPreview = true)
    // For documents: use iframe preview (showPreview = false)
    const adjustedShowPreview = isImage ? true : false;

    console.log('GoogleDrivePreviewWrapper - Link analysis:', {
      link,
      isImage,
      adjustedShowPreview,
      originalShowPreview: showPreview
    });

    return (
      <GoogleDrivePreview
        link={link}
        title={title}
        showPreview={adjustedShowPreview}
      />
    );
  }

  return (
    <GoogleDrivePreview
      link={link}
      title={title}
      showPreview={adjustedShowPreview}
    />
  );
};

export default GoogleDrivePreviewWrapper;
