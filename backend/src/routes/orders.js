// backend/src/routes/orders.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../services/db');

// Create a new order
router.post('/', verifyToken, (req, res) => {
  const { items, total_amount } = req.body;
  const newOrder = db.orders.create({
    user_id: req.user.id,
    items,
    total_amount,
  });
  res.json({ success: true, data: newOrder });
});

// Get current user's orders
router.get('/my', verifyToken, (req, res) => {
  const orders = db.orders.findByUser(req.user.id);
  res.json({ success: true, data: orders });
});

module.exports = router;
