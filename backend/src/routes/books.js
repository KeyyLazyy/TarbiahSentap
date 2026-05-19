// backend/src/routes/books.js
const express = require('express');
const router = express.Router();
const { verifyToken, permit } = require('../middleware/auth');
const db = require('../services/db');

// Example: Get all books (public)
router.get('/', (req, res) => {
  const books = db.books.findAll();
  res.json({ success: true, data: books });
});

// Example: Get single book by id
router.get('/:id', (req, res) => {
  const book = db.books.findById(req.params.id);
  if (!book) return res.status(404).json({ success: false, error: 'Book not found' });
  res.json({ success: true, data: book });
});

// Protected routes – admin only
router.post('/', verifyToken, permit('admin'), (req, res) => {
  const newBook = db.books.create(req.body);
  res.json({ success: true, data: newBook });
});

router.put('/:id', verifyToken, permit('admin'), (req, res) => {
  const updatedBook = db.books.update(req.params.id, req.body);
  if (!updatedBook) return res.status(404).json({ success: false, error: 'Book not found' });
  res.json({ success: true, data: updatedBook });
});

router.delete('/:id', verifyToken, permit('admin'), (req, res) => {
  const deleted = db.books.delete(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, error: 'Book not found' });
  res.json({ success: true, message: 'Book deleted' });
});

module.exports = router;
