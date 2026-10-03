const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient ID is required'],
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: {
        values: [
          'registration_success',
          'reminder',
          'event_update',
          'cancellation',
          'general',
        ],
        message: '{VALUE} is not a valid notification type',
      },
      default: 'general',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
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

// Indexes for frequently queried fields (Requirement 8 & 9)
notificationSchema.index({ recipientId: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 }); // Quick lookup for unread notifications

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
