const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    ticketCode: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'CANCELLED', 'WAITLISTED'],
      default: 'CONFIRMED',
      index: true
    },
    attended: {
      type: Boolean,
      default: false
    },
    attendanceStatus: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'PENDING'],
      default: 'PENDING'
    },
    checkInTime: {
      type: Date
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

registrationSchema.index({ eventId: 1, studentId: 1 });
registrationSchema.index({ eventId: 1, ticketCode: 1 });

registrationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Registration', registrationSchema);
