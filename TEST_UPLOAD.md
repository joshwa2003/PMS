# Resume Upload Test Guide

## 🔧 **Backend Setup Complete**

### Routes Available:
1. **New Hybrid Endpoint**: `POST /api/v1/student-resume/upload`
2. **Legacy Compatibility**: `POST /api/v1/file-upload/resume` (redirects to hybrid system)

### Authorization Fixed:
- ✅ Using `requireStudent` middleware (same as other student routes)
- ✅ Proper role validation for 'student' users

## 🧪 **Testing Steps**

### 1. Start Backend Server
```bash
cd backend
npm start
```

### 2. Verify Server Startup
Look for these console messages:
- ✅ "Connected to MongoDB successfully"
- ✅ "GridFS initialized successfully"
- ✅ "PMS Backend Server running on port 5001"

### 3. Test Upload Functionality
1. Navigate to Student Profile → Resume Upload
2. Try uploading different file types:
   - **JPG/PNG Image**: Should show "Profile image uploaded successfully!"
   - **PDF Document**: Should show "Resume uploaded successfully!"

### 4. Expected Behavior

#### For Images (JPG/JPEG/PNG):
- File converted to Base64
- Stored in `profileImageUrl` field
- Immediate availability in profile
- Response: `{ type: 'profile_image', profileImageUrl: 'data:image/jpeg;base64,...' }`

#### For PDFs:
- File stored in GridFS
- Unique filename generated
- Streaming download capability
- Response: `{ type: 'resume_pdf', resumeLink: '/api/v1/student-resume/filename.pdf' }`

## 🔍 **Troubleshooting**

### If Still Getting 403 Error:
1. **Check User Role**: Ensure logged-in user has role 'student'
2. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R)
3. **Check Token**: Verify JWT token is valid and not expired
4. **Backend Logs**: Check server console for detailed error messages

### If GridFS Errors:
1. **MongoDB Connection**: Ensure MongoDB is running
2. **Database Permissions**: Check if user has write permissions
3. **GridFS Initialization**: Look for "GridFS initialized successfully" message

### If File Upload Fails:
1. **File Size**: Must be under 10MB
2. **File Type**: Only JPG, JPEG, PNG, PDF allowed
3. **Network**: Check if backend server is accessible

## 📋 **API Response Examples**

### Successful Image Upload:
```json
{
  "success": true,
  "data": {
    "type": "profile_image",
    "profileImageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
    "size": 1024000,
    "message": "Profile image updated successfully using Base64 encoding"
  }
}
```

### Successful PDF Upload:
```json
{
  "success": true,
  "data": {
    "type": "resume_pdf",
    "resumeLink": "/api/v1/student-resume/userId_resume_1696789123456.pdf",
    "resumeFilename": "userId_resume_1696789123456.pdf",
    "size": 2048000,
    "message": "Resume PDF uploaded successfully using GridFS"
  }
}
```

## 🎯 **Next Steps**

1. **Start Backend**: `npm start` in backend directory
2. **Test Upload**: Try both image and PDF uploads
3. **Verify Storage**: Check database for Base64 images and GridFS files
4. **Test Download**: Try downloading uploaded PDF files

The hybrid system is now ready and should handle both the new endpoint and legacy compatibility! 🚀
