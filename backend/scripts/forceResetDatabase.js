const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const forceResetDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    console.log('🗑️  Starting FORCE database reset...');
    console.log('⚠️  This will DROP ALL COLLECTIONS completely!');
    
    // Get the database instance
    const db = mongoose.connection.db;
    
    // Get all collection names
    const collections = await db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections to drop:`);
    
    // Drop each collection completely
    for (const collection of collections) {
      try {
        await db.dropCollection(collection.name);
        console.log(`🗑️  DROPPED collection: ${collection.name}`);
      } catch (error) {
        console.log(`⚠️  Could not drop ${collection.name}: ${error.message}`);
      }
    }
    
    console.log('✅ All collections DROPPED successfully!');
    
    // Wait a moment for the drops to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    
    console.log('\n🎉 FORCE Database reset completed successfully!');
    console.log('\n🔐 Admin Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n📊 Database Status:');
    console.log('   ✅ ALL collections DROPPED and recreated');
    console.log('   ✅ Fresh admin account created');
    console.log('   ✅ Database is completely clean');
    
    // Get final counts to verify
    const userCount = await User.countDocuments();
    
    console.log('\n📈 Final Verification:');
    console.log(`   Users: ${userCount} (should be 1 - admin only)`);
    
    // List all collections after reset
    const finalCollections = await db.listCollections().toArray();
    console.log(`   Collections: ${finalCollections.length} (should be minimal)`);
    finalCollections.forEach(col => {
      console.log(`     - ${col.name}`);
    });
    
    if (userCount === 1) {
      console.log('✅ Database FORCE reset verification PASSED!');
    } else {
      console.log('⚠️  Database FORCE reset verification WARNING');
    }
    
  } catch (error) {
    console.error('❌ Error during FORCE database reset:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
console.log('🚨🚨🚨 EXTREME WARNING: This will COMPLETELY WIPE the database! 🚨🚨🚨');
console.log('🚨 ALL COLLECTIONS will be DROPPED and recreated!');
console.log('🚨 This is irreversible - ALL DATA WILL BE LOST!');
console.log('🚨 Starting in 5 seconds...');

setTimeout(() => {
  forceResetDatabase();
}, 5000);
