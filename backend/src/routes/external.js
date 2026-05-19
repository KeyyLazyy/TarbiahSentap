// backend/src/routes/external.js
const express = require('express');
const router = express.Router();

// Mock External API Integration (e.g., Weather or Book Recommendations)
router.get('/recommendations', (req, res) => {
  // Simulate a delay and mock data from an external service
  const recommendations = [
    { id: '101', title: 'The Power of Habit', author: 'Charles Duhigg' },
    { id: '102', title: 'Atomic Habits', author: 'James Clear' },
  ];
  
  res.json({ success: true, source: 'External Book Service', data: recommendations });
});

module.exports = router;
