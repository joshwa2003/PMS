# Hybrid File Upload System Documentation

## Overview
This system implements a **hybrid approach** for student file uploads in the Placement Management System (PMS):

- **Profile Images**: Base64 encoding (small files, simple storage)
- **PDF Documents**: GridFS storage (larger files, better performance)

## Architecture

### 1. GridFS Configuration (`config/gridfs.js`)
- Initializes GridFS bucket for MongoDB
- Provides utilities for file operations (upload, download, delete)
- Bucket name: `uploads`

### 2. Student Resume Controller (`controllers/studentResumeController.js`)
- Handles hybrid file upload logic
- Multer configuration for memory storage
- File type validation and processing
- GridFS integration for PDF files
- Base64 conversion for images

### 3. Updated Student Model (`models/Student.js`)
New fields added to placement section:
```javascript
placement: {
  // ... existing fields
  resumeLink: { type: String }, // URL/path to resume
  resumeFilename: { type: String }, // GridFS filename for PDFs
  resumeFileId: { type: mongoose.Schema.Types.ObjectId }, // GridFS file ID
}
```

### 4. Routes (`routes/studentResume.js`)
- `POST /api/v1/student-resume/upload` - Upload resume/profile image
- `GET /api/v1/student-resume/:filename` - Download resume file
- `DELETE /api/v1/student-resume` - Delete resume
- `GET /api/v1/student-resume/info` - Get upload status

## File Processing Logic

### Profile Images (JPG, JPEG, PNG)
1. **Storage**: Base64 encoding
2. **Size Limit**: 10MB
3. **Process**: Convert buffer to Base64 string
4. **Storage Location**: `profileImageUrl` field in Student model
5. **Format**: `data:image/jpeg;base64,{base64_string}`

### PDF Documents
1. **Storage**: GridFS
2. **Size Limit**: 10MB
3. **Process**: Stream to GridFS bucket
4. **Storage Location**: GridFS collection with metadata
5. **Reference**: Filename and FileId stored in Student model

## API Endpoints

### Upload File
```http
POST /api/v1/student-resume/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- resume: File (image or PDF)
```

**Response for Image Upload:**
```json
{
  "success": true,
  "data": {
    "type": "profile_image",
    "profileImageUrl": "data:image/jpeg;base64,{base64_string}",
    "size": 1024000,
    "message": "Profile image updated successfully using Base64 encoding"
  }
}
```

**Response for PDF Upload:**
```json
{
  "success": true,
  "data": {
    "type": "resume_pdf",
    "resumeLink": "/api/v1/student-resume/filename.pdf",
    "resumeFilename": "userId_resume_timestamp.pdf",
    "size": 2048000,
    "message": "Resume PDF uploaded successfully using GridFS"
  }
}
```

### Download Resume
```http
GET /api/v1/student-resume/{filename}
Authorization: Bearer {token}
```

### Delete Resume
```http
DELETE /api/v1/student-resume
Authorization: Bearer {token}
```

### Get Upload Info
```http
GET /api/v1/student-resume/info
Authorization: Bearer {token}
```

## Security Features

1. **File Type Validation**: Only allows JPG, JPEG, PNG, PDF
2. **Size Limits**: 10MB maximum file size
3. **Authentication**: JWT token required
4. **Authorization**: Role-based access control
5. **Unique Filenames**: Prevents conflicts with timestamp and userId

## Benefits of Hybrid Approach

### Base64 for Images
- ✅ Simple storage and retrieval
- ✅ No additional file system management
- ✅ Direct embedding in responses
- ✅ Good for small profile images

### GridFS for PDFs
- ✅ Efficient for larger files
- ✅ Streaming support
- ✅ Metadata storage
- ✅ Better performance for downloads
- ✅ Scalable storage solution

## Usage Examples

### Frontend Integration
```javascript
// Upload resume/image
const formData = new FormData();
formData.append('resume', file);

const response = await fetch('/api/v1/student-resume/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

// Display profile image (Base64)
if (data.type === 'profile_image') {
  imageElement.src = data.profileImageUrl;
}

// Download PDF resume
if (data.type === 'resume_pdf') {
  window.open(data.resumeLink, '_blank');
}
```

## Installation & Setup

1. **Install Dependencies**:
```bash
npm install mongodb
```

2. **Environment Variables**:
```env
MONGODB_URI=mongodb://localhost:27017/pms_database
```

3. **Server Initialization**:
The GridFS is automatically initialized when MongoDB connection is established.

## Error Handling

- **File Type Validation**: Returns 400 for invalid file types
- **Size Limits**: Returns 400 for files exceeding 10MB
- **GridFS Errors**: Proper error handling for upload/download failures
- **Authentication**: Returns 401 for unauthorized access
- **File Not Found**: Returns 404 for missing files

## Performance Considerations

1. **Base64 Images**: Stored in MongoDB document (good for small files)
2. **GridFS PDFs**: Streamed efficiently (good for large files)
3. **Memory Usage**: Multer uses memory storage for processing
4. **Indexing**: GridFS provides automatic indexing for file operations

## Maintenance

- **Cleanup**: Old files can be cleaned up using GridFS utilities
- **Monitoring**: File sizes and storage usage should be monitored
- **Backup**: GridFS files are included in MongoDB backups

This hybrid approach provides the best of both worlds - simplicity for small images and efficiency for larger documents.
