/**
 * Enhanced error handling for Placement Director Profile Controller
 * This file contains improved error handling functions that can be used
 * to enhance the original placementDirectorProfileController.js
 */

const PlacementDirectorProfile = require('../models/PlacementDirectorProfile');
const User = require('../models/User');

/**
 * Enhanced profile update function with better error handling
 * @param {Object} profile - The profile object to update
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Updated profile or error response
 */
const updateProfileWithErrorHandling = async (profile, req, res) => {
  try {
    // Update existing profile
    Object.keys(req.body).forEach(key => {
      if (key === 'name' && typeof req.body[key] === 'object') {
        profile.name = { ...profile.name, ...req.body[key] };
      } else if (key === 'contact' && typeof req.body[key] === 'object') {
        profile.contact = { ...profile.contact, ...req.body[key] };
        if (req.body[key].address && typeof req.body[key].address === 'object') {
          profile.contact.address = { ...profile.contact.address, ...req.body[key].address };
        }
      } else {
        profile[key] = req.body[key];
      }
    });
    
    // Set defaults for required fields if missing
    if (!profile.dateOfJoining) profile.dateOfJoining = new Date();
    if (!profile.designation) profile.designation = "Director";
    if (!profile.department) profile.department = "Placement Cell";

    const updatedProfile = await profile.save();
    
    return {
      success: true,
      profile: updatedProfile
    };
    
  } catch (saveError) {
    console.error('❌ Error saving profile:', saveError);
    
    // If it's a validation error, return more specific information
    if (saveError.name === 'ValidationError') {
      const validationErrors = Object.keys(saveError.errors).map(key => ({
        field: key,
        message: saveError.errors[key].message
      }));
      
      return {
        success: false,
        message: 'Profile validation failed',
        errors: validationErrors,
        statusCode: 400
      };
    }
    
    // Handle duplicate key errors
    if (saveError.code === 11000) {
      return {
        success: false,
        message: 'Profile with this information already exists',
        statusCode: 409
      };
    }
    
    // Handle other errors
    return {
      success: false,
      message: 'An error occurred while saving the profile',
      error: saveError.message,
      statusCode: 500
    };
  }
};

/**
 * Validate profile data before processing
 * @param {Object} profileData - Profile data to validate
 * @returns {Object} Validation result
 */
const validateProfileData = (profileData) => {
  const errors = [];
  
  // Check required fields
  if (!profileData.employeeId) {
    errors.push({ field: 'employeeId', message: 'Employee ID is required' });
  }
  
  if (!profileData.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  }
  
  if (!profileData.name || !profileData.name.firstName) {
    errors.push({ field: 'name.firstName', message: 'First name is required' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  updateProfileWithErrorHandling,
  validateProfileData
};
