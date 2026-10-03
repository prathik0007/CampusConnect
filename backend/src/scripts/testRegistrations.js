/**
 * Comprehensive Automated Test Suite for Phase 5E: Event Registration, My Tickets, and Attendee Management
 */

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
  console.log('--- STARTING PHASE 5E REGISTRATION & ATTENDEE TEST SUITE ---\n');

  const testSuffix = Date.now();
  const testPassword = 'Password@123';

  // 1. Setup Users
  const student1Email = `stu1_reg_${testSuffix}@campus.edu`;
  const student2Email = `stu2_reg_${testSuffix}@campus.edu`;
  const org1Email = `org1_reg_${testSuffix}@campus.edu`;
  const org2Email = `org2_reg_${testSuffix}@campus.edu`;
  const adminEmail = `admin_reg_${testSuffix}@campus.edu`;

  let student1Token, student2Token, org1Token, org2Token, adminToken;
  let student1User, student2User, org1User, org2User, adminUser;

  try {
    // Register Student 1
    const s1Res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Registration Student 1',
        email: student1Email,
        password: testPassword,
        role: 'student',
        department: 'Computer Science',
        rollNumber: `CS-${testSuffix.toString().slice(-4)}`,
      }),
    }).then((r) => r.json());
    student1Token = s1Res.data?.token;
    student1User = s1Res.data?.user;

    // Register Student 2
    const s2Res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Registration Student 2',
        email: student2Email,
        password: testPassword,
        role: 'student',
        department: 'Information Science',
        rollNumber: `IS-${testSuffix.toString().slice(-4)}`,
      }),
    }).then((r) => r.json());
    student2Token = s2Res.data?.token;
    student2User = s2Res.data?.user;

    // Register Organizer 1
    const o1Res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Lead Organizer 1',
        email: org1Email,
        password: testPassword,
        role: 'organizer',
      }),
    }).then((r) => r.json());
    org1Token = o1Res.data?.token;
    org1User = o1Res.data?.user;

    // Register Organizer 2
    const o2Res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Lead Organizer 2',
        email: org2Email,
        password: testPassword,
        role: 'organizer',
      }),
    }).then((r) => r.json());
    org2Token = o2Res.data?.token;
    org2User = o2Res.data?.user;

    // Create and promote Admin user directly in DB
    const { User, Event, Registration } = require('../models');
    const { hashPassword } = require('../utils/password');
    const { generateToken } = require('../utils/jwt');

    await mongoose.connect(process.env.MONGODB_URI);

    const adminDoc = await User.create({
      name: 'System Admin',
      email: adminEmail,
      passwordHash: await hashPassword(testPassword),
      role: 'admin',
    });
    adminToken = generateToken(adminDoc);
    adminUser = adminDoc.toJSON();

    console.log('[Setup] Test users registered successfully.');

    // 2. Setup Events
    // Event 1: Normal published event by Org 1, maxCapacity = 5
    const createEvt1Res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${org1Token}`,
      },
      body: JSON.stringify({
        title: `Tech Summit ${testSuffix}`,
        description: 'Comprehensive tech symposium with hands-on coding tracks.',
        category: 'Technical',
        startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        venue: 'Auditorium Hall A',
        maxCapacity: 5,
        status: 'published',
      }),
    }).then((r) => r.json());
    const event1 = createEvt1Res.data?.event;

    // Event 2: Event with maxCapacity = 1 to test capacity limits
    const createEvt2Res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${org1Token}`,
      },
      body: JSON.stringify({
        title: `VIP Workshop ${testSuffix}`,
        description: 'Exclusive 1-seat workshop for capacity limit testing.',
        category: 'Workshop',
        startDate: new Date(Date.now() + 86400000 * 4).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        venue: 'Lab 101',
        maxCapacity: 1,
        status: 'published',
      }),
    }).then((r) => r.json());
    const event2 = createEvt2Res.data?.event;

    // Event 3: Draft event (should reject registration)
    const createEvt3Res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${org1Token}`,
      },
      body: JSON.stringify({
        title: `Draft Event ${testSuffix}`,
        description: 'Draft unapproved event.',
        category: 'Seminar',
        startDate: new Date(Date.now() + 86400000 * 6).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        venue: 'Room 204',
        maxCapacity: 20,
        status: 'draft',
      }),
    }).then((r) => r.json());
    const event3 = createEvt3Res.data?.event;

    console.log('[Setup] Test events created successfully.\n');

    // ========================================================
    // TEST 1: Student can register for published event (returns 201)
    // ========================================================
    const reg1Res = await fetch(`${BASE_URL}/events/${event1.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Token}`,
      },
    });
    const reg1Json = await reg1Res.json();
    assert(reg1Res.status === 201 && reg1Json.success === true, '1. Student can register for published event (returns 201)');

    // ========================================================
    // TEST 2 & 3: Ticket code is generated, unique, clean format
    // ========================================================
    const ticket1 = reg1Json.data?.registration?.ticketCode;
    assert(
      typeof ticket1 === 'string' && ticket1.startsWith('CC-') && ticket1.length >= 10,
      '2. Ticket code is generated in clean readable format (e.g. CC-XXXXXXXX)'
    );

    // ========================================================
    // TEST 4: Student cannot register twice (returns 409 Conflict)
    // ========================================================
    const regDupRes = await fetch(`${BASE_URL}/events/${event1.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Token}`,
      },
    });
    const regDupJson = await regDupRes.json();
    assert(
      regDupRes.status === 409 && regDupJson.message.toLowerCase().includes('already registered'),
      '3. Student cannot register twice (returns 409 Conflict with clear message)'
    );

    // ========================================================
    // TEST 5: Event registeredCount increments correctly
    // ========================================================
    const getEvt1AfterReg = await fetch(`${BASE_URL}/events/${event1.id}`).then((r) => r.json());
    assert(
      getEvt1AfterReg.data?.event?.registeredCount === 1,
      '4. Event registeredCount safely increments by 1'
    );

    // ========================================================
    // TEST 6: Student 2 registers for 1-capacity event (event2)
    // ========================================================
    const regEvt2Res = await fetch(`${BASE_URL}/events/${event2.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student2Token}`,
      },
    });
    const regEvt2Json = await regEvt2Res.json();
    assert(regEvt2Res.status === 201, '5. Student 2 successfully reserves last seat of capacity-1 event');

    // ========================================================
    // TEST 7: Full event rejects registration (409 Conflict)
    // ========================================================
    const regFullRes = await fetch(`${BASE_URL}/events/${event2.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Token}`,
      },
    });
    const regFullJson = await regFullRes.json();
    assert(
      regFullRes.status === 409 && regFullJson.message.toLowerCase().includes('full'),
      '6. Full event rejects subsequent registration with 409 Conflict'
    );

    // Verify registeredCount didn't exceed maxCapacity
    const checkEvt2Count = await fetch(`${BASE_URL}/events/${event2.id}`).then((r) => r.json());
    assert(
      checkEvt2Count.data?.event?.registeredCount === 1 &&
        checkEvt2Count.data?.event?.registeredCount <= checkEvt2Count.data?.event?.maxCapacity,
      '7. registeredCount strictly never exceeds maxCapacity'
    );

    // ========================================================
    // TEST 8: Registration rejected for non-published event (draft)
    // ========================================================
    const regDraftRes = await fetch(`${BASE_URL}/events/${event3.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Token}`,
      },
    });
    assert(regDraftRes.status === 400, '8. Draft / unpublished event rejects registration');

    // ========================================================
    // TEST 9: Student cannot register another student (studentId comes strictly from token)
    // ========================================================
    // Even if student1 passes spoofed studentId in body, the registration is registered to student1
    const spoofRegRes = await fetch(`${BASE_URL}/events/${event1.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student2Token}`,
      },
      body: JSON.stringify({ studentId: student1User.id }),
    });
    const spoofJson = await spoofRegRes.json();
    assert(
      spoofRegRes.status === 201 && spoofJson.data?.registration?.studentId === student2User.id,
      '9. studentId is strictly derived from req.user._id, client cannot register for another student'
    );

    // ========================================================
    // TEST 10: Student can view their own registrations / tickets
    // ========================================================
    const myRegsRes = await fetch(`${BASE_URL}/students/my-registrations`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const myRegsJson = await myRegsRes.json();
    const myRegsList = myRegsJson.data?.registrations || [];
    assert(
      myRegsRes.status === 200 &&
        myRegsList.length === 1 &&
        myRegsList[0].eventId === event1.id &&
        myRegsList[0].eventTitle === event1.title,
      '10. Student can view their own registrations with populated event metadata'
    );

    // ========================================================
    // TEST 11: Student cannot view another student's registrations
    // ========================================================
    // Even if student1 attempts to pass ?studentId=student2User.id
    const crossRegsRes = await fetch(`${BASE_URL}/students/my-registrations?studentId=${student2User.id}`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const crossRegsJson = await crossRegsRes.json();
    const crossRegsList = crossRegsJson.data?.registrations || [];
    assert(
      crossRegsList.every((r) => r.studentId === student1User.id),
      '11. Student can only receive their own registrations, query param studentId is ignored'
    );

    // ========================================================
    // TEST 12: Student can cancel their registration
    // ========================================================
    const cancelRes = await fetch(`${BASE_URL}/events/${event1.id}/register`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const cancelJson = await cancelRes.json();
    assert(
      cancelRes.status === 200 && cancelJson.data?.registration?.status === 'cancelled',
      '12. Student can cancel their registration; status updates to cancelled without deleting record'
    );

    // ========================================================
    // TEST 13: Cancellation decrements event registeredCount
    // ========================================================
    const checkEvt1AfterCancel = await fetch(`${BASE_URL}/events/${event1.id}`).then((r) => r.json());
    assert(
      checkEvt1AfterCancel.data?.event?.registeredCount === 1, // was 2 before cancellation (student1 + student2)
      '13. Cancellation safely decrements event registeredCount'
    );

    // ========================================================
    // TEST 14: Cancelling already cancelled registration returns 400
    // ========================================================
    const cancelAgainRes = await fetch(`${BASE_URL}/events/${event1.id}/register`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(
      cancelAgainRes.status === 400 || cancelAgainRes.status === 404,
      '14. Cannot cancel an already cancelled registration (returns 400 Bad Request)'
    );

    // ========================================================
    // TEST 15: Student can re-register after cancellation (clean reactivation)
    // ========================================================
    const reRegRes = await fetch(`${BASE_URL}/events/${event1.id}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const reRegJson = await reRegRes.json();
    assert(
      (reRegRes.status === 200 || reRegRes.status === 201) &&
        reRegJson.data?.registration?.status === 'registered' &&
        reRegJson.data?.registration?.ticketCode !== ticket1,
      '15. Student can re-register; existing record is reactivated with fresh ticketCode without duplicate records'
    );

    // Verify DB count of registrations for student1 + event1 is exactly 1
    const student1Event1Records = await Registration.countDocuments({
      eventId: event1.id,
      studentId: student1User.id,
    });
    assert(student1Event1Records === 1, '16. Re-registration does not create duplicate event/student records');

    // ========================================================
    // TEST 16: Organizer can view their event attendees
    // ========================================================
    const orgAttendeesRes = await fetch(`${BASE_URL}/events/${event1.id}/attendees`, {
      headers: { Authorization: `Bearer ${org1Token}` },
    });
    const orgAttendeesJson = await orgAttendeesRes.json();
    const attendeeList = orgAttendeesJson.data?.attendees || [];
    assert(
      orgAttendeesRes.status === 200 && attendeeList.length === 2,
      '17. Organizer can view attendee list for their own event'
    );

    // Verify sanitized student fields
    const firstAttendee = attendeeList[0];
    assert(
      firstAttendee.studentName &&
        firstAttendee.studentEmail &&
        firstAttendee.passwordHash === undefined &&
        firstAttendee.password === undefined,
      '18. Attendee list populates safe student details without leaking credentials or hashes'
    );

    // ========================================================
    // TEST 17: Organizer cannot view another organizer's attendees (403)
    // ========================================================
    const crossOrgAttendeesRes = await fetch(`${BASE_URL}/events/${event1.id}/attendees`, {
      headers: { Authorization: `Bearer ${org2Token}` },
    });
    assert(
      crossOrgAttendeesRes.status === 403,
      '19. Organizer is forbidden (403) from viewing attendees of another organizer\'s event'
    );

    // ========================================================
    // TEST 18: Student cannot view attendee list (403)
    // ========================================================
    const stuAttendeesRes = await fetch(`${BASE_URL}/events/${event1.id}/attendees`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(stuAttendeesRes.status === 403, '20. Student cannot view organizer attendee lists (403)');

    // ========================================================
    // TEST 19: Admin can view any event's attendee list
    // ========================================================
    const adminAttendeesRes = await fetch(`${BASE_URL}/events/${event1.id}/attendees`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminAttendeesRes.status === 200, '21. Admin can view attendee lists for any event');

    // ========================================================
    // TEST 20: Organizer can mark attendee as attended
    // ========================================================
    const markAttendedRes = await fetch(`${BASE_URL}/events/${event1.id}/attendees/${student1User.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${org1Token}`,
      },
      body: JSON.stringify({ status: 'attended' }),
    });
    const markAttendedJson = await markAttendedRes.json();
    assert(
      markAttendedRes.status === 200 &&
        markAttendedJson.data?.registration?.status === 'attended' &&
        !!markAttendedJson.data?.registration?.attendedAt,
      '22. Organizer can mark student as attended; attendedAt timestamp is recorded'
    );

    // ========================================================
    // TEST 21: Student cannot mark their own or others attendance (403)
    // ========================================================
    const stuMarkRes = await fetch(`${BASE_URL}/events/${event1.id}/attendees/${student1User.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Token}`,
      },
      body: JSON.stringify({ status: 'attended' }),
    });
    assert(stuMarkRes.status === 403, '23. Student is forbidden (403) from marking attendance');

    // ========================================================
    // TEST 22: Organizer cannot mark attendance for another organizer's event (403)
    // ========================================================
    const crossOrgMarkRes = await fetch(`${BASE_URL}/events/${event1.id}/attendees/${student1User.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${org2Token}`,
      },
      body: JSON.stringify({ status: 'attended' }),
    });
    assert(
      crossOrgMarkRes.status === 403,
      '24. Organizer cannot mark attendance for another organizer\'s event (403 Forbidden)'
    );

    // ========================================================
    // TEST 23: Invalid event ID handled safely
    // ========================================================
    const invalidIdRes = await fetch(`${BASE_URL}/events/invalid-hex-id/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(invalidIdRes.status === 400, '25. Invalid event ObjectId is handled safely with 400 Bad Request');

    // ========================================================
    // TEST 24: Unauthenticated request rejected (401)
    // ========================================================
    const unauthRegRes = await fetch(`${BASE_URL}/events/${event1.id}/register`, {
      method: 'POST',
    });
    assert(unauthRegRes.status === 401, '26. Unauthenticated registration attempt is rejected (401 Unauthorized)');

    // ========================================================
    // TEST 25: Organizer can revert attended back to registered
    // ========================================================
    const revertAttendedRes = await fetch(`${BASE_URL}/events/${event1.id}/attendees/${student1User.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${org1Token}`,
      },
      body: JSON.stringify({ status: 'registered' }),
    });
    const revertJson = await revertAttendedRes.json();
    assert(
      revertAttendedRes.status === 200 &&
        revertJson.data?.registration?.status === 'registered' &&
        revertJson.data?.registration?.attendedAt === null,
      '27. Organizer can revert attended back to registered, resetting attendedAt to null'
    );

    // ========================================================
    // Clean up test data
    // ========================================================
    await Registration.deleteMany({
      $or: [{ eventId: event1.id }, { eventId: event2.id }, { eventId: event3.id }],
    });
    await Event.deleteMany({
      _id: { $in: [event1.id, event2.id, event3.id] },
    });
    await User.deleteMany({
      email: { $in: [student1Email, student2Email, org1Email, org2Email, adminEmail] },
    });
    await mongoose.disconnect();
    console.log('\n[Cleanup] Test data safely cleaned up from MongoDB.');
  } catch (err) {
    console.error('Test execution error:', err);
    assert(false, `Unexpected error: ${err.message}`);
    try {
      await mongoose.disconnect();
    } catch (_) {}
  }

  // Summary
  console.log('\n========================================');
  console.log('PHASE 5E TEST EXECUTION SUMMARY:');
  const passed = results.filter((r) => r.status === 'PASSED').length;
  const failed = results.filter((r) => r.status === 'FAILED').length;
  console.log(`Passed: ${passed} / ${results.length}`);
  console.log(`Failed: ${failed} / ${results.length}`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
