import jwt from 'jsonwebtoken';
import { Session } from '../models/Session.js';

const CSRF_SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
 
const protectedRoute = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    // Prefer httpOnly cookie 'sid'; fallback to Authorization header
    const cookieToken = req.cookies?.sid;
    let token = cookieToken;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check session jti validity in DB
    if (!decoded?.jti) {
      return res.status(401).json({ message: 'Invalid session.' });
    }
    const session = await Session.findOne({ jti: decoded.jti, user: decoded.sub || decoded.id, valid: true });
    if (!session) {
      return res.status(401).json({ message: 'Session expired or revoked.' });
    }
    if (new Date() > session.expiresAt) {
      await Session.updateOne({ _id: session._id }, { $set: { valid: false } });
      return res.status(401).json({ message: 'Session expired.' });
    }

    // Double-submit cookie CSRF validation for state-changing methods
    if (!CSRF_SAFE_METHODS.has(req.method)) {
      const headerToken = req.headers['x-csrf-token'];
      const cookieCsrf = req.cookies?.csrfToken;
      if (!headerToken || !cookieCsrf || headerToken !== cookieCsrf) {
        return res.status(403).json({ message: 'CSRF validation failed.' });
      }
    }

    // Attach user and auth info
    req.user = { id: decoded.sub || decoded.id, email: decoded.email };
    req.auth = { jti: decoded.jti };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    } else {
      return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
  }
};

export default protectedRoute;