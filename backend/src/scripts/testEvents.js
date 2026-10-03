/**
 * Automated test script for Phase 5D Event REST API & Authorization
 */

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const BASE_URL = 'http://localhost:5000/api';
const results = [];

function assert(condition, message) {
  if (condition) {
    results.push({ test: message, status: 'PASSED' });
    console.log(`[PASS] ${message}`);
  } else {
    results.push({ test: message, status: 'FAILED' });
    console.error(`[FAIL] ${message}`);
  }
}

async function runTests() {
  console.log('--- STARTING PHASE 5D EVENT REST API TEST SUITE ---\n');

  const testSuffix = Date.now();
  const testPassword = 'Password@123';

  // 0. Setup: Register Student, Organizer A, Organizer B, and create an Admin in DB
  const studentEmail = `stu_evt_${testSuffix}@campus.edu`;
  const orgAEmail = `orgA_evt_${testSuffix}@campus.edu`;
  const orgBEmail = `orgB_evt_${testSuffix}@campus.edu`;
  const adminEmail = `admin_evt_${testSuffix}@campus.edu`;

  let studentToken, orgAToken, orgBToken, adminToken;
  let studentUser, orgAUser, orgBUser, adminUser;

  // Register Student
  const regStu = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Event Student',
      email: studentEmail,
      password: testPassword,
      role: 'student',
    }),
  }).then((r) => r.json());
  studentToken = regStu.data?.token;
  studentUser = regStu.data?.user;

  // Register Organizer A
  const regOrgA = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Organizer Alpha',
      email: orgAEmail,
      password: testPassword,
      role: 'organizer',
    }),
  }).then((r) => r.json());
  orgAToken = regOrgA.data?.token;
  orgAUser = regOrgA.data?.user;

  // Register Organizer B
  const regOrgB = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Organizer Beta',
      email: orgBEmail,
      password: testPassword,
      role: 'organizer',
    }),
  }).then((r) => r.json());
  orgBToken = regOrgB.data?.token;
  orgBUser = regOrgB.data?.user;

  // Admin user (direct MongoDB insertion since public admin register is blocked)
  const { User, Event } = require('../models');
  const { hashPassword } = require('../utils/password');
  const { generateToken } = require('../utils/jwt');
  await mongoose.connect(process.env.MONGODB_URI);
  const adminDoc = await User.create({
    name: 'Event Admin',
    email: adminEmail,
    passwordHash: await hashPassword(testPassword),
    role: 'admin',
  });
  adminToken = generateToken(adminDoc);
  adminUser = adminDoc.toJSON();
  await mongoose.disconnect();

  let eventAId = null;

  // 1. Student cannot create event (expect 403)
  try {
    const res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Unauthorized Student Event',
        description: 'Should be rejected',
        category: 'Technical',
        startDate: '2026-11-10T10:00:00.000Z',
        endDate: '2026-11-10T12:00:00.000Z',
        venue: 'Room 101',
        maxCapacity: 50,
      }),
    });
    assert(res.status === 403, '1. Student cannot create event (HTTP 403 Forbidden)');
  } catch (e) {
    assert(false, `1. Student create event failed: ${e.message}`);
  }

  // 2. Organizer can create event
  try {
    const res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgAToken}`,
      },
      body: JSON.stringify({
        title: 'Robotics Workshop 2026',
        description: 'Hands-on robotics prototyping and ROS programming.',
        category: 'Workshop',
        bannerUrl: 'https://images.unsplash.com/photo-robotics',
        startDate: '2026-11-15T09:00:00.000Z',
        endDate: '2026-11-15T17:00:00.000Z',
        venue: 'Mechatronics Lab 3',
        maxCapacity: 60,
        status: 'published',
        organizerId: '60c72b2f9b1d8b0015b67890', // Spoof attempt! Must be ignored.
        registeredCount: 999, // Attempt to manipulate count! Must be ignored.
      }),
    });
    const data = await res.json();
    eventAId = data.data?.event?.id;
    const isOwnerMatch = data.data?.event?.organizerId === orgAUser.id;
    const isCountEnforcedZero = data.data?.event?.registeredCount === 0;

    assert(
      res.status === 201 && data.success === true && !!eventAId,
      '2. Organizer can create event (HTTP 201 Created)'
    );
    assert(
      isOwnerMatch,
      '3. organizerId strictly assigned from authenticated user (spoof attempt ignored)'
    );
    assert(
      isCountEnforcedZero,
      '4. registeredCount cannot be manipulated at creation (enforced to 0)'
    );
  } catch (e) {
    assert(false, `2. Organizer create event failed: ${e.message}`);
  }

  // 3. GET /api/events returns published events
  try {
    const res = await fetch(`${BASE_URL}/events`);
    const data = await res.json();
    const hasCreatedEvent = data.data?.events?.some((e) => e.id === eventAId);
    assert(
      res.status === 200 && data.success === true && hasCreatedEvent,
      '5. GET /api/events returns published event in list'
    );
  } catch (e) {
    assert(false, `3. GET /api/events failed: ${e.message}`);
  }

  // 4. GET /api/events/:id returns single event
  try {
    const res = await fetch(`${BASE_URL}/events/${eventAId}`);
    const data = await res.json();
    assert(
      res.status === 200 && data.data?.event?.id === eventAId,
      '6. GET /api/events/:id returns valid event details'
    );
  } catch (e) {
    assert(false, `4. GET /api/events/:id failed: ${e.message}`);
  }

  // 5. GET nonexistent event returns 404
  try {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await fetch(`${BASE_URL}/events/${fakeId}`);
    assert(res.status === 404, '7. GET nonexistent event returns HTTP 404');
  } catch (e) {
    assert(false, `5. GET nonexistent event test failed: ${e.message}`);
  }

  // 6. Invalid ObjectId returns 400
  try {
    const res = await fetch(`${BASE_URL}/events/invalid-object-id-123`);
    assert(res.status === 400, '8. Invalid ObjectId returns HTTP 400 Bad Request');
  } catch (e) {
    assert(false, `6. Invalid ObjectId test failed: ${e.message}`);
  }

  // 7. Organizer can retrieve their own events with ?mine=true
  try {
    const res = await fetch(`${BASE_URL}/events?mine=true`, {
      headers: { Authorization: `Bearer ${orgAToken}` },
    });
    const data = await res.json();
    const allMine = data.data?.events?.every((e) => e.organizerId === orgAUser.id);
    assert(
      res.status === 200 && allMine === true,
      '9. Organizer retrieves their own events with ?mine=true'
    );
  } catch (e) {
    assert(false, `7. ?mine=true failed: ${e.message}`);
  }

  // 8. Student blocked from ?mine=true (expect 403)
  try {
    const res = await fetch(`${BASE_URL}/events?mine=true`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      res.status === 403,
      '10. Student is blocked from using ?mine=true (HTTP 403 Forbidden)'
    );
  } catch (e) {
    assert(false, `8. Student mine=true test failed: ${e.message}`);
  }

  // 9. Organizer A can update their own event
  try {
    const res = await fetch(`${BASE_URL}/events/${eventAId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgAToken}`,
      },
      body: JSON.stringify({
        title: 'Updated Robotics Workshop 2026',
        maxCapacity: 75,
      }),
    });
    const data = await res.json();
    assert(
      res.status === 200 &&
        data.data?.event?.title === 'Updated Robotics Workshop 2026' &&
        data.data?.event?.maxCapacity === 75,
      '11. Organizer can update their own event'
    );
  } catch (e) {
    assert(false, `9. Update own event failed: ${e.message}`);
  }

  // 10. Organizer B CANNOT update Organizer A's event (expect 403)
  try {
    const res = await fetch(`${BASE_URL}/events/${eventAId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgBToken}`,
      },
      body: JSON.stringify({
        title: 'Hacked by Organizer B',
      }),
    });
    assert(
      res.status === 403,
      "12. Organizer cannot update another organizer's event (HTTP 403 Forbidden)"
    );
  } catch (e) {
    assert(false, `10. Cross-organizer update test failed: ${e.message}`);
  }

  // 11. Student CANNOT update event (expect 403)
  try {
    const res = await fetch(`${BASE_URL}/events/${eventAId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ title: 'Student Hack' }),
    });
    assert(res.status === 403, '13. Student cannot update events (HTTP 403 Forbidden)');
  } catch (e) {
    assert(false, `11. Student update test failed: ${e.message}`);
  }

  // 12. Validation: End Date cannot be earlier than Start Date
  try {
    const res = await fetch(`${BASE_URL}/events/${eventAId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgAToken}`,
      },
      body: JSON.stringify({
        startDate: '2026-11-20T10:00:00.000Z',
        endDate: '2026-11-19T10:00:00.000Z',
      }),
    });
    assert(res.status === 400, '14. Invalid dates (startDate > endDate) are rejected with HTTP 400');
  } catch (e) {
    assert(false, `12. Invalid dates test failed: ${e.message}`);
  }

  // 13. Validation: Capacity must be positive number
  try {
    const res = await fetch(`${BASE_URL}/events/${eventAId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgAToken}`,
      },
      body: JSON.stringify({
        maxCapacity: -5,
      }),
    });
    assert(res.status === 400, '15. Invalid capacity (negative number) is rejected with HTTP 400');
  } catch (e) {
    assert(false, `13. Invalid capacity test failed: ${e.message}`);
  }

  // 14. Validation: maxCapacity cannot be reduced below registeredCount
  try {
    // Artificially simulate 10 registered attendees directly in DB for test
    await mongoose.connect(process.env.MONGODB_URI);
    await Event.findByIdAndUpdate(eventAId, { registeredCount: 10 });
    await mongoose.disconnect();

    const res = await fetch(`${BASE_URL}/events/${eventAId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgAToken}`,
      },
      body: JSON.stringify({
        maxCapacity: 5, // Lower than 10!
      }),
    });
    assert(
      res.status === 400,
      '16. maxCapacity cannot be reduced below registeredCount (HTTP 400)'
    );
  } catch (e) {
    assert(false, `14. Capacity vs registeredCount test failed: ${e.message}`);
  }

  // 15. Search filtering works
  try {
    const res = await fetch(`${BASE_URL}/events?search=robotics`);
    const data = await res.json();
    const found = data.data?.events?.some((e) => e.id === eventAId);
    assert(res.status === 200 && found, '17. Search filtering (?search=robotics) works');
  } catch (e) {
    assert(false, `15. Search test failed: ${e.message}`);
  }

  // 16. Category filtering works
  try {
    const res = await fetch(`${BASE_URL}/events?category=Workshop`);
    const data = await res.json();
    const allWorkshop = data.data?.events?.every((e) => e.category === 'Workshop');
    assert(
      res.status === 200 && allWorkshop === true,
      '18. Category filtering (?category=Workshop) works'
    );
  } catch (e) {
    assert(false, `16. Category test failed: ${e.message}`);
  }

  // 17. Pagination works
  try {
    const res = await fetch(`${BASE_URL}/events?page=1&limit=2`);
    const data = await res.json();
    assert(
      res.status === 200 &&
        data.data?.events?.length <= 2 &&
        data.data?.pagination?.page === 1 &&
        data.data?.pagination?.limit === 2,
      '19. Pagination (?page=1&limit=2) works'
    );
  } catch (e) {
    assert(false, `17. Pagination test failed: ${e.message}`);
  }

  // 18. Organizer B CANNOT cancel Organizer A's event (expect 403)
  try {
    const res = await fetch(`${BASE_URL}/events/${eventAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${orgBToken}` },
    });
    assert(
      res.status === 403,
      "20. Organizer cannot cancel another organizer's event (HTTP 403 Forbidden)"
    );
  } catch (e) {
    assert(false, `18. Cross-organizer cancel test failed: ${e.message}`);
  }

  // 19. Student CANNOT cancel event (expect 403)
  try {
    const res = await fetch(`${BASE_URL}/events/${eventAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(res.status === 403, '21. Student cannot cancel event (HTTP 403 Forbidden)');
  } catch (e) {
    assert(false, `19. Student cancel test failed: ${e.message}`);
  }

  // 20. Organizer A can cancel their own event (safe cancellation)
  try {
    const res = await fetch(`${BASE_URL}/events/${eventAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${orgAToken}` },
    });
    const data = await res.json();
    assert(
      res.status === 200 && data.data?.event?.status === 'cancelled',
      '22. Organizer can cancel their own event (safe cancellation, status: "cancelled")'
    );
  } catch (e) {
    assert(false, `20. Cancel event test failed: ${e.message}`);
  }

  // 21. Admin can manage events (e.g. update cancelled event)
  try {
    const res = await fetch(`${BASE_URL}/events/${eventAId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        description: 'Updated by University Admin',
      }),
    });
    const data = await res.json();
    assert(
      res.status === 200 && data.data?.event?.description === 'Updated by University Admin',
      '23. Admin can update events across any organizer'
    );
  } catch (e) {
    assert(false, `21. Admin update test failed: ${e.message}`);
  }

  // 22. Existing Health Check endpoint still works
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    assert(
      res.status === 200 && data.database === 'connected',
      '24. Existing health check (/api/health) still works cleanly'
    );
  } catch (e) {
    assert(false, `22. Health check test failed: ${e.message}`);
  }

  // Clean up test documents in MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await User.deleteMany({
      email: { $in: [studentEmail, orgAEmail, orgBEmail, adminEmail] },
    });
    await Event.findByIdAndDelete(eventAId);
    await mongoose.disconnect();
    console.log('[Cleanup] Test documents cleaned up cleanly.');
  } catch (e) {
    console.warn('[Cleanup Warning]', e.message);
  }

  console.log('\n--- TEST SUITE SUMMARY ---');
  const passedCount = results.filter((r) => r.status === 'PASSED').length;
  console.log(`Passed: ${passedCount} / ${results.length}`);

  if (passedCount === results.length) {
    console.log('ALL PHASE 5D TESTS PASSED SUCCESSFULLY! ✅');
  } else {
    console.error('SOME TESTS FAILED! ❌');
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
