const admin = require('firebase-admin');

let firebaseApp = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized using FIREBASE_SERVICE_ACCOUNT');
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey
      })
    });
    console.log('Firebase Admin SDK initialized using individual environment credentials');
  } else {
    console.log('Firebase Admin SDK: Credentials not provided in .env. FCM push messages will be simulated locally.');
  }
} catch (error) {
  console.warn('Firebase Admin SDK initialization warning:', error.message);
}

const sendFcmNotification = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken || typeof fcmToken !== 'string' || fcmToken.trim().length === 0) {
    return false;
  }

  if (!firebaseApp) {
    console.log(`[FCM Push Simulated] Token: ${fcmToken.slice(0, 10)}... | Title: "${title}" | Body: "${body}"`);
    return true;
  }

  try {
    const messagePayload = {
      token: fcmToken,
      notification: {
        title,
        body
      },
      data: Object.keys(data).reduce((acc, key) => {
        acc[key] = String(data[key]);
        return acc;
      }, {})
    };

    const response = await admin.messaging().send(messagePayload);
    console.log('FCM Notification sent successfully. Message ID:', response);
    return true;
  } catch (error) {
    console.error('FCM Send Error:', error.message || error);
    return false;
  }
};

module.exports = {
  admin,
  sendFcmNotification
};
