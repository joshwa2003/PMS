const mongoose = require('mongoose');

const importHistorySchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  importType: {
    type: String,
    required: [true, 'Import type is required'],
    enum: ['staff', 'student', 'alumni'],
    default: 'staff'
  },
  totalRecords: {
    type: Number,
    required: [true, 'Total records count is required'],
    min: 0
  },
  successfulRecords: {
    type: Number,
    required: [true, 'Successful records count is required'],
    min: 0
  },
  failedRecords: {
    type: Number,
    required: [true, 'Failed records count is required'],
    min: 0
  },
  warningRecords: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    required: [true, 'Import status is required'],
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  importedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Imported by user is required']
  },
  importedData: [{
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rowNumber: Number,
    status: {
      type: String,
      enum: ['success', 'failed', 'warning'],
      required: true
    },
    data: mongoose.Schema.Types.Mixed,
    errors: [String],
    warnings: [String]
  }],
  validationErrors: [{
    rowNumber: Number,
    field: String,
    message: String,
    value: mongoose.Schema.Types.Mixed
  }],
  processingTime: {
    type: Number, // in milliseconds
    default: 0
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  rollbackData: {
    isRollbackAvailable: {
      type: Boolean,
      default: true
    },
    rollbackBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rollbackAt: Date,
    rollbackReason: String,
    createdRecordIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  metadata: {
    departmentCodes: [String],
    roles: [String],
    duplicateEmails: [String],
    duplicateEmployeeIds: [String],
    ipAddress: String,
    userAgent: String
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
importHistorySchema.index({ importedBy: 1 });
importHistorySchema.index({ status: 1 });
importHistorySchema.index({ importType: 1 });
importHistorySchema.index({ createdAt: -1 });
importHistorySchema.index({ 'rollbackData.isRollbackAvailable': 1 });

// Virtual for success rate
importHistorySchema.virtual('successRate').get(function() {
  if (this.totalRecords === 0) return 0;
  return Math.round((this.successfulRecords / this.totalRecords) * 100);
});

// Virtual for formatted processing time
importHistorySchema.virtual('formattedProcessingTime').get(function() {
  if (this.processingTime < 1000) return `${this.processingTime}ms`;
  if (this.processingTime < 60000) return `${Math.round(this.processingTime / 1000)}s`;
  return `${Math.round(this.processingTime / 60000)}m ${Math.round((this.processingTime % 60000) / 1000)}s`;
});

// Virtual for formatted file size
importHistorySchema.virtual('formattedFileSize').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Method to calculate processing time
importHistorySchema.methods.calculateProcessingTime = function() {
  if (this.startTime && this.endTime) {
    this.processingTime = this.endTime.getTime() - this.startTime.getTime();
  }
  return this.processingTime;
};

// Method to mark as completed
importHistorySchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.endTime = new Date();
  this.calculateProcessingTime();
  return this.save();
};

// Method to mark as failed
importHistorySchema.methods.markFailed = function(reason) {
  this.status = 'failed';
  this.endTime = new Date();
  this.calculateProcessingTime();
  if (reason) {
    this.notes = reason;
  }
  return this.save();
};

// Static method to get import statistics
importHistorySchema.statics.getImportStats = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await this.aggregate([
    {
      $match: {
        importedBy: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalImports: { $sum: 1 },
        totalRecords: { $sum: '$totalRecords' },
        totalSuccessful: { $sum: '$successfulRecords' },
        totalFailed: { $sum: '$failedRecords' },
        totalWarnings: { $sum: '$warningRecords' },
        avgProcessingTime: { $avg: '$processingTime' },
        completedImports: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        },
        failedImports: {
          $sum: {
            $cond: [{ $eq: ['$status', 'failed'] }, 1, 0]
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalImports: 0,
    totalRecords: 0,
    totalSuccessful: 0,
    totalFailed: 0,
    totalWarnings: 0,
    avgProcessingTime: 0,
    completedImports: 0,
    failedImports: 0
  };
};

module.exports = mongoose.model('ImportHistory', importHistorySchema);
