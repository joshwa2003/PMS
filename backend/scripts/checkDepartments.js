const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Department = require('../models/Department');
const CourseCategory = require('../models/CourseCategory');
const User = require('../models/User');

const checkAndCreateDepartments = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check existing departments
    const existingDepartments = await Department.find({}, 'name code');
    console.log('\n📋 Existing Departments:');
    existingDepartments.forEach(dept => {
      console.log(`  - ${dept.name} (${dept.code})`);
    });

    // Check if MCA department exists
    const mcaDept = await Department.findOne({ code: 'MCA' });
    
    if (!mcaDept) {
      console.log('\n⚠️  MCA Department not found. Creating...');
      
      // Find or create PG course category
      let pgCategory = await CourseCategory.findOne({ name: 'Post Graduate' });
      
      if (!pgCategory) {
        console.log('📝 Creating Post Graduate course category...');
        // Find an admin user to set as creator
        const adminUser = await User.findOne({ role: 'admin' });
        
        if (!adminUser) {
          console.error('❌ No admin user found. Please create an admin user first.');
          process.exit(1);
        }
        
        pgCategory = await CourseCategory.create({
          name: 'Post Graduate',
          description: 'Post Graduate Programs',
          createdBy: adminUser._id
        });
        console.log('✅ Post Graduate category created');
      }
      
      // Find an admin user to set as creator
      const adminUser = await User.findOne({ role: 'admin' });
      
      if (!adminUser) {
        console.error('❌ No admin user found. Please create an admin user first.');
        process.exit(1);
      }
      
      // Create MCA department
      const newMCADept = await Department.create({
        name: 'Master of Computer Applications',
        code: 'MCA',
        description: 'Master of Computer Applications - Post Graduate Program',
        courseCategory: pgCategory._id,
        isActive: true,
        createdBy: adminUser._id
      });
      
      console.log('✅ MCA Department created:', {
        name: newMCADept.name,
        code: newMCADept.code,
        _id: newMCADept._id
      });
    } else {
      console.log('\n✅ MCA Department already exists:', {
        name: mcaDept.name,
        code: mcaDept.code,
        _id: mcaDept._id
      });
    }

    // Check if MBA department exists
    const mbaDept = await Department.findOne({ code: 'MBA' });
    
    if (!mbaDept) {
      console.log('\n⚠️  MBA Department not found. Creating...');
      
      // Find or create PG course category
      let pgCategory = await CourseCategory.findOne({ name: 'Post Graduate' });
      
      if (!pgCategory) {
        console.log('📝 Creating Post Graduate course category...');
        const adminUser = await User.findOne({ role: 'admin' });
        
        if (!adminUser) {
          console.error('❌ No admin user found. Please create an admin user first.');
          process.exit(1);
        }
        
        pgCategory = await CourseCategory.create({
          name: 'Post Graduate',
          description: 'Post Graduate Programs',
          createdBy: adminUser._id
        });
        console.log('✅ Post Graduate category created');
      }
      
      const adminUser = await User.findOne({ role: 'admin' });
      
      // Create MBA department
      const newMBADept = await Department.create({
        name: 'Master of Business Administration',
        code: 'MBA',
        description: 'Master of Business Administration - Post Graduate Program',
        courseCategory: pgCategory._id,
        isActive: true,
        createdBy: adminUser._id
      });
      
      console.log('✅ MBA Department created:', {
        name: newMBADept.name,
        code: newMBADept.code,
        _id: newMBADept._id
      });
    } else {
      console.log('\n✅ MBA Department already exists:', {
        name: mbaDept.name,
        code: mbaDept.code,
        _id: mbaDept._id
      });
    }

    // List all departments again
    const allDepartments = await Department.find({}, 'name code');
    console.log('\n📋 All Departments After Update:');
    allDepartments.forEach(dept => {
      console.log(`  - ${dept.name} (${dept.code})`);
    });

    console.log('\n✅ Department check completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkAndCreateDepartments();
