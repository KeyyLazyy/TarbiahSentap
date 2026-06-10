// backend/src/routes/books.js
const express = require('express');
const router = express.Router();
const { verifyToken, permit } = require('../middleware/auth');
const db = require('../services/db');

// Example: Get all books (public)
router.get('/', async (req, res) => {
  try {
    const books = await db.books.findAll();
    res.json({ success: true, data: books });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Example: Get single book by id
router.get('/:id', async (req, res) => {
  try {
    const book = await db.books.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, error: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Protected routes – admin only
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { supabase } = require('../services/supabase');

router.post('/', verifyToken, permit('admin'), upload.single('cover_image'), async (req, res) => {
  try {
    let coverUrl = req.body.cover || '';
    
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `covers/${fileName}`;
      
      // Try to create the bucket just in case it doesn't exist
      await supabase.storage.createBucket('books', { public: true }).catch(() => {});
      
      const { data, error } = await supabase.storage
        .from('books')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });
        
      if (error) {
        throw new Error('Failed to upload image to Supabase Storage: ' + error.message);
      }
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('books')
        .getPublicUrl(filePath);
        
      coverUrl = publicUrlData.publicUrl;
    }

    const newBookData = {
      ...req.body,
      cover: coverUrl,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock, 10),
      rating: parseFloat(req.body.rating)
    };
    
    // Remove the file object if it's somehow in body
    delete newBookData.cover_image;

    const newBook = await db.books.create(newBookData);
    res.json({ success: true, data: newBook });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', verifyToken, permit('admin'), upload.single('cover_image'), async (req, res) => {
  try {
    let coverUrl = req.body.cover || undefined;
    
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `covers/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('books')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });
        
      if (error) {
        throw new Error('Failed to upload image to Supabase Storage: ' + error.message);
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('books')
        .getPublicUrl(filePath);
        
      coverUrl = publicUrlData.publicUrl;
    }

    const updatedBookData = {
      ...req.body
    };
    if (coverUrl !== undefined) updatedBookData.cover = coverUrl;
    if (req.body.price !== undefined) updatedBookData.price = parseFloat(req.body.price);
    if (req.body.stock !== undefined) updatedBookData.stock = parseInt(req.body.stock, 10);
    if (req.body.rating !== undefined) updatedBookData.rating = parseFloat(req.body.rating);

    delete updatedBookData.cover_image;

    const updatedBook = await db.books.update(req.params.id, updatedBookData);
    if (!updatedBook) return res.status(404).json({ success: false, error: 'Book not found' });
    res.json({ success: true, data: updatedBook });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', verifyToken, permit('admin'), async (req, res) => {
  try {
    const deleted = await db.books.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Book not found' });
    res.json({ success: true, message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
