const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

require('dotenv').config();

const resetDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    console.log('🗑️  Starting database reset...');
    
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
    
    // Delete all data from each collection
    for (const collection of collections) {
      try {
        const deleteResult = await collection.model.deleteMany({});
        console.log(`🗑️  Cleared ${collection.name}: ${deleteResult.deletedCount} documents deleted`);
      } catch (error) {
        console.log(`⚠️  Warning: Could not clear ${collection.name}: ${error.message}`);
      }
    }
    
    console.log('✅ All collections cleared successfully!');
    
    // Create fresh admin account
    console.log('👤 Creating fresh admin account...');
    
    const adminEmail = 'admin@saec.edu.in';
    const adminPassword = 'Admin@123';
    
    // Create the admin user (let pre-save middleware hash the password)
    const adminUser = new User({
      firstName: 'System',
      lastName: 'Administrator',
      email: adminEmail,
      password: adminPassword, // Plain password - middleware will hash it
      role: 'admin',
      department: null, // Admin doesn't need a department reference
      departmentCode: 'ADMIN', // Use departmentCode for backward compatibility
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    
    // Verify the admin user was created correctly
    const verifyAdmin = await User.findOne({ email: adminEmail }).select('+password');
    const passwordTest = await verifyAdmin.comparePassword(adminPassword);
    
    if (passwordTest) {
      console.log('✅ Admin password verification successful!');
    } else {
      console.log('❌ Admin password verification failed!');
    }
    
    console.log('\n🎉 Database reset completed successfully!');
    console.log('\n🔐 Admin Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n📊 Database Status:');
    console.log('   ✅ All old data cleared');
    console.log('   ✅ Fresh admin account created');
    console.log('   ✅ Ready for fresh start');
    
    // Get final counts to verify
    const userCount = await User.countDocuments();
    const studentCount = await Student.countDocuments();
    const jobCount = await Job.countDocuments();
    
    console.log('\n📈 Final Verification:');
    console.log(`   Users: ${userCount} (should be 1 - admin only)`);
    console.log(`   Students: ${studentCount} (should be 0)`);
    console.log(`   Jobs: ${jobCount} (should be 0)`);
    
    if (userCount === 1 && studentCount === 0 && jobCount === 0) {
      console.log('✅ Database reset verification PASSED!');
    } else {
      console.log('⚠️  Database reset verification WARNING - some data may remain');
    }
    
  } catch (error) {
    console.error('❌ Error during database reset:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
console.log('🚨 WARNING: This will DELETE ALL DATA from the database!');
console.log('🚨 Only the admin account will remain after this operation.');
console.log('🚨 Starting in 3 seconds...');

setTimeout(() => {
  resetDatabase();
}, 3000);
