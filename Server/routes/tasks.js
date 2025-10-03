import express from 'express';
import { getTasks, getTaskById, createTask, updateTask, deleteTask, completeTask, updatePriority, updateDeadline } from '../controllers/taskController.js';
import upload, { handleMulterError } from '../middleware/upload.js'; // Multer middleware for file uploads
import protectedRoute from '../middleware/protectedRoute.js'; // Protected route middleware

const router = express.Router();
  

// Get all tasks
router.get('/', protectedRoute, getTasks);

// Get a single task by ID
router.get('/:id', protectedRoute, getTaskById);

// Create a new task
router.post('/', protectedRoute, upload.array('files', 5), handleMulterError, createTask);

// Update a task by ID
router.put('/:id', protectedRoute, upload.array('files', 5), handleMulterError, updateTask);

// Delete a task by ID
router.delete('/:id', protectedRoute, deleteTask);

// Mark a task as completed
router.post('/:id/complete', protectedRoute, completeTask);

// Update task priority
router.post('/:id/priority', protectedRoute, updatePriority);

// Update task deadline
router.post('/:id/deadline', protectedRoute, updateDeadline);


export default router;
