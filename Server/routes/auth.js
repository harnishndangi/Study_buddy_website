import express from 'express';
import crypto from 'crypto';
import { signup, login, logout, me } from '../controllers/authcontroller.js';
import protectedRoute from '../middleware/protectedRoute.js';
 
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protectedRoute, me);
router.post('/logout', protectedRoute, logout);

// CSRF token endpoint - returns existing token or generates a new one
router.get('/csrf-token', (req, res) => {
  const existingToken = req.cookies?.['XSRF-TOKEN'];
  
  if (existingToken) {
    return res.json({ csrfToken: existingToken });
  }
  
  // Generate new token if none exists
  const newToken = crypto.randomBytes(24).toString('hex');
  const isSecure = process.env.NODE_ENV === 'production';
  
  res.cookie('XSRF-TOKEN', newToken, {
    httpOnly: false,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  });
  
  res.json({ csrfToken: newToken });
});

export default router;
