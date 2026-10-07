const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      trim: true,
      default: 'General'
    },
    location: {
      type: String,
      required: [true, 'Location or venue is required'],
      trim: true
    },
    venue: {
      type: String,
      trim: true
    },
    startDate: {
      type: String,
      default: 'TBD'
    },
    endDate: {
      type: String,
      default: 'TBD'
    },
    date: {
      type: String
    },
    startTime: {
      type: String
    },
    endTime: {
      type: String
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      default: 100
    },
    registeredCount: {
      type: Number,
      default: 0
    },
    imageUrl: {
      type: String,
      default: ''
    },
    bannerUrl: {
      type: String,
      default: ''
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    organizerName: {
      type: String,
      default: 'Campus Organizer'
    },
    status: {
      type: String,
      enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
      default: 'UPCOMING'
    }
  },
  {
    timestamps: true
  }
);

eventSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    if (!ret.venue) ret.venue = ret.location;
    if (!ret.imageUrl && ret.bannerUrl) ret.imageUrl = ret.bannerUrl;
    if (!ret.bannerUrl && ret.imageUrl) ret.bannerUrl = ret.imageUrl;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Event', eventSchema);
