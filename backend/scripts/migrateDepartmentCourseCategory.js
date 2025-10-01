const mongoose = require('mongoose');
const Department = require('../models/Department');
const CourseCategory = require('../models/CourseCategory');

async function migrateCourseCategory() {
  try {
    await mongoose.connect('mongodb://localhost:27017/your_database_name', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find all departments where courseCategory is a string (invalid)
    const departments = await Department.find({
      courseCategory: { $type: 'string' }
    });

    if (departments.length === 0) {
      console.log('No departments with invalid courseCategory found.');
      return;
    }

    console.log(`Found ${departments.length} departments with invalid courseCategory.`);

    // Get unique invalid courseCategory string values
    const invalidCategories = [...new Set(departments.map(d => d.courseCategory))];

    console.log('Invalid courseCategory values:', invalidCategories);

    // Map to store string category to ObjectId
    const categoryMap = {};

    for (const categoryName of invalidCategories) {
      // Find existing CourseCategory by name
      let courseCategory = await CourseCategory.findOne({ name: categoryName });

      if (!courseCategory) {
        // Create new CourseCategory if not found
        courseCategory = new CourseCategory({
          name: categoryName,
          description: `Auto-created category for ${categoryName}`
        });
        await courseCategory.save();
        console.log(`Created new CourseCategory for "${categoryName}" with id ${courseCategory._id}`);
      } else {
        console.log(`Found existing CourseCategory for "${categoryName}" with id ${courseCategory._id}`);
      }

      categoryMap[categoryName] = courseCategory._id;
    }

    // Update departments with correct ObjectId references
    for (const department of departments) {
      const newCategoryId = categoryMap[department.courseCategory];
      if (newCategoryId) {
        department.courseCategory = newCategoryId;
        await department.save();
        console.log(`Updated Department "${department.name}" with new courseCategory ObjectId.`);
      } else {
        console.warn(`No mapping found for Department "${department.name}" courseCategory "${department.courseCategory}"`);
      }
    }

    console.log('Migration completed successfully.');
    process.exit(0);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateCourseCategory();
