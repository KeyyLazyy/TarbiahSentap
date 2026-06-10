const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/auth');

// Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Profile Update Endpoint
router.post('/', verifyToken, upload.single('avatar'), (req, res) => {
  try {
    const { name, title, bio } = req.body;
    let avatarUrl = req.user?.avatar || null;
    
    if (req.file) {
      avatarUrl = `http://localhost:4000/uploads/${req.file.filename}`;
    }

    // Since this is a prototype, we just return the new data so the frontend can update its state.
    // In a real app we'd also update the user row in the database.
    const updatedUser = {
      ...req.user,
      name: name || req.user.name,
      title: title || '',
      bio: bio || '',
      avatar: avatarUrl
    };

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ success: false, error: "Failed to update profile" });
  }
});

module.exports = router;
