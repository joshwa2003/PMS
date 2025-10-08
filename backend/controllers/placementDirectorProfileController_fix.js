// Fix for updateProfile function - add this to line 210 in the original file

    } else {
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
    }

    try {
      const updatedProfile = await profile.save();
      
      // Rest of the function remains the same...
    } catch (saveError) {
      console.error('❌ Error saving profile:', saveError);
      console.error('❌ Validation errors:', saveError.errors);
      
      // If it's a validation error, return more specific information
      if (saveError.name === 'ValidationError') {
        const validationErrors = Object.keys(saveError.errors).map(key => ({
          field: key,
          message: saveError.errors[key].message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Profile validation failed',
          errors: validationErrors
        });
      }
      
      throw saveError;
    }
