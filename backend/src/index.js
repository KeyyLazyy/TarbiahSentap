const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const externalRoutes = require('./routes/external');
const paymentRoutes = require('./routes/payment');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 4000;

// Global middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting – basic
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000, // Increased for development
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/profile', profileRoutes);

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Server Error' });
});

// Seed default Supabase users if enabled
const { seedUsers } = require('./services/supabase');
seedUsers().catch(err => console.error('❌ Error during Supabase seeding:', err));

// Run Express Server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});

// nodemon touch 5
