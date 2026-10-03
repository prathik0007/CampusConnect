const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      enum: {
        values: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'],
        message: '{VALUE} is not a valid event category',
      },
    },
    bannerUrl: {
      type: String,
      trim: true,
      default: '',
    },
    startDate: {
      type: Date,
      required: [true, 'Event start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'Event end date is required'],
      validate: {
        validator: function (value) {
          // If startDate is present, endDate must be >= startDate
          return !this.startDate || value >= this.startDate;
        },
        message: 'End date cannot be earlier than start date',
      },
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
    },
    maxCapacity: {
      type: Number,
      required: [true, 'Maximum capacity is required'],
      min: [1, 'Maximum capacity must be a positive number (at least 1)'],
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: [0, 'Registered count cannot be negative'],
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer ID is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'cancelled', 'completed'],
        message: '{VALUE} is not a valid event status',
      },
      default: 'draft',
      required: true,
    },
    organizerDetails: {
      name: {
        type: String,
        trim: true,
        default: '',
      },
      contact: {
        type: String,
        trim: true,
        default: '',
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        // Provide compatibility with mobile interface
        if (ret.organizerDetails?.name && !ret.organizerName) {
          ret.organizerName = ret.organizerDetails.name;
        }
        if (ret.organizerDetails?.contact && !ret.organizerContact) {
          ret.organizerContact = ret.organizerDetails.contact;
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        if (ret.organizerDetails?.name && !ret.organizerName) {
          ret.organizerName = ret.organizerDetails.name;
        }
        if (ret.organizerDetails?.contact && !ret.organizerContact) {
          ret.organizerContact = ret.organizerDetails.contact;
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for frequently queried fields (Requirement 9)
eventSchema.index({ organizerId: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ status: 1, startDate: 1 }); // Compound index for active upcoming events query

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
