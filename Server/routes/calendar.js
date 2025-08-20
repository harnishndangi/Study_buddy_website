import express from 'express';
import { createEvent, deleteEvent, getEventById, getEvents, updateEvent,getEventsByDateRange } from '../controllers/calendarController.js';
import protectedRoute from '../middleware/protectedRoute.js'; // Protected route middleware

  
const router = express.Router();

// Get all calendar events
router.get('/', protectedRoute, getEvents);

// Get a single event by ID
router.get('/:id', protectedRoute, getEventById);

// Create a new event
router.post('/', protectedRoute, createEvent);

// Update an event by ID
router.put('/:id', protectedRoute, updateEvent);

// Delete an event by ID
router.delete('/:id', protectedRoute, deleteEvent);

// Sync with Google Calendar
// router.post('/sync/google', protectedRoute, syncWithGoogle);

router.get('/date-range/:startDate/:endDate', protectedRoute, getEventsByDateRange);

export default router;
