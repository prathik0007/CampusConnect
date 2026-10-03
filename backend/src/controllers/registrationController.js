const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { generateTicketCode } = require('../utils/ticketCode');
const { createNotification } = require('../services/notificationService');

/**
 * Register current authenticated student for an event
 * POST /api/events/:id/register
 * Protection: authenticate, requireRole('student')
 */
const registerForEvent = async (req, res, next) => {
  const eventId = req.params.id;
  const studentId = req.user._id;

  // 1. Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid event ID format',
    });
  }

  // 2. Lookup event
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found',
    });
  }

  // 3. Status checks
  if (event.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      message: 'Cannot register for a cancelled event',
    });
  }

  if (event.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Cannot register for an event that has already concluded',
    });
  }

  if (event.status !== 'published') {
    return res.status(400).json({
      success: false,
      message: 'Event is not published for registration',
    });
  }

  // 4. Duplicate registration check
  const existingReg = await Registration.findOne({ eventId, studentId });
  if (existingReg && (existingReg.status === 'registered' || existingReg.status === 'attended')) {
    return res.status(409).json({
      success: false,
      message: 'You are already registered for this event',
    });
  }

  // 5. Atomic conditional capacity check and safe registration
  // Try using MongoDB session transaction if supported
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch {
    session = null; // Deployment doesn't support replica set transactions; fallback to atomic conditional updates
  }

  try {
    // Atomic capacity increment: only succeeds if registeredCount < maxCapacity
    const eventQuery = {
      _id: eventId,
      status: 'published',
      $expr: { $lt: ['$registeredCount', '$maxCapacity'] },
    };

    const updatedEvent = await Event.findOneAndUpdate(
      eventQuery,
      { $inc: { registeredCount: 1 } },
      { new: true, session: session || undefined }
    );

    if (!updatedEvent) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(409).json({
        success: false,
        message: 'This event is full',
      });
    }

    const ticketCode = generateTicketCode();
    let registration;

    if (existingReg) {
      // Re-activate previously cancelled registration
      existingReg.status = 'registered';
      existingReg.registrationDate = new Date();
      existingReg.attendedAt = null;
      existingReg.ticketCode = ticketCode;

      if (session) {
        await existingReg.save({ session });
      } else {
        await existingReg.save();
      }
      registration = existingReg;
    } else {
      if (session) {
        const created = await Registration.create(
          [
            {
              eventId,
              studentId,
              registrationDate: new Date(),
              status: 'registered',
              ticketCode,
              attendedAt: null,
            },
          ],
          { session }
        );
        registration = created[0];
      } else {
        registration = await Registration.create({
          eventId,
          studentId,
          registrationDate: new Date(),
          status: 'registered',
          ticketCode,
          attendedAt: null,
        });
      }
    }

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    // Asynchronously create registration_success notification (failsafe: does not block or break registration)
    createNotification({
      recipientId: studentId,
      eventId: updatedEvent._id,
      title: 'Registration Successful',
      message: `You are registered for ${updatedEvent.title}.`,
      type: 'registration_success',
      data: {
        ticketCode: registration.ticketCode,
      },
    }).catch((err) => {
      console.warn('[Registration Notification] Warning:', err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Successfully registered for event',
      data: {
        registration: registration.toJSON(),
        ticketCode: registration.ticketCode,
        event: {
          id: updatedEvent.id,
          title: updatedEvent.title,
          category: updatedEvent.category,
          startDate: updatedEvent.startDate,
          venue: updatedEvent.venue,
          registeredCount: updatedEvent.registeredCount,
          maxCapacity: updatedEvent.maxCapacity,
        },
      },
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    // Handle compound index duplicate conflict
    if (error.code === 11000) {
      // Revert count if increment was done
      await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: -1 } });
      return res.status(409).json({
        success: false,
        message: 'You are already registered for this event',
      });
    }

    next(error);
  }
};

/**
 * Cancel an active registration
 * DELETE /api/events/:id/register
 * Protection: authenticate, requireRole('student')
 */
