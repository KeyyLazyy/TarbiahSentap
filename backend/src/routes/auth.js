// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const db = require('../services/db');
const { sendVerificationEmail } = require('../services/email');
const {
  isSupabaseEnabled,
  supabase,
  signInWithEmailAndPassword,
  getUserRecord,
  setCustomUserClaims,
} = require('../services/supabase');

const secret = process.env.JWT_SECRET || 'supersecretkey';

// Login route (Handles Firebase/Mock email login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Gracefully fall back to Mock login if Supabase is not configured
  if (!isSupabaseEnabled) {
    return handleMockLogin(email, password, res);
  }

  try {
    // Authenticate with Supabase
    const authData = await signInWithEmailAndPassword(email, password);
    const { uid, email: userEmail } = authData;

    // Retrieve the user from Supabase to check custom claims (role & TOTP)
    const userRecord = await getUserRecord(uid);
    const claims = userRecord.customClaims || {};
    const role = claims.role || 'customer';

    // Verify if user's email has been verified
    if (!userRecord.emailVerified) {
      // Supabase automatically handles resending via its own API, we just block login here.
      return res.status(403).json({
        success: false,
        error: 'Email is not verified. Please check your email inbox for the verification link.',
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

    // Customer device verification simulation
    const userAgent = req.headers['user-agent'] || 'unknown';
    global.userDevices = global.userDevices || {};
    
    if (!global.userDevices[uid]) {
      global.userDevices[uid] = [];
    }

    if (!global.userDevices[uid].includes(userAgent)) {
      return res.json({ 
        requires_device_verification: true, 
        message: 'New device detected. Please verify.' 
      });
    }

    // Customer login successful: sign a local JWT for subsequent API authorization
    const token = jwt.sign({ id: uid, email: userEmail, role: 'customer' }, secret, { expiresIn: '1h' });
    return res.json({
      success: true,
      token,
      user: { id: uid, email: userEmail, role: 'customer' },
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

    return res.status(status).json({ success: false, error: errorMessage, message: errorMessage });
  }
});

// 2FA Verification Route (Handles Firebase TOTP/Mock OTP verification)
router.post('/2fa/verify', async (req, res) => {
  const { otp, tempToken } = req.body;

  // Gracefully fall back to Mock 2FA verification if Supabase is not configured
  if (!isSupabaseEnabled) {
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

    // Verify 6-digit TOTP token using otplib (or allow 123456 for demo)
    const isValid = otp === '123456' || authenticator.verify({ token: otp, secret: totpSecret });

    if (isValid) {
      // Authorization successful: sign final admin JWT
      const token = jwt.sign({ id: payload.id, email: payload.email, role: 'admin' }, secret, { expiresIn: '1h' });
      return res.json({
        success: true,
        token,
        user: { id: payload.id, email: payload.email, role: 'admin' },
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

  if (!isSupabaseEnabled) {
    // Mock user creation
    const userExists = await db.users.find(u => u.email === email);
    if (userExists) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    const newUser = db.users.create({ email, password, role: 'customer', twofa_enabled: false });

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, secret, { expiresIn: '1h' });
    return res.json({ success: true, token, user: { email: newUser.email, role: newUser.role } });
  }

  try {
    // 1. Create the user without auto-confirming so they MUST verify
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { role: 'customer' }
    });

    if (createError) throw createError;

    // 2. Assign customer claims securely
    if (supabase.auth.admin && userData.user) {
        await supabase.auth.admin.updateUserById(userData.user.id, {
            app_metadata: { role: 'customer' }
        });
    }

    // 3. Generate the verification link natively through Supabase
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: email,
    });

    if (linkError) throw linkError;

    // 4. Send the verification email through Mailtrap!
    if (linkData?.properties?.action_link) {
      await sendVerificationEmail(email, linkData.properties.action_link);
    }

    return res.json({
      success: true,
      message: 'Registration successful! A verification email has been sent to your Mailtrap inbox.',
    });

  } catch (error) {
    console.error('🔥 Signup Error:', error.message);
    let errorMessage = 'Registration failed';
    if (error.code === 'auth/email-already-exists' || error.message === 'EMAIL_EXISTS' || error.code === 'email_exists' || error.message.includes('already registered')) {
      errorMessage = 'Email is already registered';
    } else if (error.code === 'auth/invalid-password' || error.message === 'WEAK_PASSWORD' || error.message.includes('Password')) {
      errorMessage = 'Password must be at least 6 characters long';
    } else {
      errorMessage = error.message; // Show the actual error to the user for debugging
    }
    return res.status(400).json({ success: false, error: errorMessage, message: errorMessage });
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
  return res.json({ success: true, token, user: { id: user.id, email: user.email, role: user.role } });
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

router.post('/verify-device', async (req, res) => {
  try {
    const { email, verification_code } = req.body;
    
    // For demo purposes, we accept '123456' as the verification code
    if (verification_code === '123456') {
      // Find user to generate token
      let uid = null;
      if (isSupabaseEnabled) {
        const { data } = await supabase.auth.admin.listUsers();
        const user = data.users.find(u => u.email === email);
        if (user) uid = user.id;
      } else {
        const user = await db.users.find(u => u.email === email);
        if (user) uid = user.id;
      }

      if (!uid) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Add device to allowed list
      global.userDevices = global.userDevices || {};
      if (!global.userDevices[uid]) global.userDevices[uid] = [];
      const userAgent = req.headers['user-agent'] || 'unknown';
      global.userDevices[uid].push(userAgent);

      // Issue token
      const token = jwt.sign({ id: uid, email, role: 'customer' }, secret, { expiresIn: '1h' });
      return res.json({
        success: true,
        token,
        user: { id: uid, email, role: 'customer' },
        message: 'Device verified successfully'
      });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid verification code' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
