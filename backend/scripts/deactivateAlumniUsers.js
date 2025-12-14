const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const User = require('../models/User');

// Load env vars
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const deactivateAlumniUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Find all alumni batches
        const alumniBatches = await Batch.find({ isGraduated: true });
        console.log(`Found ${alumniBatches.length} alumni batches.`);

        if (alumniBatches.length === 0) {
            console.log('No alumni batches found.');
            process.exit(0);
        }

        const batchIds = alumniBatches.map(b => b._id);

        // 2. Find students in these batches
        const students = await Student.find({ batchId: { $in: batchIds } }).select('userId');
        console.log(`Found ${students.length} students in alumni batches.`);

        const userIds = students.map(s => s.userId).filter(id => id); // filter out nulls

        if (userIds.length > 0) {
            // 3. Deactivate users
            const result = await User.updateMany(
                { _id: { $in: userIds } },
                { $set: { isActive: false } }
            );
            console.log(`Deactivated ${result.modifiedCount} users.`);
        } else {
            console.log('No student users found to deactivate.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

deactivateAlumniUsers();
