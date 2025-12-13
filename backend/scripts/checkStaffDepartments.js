const mongoose = require('mongoose');
const PlacementStaffProfile = require('../models/PlacementStaffProfile');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkDepartments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find R. SANKAR
    const sankarUser = await User.findOne({ email: 'rsankar@rsc.ac.in' });
    if (sankarUser) {
      const sankarProfile = await PlacementStaffProfile.findOne({ userId: sankarUser._id });
      console.log('👤 R. SANKAR (MCA):');
      console.log('   Department value:', sankarProfile?.department);
      console.log('   Type:', typeof sankarProfile?.department);
      console.log('   Is ObjectId?:', mongoose.Types.ObjectId.isValid(sankarProfile?.department));
    }

    console.log('');

    // Find PRINCY P
    const princyUser = await User.findOne({ email: 'princyp@rsc.ac.in' });
    if (princyUser) {
      const princyProfile = await PlacementStaffProfile.findOne({ userId: princyUser._id });
      console.log('👤 PRINCY P (MBA):');
      console.log('   Department value:', princyProfile?.department);
      console.log('   Type:', typeof princyProfile?.department);
      console.log('   Is ObjectId?:', mongoose.Types.ObjectId.isValid(princyProfile?.department));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDepartments();
