const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for migration');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Migration function
const migrateDepartmentData = async () => {
  try {
    console.log('Starting department data migration...');

    // Get all departments to create a mapping
    const departments = await Department.find({});
    const departmentMap = {};
    
    departments.forEach(dept => {
      departmentMap[dept._id.toString()] = dept.code;
    });

    console.log('Department mapping:', departmentMap);

    // Find all users with ObjectId department fields
    const usersWithObjectIdDepartments = await User.find({
      department: { $exists: true, $ne: null }
    });

    console.log(`Found ${usersWithObjectIdDepartments.length} users to check`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of usersWithObjectIdDepartments) {
      const departmentValue = user.department;
      
      // Check if department is an ObjectId (24 character hex string)
      if (typeof departmentValue === 'string' && departmentValue.length === 24 && /^[0-9a-fA-F]{24}$/.test(departmentValue)) {
        const departmentCode = departmentMap[departmentValue];
        
        if (departmentCode) {
          // Update user with department code
          await User.findByIdAndUpdate(user._id, {
            department: departmentCode
          });
          
          console.log(`Migrated user ${user.email}: ${departmentValue} -> ${departmentCode}`);
          migratedCount++;
        } else {
          console.log(`Warning: No department code found for ObjectId ${departmentValue} (user: ${user.email})`);
          // Set to 'OTHER' as fallback
          await User.findByIdAndUpdate(user._id, {
            department: 'OTHER'
          });
          migratedCount++;
        }
      } else {
        // Department is already a code, skip
        console.log(`Skipped user ${user.email}: department already a code (${departmentValue})`);
        skippedCount++;
      }
    }

    console.log(`Migration completed:`);
    console.log(`- Migrated: ${migratedCount} users`);
    console.log(`- Skipped: ${skippedCount} users`);

  } catch (error) {
    console.error('Migration error:', error);
  }
};

// Run migration
const runMigration = async () => {
  await connectDB();
  await migrateDepartmentData();
  await mongoose.connection.close();
  console.log('Migration completed and database connection closed');
  process.exit(0);
};

// Execute if run directly
if (require.main === module) {
  runMigration();
}

module.exports = { migrateDepartmentData };
