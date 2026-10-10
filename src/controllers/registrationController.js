const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

const registerForEvent = async (req, res) => {
  try {
    const { id: eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        message: 'Invalid event ID format.',
        status: 'ERROR'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        message: 'Event not found.',
        status: 'ERROR'
      });
    }

    if (event.status === 'CANCELLED') {
      return res.status(400).json({
        message: 'Registration unavailable. Event has been cancelled.',
        status: 'ERROR'
      });
    }

    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({
        message: 'Event is full. Maximum capacity reached.',
        status: 'ERROR'
      });
    }

    const existingRegistration = await Registration.findOne({
      eventId: event._id,
      studentId: req.user._id,
      status: 'CONFIRMED'
    });

    if (existingRegistration) {
      return res.status(409).json({
        message: 'You are already registered for this event.',
        status: 'ERROR'
      });
    }

    const randCode = Math.floor(1000 + Math.random() * 9000);
    const ticketCode = `TKT-${event._id.toString().slice(-4).toUpperCase()}-${randCode}`;

    const registration = await Registration.create({
      eventId: event._id,
      studentId: req.user._id,
      ticketCode,
      status: 'CONFIRMED',
      attended: false,
      attendanceStatus: 'PENDING'
    });

    event.registeredCount += 1;
    await event.save();

    // Trigger registration notification (in-app + FCM)
    await createNotification({
      recipientId: req.user._id,
      title: 'Registration Successful',
      message: `You have successfully registered for ${event.title}.`,
      type: 'REGISTRATION_SUCCESS',
      eventId: event._id
    });

    const responsePayload = {
      id: registration._id.toString(),
      _id: registration._id.toString(),
      eventId: event._id.toString(),
      studentId: req.user._id.toString(),
      ticketCode: registration.ticketCode,
      status: registration.status,
      attended: registration.attended,
      attendanceStatus: registration.attendanceStatus,
      event: event.toJSON()
    };

    return res.status(201).json({
      registration: responsePayload,
      ticket: responsePayload,
      data: responsePayload,
      message: 'Successfully registered for event'
    });
  } catch (error) {
    console.error('RegisterForEvent Error:', error);
    return res.status(500).json({
      message: 'Server error during event registration.',
      status: 'ERROR'
    });
  }
};

const cancelRegistration = async (req, res) => {
  try {
    const { id: eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        message: 'Invalid event ID format.',
        status: 'ERROR'
      });
    }

    const registration = await Registration.findOne({
      eventId,
      studentId: req.user._id,
      status: 'CONFIRMED'
    });

    if (!registration) {
      return res.status(404).json({
        message: 'Active registration for this event not found.',
        status: 'ERROR'
      });
    }

    registration.status = 'CANCELLED';
    await registration.save();

    const event = await Event.findById(eventId);
    if (event && event.registeredCount > 0) {
      event.registeredCount -= 1;
      await event.save();
    }

    return res.status(200).json({
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    console.error('CancelRegistration Error:', error);
    return res.status(500).json({
      message: 'Server error cancelling registration.',
      status: 'ERROR'
    });
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      studentId: req.user._id,
      status: 'CONFIRMED'
    })
      .populate('eventId')
      .sort({ createdAt: -1 });

    const result = registrations.map((reg) => {
      const regObj = reg.toJSON();
      if (reg.eventId) {
        regObj.event = reg.eventId;
        regObj.eventId = reg.eventId._id ? reg.eventId._id.toString() : reg.eventId.toString();
      }
      return regObj;
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('GetMyRegistrations Error:', error);
    return res.status(500).json({
      message: 'Server error retrieving registrations.',
      status: 'ERROR'
    });
  }
};

const getEventAttendees = async (req, res) => {
  try {
    const { id: eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        message: 'Invalid event ID format.',
        status: 'ERROR'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        message: 'Event not found.',
        status: 'ERROR'
      });
    }

    const registrations = await Registration.find({
      eventId,
      status: 'CONFIRMED'
    })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    const attendees = registrations.map((reg) => {
      const student = reg.studentId;
      const studentIdStr = student ? student._id.toString() : 'std_unknown';
      const nameStr = student ? student.name : 'Student';
      const emailStr = student ? student.email : 'student@campusconnect.com';

      return {
        id: reg._id.toString(),
        _id: reg._id.toString(),
        studentId: studentIdStr,
        studentName: nameStr,
        name: nameStr,
        studentEmail: emailStr,
        email: emailStr,
        student: student ? { id: studentIdStr, name: nameStr, email: emailStr, role: 'STUDENT' } : null,
        ticketCode: reg.ticketCode,
        status: reg.status,
        attended: reg.attended,
        attendanceStatus: reg.attendanceStatus,
        checkInTime: reg.checkInTime
      };
    });

    return res.status(200).json(attendees);
  } catch (error) {
    console.error('GetEventAttendees Error:', error);
    return res.status(500).json({
      message: 'Server error retrieving attendees.',
      status: 'ERROR'
    });
  }
};

