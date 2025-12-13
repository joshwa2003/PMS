const mongoose = require('mongoose');
const PlacementStaffProfile = require('../models/PlacementStaffProfile');
const Department = require('../models/Department');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function fixAllStaff() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all placement staff profiles
    const profiles = await PlacementStaffProfile.find({});
    console.log(`📊 Found ${profiles.length} placement staff profiles\n`);

    let fixed = 0;
    let alreadyOk = 0;

    for (const profile of profiles) {
      const deptValue = profile.department;
      console.log(`👤 Checking profile ID: ${profile._id}`);
      console.log(`   Current department: ${deptValue} (Type: ${typeof deptValue})`);

      // Check if it's already an ObjectId string
      if (mongoose.Types.ObjectId.isValid(deptValue) && deptValue.length === 24) {
        console.log(`   ✅ Already ObjectId format\n`);
        alreadyOk++;
        continue;
      }

      // It's a code, need to convert
      console.log(`   ⚠️  Is a code, converting...`);
      
      // Find department by code
      const department = await Department.findOne({ code: deptValue });
      
      if (!department) {
        console.log(`   ❌ Department not found for code: ${deptValue}\n`);
        continue;
      }

      // Update using direct MongoDB update to bypass enum validation
      await mongoose.connection.collection('placementstaffprofiles').updateOne(
        { _id: profile._id },
        { $set: { department: department._id.toString() } }
      );

      console.log(`   ✅ Updated to: ${department._id.toString()} (${department.name})\n`);
      fixed++;
    }

    console.log('═══════════════════════════════════════');
    console.log(`✅ Fixed: ${fixed} profiles`);
    console.log(`✅ Already OK: ${alreadyOk} profiles`);
    console.log(`✅ Total: ${profiles.length} profiles`);
    console.log('═══════════════════════════════════════');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAllStaff();
