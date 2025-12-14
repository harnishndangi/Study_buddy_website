import express from 'express';
import { getClips, getClipById, saveClip, organizeClips, searchClips } from '../controllers/clipController.js';
import protectedRoute from '../middleware/protectedRoute.js'; // Protected route middleware
const router = express.Router();

// Get all clips
router.get('/', protectedRoute, getClips);

// Get a single clip by ID
router.get('/:id', protectedRoute, getClipById);

// Save a new clip
router.post('/', protectedRoute, saveClip);

// Organize clips by topic/category
router.post('/organize', protectedRoute, organizeClips);

// Search clips
router.get('/search', protectedRoute, searchClips);
 
export default router;
