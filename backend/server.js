const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const studentRoutes = require('./routes/students');
const studentManagementRoutes = require('./routes/studentManagement');
const administratorRoutes = require('./routes/administrators');
const administratorProfileRoutes = require('./routes/administratorProfiles');
const placementDirectorProfileRoutes = require('./routes/placementDirectorProfiles');
const placementStaffProfileRoutes = require('./routes/placementStaffProfiles');
const departmentHODProfileRoutes = require('./routes/departmentHODProfiles');

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const resumesDir = path.join(uploadsDir, 'resumes');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir);
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Routes - with fallback for API_VERSION
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/students`, studentRoutes);
app.use(`/api/${API_VERSION}/student-management`, studentManagementRoutes);
app.use(`/api/${API_VERSION}/administrators`, administratorRoutes);
app.use(`/api/${API_VERSION}/administrator-profiles`, administratorProfileRoutes);
app.use(`/api/${API_VERSION}/placement-director-profiles`, placementDirectorProfileRoutes);
app.use(`/api/${API_VERSION}/placement-staff-profiles`, placementStaffProfileRoutes);
app.use(`/api/${API_VERSION}/department-hod-profiles`, departmentHODProfileRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'PMS Backend Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Placement Management System API',
    version: API_VERSION,
    documentation: '/api/docs'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global Error:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 PMS Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
