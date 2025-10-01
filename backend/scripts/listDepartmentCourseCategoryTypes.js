const mongoose = require('mongoose');
const Department = require('../models/Department');

async function listCourseCategoryTypes() {
  try {
    await mongoose.connect('mongodb://localhost:27017/your_database_name', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    const departments = await Department.find({}).select('name courseCategory').lean();

    const invalidDepartments = [];

    departments.forEach(dept => {
      const courseCategory = dept.courseCategory;
      if (!courseCategory || typeof courseCategory !== 'object' || !courseCategory._bsontype) {
        invalidDepartments.push({
          name: dept.name,
          courseCategory: courseCategory,
          type: typeof courseCategory
        });
      }
    });

    if (invalidDepartments.length === 0) {
      console.log('All departments have valid courseCategory ObjectId references.');
    } else {
      console.log('Departments with invalid courseCategory values:');
      console.table(invalidDepartments);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error listing department courseCategory types:', error);
    process.exit(1);
  }
}

listCourseCategoryTypes();
