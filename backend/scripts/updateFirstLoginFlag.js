const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

// Staff roles that should have first login flag
const STAFF_ROLES = ['placement_staff', 'department_hod', 'other_staff'];

// Default passwords that indicate first-time login
const DEFAULT_PASSWORDS = ['Staff@123', 'HOD@123', 'Director@123'];

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

// Update first login flag for staff users
const updateFirstLoginFlag = async () => {
  try {
    console.log('🔄 Updating first login flags for staff users...');

    // Find all staff users who might need first login setup
    const staffUsers = await User.find({
      role: { $in: STAFF_ROLES },
      isFirstLogin: { $ne: false } // Users who haven't completed first login
    });

    console.log(`📊 Found ${staffUsers.length} staff users to check`);

    let updatedCount = 0;

    for (const user of staffUsers) {
      // Check if user has default password or needs first login
      const needsFirstLogin = user.isFirstLogin !== false;
      
      if (needsFirstLogin) {
        await User.findByIdAndUpdate(user._id, {
          isFirstLogin: true
        });
        updatedCount++;
        console.log(`✅ Updated ${user.email} (${user.role}) - isFirstLogin: true`);
      }
    }

    console.log(`\n🎉 Updated ${updatedCount} staff users with first login flag`);
    
    // Display summary
    const summary = await User.aggregate([
      {
        $match: {
          role: { $in: STAFF_ROLES }
        }
      },
      {
        $group: {
          _id: '$role',
          total: { $sum: 1 },
          needsFirstLogin: {
            $sum: {
              $cond: [{ $eq: ['$isFirstLogin', true] }, 1, 0]
            }
          }
        }
      }
    ]);

    console.log('\n📊 Staff Users Summary:');
    summary.forEach(item => {
      console.log(`   ${item._id}: ${item.needsFirstLogin}/${item.total} need first login`);
    });

  } catch (error) {
    console.error('❌ Error updating first login flags:', error);
    process.exit(1);
  }
};

// Run the update
const runUpdate = async () => {
  await connectDB();
  await updateFirstLoginFlag();
  process.exit(0);
};

// Check if this file is being run directly
if (require.main === module) {
  runUpdate();
}

module.exports = { updateFirstLoginFlag };
