const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const resetAdminPassword = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Admin email and new password
    const adminEmail = 'admin@saec.edu.in';
    const newPassword = 'Admin@123'; // You can change this to any password you want
    
    console.log(`🔑 New password will be: ${newPassword}`);
    
    console.log(`🔍 Looking for admin user: ${adminEmail}`);
    
    // Find the admin user
    const adminUser = await User.findOne({ 
      email: adminEmail,
      role: 'admin'
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      console.log('📝 Creating new admin user...');
      
      // Create new admin user if not exists
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      const newAdmin = new User({
        firstName: 'System',
        lastName: 'Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        department: 'ADMIN',
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await newAdmin.save();
      console.log('✅ New admin user created successfully!');
    } else {
      console.log('✅ Admin user found');
      console.log(`📝 Resetting password for: ${adminUser.firstName} ${adminUser.lastName}`);
      
      // Set the plain password - let the pre-save middleware handle hashing
      console.log('🔐 Setting password (will be hashed by middleware)...');
      
      // Update the password (plain text - middleware will hash it)
      adminUser.password = newPassword;
      adminUser.updatedAt = new Date();
      
      await adminUser.save();
      console.log('✅ Admin password reset successfully!');
      
      // Verify the saved password
      const savedUser = await User.findOne({ email: adminEmail }).select('+password');
      const finalTest = await bcrypt.compare(newPassword, savedUser.password);
      console.log(`🔍 Final verification: ${finalTest}`);
    }
    
    console.log('\n🔐 Admin Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${newPassword}`);
    console.log('\n💡 You can now login to the admin panel with these credentials.');
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error.message);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
resetAdminPassword();
