const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const verifyAdmin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Find the admin user
    const adminUser = await User.findOne({ 
      email: 'admin@saec.edu.in',
      role: 'admin'
    }).select('+password');
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log(`   Name: ${adminUser.fullName}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Active: ${adminUser.isActive}`);
    console.log(`   Verified: ${adminUser.isVerified}`);
    
    // Test password
    const testPassword = 'Admin@123';
    const isPasswordValid = await adminUser.comparePassword(testPassword);
    
    console.log(`\n🔐 Password Test:`);
    console.log(`   Test Password: ${testPassword}`);
    console.log(`   Password Valid: ${isPasswordValid ? '✅ YES' : '❌ NO'}`);
    
    if (isPasswordValid) {
      console.log('\n🎉 Admin account is ready for login!');
    } else {
      console.log('\n❌ Admin password verification failed!');
    }
    
    // Count all users
    const totalUsers = await User.countDocuments();
    console.log(`\n📊 Total users in database: ${totalUsers}`);
    
  } catch (error) {
    console.error('❌ Error verifying admin:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

verifyAdmin();
