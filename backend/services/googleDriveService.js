class GoogleDriveService {
  constructor() {
    console.log('Using Google Drive links for file storage');
  }

  /**
   * Validate Google Drive URL
   */
  validateGoogleDriveUrl(url) {
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'URL is required' };
    }

    // Remove whitespace
    url = url.trim();

    // Check if it's a Google Drive URL
    const googleDrivePatterns = [
      /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/,
      /^https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9-_]+)/,
      /^https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9-_]+)/,
      /^https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /^https:\/\/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9-_]+)/
    ];

    const isValidGoogleDriveUrl = googleDrivePatterns.some(pattern => pattern.test(url));

    if (!isValidGoogleDriveUrl) {
      return { 
        isValid: false, 
        error: 'Please provide a valid Google Drive share link' 
      };
    }

    return { isValid: true, url };
  }

  /**
   * Extract file ID from Google Drive URL
   */
  extractFileId(url) {
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9-_]+)/,
      /[?&]id=([a-zA-Z0-9-_]+)/,
      /\/document\/d\/([a-zA-Z0-9-_]+)/,
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /\/presentation\/d\/([a-zA-Z0-9-_]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Convert Google Drive share URL to direct view URL
   */
  convertToDirectViewUrl(url) {
    const validation = this.validateGoogleDriveUrl(url);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const fileId = this.extractFileId(url);
    if (!fileId) {
      return { success: false, error: 'Could not extract file ID from URL' };
    }

    // Create direct view URL
    const directUrl = `https://drive.google.com/file/d/${fileId}/view`;

    return { 
      success: true, 
      url: directUrl,
      fileId,
      originalUrl: url
    };
  }

  /**
   * Convert Google Drive URL to thumbnail URL for images
   */
  convertToThumbnailUrl(url, size = 400) {
    const validation = this.validateGoogleDriveUrl(url);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const fileId = this.extractFileId(url);
    if (!fileId) {
      return { success: false, error: 'Could not extract file ID from URL' };
    }

    // Create thumbnail URL for images - use uc endpoint for better compatibility
    const thumbnailUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    return { 
      success: true, 
      url: thumbnailUrl,
      fileId,
      originalUrl: url
    };
  }

  /**
   * Process profile image URL
   */
  async processProfileImageUrl(url, userId) {
    try {
      console.log('Processing profile image URL for user:', userId);
      
      const validation = this.validateGoogleDriveUrl(url);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Convert to direct view URL
      const result = this.convertToDirectViewUrl(url);
      if (!result.success) {
        return result;
      }

      console.log('Profile image URL processed successfully:', result.url);

      return { 
        success: true, 
        url: result.url,
        thumbnailUrl: this.convertToThumbnailUrl(url).url,
        fileId: result.fileId,
        originalUrl: url
      };
    } catch (error) {
      console.error('Process profile image URL error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process resume/PDF URL
   */
  async processResumeUrl(url, userId) {
    try {
      console.log('Processing resume URL for user:', userId);
      
      const validation = this.validateGoogleDriveUrl(url);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Convert to direct view URL
      const result = this.convertToDirectViewUrl(url);
      if (!result.success) {
        return result;
      }

      console.log('Resume URL processed successfully:', result.url);

      return { 
        success: true, 
        url: result.url,
        fileId: result.fileId,
        originalUrl: url
      };
    } catch (error) {
      console.error('Process resume URL error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get embed URL for preview
   */
  getEmbedUrl(url) {
    const fileId = this.extractFileId(url);
    if (!fileId) {
      return null;
    }

    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  /**
   * Check if URL is accessible (basic validation)
   */
  async validateUrlAccessibility(url) {
    try {
      // For now, we'll just validate the format
      // In a production environment, you might want to make a HEAD request
      // to check if the file is publicly accessible
      
      const validation = this.validateGoogleDriveUrl(url);
      if (!validation.isValid) {
        return { isAccessible: false, error: validation.error };
      }

      // Check if URL contains sharing parameters
      const hasSharing = url.includes('usp=sharing') || url.includes('usp=drive_link');
      
      if (!hasSharing) {
        console.warn('Google Drive URL may not be publicly accessible. Ensure sharing is enabled.');
      }

      return { 
        isAccessible: true, 
        warning: !hasSharing ? 'Please ensure the Google Drive file is shared publicly or with appropriate permissions.' : null
      };
    } catch (error) {
      console.error('URL accessibility check error:', error);
      return { isAccessible: false, error: error.message };
    }
  }

  /**
   * Legacy method compatibility - no-op for delete operations
   */
  async deleteFile(filePath) {
    console.log('Delete operation not applicable for Google Drive links:', filePath);
    return { success: true, message: 'Google Drive files are managed externally' };
  }

  /**
   * Legacy method compatibility - return the URL as-is
   */
  getPublicUrl(url) {
    return url;
  }

  /**
   * Utility method to get file type from URL
   */
  getFileTypeFromUrl(url) {
    // This is a basic implementation
    // In practice, you might want to make an API call to get file metadata
    if (url.includes('docs.google.com/document')) {
      return 'document';
    } else if (url.includes('docs.google.com/spreadsheets')) {
      return 'spreadsheet';
    } else if (url.includes('docs.google.com/presentation')) {
      return 'presentation';
    } else {
      // For drive.google.com links, we can't determine type from URL alone
      return 'file';
    }
  }

  /**
   * Generate sharing instructions for users
   */
  getSharingInstructions() {
    return {
      title: 'How to share your Google Drive file:',
      steps: [
        '1. Open your file in Google Drive',
        '2. Click the "Share" button (top-right corner)',
        '3. Click "Change to anyone with the link"',
        '4. Set permission to "Viewer" or "Commenter"',
        '5. Click "Copy link" and paste it here'
      ],
      note: 'Make sure your file is accessible to anyone with the link for it to display properly.'
    };
  }
}

module.exports = new GoogleDriveService();
