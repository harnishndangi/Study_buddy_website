import express from 'express';
import { startSession, logSession, getSessions, getStats } from '../controllers/pomodoroController.js';
import protectedRoute from '../middleware/protectedRoute.js'; // Protected route middleware
const router = express.Router();


// Start a new Pomodoro session
router.post('/start', protectedRoute, startSession);

// Log a completed Pomodoro session
router.post('/log', protectedRoute, logSession);

// Get all Pomodoro sessions
router.get('/', protectedRoute, getSessions);

// Get Pomodoro session stats
router.get('/stats', protectedRoute, getStats);

export default router;
