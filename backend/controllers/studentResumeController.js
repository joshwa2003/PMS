const Student = require('../models/Student');
const multer = require('multer');
const { getGridFSBucket, deleteFile, fileExists } = require('../config/gridfs');
const mongoose = require('mongoose');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for resume uploads
const fileFilter = (req, file, cb) => {
  // Profile images: jpg, jpeg, png (for Base64 encoding)
  // Resume documents: pdf (for GridFS storage)
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG images and PDF documents are allowed.'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

// Helper function to convert image to Base64
const convertImageToBase64 = (buffer, mimetype) => {
  const base64String = buffer.toString('base64');
  return `data:${mimetype};base64,${base64String}`;
};

// Helper function to generate unique filename
const generateUniqueFilename = (originalName, userId) => {
  const timestamp = Date.now();
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  return `${userId}_${baseName}_${timestamp}${extension}`;
};

// Helper function to save PDF to GridFS
const savePDFToGridFS = async (buffer, filename, mimetype, userId) => {
  return new Promise((resolve, reject) => {
    try {
      const bucket = getGridFSBucket();
      
      const uploadStream = bucket.openUploadStream(filename, {
        metadata: {
          userId: userId,
          originalName: filename,
          uploadDate: new Date(),
          contentType: mimetype
        }
      });

      uploadStream.on('error', (error) => {
        console.error('GridFS upload error:', error);
        reject(error);
      });

      uploadStream.on('finish', (file) => {
        console.log('File uploaded to GridFS:', file);
        resolve({
          success: true,
          fileId: file._id,
          filename: filename,
          size: buffer.length
        });
      });

      // Write buffer to GridFS
      uploadStream.end(buffer);
    } catch (error) {
      console.error('Error saving PDF to GridFS:', error);
      reject(error);
    }
  });
};

// @desc    Upload student resume (Hybrid approach)
// @route   POST /api/students/resume-upload
// @access  Private (Student only)
const uploadStudentResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await Student.findOne({ userId });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { buffer, mimetype, originalname, size } = req.file;
    
    // Validate file size
    if (size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      });
    }

    let updateData = {};
    let responseData = {};

    // Handle based on file type (Hybrid approach)
    if (mimetype.startsWith('image/')) {
      // Profile Images: Use Base64 encoding (small files)
      const base64Image = convertImageToBase64(buffer, mimetype);
      
      updateData = {
        profileImageUrl: base64Image,
        'placement.resumeLastUpdated': new Date()
      };
      
      responseData = {
        type: 'profile_image',
        profileImageUrl: base64Image,
        size: size,
        message: 'Profile image updated successfully using Base64 encoding'
      };
      
    } else if (mimetype === 'application/pdf') {
      // PDF Documents: Use GridFS (larger files, better performance)
      
      // Delete old resume if exists
      if (student.placement && student.placement.resumeFilename) {
        await deleteFile(student.placement.resumeFilename);
      }
      
      const uniqueFilename = generateUniqueFilename(originalname, userId);
      
      // Save PDF to GridFS
      const gridfsResult = await savePDFToGridFS(buffer, uniqueFilename, mimetype, userId);
      
      if (!gridfsResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to save resume to database'
        });
      }
      
      updateData = {
        'placement.resumeLink': `/api/students/resume/${uniqueFilename}`,
        'placement.resumeFilename': uniqueFilename,
        'placement.resumeFileId': gridfsResult.fileId,
        'placement.resumeLastUpdated': new Date()
      };
      
      responseData = {
        type: 'resume_pdf',
        resumeLink: `/api/students/resume/${uniqueFilename}`,
        resumeFilename: uniqueFilename,
        size: size,
        message: 'Resume PDF uploaded successfully using GridFS'
      };
    }

    // Update student profile
    await Student.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Upload student resume error:', error);
    
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while uploading file'
    });
  }
};

// @desc    Get student resume file
// @route   GET /api/students/resume/:filename
// @access  Private (Student, Placement Staff, Admin)
const getStudentResume = async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Check if file exists in GridFS
    const exists = await fileExists(filename);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found'
      });
    }

    const bucket = getGridFSBucket();
    
    // Get file info
    const files = await bucket.find({ filename }).toArray();
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found'
      });
    }

    const file = files[0];
    
    // Set appropriate headers
    res.set({
      'Content-Type': file.metadata.contentType || 'application/pdf',
      'Content-Disposition': `inline; filename="${file.filename}"`,
      'Content-Length': file.length
    });

    // Stream file from GridFS
    const downloadStream = bucket.openDownloadStreamByName(filename);
    
    downloadStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming file'
        });
      }
    });

    downloadStream.pipe(res);

  } catch (error) {
    console.error('Get student resume error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Server error while retrieving resume'
      });
    }
  }
};

// @desc    Delete student resume
// @route   DELETE /api/students/resume
// @access  Private (Student only)
const deleteStudentResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await Student.findOne({ userId });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    if (!student.placement || !student.placement.resumeFilename) {
      return res.status(404).json({
        success: false,
        message: 'No resume found to delete'
      });
    }

    // Delete file from GridFS
    const deleted = await deleteFile(student.placement.resumeFilename);
    
    if (deleted) {
      // Update student profile to remove resume references
      await Student.findOneAndUpdate(
        { userId },
        { 
          $unset: {
            'placement.resumeLink': '',
            'placement.resumeFilename': '',
            'placement.resumeFileId': ''
          },
          $set: {
            'placement.resumeLastUpdated': new Date()
          }
        }
      );

      res.status(200).json({
        success: true,
        message: 'Resume deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Resume file not found in database'
      });
    }

  } catch (error) {
    console.error('Delete student resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting resume'
    });
  }
};

// @desc    Get resume upload status and info
// @route   GET /api/students/resume-info
// @access  Private (Student only)
const getResumeInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await Student.findOne({ userId });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const resumeInfo = {
      hasResume: !!(student.placement && student.placement.resumeLink),
      resumeLink: student.placement?.resumeLink || null,
      resumeFilename: student.placement?.resumeFilename || null,
      lastUpdated: student.placement?.resumeLastUpdated || null,
      hasProfileImage: !!student.profileImageUrl,
      profileImageType: student.profileImageUrl ? 
        (student.profileImageUrl.startsWith('data:') ? 'base64' : 'url') : null
    };

    res.status(200).json({
      success: true,
      resumeInfo
    });

  } catch (error) {
    console.error('Get resume info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching resume info'
    });
  }
};

module.exports = {
  upload,
  uploadStudentResume,
  getStudentResume,
  deleteStudentResume,
  getResumeInfo
};
