const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    length: 6
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: [3, 'Maximum 3 attempts allowed']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Document expires after 10 minutes (600 seconds)
  }
}, {
  timestamps: true
});

// Index for better query performance
passwordResetSchema.index({ email: 1 });
passwordResetSchema.index({ otp: 1 });
passwordResetSchema.index({ userId: 1 });
passwordResetSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

// Instance method to check if OTP is expired
passwordResetSchema.methods.isExpired = function() {
  const now = new Date();
  const createdTime = new Date(this.createdAt);
  const timeDifference = (now - createdTime) / 1000; // in seconds
  return timeDifference > 600; // 10 minutes
};

// Instance method to increment attempts
passwordResetSchema.methods.incrementAttempts = async function() {
  this.attempts += 1;
  return await this.save();
};

// Static method to clean up expired records
passwordResetSchema.statics.cleanupExpired = async function() {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  return await this.deleteMany({ createdAt: { $lt: tenMinutesAgo } });
};

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