const cancelRegistration = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const studentId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const registration = await Registration.findOne({ eventId, studentId });
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found for this event',
      });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Registration is already cancelled',
      });
    }

    // Mark as cancelled (preserving document history)
    registration.status = 'cancelled';
    registration.attendedAt = null;
    await registration.save();

    // Safely decrement event registeredCount (never allow count to drop below 0)
    await Event.findOneAndUpdate(
      { _id: eventId, registeredCount: { $gt: 0 } },
      { $inc: { registeredCount: -1 } }
    );

    return res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully',
      data: {
        registration: registration.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current student's registrations and tickets
 * GET /api/students/my-registrations
 * Protection: authenticate, requireRole('student')
 */
const getMyRegistrations = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const filter = { studentId };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const registrations = await Registration.find(filter)
      .populate({
        path: 'eventId',
        select: 'title description category bannerUrl startDate endDate venue status organizerDetails organizerId maxCapacity registeredCount',
      })
      .sort({ registrationDate: -1 });

    // Format for frontend consistency matching mobile Registration interface
    const formatted = registrations.map((r) => {
      const regObj = r.toJSON();
      const evt = r.eventId;

      return {
        id: regObj.id,
        eventId: evt?._id ? evt._id.toString() : r.eventId.toString(),
        studentId: studentId.toString(),
        studentName: req.user.name,
        studentEmail: req.user.email,
        studentRollNumber: req.user.rollNumber || '',
        studentDepartment: req.user.department || '',
        eventTitle: evt?.title || 'Campus Event',
        eventCategory: evt?.category,
        eventStartDate: evt?.startDate ? evt.startDate.toISOString() : undefined,
        eventVenue: evt?.venue,
        organizerName: evt?.organizerDetails?.name || 'Campus Council',
        registrationDate: r.registrationDate ? r.registrationDate.toISOString() : r.createdAt.toISOString(),
        status: r.status,
        ticketCode: r.ticketCode,
        attendedAt: r.attendedAt ? r.attendedAt.toISOString() : undefined,
        event: evt ? evt.toJSON() : undefined,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        registrations: formatted,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get attendee roster for an event (Organizer/Admin only)
 * GET /api/events/:id/attendees
 * Protection: authenticate, requireRole('organizer', 'admin')
 */
const getEventAttendees = async (req, res, next) => {
  try {
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Authorization: only event's organizer or admin can access attendee list
    const isOwner = event.organizerId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view attendees for your own events',
      });
    }

    const registrations = await Registration.find({ eventId })
      .populate('studentId', 'name email department rollNumber phone avatarUrl')
      .sort({ registrationDate: -1 });

    const attendees = registrations.map((r) => {
      const student = r.studentId || {};
      return {
        id: r.id,
        eventId: event.id,
        studentId: student._id ? student._id.toString() : '',
        studentName: student.name || 'Anonymous Student',
        studentEmail: student.email || '',
        studentDepartment: student.department || '',
        studentRollNumber: student.rollNumber || '',
        studentPhone: student.phone || '',
        registrationDate: r.registrationDate ? r.registrationDate.toISOString() : r.createdAt.toISOString(),
        status: r.status,
        ticketCode: r.ticketCode,
        attendedAt: r.attendedAt ? r.attendedAt.toISOString() : null,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          registeredCount: event.registeredCount,
          maxCapacity: event.maxCapacity,
        },
        attendees,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update attendee attendance status (mark attended / registered)
 * PATCH /api/events/:id/attendees/:studentId
 * Protection: authenticate, requireRole('organizer', 'admin')
 */
const updateAttendance = async (req, res, next) => {
  try {
    const { id: eventId, studentId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event or student ID format',
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Authorization: owner organizer or admin only
    const isOwner = event.organizerId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only manage attendance for your own events',
      });
    }

    const registration = await Registration.findOne({ eventId, studentId });
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found for this student and event',
      });
    }

    if (!['attended', 'registered', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: "attended", "registered", "cancelled"',
      });
    }

    // Apply attendance update
    registration.status = status;
    if (status === 'attended') {
      registration.attendedAt = new Date();
    } else {
      registration.attendedAt = null;
    }

    await registration.save();

    return res.status(200).json({
      success: true,
      message: `Attendance status updated to '${status}'`,
      data: {
        registration: registration.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventAttendees,
  updateAttendance,
};
