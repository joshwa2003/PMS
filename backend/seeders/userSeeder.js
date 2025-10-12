const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables from the parent directory (.env file is in backend/)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

// Clean user data - Only Administrator for fresh start
const dummyUsers = [
  // Single Admin User
  {
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@saec.edu.in',
    password: 'Admin@123',
    role: 'admin',
    department: 'ADMIN',
    phone: '9876543210',
    employeeId: 'ADMIN001',
    designation: 'System Administrator',
    isActive: true,
    isVerified: true,
    bio: 'System administrator with full access to the placement management system.'
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Use environment variable with fallback to local MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pms';
    
    // Log the connection attempt (without exposing sensitive credentials)
    const uriForLogging = mongoURI.includes('@') 
      ? mongoURI.replace(/:([^:@]{1,})@/, ':****@') 
      : mongoURI;
    console.log(`🔗 Attempting to connect to MongoDB: ${uriForLogging}`);
    
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MONGODB_URI not found in environment variables, using fallback: mongodb://localhost:27017/pms');
    }
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('💡 Troubleshooting tips:');
    console.error('   1. Make sure MongoDB is running locally or check your MONGODB_URI');
    console.error('   2. Verify the .env file exists in the backend directory');
    console.error('   3. Check if MONGODB_URI is properly set in the .env file');
    process.exit(1);
  }
};

// Seed users
const seedUsers = async () => {
  try {
    console.log('🌱 Starting user seeding process...');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create users with hashed passwords
    const usersToCreate = [];
    
    for (const userData of dummyUsers) {
      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      // Fix department field - move string value to departmentCode and set department to null
      const userDataFixed = { ...userData };
      if (userDataFixed.department && typeof userDataFixed.department === 'string') {
        userDataFixed.departmentCode = userDataFixed.department;
        userDataFixed.department = null;
      }
      
      usersToCreate.push({
        ...userDataFixed,
        password: hashedPassword,
        permissions: User.getRolePermissions(userDataFixed.role),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Insert users
    const createdUsers = await User.insertMany(usersToCreate);
    console.log(`✅ Successfully created ${createdUsers.length} users`);

    // Display summary
    const roleCount = {};
    createdUsers.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });

    console.log('\n📊 User Summary by Role:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} users`);
    });

    console.log('\n🔐 Default Login Credentials:');
    console.log('   Admin: admin@saec.edu.in / Admin@123');

    console.log('\n🎉 User seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

// Run seeder
const runSeeder = async () => {
  await connectDB();
  await seedUsers();
  process.exit(0);
};

// Check if this file is being run directly
if (require.main === module) {
  runSeeder();
}

module.exports = { seedUsers, dummyUsers };
