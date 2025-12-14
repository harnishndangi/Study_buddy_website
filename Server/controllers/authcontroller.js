import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Session } from '../models/Session.js';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function signJwt(user, jti) {
  return jwt.sign(
    { sub: String(user._id), id: String(user._id), email: user.email, jti },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

function setAuthCookies(res, token, isSecure) {
  res.cookie('sid', token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax', // Must be 'none' if secure (cross-site), 'lax' otherwise (localhost)
    maxAge: ONE_DAY_MS,
    path: '/',
  });
}

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    const user = new User({ email, password });
    await user.save();

    // Auto-login after signup
    const jti = crypto.randomUUID();
    const token = signJwt(user, jti);

    await Session.create({
      user: user._id,
      jti,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      expiresAt: new Date(Date.now() + ONE_DAY_MS),
    });

    setAuthCookies(res, token, process.env.NODE_ENV === 'production');

    res.status(201).json({ 
      user: { email: user.email, id: user._id }, 
      csrfToken: jti, // Return jti as CSRF token for client to use in X-CSRF-Token header
      message: 'User created successfully' 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const jti = crypto.randomUUID();
    const token = signJwt(user, jti);

    await Session.create({
      user: user._id,
      jti,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      expiresAt: new Date(Date.now() + ONE_DAY_MS),
    });

    setAuthCookies(res, token, process.env.NODE_ENV === 'production');

    res.status(200).json({ 
      user: { email: user.email, id: user._id }, 
      csrfToken: jti, // Return jti as CSRF token for client to use in X-CSRF-Token header
      message: 'Login successful' 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const me = async (req, res) => {
  // req.user is set by auth middleware
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  res.json({ user: { id: req.user.id, email: req.user.email } });
};

export const logout = async (req, res) => {
  try {
    const jti = req.auth?.jti;
    if (jti) {
      await Session.updateOne({ jti }, { $set: { valid: false } });
    }
    const isSecure = process.env.NODE_ENV === 'production';
    res.clearCookie('sid', { httpOnly: true, secure: isSecure, sameSite: isSecure ? 'none' : 'lax', path: '/' });
    res.clearCookie('csrfToken', { httpOnly: false, secure: isSecure, sameSite: isSecure ? 'none' : 'lax', path: '/' });
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

