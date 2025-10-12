const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import all models
const User = require('../models/User');
const Administrator = require('../models/Administrator');
const AdministratorProfile = require('../models/AdministratorProfile');
const Batch = require('../models/Batch');
const CourseCategory = require('../models/CourseCategory');
const Department = require('../models/Department');
const DepartmentHODProfile = require('../models/DepartmentHODProfile');
const ImportHistory = require('../models/ImportHistory');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const JobView = require('../models/JobView');
const OtherStaffProfile = require('../models/OtherStaffProfile');
const PasswordReset = require('../models/PasswordReset');
const PlacementDirectorProfile = require('../models/PlacementDirectorProfile');
const PlacementStaffProfile = require('../models/PlacementStaffProfile');
const Student = require('../models/Student');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pms';
    
    const uriForLogging = mongoURI.includes('@') 
      ? mongoURI.replace(/:([^:@]{1,})@/, ':****@') 
      : mongoURI;
    console.log(`🔗 Connecting to MongoDB: ${uriForLogging}`);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear all collections
const clearDatabase = async () => {
  try {
    console.log('🧹 Starting database cleanup...');
    
    // Clear all collections
    const collections = [
      { model: User, name: 'Users' },
      { model: Administrator, name: 'Administrators' },
      { model: AdministratorProfile, name: 'Administrator Profiles' },
      { model: Batch, name: 'Batches' },
      { model: CourseCategory, name: 'Course Categories' },
      { model: Department, name: 'Departments' },
      { model: DepartmentHODProfile, name: 'Department HOD Profiles' },
      { model: ImportHistory, name: 'Import History' },
      { model: Job, name: 'Jobs' },
      { model: JobApplication, name: 'Job Applications' },
      { model: JobView, name: 'Job Views' },
      { model: OtherStaffProfile, name: 'Other Staff Profiles' },
      { model: PasswordReset, name: 'Password Resets' },
      { model: PlacementDirectorProfile, name: 'Placement Director Profiles' },
      { model: PlacementStaffProfile, name: 'Placement Staff Profiles' },
      { model: Student, name: 'Students' }
    ];

    let totalDeleted = 0;
    
    for (const { model, name } of collections) {
      try {
        const result = await model.deleteMany({});
        console.log(`🗑️  Cleared ${name}: ${result.deletedCount} documents`);
        totalDeleted += result.deletedCount;
      } catch (error) {
        console.log(`⚠️  Could not clear ${name}: ${error.message}`);
      }
    }

    console.log(`\n✅ Database cleanup completed! Total documents deleted: ${totalDeleted}`);
    console.log('🎯 Database is now clean and ready for fresh data');
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    process.exit(1);
  }
};

// Run cleaner
const runCleaner = async () => {
  await connectDB();
  await clearDatabase();
  
  console.log('\n💡 Next steps:');
  console.log('   1. Run: npm run seed:users (to create the admin user)');
  console.log('   2. Start the server: npm run dev');
  console.log('   3. Login with: admin@saec.edu.in / Admin@123');
  
  process.exit(0);
};

// Check if this file is being run directly
if (require.main === module) {
  runCleaner();
}

module.exports = { clearDatabase };
