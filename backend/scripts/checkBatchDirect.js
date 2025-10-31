require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Batch = require('../models/Batch');

const checkBatch = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const batch = await Batch.findById('68fc98a6c596d57bbe49908d');
    console.log('\n📊 Batch Document:');
    console.log(JSON.stringify(batch, null, 2));

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkBatch();
