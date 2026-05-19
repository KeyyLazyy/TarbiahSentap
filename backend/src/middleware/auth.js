// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'supersecretkey';

// Verify JWT and attach user payload to request
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Missing token' });
  jwt.verify(token, secret, (err, user) => {
    if (err) return res.status(403).json({ success: false, error: 'Invalid token' });
    req.user = user; // { id, email, role }
    next();
  });
}

// Role‑based access control helper
function permit(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthenticated' });
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ success: false, error: 'Forbidden: insufficient role' });
  };
}

module.exports = { verifyToken, permit };
