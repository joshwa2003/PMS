const CourseCategory = require('../models/CourseCategory');
const User = require('../models/User');

// Get all course categories
const getAllCourseCategories = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      isActive = '' 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get course categories with pagination
    const courseCategories = await CourseCategory.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCategories = await CourseCategory.countDocuments(filter);
    const totalPages = Math.ceil(totalCategories / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        courseCategories,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCategories,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching course categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course categories',
      error: error.message
    });
  }
};

// Get single course category
const getCourseCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const courseCategory = await CourseCategory.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
    
    if (!courseCategory) {
      return res.status(404).json({
        success: false,
        message: 'Course category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { courseCategory }
    });
  } catch (error) {
    console.error('Error fetching course category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course category',
      error: error.message
    });
  }
};

// Create new course category
const createCourseCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Course category name is required'
      });
    }

    // Check if course category already exists
    const existingCategory = await CourseCategory.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Course category with this name already exists'
      });
    }

    // Create new course category
    const courseCategory = new CourseCategory({
      name: name.trim(),
      description: description?.trim(),
      createdBy: userId
    });

    await courseCategory.save();

    // Populate the created category
    await courseCategory.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Course category created successfully',
      data: { courseCategory }
    });
  } catch (error) {
    console.error('Error creating course category:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Course category with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating course category',
      error: error.message
    });
  }
};

// Update course category
const updateCourseCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    const userId = req.user.id;

    // Find the course category
    const courseCategory = await CourseCategory.findById(id);
    
    if (!courseCategory) {
      return res.status(404).json({
        success: false,
        message: 'Course category not found'
      });
    }

    // Check if name is being changed and if it already exists
    if (name && name !== courseCategory.name) {
      const existingCategory = await CourseCategory.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Course category with this name already exists'
        });
      }
    }

    // Update fields
    if (name) courseCategory.name = name.trim();
    if (description !== undefined) courseCategory.description = description?.trim();
    if (isActive !== undefined) courseCategory.isActive = isActive;
    courseCategory.updatedBy = userId;

    await courseCategory.save();

    // Populate the updated category
    await courseCategory.populate('createdBy', 'firstName lastName email');
    await courseCategory.populate('updatedBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Course category updated successfully',
      data: { courseCategory }
    });
  } catch (error) {
    console.error('Error updating course category:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Course category with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating course category',
      error: error.message
    });
  }
};

// Delete course category
const deleteCourseCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const courseCategory = await CourseCategory.findById(id);
    
    if (!courseCategory) {
      return res.status(404).json({
        success: false,
        message: 'Course category not found'
      });
    }

    await CourseCategory.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Course category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course category',
      error: error.message
    });
  }
};

// Toggle course category status
const toggleCourseCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const courseCategory = await CourseCategory.findById(id);
    
    if (!courseCategory) {
      return res.status(404).json({
        success: false,
        message: 'Course category not found'
      });
    }

    courseCategory.isActive = !courseCategory.isActive;
    courseCategory.updatedBy = userId;
    
    await courseCategory.save();

    // Populate the updated category
    await courseCategory.populate('createdBy', 'firstName lastName email');
    await courseCategory.populate('updatedBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: `Course category ${courseCategory.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { courseCategory }
    });
  } catch (error) {
    console.error('Error toggling course category status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course category status',
      error: error.message
    });
  }
};

module.exports = {
  getAllCourseCategories,
  getCourseCategory,
  createCourseCategory,
  updateCourseCategory,
  deleteCourseCategory,
  toggleCourseCategoryStatus
};
