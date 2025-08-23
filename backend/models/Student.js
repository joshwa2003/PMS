const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { 
    type: String, 
    required: [true, 'Student ID is required'], 
    unique: true,
    trim: true
  },
  registrationNumber: { 
    type: String, 
    required: [true, 'Registration number is required'],
    trim: true
  },

  personalInfo: {
    fullName: { 
      type: String, 
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters long']
    },
    dateOfBirth: { type: Date },
    gender: { 
      type: String, 
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: 'Gender must be Male, Female, or Other'
      }
    },
    nationality: { type: String, trim: true },
    category: { 
      type: String, 
      enum: {
        values: ['GEN', 'SC', 'ST', 'OBC', 'Others'],
        message: 'Category must be one of: GEN, SC, ST, OBC, Others'
      }
    },
    maritalStatus: { type: String, trim: true },
    differentlyAbled: { type: Boolean, default: false },
    careerBreak: { type: Boolean, default: false },
    workPermitUSA: { type: Boolean, default: false },
    workPermitCountries: [{ type: String, trim: true }],
  },

  contact: {
    phone: { type: String },
    email: { type: String },
    guardianName: { type: String },
    guardianContact: { type: String },
    permanentAddress: { type: String },
    currentAddress: { type: String },
    hometown: { type: String },
    pincode: { type: String }
  },

  academic: {
    department: { type: String },
    program: { type: String }, // B.E, B.Tech, MBA, etc.
    specialization: { type: String },
    courseType: { type: String }, // Full-time, Part-time
    university: { type: String },
    courseDurationFrom: { type: Date },
    courseDurationTo: { type: Date },
    gradingSystem: { type: String }, // CGPA, GPA, %, etc.
    cgpa: { type: Number },
    backlogs: { type: Number },
    yearOfStudy: { type: Number },
    currentSemester: { type: Number },
    section: { type: String }
  },

  placement: {
    placementStatus: { type: String, enum: ['Unplaced', 'Placed', 'Multiple Offers'], default: 'Unplaced' },
    offerDetails: [{
      companyName: String,
      ctc: String,
      joiningDate: Date,
      jobRole: String
    }],
    applicationHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    trainingAttended: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    resumeLastUpdated: { type: Date },
    resumeHeadline: { type: String },
    resumeLink: { type: String },
  },

  careerProfile: {
    currentIndustry: { type: String },
    department: { type: String },
    desiredJobType: { type: String },
    desiredEmploymentType: { type: String },
    preferredShift: { type: String },
    preferredLocations: [{ type: String }],
    expectedSalary: { type: String },
    availableToJoinInDays: { type: Number },
    experienceStatus: { type: String, enum: ['Fresher', 'Experienced'] },
  },

  skills: [{ type: String }],
  certifications: [{
    name: String,
    authority: String,
    link: String,
    validFrom: Date,
    validTo: Date
  }],

  internships: [{
    company: String,
    role: String,
    duration: String,
    certificateLink: String
  }],

  projects: [{
    title: String,
    client: String,
    status: String,
    from: Date,
    to: Date,
    description: String,
    techStack: [String]
  }],

  achievements: [{ type: String }],
  preferredJobDomains: [{ type: String }],
  languagesKnown: [{
    language: String,
    proficiency: { type: String, enum: ['Basic', 'Intermediate', 'Fluent'] }
  }],

  onlineProfiles: [{
    platform: String,
    url: String,
    description: String
  }],
  portfolioWebsite: { type: String },
  githubProfile: { type: String },
  linkedinProfile: { type: String },

  accomplishments: {
    researchPapers: [{ title: String, link: String }],
    presentations: [{ title: String, link: String }],
    patents: [{ title: String, details: String }],
    workSamples: [{ title: String, link: String }]
  },

  profileSummary: { type: String },
  profileImageUrl: { type: String }, // Supabase URL for profile image
  profileLastUpdated: { type: Date, default: Date.now },
  
  // Reference to User model
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Batch reference
  batchId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Batch',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
studentSchema.index({ studentId: 1 });
studentSchema.index({ userId: 1 });
studentSchema.index({ batchId: 1 });
studentSchema.index({ 'academic.department': 1 });
studentSchema.index({ 'placement.placementStatus': 1 });
studentSchema.index({ 'academic.yearOfStudy': 1 });

// Pre-save middleware to update profileLastUpdated
studentSchema.pre('save', function(next) {
  this.profileLastUpdated = new Date();
  next();
});

// Virtual for completion percentage
studentSchema.virtual('profileCompletionPercentage').get(function() {
  let completedFields = 0;
  let totalFields = 0;

  // Check personal info completion
  const personalInfoFields = ['fullName', 'dateOfBirth', 'gender', 'nationality', 'category'];
  personalInfoFields.forEach(field => {
    totalFields++;
    if (this.personalInfo && this.personalInfo[field]) completedFields++;
  });

  // Check contact completion
  const contactFields = ['phone', 'email', 'permanentAddress', 'currentAddress'];
  contactFields.forEach(field => {
    totalFields++;
    if (this.contact && this.contact[field]) completedFields++;
  });

  // Check academic completion
  const academicFields = ['department', 'program', 'specialization', 'cgpa'];
  academicFields.forEach(field => {
    totalFields++;
    if (this.academic && this.academic[field]) completedFields++;
  });

  // Check other important fields
  totalFields += 4;
  if (this.skills && this.skills.length > 0) completedFields++;
  if (this.projects && this.projects.length > 0) completedFields++;
  if (this.profileSummary) completedFields++;
  if (this.placement && this.placement.resumeLink) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
});

// Static method to get student by user ID
studentSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId }).populate('userId', 'firstName lastName email');
};

// Instance method to update placement status
studentSchema.methods.updatePlacementStatus = function(status, offerDetails = null) {
  this.placement.placementStatus = status;
  if (offerDetails) {
    this.placement.offerDetails.push(offerDetails);
  }
  return this.save();
};

module.exports = mongoose.model('Student', studentSchema);
