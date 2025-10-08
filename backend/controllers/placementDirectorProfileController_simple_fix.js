// Simple fix for updateProfile function
exports.updateProfile = async (req, res) => {
  try {
    console.log('🔍 Update profile request received');
    console.log('🔍 Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 User ID:', req.user._id);

    const userId = req.user._id;
    
    // Find existing profile or create new one
    let profile = await PlacementDirectorProfile.findByUserId(userId);
    
    if (!profile) {
      console.log('🔍 Creating new profile for user:', userId);
      // Create new profile with required defaults
      const profileData = {
        userId,
        employeeId: req.body.employeeId || `PD${Date.now().toString().slice(-4)}`,
        name: req.body.name || { firstName: 'Director', lastName: 'Placement' },
        email: req.body.email || req.user.email,
        mobileNumber: req.body.mobileNumber || '1234567890',
        gender: req.body.gender || 'Other',
        role: 'placement_director',
        department: req.body.department || 'Placement Cell',
        designation: req.body.designation || 'Director',
        dateOfJoining: req.body.dateOfJoining || new Date(),
        ...req.body
      };
      
      profile = new PlacementDirectorProfile(profileData);
    } else {
      console.log('🔍 Updating existing profile for user:', userId);
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
      
      // Ensure required fields have values
      if (!profile.dateOfJoining) profile.dateOfJoining = new Date();
      if (!profile.designation) profile.designation = 'Director';
      if (!profile.department) profile.department = 'Placement Cell';
    }

    console.log('🔍 About to save profile:', profile.toObject());
    const updatedProfile = await profile.save();
    console.log('✅ Profile saved successfully');

    // Also update the User model with basic information
    await User.findByIdAndUpdate(userId, {
      firstName: updatedProfile.name.firstName,
      lastName: updatedProfile.name.lastName,
      mobileNumber: updatedProfile.mobileNumber,
      gender: updatedProfile.gender,
      profilePhotoUrl: updatedProfile.profilePhotoUrl,
      department: updatedProfile.department,
      employeeId: updatedProfile.employeeId,
      designation: updatedProfile.designation,
      dateOfJoining: updatedProfile.dateOfJoining,
      officeRoomNo: updatedProfile.officeRoomNo,
      officialEmail: updatedProfile.officialEmail,
      alternateMobile: updatedProfile.alternateMobile,
      reportingTo: updatedProfile.reportingTo,
      yearsOfExperience: updatedProfile.yearsOfExperience,
      resumeUrl: updatedProfile.resumeUrl,
      responsibilitiesText: updatedProfile.responsibilitiesText,
      communicationPreferences: updatedProfile.communicationPreferences,
      contact: updatedProfile.contact
    });

    res.status(200).json({
      success: true,
      message: 'Placement director profile updated successfully',
      profile: {
        id: updatedProfile._id,
        userId: updatedProfile.userId,
        employeeId: updatedProfile.employeeId,
        name: updatedProfile.name,
        email: updatedProfile.email,
        mobileNumber: updatedProfile.mobileNumber,
        gender: updatedProfile.gender,
        profilePhotoUrl: updatedProfile.profilePhotoUrl,
        role: updatedProfile.role,
        department: updatedProfile.department,
        designation: updatedProfile.designation,
        status: updatedProfile.status,
        dateOfJoining: updatedProfile.dateOfJoining,
        registrationDate: updatedProfile.registrationDate,
        lastLoginAt: updatedProfile.lastLoginAt,
        authProvider: updatedProfile.authProvider,
        officeRoomNo: updatedProfile.officeRoomNo,
        officialEmail: updatedProfile.officialEmail,
        alternateMobile: updatedProfile.alternateMobile,
        reportingTo: updatedProfile.reportingTo,
        yearsOfExperience: updatedProfile.yearsOfExperience,
        resumeUrl: updatedProfile.resumeUrl,
        responsibilitiesText: updatedProfile.responsibilitiesText,
        communicationPreferences: updatedProfile.communicationPreferences,
        contact: updatedProfile.contact,
        profileCompletion: updatedProfile.profileCompletion,
        isProfileComplete: updatedProfile.isProfileComplete,
        fullName: updatedProfile.fullName,
        fullAddress: updatedProfile.fullAddress,
        createdAt: updatedProfile.createdAt,
        updatedAt: updatedProfile.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Update placement director profile error:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    if (error.errors) {
      console.error('❌ Validation errors:', error.errors);
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating placement director profile',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
        errors: error.errors
      } : undefined
    });
  }
};
