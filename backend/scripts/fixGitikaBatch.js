require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Batch = require('../models/Batch');
const Department = require('../models/Department');

const fixGitikaBatch = async () => {
  try {
    console.log('🔧 Fixing Gitika\'s batch...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const batchId = '68fc98a6c596d57bbe49908d';
    const batch = await Batch.findById(batchId).populate('department');

    if (!batch) {
      console.log('❌ Batch not found');
      await mongoose.connection.close();
      return;
    }

    console.log('\n📊 Current Batch Data:');
    console.log('   ID:', batch._id);
    console.log('   Name:', batch.name);
    console.log('   Batch Code:', batch.batchCode);
    console.log('   Year:', batch.year);
    console.log('   Department:', batch.department ? batch.department.name : 'NULL');

    // Update batch with proper name and year if missing
    let updated = false;
    
    if (!batch.year && batch.batchCode) {
      // Extract year from batchCode (e.g., "2025-2027" -> 2025)
      const yearMatch = batch.batchCode.match(/^(\d{4})/);
      if (yearMatch) {
        batch.year = parseInt(yearMatch[1]);
        console.log('\n🔄 Setting batch year to:', batch.year);
        updated = true;
      }
    }
    
    if (!batch.name) {
      const year = batch.year || new Date().getFullYear();
      const deptCode = batch.department ? batch.department.code : 'UNKNOWN';
      batch.name = `${deptCode} ${year}`;
      
      console.log('🔄 Setting batch name to:', batch.name);
      updated = true;
    }
    
    if (updated) {
      await batch.save();
      console.log('✅ Batch updated successfully');
    } else {
      console.log('\n✅ Batch already has name and year');
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixGitikaBatch();
