/**
 * Automated test suite for Phase 5F-A: Cloudinary Event Image Upload
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

// 1x1 transparent PNG file buffer for valid test image
const VALID_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Helper to create multipart form-data payload using Node 18+ FormData & Blob
function createFormData(fileBuffer, filename, mimeType) {
  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: mimeType });
  formData.append('image', blob, filename);
  return formData;
}

async function runTests() {
  console.log('--- STARTING PHASE 5F-A CLOUDINARY UPLOADS TEST SUITE ---\n');

  const testSuffix = Date.now();
  const testPassword = 'Password@123';

  let studentToken, orgToken, adminToken;
  let studentUser, orgUser, adminUser;
  let uploadedPublicId = null;
  let uploadedUrl = null;
  let createdEventId = null;

  try {
    // 1. Setup Users
    const studentEmail = `stu_up_${testSuffix}@campus.edu`;
    const orgEmail = `org_up_${testSuffix}@campus.edu`;
    const adminEmail = `admin_up_${testSuffix}@campus.edu`;

    // Student
    const stuRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Upload Student',
        email: studentEmail,
        password: testPassword,
        role: 'student',
      }),
    }).then((r) => r.json());
    studentToken = stuRes.data?.token;
    studentUser = stuRes.data?.user;

    // Organizer
    const orgRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Upload Organizer',
        email: orgEmail,
        password: testPassword,
        role: 'organizer',
      }),
    }).then((r) => r.json());
    orgToken = orgRes.data?.token;
    orgUser = orgRes.data?.user;

    // Admin
    const { User, Event } = require('../models');
    const { hashPassword } = require('../utils/password');
    const { generateToken } = require('../utils/jwt');
    const { getCloudinary } = require('../config/cloudinary');

    await mongoose.connect(process.env.MONGODB_URI);
    const adminDoc = await User.create({
      name: 'Upload Admin',
      email: adminEmail,
      passwordHash: await hashPassword(testPassword),
      role: 'admin',
    });
    adminToken = generateToken(adminDoc);
    adminUser = adminDoc.toJSON();

    console.log('[Setup] Test users created successfully.\n');

    // ========================================================
    // TEST 1: Unauthenticated upload returns 401 Unauthorized
    // ========================================================
    const unauthForm = createFormData(VALID_PNG_BUFFER, 'test.png', 'image/png');
    const unauthRes = await fetch(`${BASE_URL}/uploads/event-banner`, {
      method: 'POST',
      body: unauthForm,
    });
    assert(unauthRes.status === 401, '1. Unauthenticated upload returns 401 Unauthorized');

    // ========================================================
    // TEST 2: Student upload returns 403 Forbidden
    // ========================================================
    const studentForm = createFormData(VALID_PNG_BUFFER, 'test.png', 'image/png');
    const studentRes = await fetch(`${BASE_URL}/uploads/event-banner`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: studentForm,
    });
    assert(studentRes.status === 403, '2. Student upload returns 403 Forbidden');

    // ========================================================
    // TEST 3: Invalid MIME type is rejected with 400 Bad Request
    // ========================================================
    const textBuffer = Buffer.from('This is a text document, not an image.');
    const textForm = createFormData(textBuffer, 'document.txt', 'text/plain');
    const textRes = await fetch(`${BASE_URL}/uploads/event-banner`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${orgToken}` },
      body: textForm,
    });
    assert(textRes.status === 400, '3. Invalid MIME type (text/plain) is rejected with 400 Bad Request');

    // ========================================================
    // TEST 4: Oversized file (> 5MB) is rejected with 400 Bad Request
    // ========================================================
    const oversizedBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    const overForm = createFormData(oversizedBuffer, 'huge.png', 'image/png');
    const overRes = await fetch(`${BASE_URL}/uploads/event-banner`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${orgToken}` },
      body: overForm,
    });
    assert(overRes.status === 400, '4. Oversized image (> 5MB) is rejected with 400 Bad Request');

    // ========================================================
    // TEST 5: Missing image attachment returns 400 Bad Request
    // ========================================================
    const emptyForm = new FormData();
    const emptyRes = await fetch(`${BASE_URL}/uploads/event-banner`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${orgToken}` },
      body: emptyForm,
    });
    assert(emptyRes.status === 400, '5. Empty upload payload returns 400 Bad Request');

    // ========================================================
    // TEST 6: Organizer can upload valid image to Cloudinary (returns 200)
    // ========================================================
    const orgValidForm = createFormData(VALID_PNG_BUFFER, 'campus_event_banner.png', 'image/png');
    const orgUploadRes = await fetch(`${BASE_URL}/uploads/event-banner`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${orgToken}` },
      body: orgValidForm,
    });
    const orgUploadJson = await orgUploadRes.json();
    uploadedUrl = orgUploadJson.data?.url;
    uploadedPublicId = orgUploadJson.data?.publicId;

    assert(
      orgUploadRes.status === 200 && orgUploadJson.success === true,
      '6. Organizer can upload valid image (returns 200 OK)'
    );

    // ========================================================
    // TEST 7: Successful upload returns secure HTTPS URL
    // ========================================================
    assert(
      typeof uploadedUrl === 'string' &&
        uploadedUrl.startsWith('https://res.cloudinary.com/') &&
        uploadedUrl.includes('/campusconnect/events/'),
      '7. Successful upload returns secure HTTPS URL placed in campusconnect/events/ folder'
    );

    // ========================================================
    // TEST 8: Returned publicId is present and scoped
    // ========================================================
    assert(
      typeof uploadedPublicId === 'string' && uploadedPublicId.startsWith('campusconnect/events/'),
      '8. Returned publicId is present and scoped under campusconnect/events/'
    );

    // ========================================================
    // TEST 9: Cloudinary API credentials are NOT exposed in response
    // ========================================================
    const responseStr = JSON.stringify(orgUploadJson);
    assert(
      !responseStr.includes(process.env.CLOUDINARY_API_SECRET) &&
        !responseStr.includes('api_secret') &&
        !responseStr.includes('api_key'),
      '9. Response does NOT expose Cloudinary API secret or credentials'
    );

    // ========================================================
    // TEST 10: Admin can also upload valid image
    // ========================================================
    const adminValidForm = createFormData(VALID_PNG_BUFFER, 'admin_banner.png', 'image/png');
    const adminUploadRes = await fetch(`${BASE_URL}/uploads/event-banner`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: adminValidForm,
    });
    const adminUploadJson = await adminUploadRes.json();
    assert(adminUploadRes.status === 200, '10. Admin can upload valid image to Cloudinary');

    // Clean up admin test asset
    if (adminUploadJson.data?.publicId) {
      try {
        const cloudinary = getCloudinary();
        await cloudinary.uploader.destroy(adminUploadJson.data.publicId);
      } catch (_) {}
    }

    // ========================================================
    // TEST 11: Event can be created with the returned Cloudinary bannerUrl
    // ========================================================
    const createEvtRes = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgToken}`,
      },
      body: JSON.stringify({
        title: `Cloudinary Event ${testSuffix}`,
        description: 'Demonstrating cloud image upload integration for event banners.',
        category: 'Technical',
        bannerUrl: uploadedUrl,
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        venue: 'Engineering Hall 3',
        maxCapacity: 100,
        status: 'published',
      }),
    }).then((r) => r.json());
    createdEventId = createEvtRes.data?.event?.id;

    assert(
      createEvtRes.success === true && createEvtRes.data?.event?.bannerUrl === uploadedUrl,
      '11. Event is created with Cloudinary secure HTTPS bannerUrl stored in MongoDB'
    );

    // ========================================================
    // TEST 12: Event can be edited with a new bannerUrl
    // ========================================================
    const newBannerUrl = 'https://res.cloudinary.com/dummy/image/upload/v1/campusconnect/events/updated.png';
    const updateEvtRes = await fetch(`${BASE_URL}/events/${createdEventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgToken}`,
      },
      body: JSON.stringify({
        bannerUrl: newBannerUrl,
      }),
    }).then((r) => r.json());

    assert(
      updateEvtRes.success === true && updateEvtRes.data?.event?.bannerUrl === newBannerUrl,
      '12. Event bannerUrl can be edited and updated in MongoDB'
    );

    // ========================================================
    // TEST 13: Event bannerUrl remains unchanged if not updated
    // ========================================================
    const updateTitleOnlyRes = await fetch(`${BASE_URL}/events/${createdEventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgToken}`,
      },
      body: JSON.stringify({
        title: `Updated Title ${testSuffix}`,
      }),
    }).then((r) => r.json());

    assert(
      updateTitleOnlyRes.data?.event?.bannerUrl === newBannerUrl,
      '13. Event bannerUrl remains unchanged when editing other event fields'
    );

    // ========================================================
    // Clean up test assets in Cloudinary & MongoDB
    // ========================================================
    if (uploadedPublicId) {
      try {
        const cloudinary = getCloudinary();
        await cloudinary.uploader.destroy(uploadedPublicId);
        console.log('[Cleanup] Test image deleted from Cloudinary.');
      } catch (cErr) {
        console.warn('[Cleanup Warning] Could not delete image from Cloudinary:', cErr.message);
      }
    }

    if (createdEventId) {
      await Event.findByIdAndDelete(createdEventId);
    }
    await User.deleteMany({
      email: { $in: [studentEmail, orgEmail, adminEmail] },
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
  console.log('PHASE 5F-A TEST EXECUTION SUMMARY:');
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
