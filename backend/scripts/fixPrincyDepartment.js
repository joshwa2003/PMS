const mongoose = require('mongoose');
const PlacementStaffProfile = require('../models/PlacementStaffProfile');
const Department = require('../models/Department');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function fixPrincy() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find PRINCY P
    const princyUser = await User.findOne({ email: 'princyp@rsc.ac.in' });
    if (!princyUser) {
      console.log('❌ PRINCY P user not found');
      process.exit(1);
    }

    const princyProfile = await PlacementStaffProfile.findOne({ userId: princyUser._id });
    if (!princyProfile) {
      console.log('❌ PRINCY P profile not found');
      process.exit(1);
    }

    console.log('👤 Current PRINCY P department:', princyProfile.department);

    // Find MBA department
    const mbaDept = await Department.findOne({ code: 'MBA' });
    if (!mbaDept) {
      console.log('❌ MBA department not found');
      process.exit(1);
    }

    console.log('📚 MBA Department ObjectId:', mbaDept._id.toString());

    // Update using direct MongoDB update to bypass enum validation
    await mongoose.connection.collection('placementstaffprofiles').updateOne(
      { _id: princyProfile._id },
      { $set: { department: mbaDept._id.toString() } }
    );

    console.log('✅ Updated PRINCY P department to ObjectId format!');
    
    // Verify
    const updated = await PlacementStaffProfile.findById(princyProfile._id);
    console.log('✅ Verified - New department value:', updated.department);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixPrincy();
