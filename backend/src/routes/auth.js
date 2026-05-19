// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../services/db');

const secret = process.env.JWT_SECRET || 'supersecretkey';

// Mock login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  if (user.role === 'admin' && user.twofa_enabled) {
    // Return a temporary token for 2FA challenge
    const tempToken = jwt.sign({ id: user.id, role: user.role, pending2FA: true }, secret, { expiresIn: '5m' });
    return res.json({ success: true, pending2FA: true, tempToken });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '1h' });
  res.json({ success: true, token, user: { email: user.email, role: user.role } });
});

router.post('/2fa/verify', (req, res) => {
  const { otp, tempToken } = req.body;
  
  try {
    const payload = jwt.verify(tempToken, secret);
    if (!payload.pending2FA) throw new Error('Invalid token');

    // Mock OTP verification (any 6-digit code works for prototype)
    if (otp === '123456') {
      const user = db.users.find(u => u.id === payload.id);
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '1h' });
      return res.json({ success: true, token, user: { email: user.email, role: user.role } });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }
  } catch (err) {
    res.status(401).json({ success: false, error: 'Unauthorized or token expired' });
  }
});

module.exports = router;
