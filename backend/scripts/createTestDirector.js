const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pms';
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

// Create test placement director
const createTestDirector = async () => {
  try {
    console.log('🔄 Creating test placement director...');

    // Check if director already exists
    const existingDirector = await User.findOne({ email: 'test.director@saec.edu.in' });
    if (existingDirector) {
      console.log('📋 Test director already exists, updating...');
      
      // Hash the default password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash('Director@123', saltRounds);
      
      // Update with default password and first login flag
      await User.findByIdAndUpdate(existingDirector._id, {
        password: hashedPassword,
        isFirstLogin: true,
        isActive: true,
        isVerified: true
      });
      
      console.log('✅ Updated existing test director');
    } else {
      // Hash the default password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash('Director@123', saltRounds);
      
      // Create new director
      const directorData = {
        firstName: 'Test',
        lastName: 'Director',
        email: 'test.director@saec.edu.in',
        password: hashedPassword,
        role: 'placement_director',
        phone: '9876543211',
        employeeId: 'DIR001',
        designation: 'Placement Director',
        isActive: true,
        isVerified: true,
        isFirstLogin: true, // This will force password reset
        permissions: User.getRolePermissions('placement_director'),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newDirector = await User.create(directorData);
      console.log('✅ Created new test placement director');
    }

    console.log('\n🔐 Test Login Credentials:');
    console.log('   Email: test.director@saec.edu.in');
    console.log('   Password: Director@123');
    console.log('   Role: placement_director');
    console.log('\n📝 This user will be forced to change password on first login');

  } catch (error) {
    console.error('❌ Error creating test director:', error);
    process.exit(1);
  }
};

// Run the script
const runScript = async () => {
  await connectDB();
  await createTestDirector();
  process.exit(0);
};

// Check if this file is being run directly
if (require.main === module) {
  runScript();
}

module.exports = { createTestDirector };
