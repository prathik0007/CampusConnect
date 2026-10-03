/**
 * Automated test script for Phase 5C Authentication & Authorization
 */

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const BASE_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET;

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
  console.log('--- STARTING PHASE 5C TEST SUITE ---\n');

  const testSuffix = Date.now();
  const studentEmail = `student_${testSuffix}@campus.edu`;
  const organizerEmail = `organizer_${testSuffix}@campus.edu`;
  const testPassword = 'Password@123';

  // 1. Health Endpoint Test
  try {
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(
      healthRes.status === 200 && healthData.database === 'connected',
      '1. GET /api/health returns 200 and database: "connected"'
    );
  } catch (e) {
    assert(false, `1. Health check failed: ${e.message}`);
  }

  // 2. Register Student
  let studentToken = null;
  let studentId = null;
  try {
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: studentEmail,
        password: testPassword,
        role: 'student',
        department: 'MCA',
        rollNumber: `STU${testSuffix.toString().slice(-4)}`,
        phone: '+91 9999999999',
      }),
    });
    const regData = await regRes.json();
    studentToken = regData.data?.token;
    studentId = regData.data?.user?.id;
    assert(
      regRes.status === 201 &&
        regData.success === true &&
        regData.data.user.role === 'student' &&
        !!studentToken,
      '2. Register new student returns 201, token, and user data'
    );
    assert(
      regData.data.user.passwordHash === undefined &&
        regData.data.user.password === undefined,
      '3. Register student response does NOT expose password or passwordHash'
    );
  } catch (e) {
    assert(false, `2. Register student failed: ${e.message}`);
  }

  // 3. Register Organizer
  let organizerToken = null;
  try {
    const orgRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Organizer',
        email: organizerEmail,
        password: testPassword,
        role: 'organizer',
        department: 'CS',
        phone: '+91 8888888888',
      }),
    });
    const orgData = await orgRes.json();
    organizerToken = orgData.data?.token;
    assert(
      orgRes.status === 201 &&
        orgData.success === true &&
        orgData.data.user.role === 'organizer',
      '4. Register new organizer returns 201 with role: "organizer"'
    );
  } catch (e) {
    assert(false, `3. Register organizer failed: ${e.message}`);
  }

  // 4. Duplicate Registration
  try {
    const dupRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Student',
        email: studentEmail,
        password: testPassword,
        role: 'student',
      }),
    });
    const dupData = await dupRes.json();
    assert(
      dupRes.status === 409 && dupData.success === false,
      '5. Attempt duplicate registration returns HTTP 409 Conflict'
    );
  } catch (e) {
    assert(false, `4. Duplicate registration test failed: ${e.message}`);
  }

  // 5. Attempt Admin Registration
  try {
    const adminRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Malicious Admin',
        email: `admin_${testSuffix}@campus.edu`,
        password: testPassword,
        role: 'admin',
      }),
    });
    const adminData = await adminRes.json();
    assert(
      adminRes.status === 400 && adminData.success === false,
      '6. Attempt admin registration is rejected with HTTP 400'
    );
  } catch (e) {
    assert(false, `5. Admin registration test failed: ${e.message}`);
  }

  // 6. Login with Correct Credentials
  let loginToken = null;
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: studentEmail,
        password: testPassword,
      }),
    });
    const loginData = await loginRes.json();
    loginToken = loginData.data?.token;
    assert(
      loginRes.status === 200 &&
        loginData.success === true &&
        loginData.data.user.email === studentEmail.toLowerCase() &&
        !!loginToken,
      '7. Login with correct credentials returns 200, JWT token, and user data'
    );
    assert(
      loginData.data.user.passwordHash === undefined,
      '8. Login response does NOT expose passwordHash'
    );
  } catch (e) {
    assert(false, `6. Login with correct credentials failed: ${e.message}`);
  }

  // 7. Login with Incorrect Password
  try {
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: studentEmail,
        password: 'WrongPassword!456',
      }),
    });
    const badLoginData = await badLoginRes.json();
    assert(
      badLoginRes.status === 401 && badLoginData.success === false,
      '9. Login with incorrect password returns HTTP 401 and generic error'
    );
  } catch (e) {
    assert(false, `7. Bad password test failed: ${e.message}`);
  }

  // 8. Login with Nonexistent Email
  try {
    const noUserRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `nonexistent_${testSuffix}@campus.edu`,
        password: testPassword,
      }),
    });
    const noUserData = await noUserRes.json();
    assert(
      noUserRes.status === 401 && noUserData.success === false,
      '10. Login with nonexistent user returns HTTP 401 with generic error'
    );
  } catch (e) {
    assert(false, `8. Nonexistent user test failed: ${e.message}`);
  }

  // 9. GET /api/auth/me with Valid Token
  try {
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });
    const meData = await meRes.json();
    assert(
      meRes.status === 200 &&
        meData.success === true &&
        meData.data.user.email === studentEmail.toLowerCase() &&
        meData.data.user.passwordHash === undefined,
      '11. GET /api/auth/me with valid Bearer token returns 200 and safe profile'
    );
  } catch (e) {
    assert(false, `9. GET /me valid token failed: ${e.message}`);
  }

  // 10. GET /api/auth/me without Token
  try {
    const noTokenRes = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
    });
    const noTokenData = await noTokenRes.json();
    assert(
      noTokenRes.status === 401 && noTokenData.success === false,
      '12. GET /api/auth/me without Authorization header returns HTTP 401'
    );
  } catch (e) {
    assert(false, `10. GET /me no token test failed: ${e.message}`);
  }

  // 11. GET /api/auth/me with Invalid Token
  try {
    const badTokenRes = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer invalid.jwt.token.string',
      },
    });
    const badTokenData = await badTokenRes.json();
    assert(
      badTokenRes.status === 401 && badTokenData.success === false,
      '13. GET /api/auth/me with malformed/invalid token returns HTTP 401'
    );
  } catch (e) {
    assert(false, `11. GET /me invalid token test failed: ${e.message}`);
  }

  // 12. GET /api/auth/me with Expired Token
  try {
    const expiredToken = jwt.sign(
      { id: studentId, role: 'student' },
      JWT_SECRET,
      { expiresIn: '-1s' }
    );
    const expiredRes = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${expiredToken}`,
      },
    });
    const expiredData = await expiredRes.json();
    assert(
      expiredRes.status === 401 &&
        expiredData.success === false &&
        expiredData.message.toLowerCase().includes('expired'),
      '14. GET /api/auth/me with expired token returns HTTP 401 (expired message)'
    );
  } catch (e) {
    assert(false, `12. GET /me expired token test failed: ${e.message}`);
  }

  // 13. Verify Database stores bcrypt hash rather than plaintext
  try {
    const { User } = require('../models');
    await mongoose.connect(process.env.MONGODB_URI);
    const dbUser = await User.findOne({ email: studentEmail }).select('+passwordHash');
    const isBcrypt = dbUser.passwordHash && dbUser.passwordHash.startsWith('$2b$');
    const notPlaintext = dbUser.passwordHash !== testPassword;
    assert(
      isBcrypt && notPlaintext,
      '15. MongoDB stores securely hashed bcrypt password ($2b$...) instead of plaintext'
    );
    await mongoose.disconnect();
  } catch (e) {
    assert(false, `13. DB passwordHash inspection failed: ${e.message}`);
  }

  // 14. Validation Edge Cases (short password, invalid email format)
  try {
    const shortPassRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Pass',
        email: `valid_${testSuffix}@campus.edu`,
        password: '123',
      }),
    });
    assert(
      shortPassRes.status === 400,
      '16. Registration rejects passwords shorter than 6 characters (HTTP 400)'
    );
  } catch (e) {
    assert(false, `14. Short password test failed: ${e.message}`);
  }

  try {
    const badEmailRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bad Email',
        email: 'invalid-email-address',
        password: 'Password@123',
      }),
    });
    assert(
      badEmailRes.status === 400,
      '17. Registration rejects invalid email formats (HTTP 400)'
    );
  } catch (e) {
    assert(false, `15. Bad email test failed: ${e.message}`);
  }

  console.log('\n--- TEST SUITE SUMMARY ---');
  const passedCount = results.filter((r) => r.status === 'PASSED').length;
  console.log(`Passed: ${passedCount} / ${results.length}`);

  if (passedCount === results.length) {
    console.log('ALL TESTS PASSED SUCCESSFULLY! ✅');
  } else {
    console.error('SOME TESTS FAILED! ❌');
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test runner error:', e);
  process.exit(1);
});
