const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    registrationDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ['registered', 'cancelled', 'attended'],
        message: '{VALUE} is not a valid registration status',
      },
      default: 'registered',
      required: true,
    },
    ticketCode: {
      type: String,
      required: [true, 'Ticket code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    attendedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound unique index: prevents duplicate registration for same student and event (Requirement 7 & 9)
registrationSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

// Note: ticketCode index is automatically created with unique: true constraint
// Index for student lookup queries
registrationSchema.index({ studentId: 1 });


const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
