/**
 * Optional Database Seeding Script for CampusConnect
 *
 * NOTE: This script is OPTIONAL and must be run MANUALLY.
 * It will NOT be executed automatically.
 *
 * Usage:
 *   cd backend
 *   npm run seed
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { User, Event, Registration, Notification } = require('../models');

const seedData = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('[Seed Error] MONGODB_URI is not set in backend/.env');
    process.exit(1);
  }

  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('[Seed] Connected successfully.');

    // Clear existing data (optional warning)
    console.log('[Seed] Clearing existing demo collections...');
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    const { hashPassword } = require('../utils/password');
    const demoPasswordHash = await hashPassword('Campus@123');

    const users = await User.create([
      {
        name: 'Prathik Kumar',
        email: 'student@campus.edu',
        passwordHash: demoPasswordHash,
        role: 'student',
        department: 'Computer Applications (MCA)',
        rollNumber: 'MCA2024042',
        phone: '+91 9876543210',
      },
      {
        name: 'Tech & Cultural Council',
        email: 'organizer@campus.edu',
        passwordHash: demoPasswordHash,
        role: 'organizer',
        department: 'Department of Computer Applications',
        rollNumber: 'IT-2023-018',
        phone: '+91 9876500000',
      },
      {
        name: 'Dean Marcus Vance',
        email: 'admin@campus.edu',
        passwordHash: demoPasswordHash,
        role: 'admin',
        department: 'Administration',
        phone: '+1 555-0100',
      },
    ]);


    const student = users[0];
    const organizer = users[1];

    console.log('[Seed] Creating demo events...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextWeekEnd = new Date(nextWeek.getTime() + 3 * 60 * 60 * 1000);

    const events = await Event.create([
      {
        title: 'Annual Hackathon 2026',
        description: '36-hour non-stop campus-wide coding competition with industry mentors and prizes.',
        category: 'Technical',
        bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
        startDate: nextWeek,
        endDate: nextWeekEnd,
        venue: 'Engineering Auditorium - Hall B',
        maxCapacity: 120,
        registeredCount: 1,
        organizerId: organizer._id,
        status: 'published',
        organizerDetails: {
          name: organizer.name,
          contact: organizer.email,
        },
      },
      {
        title: 'Spring Cultural Festival',
        description: 'Celebration of music, dance, and creative arts across departments.',
        category: 'Cultural',
        bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
        startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        venue: 'Open Air Amphitheatre',
        maxCapacity: 300,
        registeredCount: 0,
        organizerId: organizer._id,
        status: 'published',
        organizerDetails: {
          name: organizer.name,
          contact: organizer.email,
        },
      },
    ]);

    const hackathon = events[0];

    console.log('[Seed] Creating demo registration...');
    await Registration.create({
      eventId: hackathon._id,
      studentId: student._id,
      registrationDate: new Date(),
      status: 'registered',
      ticketCode: 'TKT-HACK-001',
      attendedAt: null,
    });

    console.log('[Seed] Creating demo notification...');
    await Notification.create({
      recipientId: student._id,
      eventId: hackathon._id,
      title: 'Registration Confirmed',
      message: 'You have successfully registered for Annual Hackathon 2026. Your ticket is ready.',
      isRead: false,
      type: 'registration_success',
    });

    console.log('[Seed] Seed data successfully populated!');
    console.log(`[Seed] Summary: ${users.length} users, ${events.length} events, 1 registration, 1 notification.`);
  } catch (error) {
    console.error('[Seed Error] Failed to populate seed data:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed] Database disconnected.');
    process.exit(0);
  }
};

seedData();
