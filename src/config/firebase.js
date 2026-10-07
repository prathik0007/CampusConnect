const admin = require('firebase-admin');
const { cert, initializeApp } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

let firebaseApp = null;

try {
  const getCertCredential = (configObj) => {
    if (typeof cert === 'function') {
      return cert(configObj);
    }
    if (typeof admin.cert === 'function') {
      return admin.cert(configObj);
    }
    if (admin.credential && typeof admin.credential.cert === 'function') {
      return admin.credential.cert(configObj);
    }
    throw new Error('Firebase cert function unavailable');
  };

  const initApp = (options) => {
    if (typeof initializeApp === 'function') {
      return initializeApp(options);
    }
    return admin.initializeApp(options);
  };

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseApp = initApp({
      credential: getCertCredential(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized using FIREBASE_SERVICE_ACCOUNT');
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (typeof privateKey === 'string') {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    firebaseApp = initApp({
      credential: getCertCredential({
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

    const messagingService = typeof admin.messaging === 'function' ? admin.messaging() : getMessaging(firebaseApp);
    const response = await messagingService.send(messagePayload);
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
