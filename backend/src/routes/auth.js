// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const db = require('../services/db');
const {
  isFirebaseEnabled,
  signInWithEmailAndPassword,
  getUserRecord,
  setCustomUserClaims,
} = require('../services/firebase');

const secret = process.env.JWT_SECRET || 'supersecretkey';

// Login route (Handles Firebase/Mock email login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Gracefully fall back to Mock login if Firebase is not configured
  if (!isFirebaseEnabled) {
    return handleMockLogin(email, password, res);
  }

  try {
    // Authenticate with Firebase via REST API
    const authData = await signInWithEmailAndPassword(email, password);
    const { uid, email: userEmail } = authData;

    // Retrieve the user from Firebase Auth to check custom claims (role & TOTP)
    const userRecord = await getUserRecord(uid);
    const claims = userRecord.customClaims || {};
    const role = claims.role || 'customer';

    // Verify if user's email has been verified
    if (!userRecord.emailVerified) {
      const adminSDK = require('firebase-admin');
      const actionCodeSettings = {
        url: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      };
      const verificationLink = await adminSDK.auth().generateEmailVerificationLink(userEmail, actionCodeSettings);
      
      console.log(`✉️ Firebase Verification Link for ${userEmail}: ${verificationLink}`);
      
      return res.status(403).json({
        success: false,
        error: 'Email is not verified. Check console logs for the verification link.',
        verificationLink,
      });
    }

    if (role === 'admin') {
      // Generate a temporary JWT token for the 2FA challenge (expires in 5 minutes)
      const tempToken = jwt.sign(
        { id: uid, email: userEmail, role: 'admin', pending2FA: true },
        secret,
        { expiresIn: '5m' }
      );
      return res.json({ success: true, pending2FA: true, tempToken });
    }

    // Customer login successful: sign a local JWT for subsequent API authorization
    const token = jwt.sign({ id: uid, email: userEmail, role: 'customer' }, secret, { expiresIn: '1h' });
    return res.json({
      success: true,
      token,
      user: { email: userEmail, role: 'customer' },
    });

  } catch (error) {
    console.error('🔥 Login Error:', error.message);
    
    let status = 401;
    let errorMessage = 'Invalid credentials';

    if (error.message === 'EMAIL_NOT_FOUND' || error.message === 'INVALID_PASSWORD') {
      errorMessage = 'Invalid email or password';
    } else if (error.message === 'USER_DISABLED') {
      errorMessage = 'This user account has been disabled';
    } else if (error.message === 'Firebase authentication is not enabled.') {
      status = 500;
      errorMessage = 'Authentication service is misconfigured';
    }

    return res.status(status).json({ success: false, error: errorMessage });
  }
});

// 2FA Verification Route (Handles Firebase TOTP/Mock OTP verification)
router.post('/2fa/verify', async (req, res) => {
  const { otp, tempToken } = req.body;

  // Gracefully fall back to Mock 2FA verification if Firebase is not configured
  if (!isFirebaseEnabled) {
    return handleMock2FA(otp, tempToken, res);
  }

  try {
    // Verify the temporary token
    const payload = jwt.verify(tempToken, secret);
    if (!payload.pending2FA) {
      return res.status(400).json({ success: false, error: 'Invalid authentication session' });
    }

    // Retrieve user record to access the TOTP secret claim
    const userRecord = await getUserRecord(payload.id);
    const claims = userRecord.customClaims || {};
    const totpSecret = claims.totpSecret;

    if (!totpSecret) {
      return res.status(500).json({ success: false, error: 'TOTP authentication is not configured for this admin' });
    }

    // Verify 6-digit TOTP token using otplib
    const isValid = authenticator.verify({ token: otp, secret: totpSecret });

    if (isValid) {
      // Authorization successful: sign final admin JWT
      const token = jwt.sign({ id: payload.id, email: payload.email, role: 'admin' }, secret, { expiresIn: '1h' });
      return res.json({
        success: true,
        token,
        user: { email: payload.email, role: 'admin' },
      });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid OTP code' });
    }

  } catch (error) {
    console.error('🔥 2FA Verification Error:', error.message);
    return res.status(401).json({ success: false, error: 'Session expired or unauthorized' });
  }
});

// Signup Route (Registers new customers in Firebase/Mock)
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  if (!isFirebaseEnabled) {
    // Mock user creation
    const userExists = db.users.find(u => u.email === email);
    if (userExists) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    const newUser = db.users.create({ email, password, role: 'customer', twofa_enabled: false });

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, secret, { expiresIn: '1h' });
    return res.json({ success: true, token, user: { email: newUser.email, role: newUser.role } });
  }

  try {
    const adminSDK = require('firebase-admin');
    
    // Create new Firebase User
    const userRecord = await adminSDK.auth().createUser({
      email,
      password,
      emailVerified: false, // Set to false to require email verification
    });

    // Assign customer claims
    await adminSDK.auth().setCustomUserClaims(userRecord.uid, { role: 'customer' });

    // Generate email verification link
    const actionCodeSettings = {
      url: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    };
    const verificationLink = await adminSDK.auth().generateEmailVerificationLink(email, actionCodeSettings);

    console.log(`✉️ Firebase Verification Link for ${email}: ${verificationLink}`);

    // Return success response with verificationLink for testing
    return res.json({
      success: true,
      message: 'Registration successful! Verification link sent.',
      verificationLink,
    });

  } catch (error) {
    console.error('🔥 Signup Error:', error.message);
    let errorMessage = 'Registration failed';
    if (error.code === 'auth/email-already-exists' || error.message === 'EMAIL_EXISTS') {
      errorMessage = 'Email is already registered';
    } else if (error.code === 'auth/invalid-password' || error.message === 'WEAK_PASSWORD') {
      errorMessage = 'Password must be at least 6 characters long';
    }
    return res.status(400).json({ success: false, error: errorMessage });
  }
});

// --- Graceful Mock Fallback Helpers ---

function handleMockLogin(email, password, res) {
  const user = db.users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  if (user.role === 'admin' && user.twofa_enabled) {
    const tempToken = jwt.sign({ id: user.id, role: user.role, pending2FA: true }, secret, { expiresIn: '5m' });
    return res.json({ success: true, pending2FA: true, tempToken });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '1h' });
  return res.json({ success: true, token, user: { email: user.email, role: user.role } });
}

function handleMock2FA(otp, tempToken, res) {
  try {
    const payload = jwt.verify(tempToken, secret);
    if (!payload.pending2FA) throw new Error('Invalid token');

    // Default mock OTP accepts '123456'
    if (otp === '123456') {
      const user = db.users.find(u => u.id === payload.id);
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '1h' });
      return res.json({ success: true, token, user: { email: user.email, role: user.role } });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Unauthorized or token expired' });
  }
}

module.exports = router;
