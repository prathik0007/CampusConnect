/**
 * Automated test suite for Phase 5F-B: Push Notifications & Notification Center
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
  console.log('--- STARTING PHASE 5F-B PUSH NOTIFICATIONS TEST SUITE ---\n');

  const testSuffix = Date.now();
  const testPassword = 'Password@123';

  let student1Token, student2Token, orgToken;
  let student1User, student2User, orgUser;
  let testEventId = null;

  try {
    const { User, Event, Registration, Notification } = require('../models');
    const { sendExpoPushMessage } = require('../services/notificationService');

    // 1. Setup Users
    const student1Email = `stu1_notif_${testSuffix}@campus.edu`;
    const student2Email = `stu2_notif_${testSuffix}@campus.edu`;
    const orgEmail = `org_notif_${testSuffix}@campus.edu`;

    // Student 1
    const s1Res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Notification Student 1',
        email: student1Email,
        password: testPassword,
        role: 'student',
      }),
    }).then((r) => r.json());
    student1Token = s1Res.data?.token;
    student1User = s1Res.data?.user;

    // Student 2
    const s2Res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Notification Student 2',
        email: student2Email,
        password: testPassword,
        role: 'student',
      }),
    }).then((r) => r.json());
    student2Token = s2Res.data?.token;
    student2User = s2Res.data?.user;

    // Organizer
    const orgRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Notification Organizer',
        email: orgEmail,
        password: testPassword,
        role: 'organizer',
      }),
    }).then((r) => r.json());
    orgToken = orgRes.data?.token;
    orgUser = orgRes.data?.user;

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Setup] Test users registered successfully.\n');

    // ========================================================
    // TEST 1: Unauthenticated register-token request returns 401
    // ========================================================
    const unauthRegToken = await fetch(`${BASE_URL}/notifications/register-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pushToken: 'ExponentPushToken[dummy-token]' }),
    });
    assert(unauthRegToken.status === 401, '1. Unauthenticated register-token returns 401 Unauthorized');

    // ========================================================
    // TEST 2: Student can register push token
    // ========================================================
    const testPushToken1 = 'ExponentPushToken[stu1-test-token-abcdef]';
    const regToken1Res = await fetch(`${BASE_URL}/notifications/register-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Token}`,
      },
      body: JSON.stringify({ pushToken: testPushToken1 }),
    });
    const regToken1Json = await regToken1Res.json();
    assert(
      regToken1Res.status === 200 && regToken1Json.success === true,
      '2. Authenticated student can register a push token'
    );

    // ========================================================
    // TEST 3: Organizer can register push token
    // ========================================================
    const testPushTokenOrg = 'ExponentPushToken[org-test-token-123456]';
    const regTokenOrgRes = await fetch(`${BASE_URL}/notifications/register-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgToken}`,
      },
      body: JSON.stringify({ pushToken: testPushTokenOrg }),
    });
    assert(regTokenOrgRes.status === 200, '3. Authenticated organizer can register a push token');

    // ========================================================
    // TEST 4: Token is stored securely against authenticated user
    // ========================================================
    const userInDb = await User.findById(student1User.id).select('+pushToken');
    assert(
      userInDb && userInDb.pushToken === testPushToken1,
      '4. Push token is correctly saved in User.pushToken for authenticated user'
    );

    // ========================================================
    // TEST 5: Client cannot register empty push token
    // ========================================================
    const emptyTokenRes = await fetch(`${BASE_URL}/notifications/register-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Token}`,
      },
      body: JSON.stringify({ pushToken: '   ' }),
    });
    assert(emptyTokenRes.status === 400, '5. Empty or whitespace-only push token is rejected with 400 Bad Request');

    // ========================================================
    // TEST 6: Create an Event by Organizer
    // ========================================================
    const createEvtRes = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgToken}`,
      },
      body: JSON.stringify({
        title: `Notification Summit ${testSuffix}`,
        description: 'Event to test push and in-app notifications on registration/updates.',
        category: 'Technical',
        startDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 4).toISOString(),
        venue: 'Room 303',
        maxCapacity: 50,
        status: 'published',
      }),
    }).then((r) => r.json());
    testEventId = createEvtRes.data?.event?.id;

    // ========================================================
    // TEST 7: Successful registration creates registration_success notification
    // ========================================================
    await fetch(`${BASE_URL}/events/${testEventId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
    });

    // Small delay to allow asynchronous notification creation
    await new Promise((r) => setTimeout(r, 600));

    const regNotifs = await Notification.find({
      recipientId: student1User.id,
      type: 'registration_success',
      eventId: testEventId,
    });
    assert(
      regNotifs.length === 1 && regNotifs[0].title === 'Registration Successful',
      '6. Successful event registration creates registration_success notification in MongoDB'
    );

    // ========================================================
    // TEST 8: User can retrieve their own notifications
    // ========================================================
    const getNotifsRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const getNotifsJson = await getNotifsRes.json();
    const student1NotifsList = getNotifsJson.data?.notifications || [];
    assert(
      getNotifsRes.status === 200 &&
        student1NotifsList.length >= 1 &&
        student1NotifsList[0].recipientId === student1User.id,
      '7. User can retrieve their own notifications list with unreadCount'
    );

    // ========================================================
    // TEST 9: User cannot view another user's notifications
    // ========================================================
    const s2NotifsRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    const s2NotifsJson = await s2NotifsRes.json();
    const student2NotifsList = s2NotifsJson.data?.notifications || [];
    assert(
      student2NotifsList.length === 0,
      '8. User cannot view another user\'s notifications; response strictly scoped to authenticated user'
    );

    // ========================================================
    // TEST 10: User can mark their own notification as read
    // ========================================================
    const notifToMark = student1NotifsList[0];
    const markReadRes = await fetch(`${BASE_URL}/notifications/${notifToMark.id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const markReadJson = await markReadRes.json();
    assert(
      markReadRes.status === 200 && markReadJson.data?.notification?.isRead === true,
      '9. User can mark their own notification as read (isRead: true)'
    );

    // ========================================================
    // TEST 11: User cannot mark another user's notification as read (404/403)
    // ========================================================
    const markOtherRes = await fetch(`${BASE_URL}/notifications/${notifToMark.id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    assert(
      markOtherRes.status === 404,
      '10. User cannot mark another user\'s notification as read (404 Not Found)'
    );

    // ========================================================
    // TEST 12: Mark all notifications read
    // ========================================================
    // Create an unread notification for student 1
    await Notification.create({
      recipientId: student1User.id,
      title: 'Second Alert',
      message: 'Testing mark all read',
      type: 'general',
      isRead: false,
    });

    const markAllRes = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const markAllJson = await markAllRes.json();
    assert(
      markAllRes.status === 200 && markAllJson.data?.updatedCount >= 1,
      '11. Mark-all-read updates all unread notifications for authenticated user'
    );

    // Verify unread count is now 0
    const unreadCheck = await fetch(`${BASE_URL}/notifications?unreadOnly=true`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    }).then((r) => r.json());
    assert(
      unreadCheck.data?.unreadCount === 0 && unreadCheck.data?.notifications?.length === 0,
      '12. Unread notification count updates to 0 after mark-all-read'
    );

    // ========================================================
    // TEST 13: Event update sends notification to registered attendees
    // ========================================================
    // Student 2 registers then cancels
    await fetch(`${BASE_URL}/events/${testEventId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    await fetch(`${BASE_URL}/events/${testEventId}/register`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${student2Token}` },
    });

    // Organizer updates the event
    await fetch(`${BASE_URL}/events/${testEventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgToken}`,
      },
      body: JSON.stringify({
        title: `Updated Summit ${testSuffix}`,
      }),
    });

    await new Promise((r) => setTimeout(r, 600));

    // Student 1 (active registered) should receive update notification
    const s1UpdateNotifs = await Notification.find({
      recipientId: student1User.id,
      type: 'event_update',
      eventId: testEventId,
    });
    assert(
      s1UpdateNotifs.length === 1 && s1UpdateNotifs[0].title === 'Event Updated',
      '13. Active registered attendees receive event_update notification when event is edited'
    );

    // Student 2 (cancelled) must NOT receive update notification
    const s2UpdateNotifs = await Notification.find({
      recipientId: student2User.id,
      type: 'event_update',
      eventId: testEventId,
    });
    assert(
      s2UpdateNotifs.length === 0,
      '14. Cancelled registrations do NOT receive event_update notifications'
    );

    // ========================================================
    // TEST 14: Event cancellation sends notification to active attendees
    // ========================================================
    await fetch(`${BASE_URL}/events/${testEventId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${orgToken}` },
    });

    await new Promise((r) => setTimeout(r, 600));

    const s1CancelNotifs = await Notification.find({
      recipientId: student1User.id,
      type: 'cancellation',
      eventId: testEventId,
    });
    assert(
      s1CancelNotifs.length === 1 && s1CancelNotifs[0].title === 'Event Cancelled',
      '15. Active attendees receive cancellation notification when event is cancelled'
    );

    // ========================================================
    // TEST 15: Push delivery error does not crash service
    // ========================================================
    const fakePushResult = await sendExpoPushMessage('invalid-format-token', {
      title: 'Test',
      body: 'Test',
    });
    assert(
      fakePushResult.success === false,
      '16. Push delivery handles invalid tokens gracefully without throwing or crashing'
    );

    // ========================================================
    // TEST 16: Invalid notification ID format handled safely (400)
    // ========================================================
    const invalidIdRes = await fetch(`${BASE_URL}/notifications/invalid-id/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(invalidIdRes.status === 400, '17. Invalid notification ObjectId handled with 400 Bad Request');

    // ========================================================
    // Clean up test database records
    // ========================================================
    await Notification.deleteMany({
      recipientId: { $in: [student1User.id, student2User.id, orgUser.id] },
    });
    await Registration.deleteMany({ eventId: testEventId });
    await Event.findByIdAndDelete(testEventId);
    await User.deleteMany({
      email: { $in: [student1Email, student2Email, orgEmail] },
    });
    await mongoose.disconnect();
    console.log('[Cleanup] Test database records cleaned up.');
  } catch (err) {
    console.error('Test execution error:', err);
    assert(false, `Unexpected error: ${err.message}`);
    try {
      await mongoose.disconnect();
    } catch (_) {}
  }

  // Summary
  console.log('\n========================================');
  console.log('PHASE 5F-B TEST EXECUTION SUMMARY:');
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