const updateAttendeeStatus = async (req, res) => {
  try {
    const { id: eventId, studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        message: 'Invalid event ID or student ID format.',
        status: 'ERROR'
      });
    }

    const registration = await Registration.findOne({
      eventId,
      studentId,
      status: 'CONFIRMED'
    }).populate('studentId', 'name email');

    if (!registration) {
      return res.status(404).json({
        message: 'Attendee registration record not found.',
        status: 'ERROR'
      });
    }

    const { attended, attendanceStatus } = req.body;

    if (attended !== undefined) {
      registration.attended = Boolean(attended);
    }

    if (attendanceStatus) {
      registration.attendanceStatus = attendanceStatus.toUpperCase();
      registration.attended = registration.attendanceStatus === 'PRESENT';
    } else if (attended !== undefined) {
      registration.attendanceStatus = registration.attended ? 'PRESENT' : 'ABSENT';
    }

    if (registration.attended && !registration.checkInTime) {
      registration.checkInTime = new Date();
      registration.checkedInBy = req.user._id;
    }

    await registration.save();

    const student = registration.studentId;
    const studentIdStr = student ? student._id.toString() : studentId;
    const nameStr = student ? student.name : 'Student';
    const emailStr = student ? student.email : 'student@campusconnect.com';

    const responsePayload = {
      id: registration._id.toString(),
      _id: registration._id.toString(),
      studentId: studentIdStr,
      studentName: nameStr,
      name: nameStr,
      studentEmail: emailStr,
      email: emailStr,
      student: student ? { id: studentIdStr, name: nameStr, email: emailStr, role: 'STUDENT' } : null,
      ticketCode: registration.ticketCode,
      status: registration.status,
      attended: registration.attended,
      attendanceStatus: registration.attendanceStatus,
      checkInTime: registration.checkInTime
    };

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('UpdateAttendeeStatus Error:', error);
    return res.status(500).json({
      message: 'Server error updating attendee status.',
      status: 'ERROR'
    });
  }
};

const checkInAttendee = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const { ticketCode, qrCode } = req.body;
    const targetCode = (ticketCode || qrCode || '').trim();

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        message: 'Invalid event ID format.',
        status: 'ERROR'
      });
    }

    if (!targetCode) {
      return res.status(400).json({
        message: 'Ticket code is required for check-in.',
        status: 'ERROR'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        message: 'Event not found.',
        status: 'ERROR'
      });
    }

    if (event.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Unauthorized: You can only check in attendees for your own events.',
        status: 'ERROR'
      });
    }

    const registration = await Registration.findOne({
      eventId,
      ticketCode: targetCode
    }).populate('studentId', 'name email');

    if (!registration) {
      return res.status(404).json({
        message: 'Invalid ticket code. No registration record found for this event.',
        status: 'ERROR'
      });
    }

    if (registration.status === 'CANCELLED') {
      return res.status(400).json({
        message: 'Check-in Rejected: Registration for this event was cancelled.',
        status: 'ERROR'
      });
    }

    const student = registration.studentId;
    const studentName = student ? student.name : 'Student';
    const studentEmail = student ? student.email : 'student@campusconnect.com';

    if (registration.attended || registration.attendanceStatus === 'PRESENT') {
      const totalRegistered = await Registration.countDocuments({ eventId, status: 'CONFIRMED' });
      const totalCheckedIn = await Registration.countDocuments({ eventId, status: 'CONFIRMED', attended: true });

      return res.status(409).json({
        message: 'Attendee Already Checked In',
        status: 'ALREADY_CHECKED_IN',
        attendee: {
          id: registration._id.toString(),
          studentName,
          studentEmail,
          ticketCode: registration.ticketCode,
          checkInTime: registration.checkInTime || registration.updatedAt
        },
        event: {
          id: event._id.toString(),
          title: event.title
        },
        stats: {
          totalRegistered,
          totalCheckedIn
        }
      });
    }

    registration.attended = true;
    registration.attendanceStatus = 'PRESENT';
    registration.checkInTime = new Date();
    registration.checkedInBy = req.user._id;
    await registration.save();

    const totalRegistered = await Registration.countDocuments({ eventId, status: 'CONFIRMED' });
    const totalCheckedIn = await Registration.countDocuments({ eventId, status: 'CONFIRMED', attended: true });

    return res.status(200).json({
      message: 'Check-in successful!',
      status: 'SUCCESS',
      attendee: {
        id: registration._id.toString(),
        studentName,
        studentEmail,
        ticketCode: registration.ticketCode,
        checkInTime: registration.checkInTime
      },
      event: {
        id: event._id.toString(),
        title: event.title
      },
      stats: {
        totalRegistered,
        totalCheckedIn
      }
    });
  } catch (error) {
    console.error('CheckInAttendee Error:', error);
    return res.status(500).json({
      message: 'Server error during check-in.',
      status: 'ERROR'
    });
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventAttendees,
  updateAttendeeStatus,
  checkInAttendee
};
