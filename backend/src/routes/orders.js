// backend/src/routes/orders.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../services/db');

// Optional auth middleware
const optionalToken = (req, res, next) => {
  const customUserId = req.header('X-User-Id');
  if (customUserId) {
    req.user = { id: customUserId };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'supersecretkey';
  jwt.verify(token, secret, (err, user) => {
    req.user = err ? null : user;
    next();
  });
};

// Create a new order
router.post('/', optionalToken, async (req, res) => {
  try {
    const { items, total_amount } = req.body;
    let userId = req.user ? req.user.id : null;
    
    // Validate UUID format to prevent Postgres 500 error
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (userId && !uuidRegex.test(userId)) {
      userId = null; // Fallback to guest order if ID is corrupt
    }

    const newOrder = await db.orders.create({
      user_id: userId,
      items: items, 
      total_amount
    });
    res.json({ success: true, data: newOrder });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get current user's orders (or all if guest for demo)
router.get('/my', optionalToken, async (req, res) => {
  try {
    let orders = [];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    console.log('[DEBUG /my] req.user:', req.user);

    if (req.user && req.user.id && uuidRegex.test(req.user.id)) {
      console.log('[DEBUG /my] Valid UUID, fetching for:', req.user.id);
      orders = await db.orders.findByUser(req.user.id);
    } else if (req.user && req.user.id) {
      console.log('[DEBUG /my] Invalid UUID (mock cache), returning empty array.');
      // User is logged in but has invalid UUID (e.g. from old mock cache)
      orders = [];
    } else {
      console.log('[DEBUG /my] Guest mode, fetching all null user_id orders.');
      // For guest demo, return all guest orders
      orders = await db.orders.findAll();
      orders = orders.filter(o => !o.user_id);
    }
    console.log('[DEBUG /my] Returning orders count:', orders.length);
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
