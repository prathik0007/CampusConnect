const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { sendNotificationToUsers } = require('../services/notificationService');

const VALID_CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'];
const VALID_STATUSES = ['draft', 'published', 'cancelled', 'completed'];

/**
 * Helper to escape regex special characters
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Get all events with filtering, search, and pagination
 * GET /api/events
 */
const getEvents = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    // 1. Handle "mine=true" query for organizers
    if (req.query.mine === 'true' || req.query.mine === '1') {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to view your events',
        });
      }

      if (req.user.role === 'student') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Students cannot access organizer event rosters',
        });
      }

      // If organizer, filter by their own organizerId
      filter.organizerId = req.user._id;

      // Allow organizer to filter by status if specified, otherwise include all their events
      if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
        filter.status = req.query.status;
      }
    } else {
      // General event browsing
      if (req.query.status) {
        if (!VALID_STATUSES.includes(req.query.status)) {
          return res.status(400).json({
            success: false,
            message: `Invalid status parameter. Allowed values: ${VALID_STATUSES.join(', ')}`,
          });
        }

        // Students and unauthenticated callers can NEVER query drafts
        if (req.query.status === 'draft') {
          if (!req.user || req.user.role === 'student') {
            return res.status(403).json({
              success: false,
              message: 'Forbidden: Draft events are not accessible to students',
            });
          }
          // Organizer querying drafts can only view their own drafts
          if (req.user.role === 'organizer') {
            filter.organizerId = req.user._id;
          }
        }

        filter.status = req.query.status;
      } else {
        // By default, only return published events for public/student browsing
        filter.status = 'published';
      }
    }

    // 2. Category Filter
    if (req.query.category) {
      if (VALID_CATEGORIES.includes(req.query.category)) {
        filter.category = req.query.category;
      } else {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Allowed values: ${VALID_CATEGORIES.join(', ')}`,
        });
      }
    }

    // 3. Case-Insensitive Search (title, description, venue)
    if (req.query.search && typeof req.query.search === 'string' && req.query.search.trim()) {
      const searchRegex = new RegExp(escapeRegex(req.query.search.trim()), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { venue: searchRegex },
      ];
    }

    // Count and fetch with pagination, ordered by startDate ascending
    const total = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .sort({ startDate: 1, _id: 1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      data: {
        events: events.map((event) => event.toJSON()),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single event by ID
 * GET /api/events/:id
 */
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Draft events are restricted to the event's organizer and admins
    if (event.status === 'draft') {
      const isOwner = req.user && event.organizerId.toString() === req.user.id;
      const isAdmin = req.user && req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        event: event.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new event
 * POST /api/events
 * Protection: authenticate, requireRole('organizer', 'admin')
 */
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      bannerUrl,
      startDate,
      endDate,
      venue,
      maxCapacity,
      status,
    } = req.body;

    // Validate title
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Event title is required',
      });
    }

    // Validate description
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Event description is required',
      });
    }

    // Validate category
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Valid category is required. Allowed: ${VALID_CATEGORIES.join(', ')}`,
      });
    }

    // Validate dates
    if (!startDate || isNaN(new Date(startDate).getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Valid start date is required',
      });
    }

    if (!endDate || isNaN(new Date(endDate).getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Valid end date is required',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
      });
    }

    // Validate venue
    if (!venue || typeof venue !== 'string' || !venue.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Event venue is required',
      });
    }

    // Validate maxCapacity
    const capacityNum = Number(maxCapacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Maximum capacity must be a positive number greater than 0',
      });
    }

    // Validate status (must be draft or published when creating)
    const initialStatus = status ? status.toLowerCase().trim() : 'published';
    if (!['draft', 'published'].includes(initialStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Initial event status must be either "draft" or "published"',
      });
    }

    // Security: organizerId strictly assigned from authenticated req.user
    const newEvent = await Event.create({
      title: title.trim(),
      description: description.trim(),
      category,
      bannerUrl: typeof bannerUrl === 'string' ? bannerUrl.trim() : '',
      startDate: start,
      endDate: end,
      venue: venue.trim(),
      maxCapacity: capacityNum,
      registeredCount: 0, // Enforce 0 at creation
      organizerId: req.user._id,
      status: initialStatus,
      organizerDetails: {
        name: req.user.name,
        contact: req.user.phone || req.user.email,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event: newEvent.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing event
 * PUT /api/events/:id
 * Protection: authenticate, requireRole('organizer', 'admin')
 */
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Authorization: Only the event's organizer or an admin can update
    const currentUserId = req.user.id || req.user._id?.toString();
    const isOwner = event.organizerId.toString() === currentUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own events',
      });
    }

    const updates = req.body;

    // Security: NEVER allow organizerId or registeredCount to be modified via this endpoint
    delete updates.organizerId;
    delete updates.registeredCount;
    delete updates._id;

    // Validate category if provided
    if (updates.category && !VALID_CATEGORIES.includes(updates.category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Allowed: ${VALID_CATEGORIES.join(', ')}`,
      });
    }

    // Validate status if provided
    if (updates.status && !VALID_STATUSES.includes(updates.status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${VALID_STATUSES.join(', ')}`,
      });
    }

    // Validate dates if provided
    const newStart = updates.startDate ? new Date(updates.startDate) : event.startDate;
    const newEnd = updates.endDate ? new Date(updates.endDate) : event.endDate;

    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date values provided',
      });
    }

    if (newStart > newEnd) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
      });
    }

    // Validate maxCapacity if provided
    if (updates.maxCapacity !== undefined) {
      const newCapacity = Number(updates.maxCapacity);
      if (isNaN(newCapacity) || newCapacity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Maximum capacity must be a positive number greater than 0',
        });
      }

      if (newCapacity < event.registeredCount) {
        return res.status(400).json({
          success: false,
          message: `Maximum capacity cannot be reduced below current registered count (${event.registeredCount})`,
        });
      }

      event.maxCapacity = newCapacity;
    }

    // Apply allowed scalar updates
    if (updates.title) event.title = updates.title.trim();
    if (updates.description) event.description = updates.description.trim();
    if (updates.category) event.category = updates.category;
    if (updates.bannerUrl !== undefined) event.bannerUrl = updates.bannerUrl.trim();
    if (updates.venue) event.venue = updates.venue.trim();
    if (updates.status) event.status = updates.status;
    event.startDate = newStart;
    event.endDate = newEnd;

    await event.save();

    // Notify active registered/attended students about event update (failsafe: does not block/fail response)
    Registration.find({
      eventId: event._id,
      status: { $in: ['registered', 'attended'] },
    })
      .select('studentId')
      .lean()
      .then((activeRegistrations) => {
        if (activeRegistrations.length > 0) {
          const studentIds = activeRegistrations.map((r) => r.studentId);
          sendNotificationToUsers(studentIds, {
            eventId: event._id,
            title: 'Event Updated',
            message: `${event.title} has been updated.`,
            type: 'event_update',
          }).catch((notifErr) => {
            console.warn('[Event Update Notification Error]:', notifErr.message);
          });
        }
      })
      .catch((err) => {
        console.warn('[Event Update Notification Lookup Error]:', err.message);
      });

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: {
        event: event.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel an event (Safe Cancellation)
 * DELETE /api/events/:id
 * Protection: authenticate, requireRole('organizer', 'admin')
 */
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Authorization: Only the event's organizer or an admin can cancel
    const currentUserId = req.user.id || req.user._id?.toString();
    const isOwner = event.organizerId.toString() === currentUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only cancel your own events',
      });
    }

    // Safe cancellation: update status to 'cancelled' without removing document from MongoDB
    event.status = 'cancelled';
    await event.save();

    // Notify active registered/attended students about event cancellation (failsafe: does not block/fail response)
    Registration.find({
      eventId: event._id,
      status: { $in: ['registered', 'attended'] },
    })
      .select('studentId')
      .lean()
      .then((activeRegistrations) => {
        if (activeRegistrations.length > 0) {
          const studentIds = activeRegistrations.map((r) => r.studentId);
          sendNotificationToUsers(studentIds, {
            eventId: event._id,
            title: 'Event Cancelled',
            message: `${event.title} has been cancelled.`,
            type: 'cancellation',
          }).catch((notifErr) => {
            console.warn('[Event Cancellation Notification Error]:', notifErr.message);
          });
        }
      })
      .catch((err) => {
        console.warn('[Event Cancellation Notification Lookup Error]:', err.message);
      });

    return res.status(200).json({
      success: true,
      message: 'Event has been cancelled successfully',
      data: {
        event: event.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
