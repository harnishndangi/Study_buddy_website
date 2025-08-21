import express from 'express';
import { signup, login, logout, me } from '../controllers/authcontroller.js';
import protectedRoute from '../middleware/protectedRoute.js';
 
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protectedRoute, me);
router.post('/logout', protectedRoute, logout);

export default router;
