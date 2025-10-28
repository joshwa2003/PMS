const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const nuclearResetDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Try multiple possible database connections
    const possibleURIs = [
      process.env.MONGODB_URI,
      'mongodb://localhost:27017/pms_database',
      'mongodb://localhost:27017/pms',
      'mongodb://127.0.0.1:27017/pms_database',
      'mongodb://127.0.0.1:27017/pms'
    ];
    
    let connection = null;
    let connectedURI = null;
    
    for (const uri of possibleURIs) {
      if (!uri) continue;
      try {
        console.log(`🔍 Trying to connect to: ${uri}`);
        connection = await mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        connectedURI = uri;
        console.log(`✅ Connected successfully to: ${uri}`);
        break;
      } catch (error) {
        console.log(`❌ Failed to connect to: ${uri}`);
        continue;
      }
    }
    
    if (!connection) {
      throw new Error('Could not connect to any MongoDB database');
    }
    
    console.log(`🎯 Using database: ${connectedURI}`);
    
    // Get the database name from the connection
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📋 Database name: ${dbName}`);
    
    console.log('💣 Starting NUCLEAR database reset...');
    console.log('⚠️  This will DROP THE ENTIRE DATABASE!');
    
    // Get the database instance
    const db = mongoose.connection.db;
    
    // Get all collection names
    const collections = await db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections in ${dbName}:`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    // Method 1: Drop each collection
    console.log('\n🗑️  Method 1: Dropping each collection...');
    for (const collection of collections) {
      try {
        await db.dropCollection(collection.name);
        console.log(`🗑️  DROPPED: ${collection.name}`);
      } catch (error) {
        console.log(`⚠️  Could not drop ${collection.name}: ${error.message}`);
      }
    }
    
    // Method 2: Drop the entire database
    console.log('\n💣 Method 2: Dropping entire database...');
    try {
      await db.dropDatabase();
      console.log('💥 ENTIRE DATABASE DROPPED!');
    } catch (error) {
      console.log(`⚠️  Could not drop database: ${error.message}`);
    }
    
    // Wait for operations to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reconnect to ensure clean state
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
    console.log('🔄 Reconnecting to create fresh admin...');
    await mongoose.connect(connectedURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Reconnected to MongoDB');
    
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
    
    console.log('\n🎉 NUCLEAR Database reset completed successfully!');
    console.log('\n🔐 Admin Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n📊 Database Status:');
    console.log('   💥 ENTIRE DATABASE DROPPED and recreated');
    console.log('   ✅ Fresh admin account created');
    console.log('   ✅ Database is completely clean');
    
    // Get final counts to verify
    const userCount = await User.countDocuments();
    
    console.log('\n📈 Final Verification:');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Users: ${userCount} (should be 1 - admin only)`);
    
    // List all collections after reset
    const finalCollections = await db.listCollections().toArray();
    console.log(`   Collections: ${finalCollections.length}`);
    finalCollections.forEach(col => {
      console.log(`     - ${col.name}`);
    });
    
    if (userCount === 1) {
      console.log('✅ Database NUCLEAR reset verification PASSED!');
    } else {
      console.log('⚠️  Database NUCLEAR reset verification WARNING');
    }
    
  } catch (error) {
    console.error('❌ Error during NUCLEAR database reset:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
console.log('🚨🚨🚨 NUCLEAR WARNING: This will COMPLETELY DESTROY the database! 🚨🚨🚨');
console.log('🚨 THE ENTIRE DATABASE will be DROPPED!');
console.log('🚨 This will try multiple database connections to ensure complete wipe!');
console.log('🚨 Starting in 3 seconds...');

setTimeout(() => {
  nuclearResetDatabase();
}, 3000);
