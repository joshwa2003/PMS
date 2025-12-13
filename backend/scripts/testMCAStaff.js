const mongoose = require('mongoose');
require('dotenv').config();

const Job = require('../models/Job');
const Department = require('../models/Department');
const PlacementStaffProfile = require('../models/PlacementStaffProfile');
const User = require('../models/User');

async function testMCAStaffFilter() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find R. SANKAR user
    const user = await User.findOne({ 
      firstName: 'R.',
      lastName: 'SANKAR'
    });
    
    if (!user) {
      console.log('❌ R. SANKAR user not found');
      return;
    }
    
    console.log('✅ Found user:', user.firstName, user.lastName, user.email);

    // Find staff profile
    const staffProfile = await PlacementStaffProfile.findOne({ userId: user._id });
    
    if (!staffProfile) {
      console.log('❌ Staff profile not found');
      return;
    }
    
    console.log('✅ Found staff profile:');
    console.log('   Department value:', staffProfile.department);
    console.log('   Type:', typeof staffProfile.department);

    // Find department by ID or code
    let department;
    
    // Try to find by ObjectId first
    try {
      if (mongoose.Types.ObjectId.isValid(staffProfile.department)) {
        department = await Department.findById(staffProfile.department);
        console.log('   Found by ObjectId');
      }
    } catch (err) {
      console.log('   Not a valid ObjectId, trying by code...');
    }
    
    // If not found by ID, try by code
    if (!department) {
      department = await Department.findOne({ code: staffProfile.department });
      if (department) {
        console.log('   Found by code');
      }
    }
    
    if (!department) {
      console.log('❌ Department not found for code:', staffProfile.department);
      console.log('\nAvailable departments:');
      const allDepts = await Department.find({}, 'name code');
      allDepts.forEach(d => console.log(`   - ${d.name} (${d.code})`));
      return;
    }
    
    console.log('✅ Found department:', department.name, '(', department.code, ')');
    console.log('   Department ID:', department._id);

    // Find jobs targeting this department
    const jobs = await Job.find({
      status: { $in: ['Active', 'Closed', 'Expired'] },
      $or: [
        { postingType: 'All Departments' },
        { targetDepartments: department._id },
        { 'eligibility.departments': department._id }
      ]
    }).populate('targetDepartments', 'name code')
      .populate('eligibility.departments', 'name code');

    console.log('\n✅ Found', jobs.length, 'jobs for', department.name);
    
    jobs.forEach((job, index) => {
      console.log(`\n${index + 1}. ${job.title}`);
      console.log('   Status:', job.status);
      console.log('   Posting Type:', job.postingType);
      console.log('   Target Departments:', job.targetDepartments?.map(d => d.name).join(', ') || 'None');
      console.log('   Eligibility Departments:', job.eligibility?.departments?.map(d => d.name).join(', ') || 'None');
    });

    await mongoose.disconnect();
    console.log('\n✅ Test completed');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

testMCAStaffFilter();
