const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let gfsBucket;

// Initialize GridFS bucket
const initGridFS = () => {
  const conn = mongoose.connection;
  
  if (conn.readyState === 1) {
    // Connection is already open
    gfsBucket = new GridFSBucket(conn.db, {
      bucketName: 'uploads'
    });
    console.log('GridFS initialized successfully');
  } else {
    // Wait for connection to open
    conn.once('open', () => {
      gfsBucket = new GridFSBucket(conn.db, {
        bucketName: 'uploads'
      });
      console.log('GridFS initialized successfully');
    });
  }
};

// Get GridFS bucket instance
const getGridFSBucket = () => {
  if (!gfsBucket) {
    throw new Error('GridFS not initialized. Call initGridFS() first.');
  }
  return gfsBucket;
};

// Check if file exists in GridFS
const fileExists = async (filename) => {
  try {
    const bucket = getGridFSBucket();
    const files = await bucket.find({ filename }).toArray();
    return files.length > 0;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
};

// Delete file from GridFS
const deleteFile = async (filename) => {
  try {
    const bucket = getGridFSBucket();
    const files = await bucket.find({ filename }).toArray();
    
    if (files.length > 0) {
      await bucket.delete(files[0]._id);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Get file stream from GridFS
const getFileStream = (filename) => {
  try {
    const bucket = getGridFSBucket();
    return bucket.openDownloadStreamByName(filename);
  } catch (error) {
    console.error('Error getting file stream:', error);
    throw error;
  }
};

// Get file info from GridFS
const getFileInfo = async (filename) => {
  try {
    const bucket = getGridFSBucket();
    const files = await bucket.find({ filename }).toArray();
    return files.length > 0 ? files[0] : null;
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
};

module.exports = {
  initGridFS,
  getGridFSBucket,
  fileExists,
  deleteFile,
  getFileStream,
  getFileInfo
};
