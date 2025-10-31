require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const JobApplication = require('../models/JobApplication');
const Student = require('../models/Student');
const Department = require('../models/Department');
const Batch = require('../models/Batch');

const fixJobApplicationDepartments = async () => {
  try {
    console.log('🔧 Starting to fix job application departments...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all job applications
    const applications = await JobApplication.find({})
      .populate('student')
      .populate('department');

    console.log(`📊 Found ${applications.length} job applications to check`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const app of applications) {
      try {
        if (!app.student) {
          console.log(`⚠️ Application ${app._id} has no student, skipping`);
          continue;
        }

        let correctDepartment = null;

        // Student model doesn't have department as ObjectId, only as string in academic.department
        // So we need to get department from batch
        if (app.student.batchId) {
          const batch = await Batch.findById(app.student.batchId).populate('department');
          if (batch && batch.department) {
            correctDepartment = batch.department;
            console.log(`   Found department from batch: ${correctDepartment.name}`);
          }
        }
        
        // If still not found, try to find by department code from academic.department string
        if (!correctDepartment && app.student.academic?.department) {
          correctDepartment = await Department.findOne({ code: app.student.academic.department });
          if (correctDepartment) {
            console.log(`   Found department from academic.department code: ${correctDepartment.name}`);
          }
        }

        if (!correctDepartment) {
          console.log(`⚠️ Could not find department for student ${app.student.studentId}`);
          errorCount++;
          continue;
        }

        // Check if department needs updating
        const currentDeptId = app.department?._id?.toString() || app.department?.toString();
        const correctDeptId = correctDepartment._id.toString();

        if (currentDeptId !== correctDeptId) {
          console.log(`🔄 Updating application for student ${app.student.studentId}`);
          console.log(`   From: ${app.department?.name || 'NULL'} (${currentDeptId})`);
          console.log(`   To: ${correctDepartment.name} (${correctDeptId})`);

          app.department = correctDepartment._id;
          await app.save();
          fixedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing application ${app._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n✅ Fix completed!');
    console.log(`📊 Statistics:`);
    console.log(`   - Total applications: ${applications.length}`);
    console.log(`   - Fixed: ${fixedCount}`);
    console.log(`   - Errors: ${errorCount}`);
    console.log(`   - Already correct: ${applications.length - fixedCount - errorCount}`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
fixJobApplicationDepartments();
