require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
const Department = require('../models/Department');
const Batch = require('../models/Batch');

const checkGitikaProfile = async () => {
  try {
    console.log('🔍 Checking Gitika Goyal profile...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find Gitika's user account
    const user = await User.findOne({ 
      $or: [
        { email: /gitika/i },
        { firstName: /gitika/i }
      ]
    });

    if (!user) {
      console.log('❌ Gitika user not found');
      await mongoose.connection.close();
      return;
    }

    console.log('\n👤 User Info:');
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   User ID: ${user._id}`);

    // Find student profile
    const student = await Student.findOne({ userId: user._id })
      .populate('batchId');

    if (!student) {
      console.log('\n❌ Student profile not found');
      await mongoose.connection.close();
      return;
    }

    console.log('\n📚 Student Info:');
    console.log(`   Student ID: ${student.studentId}`);
    console.log(`   Academic Department (string): ${student.academic?.department || 'NOT SET'}`);
    console.log(`   Batch: ${student.batchId ? student.batchId.name : 'NOT SET'}`);
    console.log(`   Batch ID: ${student.batchId ? student.batchId._id : 'NULL'}`);

    if (student.batchId) {
      const batch = await Batch.findById(student.batchId).populate('department');
      console.log('\n🎓 Batch Info:');
      console.log(`   Batch Name: ${batch.name}`);
      console.log(`   Batch Department: ${batch.department ? batch.department.name : 'NOT SET'}`);
      console.log(`   Batch Department ID: ${batch.department ? batch.department._id : 'NULL'}`);
    }

    // Check all departments
    console.log('\n📋 All Departments:');
    const departments = await Department.find({});
    departments.forEach(dept => {
      console.log(`   - ${dept.name} (${dept.code}) - ID: ${dept._id}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkGitikaProfile();
