// backend/src/services/firebase.js
const admin = require('firebase-admin');

let isFirebaseEnabled = false;

// Check if all necessary environment variables are set
const requiredEnv = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_API_KEY'
];

const missingEnv = requiredEnv.filter(envVar => !process.env[envVar]);

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (serviceAccountPath) {
  try {
    const path = require('path');
    const fs = require('fs');
    const resolvedPath = path.isAbsolute(serviceAccountPath) 
      ? serviceAccountPath 
      : path.resolve(__dirname, '../../', serviceAccountPath);

    if (fs.existsSync(resolvedPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      isFirebaseEnabled = true;
      process.env.FIREBASE_PROJECT_ID = serviceAccount.project_id;
      process.env.FIREBASE_CLIENT_EMAIL = serviceAccount.client_email;
      process.env.FIREBASE_PRIVATE_KEY = serviceAccount.private_key;
      console.log('🔥 Firebase Admin SDK initialized successfully via Service Account JSON file');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK via JSON file:', error.message);
  }
}

if (!isFirebaseEnabled && missingEnv.length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    isFirebaseEnabled = true;
    console.log('🔥 Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  }
}

if (!isFirebaseEnabled) {
  console.warn(`⚠️ Firebase configuration variables missing: [${missingEnv.join(', ')}].`);
  console.warn('⚠️ Server will run in MOCK Authentication mode.');
}

/**
 * Signs in a user using email and password via Firebase Auth REST API.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>} Firebase sign-in response
 */
async function signInWithEmailAndPassword(email, password) {
  if (!isFirebaseEnabled) {
    throw new Error('Firebase authentication is not enabled.');
  }

  const apiKey = process.env.FIREBASE_API_KEY;
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorCode = data.error?.message || 'AUTHENTICATION_FAILED';
    throw new Error(errorCode);
  }

  return {
    idToken: data.idToken,
    uid: data.localId,
    email: data.email,
  };
}

/**
 * Gets a user's details and custom claims using their Firebase UID.
 * @param {string} uid 
 * @returns {Promise<admin.auth.UserRecord>}
 */
async function getUserRecord(uid) {
  if (!isFirebaseEnabled) {
    throw new Error('Firebase Admin SDK is not enabled.');
  }
  return await admin.auth().getUser(uid);
}

/**
 * Sets custom claims on a user (such as role and TOTP secret).
 * @param {string} uid 
 * @param {object} claims 
 */
async function setCustomUserClaims(uid, claims) {
  if (!isFirebaseEnabled) {
    throw new Error('Firebase Admin SDK is not enabled.');
  }
  await admin.auth().setCustomUserClaims(uid, claims);
}

/**
 * Seeds default admin and customer credentials in Firebase Auth if they do not exist.
 */
async function seedUsers() {
  if (!isFirebaseEnabled) {
    return;
  }

  console.log('🌱 Checking and seeding default users in Firebase Auth...');
  
  const defaultUsers = [
    {
      email: 'admin@tarbiahsentap.com',
      password: 'password123',
      displayName: 'System Admin',
      claims: {
        role: 'admin',
        totpSecret: 'MFRGGZDFMZTWQ2LK', // Deterministic base32 secret
      },
    },
    {
      email: 'customer@example.com',
      password: 'password123',
      displayName: 'Mock Customer',
      claims: {
        role: 'customer',
      },
    }
  ];

  for (const defaultUser of defaultUsers) {
    try {
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(defaultUser.email);
        console.log(`✅ User ${defaultUser.email} already exists in Firebase Auth`);
      } catch (err) {
        if (err.code === 'auth/user-not-found') {
          userRecord = await admin.auth().createUser({
            email: defaultUser.email,
            password: defaultUser.password,
            displayName: defaultUser.displayName,
            emailVerified: true,
          });
          console.log(`✨ Created default user ${defaultUser.email} in Firebase Auth`);
        } else {
          throw err;
        }
      }

      // Check if claims are already set correctly, otherwise set them
      const currentClaims = userRecord.customClaims || {};
      const needsClaimsUpdate = Object.keys(defaultUser.claims).some(
        key => currentClaims[key] !== defaultUser.claims[key]
      );

      if (needsClaimsUpdate) {
        await admin.auth().setCustomUserClaims(userRecord.uid, {
          ...currentClaims,
          ...defaultUser.claims,
        });
        console.log(`🔑 Applied custom claims for ${defaultUser.email}`);
      }
    } catch (error) {
      console.error(`❌ Failed to seed user ${defaultUser.email}:`, error.message);
    }
  }

  console.log('📌 Admin TOTP Setup Info:');
  console.log('   - Secret Key: MFRGGZDFMZTWQ2LK');
  console.log('   - Setup Link: https://root.cz/totp/?secret=MFRGGZDFMZTWQ2LK&issuer=TarbiahSentap&label=admin@tarbiahsentap.com');
  console.log('----------------------------------------------------');
}

module.exports = {
  isFirebaseEnabled,
  signInWithEmailAndPassword,
  getUserRecord,
  setCustomUserClaims,
  seedUsers,
};
