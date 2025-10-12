/**
 * Utility functions for handling Google Drive URLs
 */

/**
 * Convert Google Drive URL to thumbnail for display using backend proxy
 * @param {string} url - The Google Drive URL
 * @returns {string|null} - The processed URL or null if invalid
 */
export const getGoogleDriveThumbnail = (url) => {
  if (!url) return null;

  // If it's a Google Drive URL, route via backend proxy so the image can render
  if (url.includes('drive.google.com')) {
    const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
    let fileId = null;

    // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    const viewMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (viewMatch) {
      fileId = viewMatch[1];
    }

    // Format: https://drive.google.com/open?id=FILE_ID
    const openMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
    if (openMatch) {
      fileId = openMatch[1];
    }

    if (fileId) {
      return `${API_BASE}/api/google-drive-image?id=${fileId}`;
    }
  }

  // If it's not a Google Drive URL, return as-is
  return url;
};

/**
 * Convert Google Drive URL to direct image URL for display (alternative method)
 * @param {string} url - The Google Drive URL
 * @returns {string|null} - The direct image URL or null if invalid
 */
export const getGoogleDriveDirectImageUrl = (url) => {
  if (!url) return null;

  if (url.includes('drive.google.com')) {
    const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
    let fileId = null;

    const viewMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (viewMatch) {
      fileId = viewMatch[1];
    }

    const openMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
    if (openMatch) {
      fileId = openMatch[1];
    }

    if (fileId) {
      return `${API_BASE}/api/google-drive-image?id=${fileId}`;
    }
  }

  return url;
};

/**
 * Check if a URL is a Google Drive URL
 * @param {string} url - The URL to check
 * @returns {boolean} - True if it's a Google Drive URL
 */
export const isGoogleDriveUrl = (url) => {
  if (!url) return false;
  return url.includes('drive.google.com');
};

/**
 * Extract file ID from Google Drive URL
 * @param {string} url - The Google Drive URL
 * @returns {string|null} - The file ID or null if not found
 */
export const extractGoogleDriveFileId = (url) => {
  if (!url) return null;
  
  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const viewMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (viewMatch) {
    return viewMatch[1];
  }
  
  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  if (openMatch) {
    return openMatch[1];
  }
  
  return null;
};

/**
 * Validate Google Drive URL format
 * @param {string} url - The URL to validate
 * @returns {object} - Validation result with isValid and error properties
 */
export const validateGoogleDriveUrl = (url) => {
  if (!url || !url.trim()) {
    return { isValid: false, error: 'Please enter a Google Drive URL' };
  }

  const googleDrivePatterns = [
    /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/,
    /^https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9-_]+)/
  ];

  const isValid = googleDrivePatterns.some(pattern => pattern.test(url.trim()));
  
  if (!isValid) {
    return { isValid: false, error: 'Please provide a valid Google Drive share link' };
  }

  return { isValid: true, url: url.trim() };
};
