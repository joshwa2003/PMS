const mongoose = require('mongoose');
const PlacementStaffProfile = require('../models/PlacementStaffProfile');
const Department = require('../models/Department');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function fixDepartments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all placement staff profiles
    const profiles = await PlacementStaffProfile.find({});
    console.log(`📊 Found ${profiles.length} placement staff profiles`);

    for (const profile of profiles) {
      console.log(`\n👤 Checking ${profile.name?.firstName} ${profile.name?.lastName}`);
      console.log(`   Current department value: ${profile.department} (Type: ${typeof profile.department})`);

      // Check if department is a string code
      if (typeof profile.department === 'string' && !mongoose.Types.ObjectId.isValid(profile.department)) {
        console.log(`   ⚠️  Department is a string code, converting to ObjectId...`);
        
        // Find department by code
        const department = await Department.findOne({ code: profile.department });
        
        if (department) {
          // Update to ObjectId
          profile.department = department._id;
          await profile.save();
          console.log(`   ✅ Updated to ObjectId: ${department._id} (${department.name})`);
        } else {
          console.log(`   ❌ Department not found for code: ${profile.department}`);
        }
      } else if (mongoose.Types.ObjectId.isValid(profile.department)) {
        const dept = await Department.findById(profile.department);
        console.log(`   ✅ Already an ObjectId: ${dept?.name || 'Unknown'}`);
      }
    }

    console.log('\n✅ All profiles checked and updated!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixDepartments();
