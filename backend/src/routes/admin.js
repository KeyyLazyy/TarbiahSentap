// backend/src/routes/admin.js
const express = require('express');
const router = express.Router();
const { verifyToken, permit } = require('../middleware/auth');
const db = require('../services/db');

// Get all orders (Admin only)
router.get('/orders', verifyToken, permit('admin'), (req, res) => {
  const orders = db.orders.findAll();
  res.json({ success: true, data: orders });
});

// Data Export (JSON to CSV simulation)
router.get('/export/csv', verifyToken, permit('admin'), (req, res) => {
  const orders = db.orders.findAll();
  
  // Basic CSV conversion simulation
  if (orders.length === 0) {
    return res.status(400).json({ success: false, error: 'No orders to export' });
  }

  const headers = 'id,user_id,status,total_amount,created_at\n';
  const rows = orders.map(o => `${o.id},${o.user_id},${o.status},${o.total_amount},${o.created_at}`).join('\n');
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
  res.send(headers + rows);
});

module.exports = router;
