const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { createNotification } = require('../services/notificationService');

const getEvents = async (req, res) => {
  try {
    const { search, q, category } = req.query;
    const queryTerm = search || q;

    const filter = {};

    if (category && category !== 'All') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    if (queryTerm && queryTerm.trim().length > 0) {
      const searchRegex = new RegExp(queryTerm.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { venue: searchRegex },
        { category: searchRegex }
      ];
    }

    const events = await Event.find(filter).sort({ createdAt: -1 });

    return res.status(200).json(events);
  } catch (error) {
    console.error('GetEvents Error:', error);
    return res.status(500).json({
      message: 'Server error retrieving events.',
      status: 'ERROR'
    });
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid event ID format.',
        status: 'ERROR'
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        message: 'Requested event not found.',
        status: 'ERROR'
      });
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error('GetEventById Error:', error);
    return res.status(500).json({
      message: 'Server error retrieving event details.',
      status: 'ERROR'
    });
  }
};

const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      venue,
      startDate,
      endDate,
      date,
      startTime,
      endTime,
      capacity,
      imageUrl,
      bannerUrl
    } = req.body;

    const finalLocation = (location || venue || '').trim();

    if (!title || !description || !finalLocation) {
      return res.status(400).json({
        message: 'Please provide title, description, and location/venue for the event.',
        status: 'ERROR'
      });
    }

    const parsedCapacity = parseInt(capacity, 10) || 100;
    if (parsedCapacity < 1) {
      return res.status(400).json({
        message: 'Capacity must be at least 1.',
        status: 'ERROR'
      });
    }

    const finalImage = imageUrl || bannerUrl || '';

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      category: (category || 'General').trim(),
      location: finalLocation,
      venue: finalLocation,
      startDate: startDate || (date ? `${date} ${startTime || ''}`.trim() : 'TBD'),
      endDate: endDate || endTime || 'TBD',
      date: date || '',
      startTime: startTime || '',
      endTime: endTime || '',
      capacity: parsedCapacity,
      registeredCount: 0,
      imageUrl: finalImage,
      bannerUrl: finalImage,
      organizerId: req.user._id,
      organizerName: req.user.name || 'Campus Organizer',
      status: 'UPCOMING'
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error('CreateEvent Error:', error);
    return res.status(500).json({
      message: 'Server error creating event.',
      status: 'ERROR'
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid event ID format.',
        status: 'ERROR'
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        message: 'Event not found.',
        status: 'ERROR'
      });
    }

    // Ownership/Authorization check
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'ORGANIZER') {
      return res.status(403).json({
        message: 'Forbidden. You are not authorized to update this event.',
        status: 'ERROR'
      });
    }

    const {
      title,
      description,
      category,
      location,
      venue,
      startDate,
      endDate,
      capacity,
      imageUrl,
      bannerUrl,
      status
    } = req.body;

    if (title !== undefined) event.title = title.trim();
    if (description !== undefined) event.description = description.trim();
    if (category !== undefined) event.category = category.trim();

    const newLocation = location || venue;
    if (newLocation !== undefined) {
      event.location = newLocation.trim();
      event.venue = newLocation.trim();
    }

    if (startDate !== undefined) event.startDate = startDate;
    if (endDate !== undefined) event.endDate = endDate;
    if (capacity !== undefined) {
      const cap = parseInt(capacity, 10);
      if (cap >= 1) event.capacity = cap;
    }

    const newImage = imageUrl || bannerUrl;
    if (newImage !== undefined) {
      event.imageUrl = newImage;
      event.bannerUrl = newImage;
    }

    if (status !== undefined && ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'].includes(status.toUpperCase())) {
      event.status = status.toUpperCase();
    }

    await event.save();

    // Trigger notification to affected registered students
    try {
      const registrations = await Registration.find({ eventId: event._id, status: 'CONFIRMED' }).select('studentId');
      for (const reg of registrations) {
        await createNotification({
          recipientId: reg.studentId,
          title: `Event Updated: ${event.title}`,
          message: `The event details for ${event.title} have been updated by the organizer.`,
          type: 'EVENT_UPDATED',
          eventId: event._id
        });
      }
    } catch (notifErr) {
      console.warn('Event update notification trigger warning (handled safely):', notifErr.message);
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error('UpdateEvent Error:', error);
    return res.status(500).json({
      message: 'Server error updating event.',
      status: 'ERROR'
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid event ID format.',
        status: 'ERROR'
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        message: 'Event not found.',
        status: 'ERROR'
      });
    }

    // Ownership/Authorization check
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'ORGANIZER') {
      return res.status(403).json({
        message: 'Forbidden. You are not authorized to delete this event.',
        status: 'ERROR'
      });
    }

    await Event.findByIdAndDelete(id);

    return res.status(200).json({
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('DeleteEvent Error:', error);
    return res.status(500).json({
      message: 'Server error deleting event.',
      status: 'ERROR'
    });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
