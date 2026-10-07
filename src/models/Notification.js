const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true
    },
    body: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['REGISTRATION_SUCCESS', 'EVENT_UPDATED', 'EVENT_REMINDER', 'GENERAL'],
      default: 'GENERAL'
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    if (!ret.body) ret.body = ret.message;
    if (!ret.message) ret.message = ret.body;
    ret.read = ret.isRead;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
