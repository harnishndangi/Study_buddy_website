import express from 'express';
import { getNotes, getNoteById, createNote, updateNote, deleteNote, highlightNote, attachFile } from '../controllers/noteController.js';
import upload, { handleMulterError } from '../middleware/upload.js'; // Multer middleware for file uploads
import protectedRoute from '../middleware/protectedRoute.js'; // Protected route middleware

const router = express.Router();

// Get all notes or search (query param: ?search=term)
router.get('/', protectedRoute, getNotes);

// Get a single note by ID
router.get('/:id', protectedRoute, getNoteById);

// Create a new note
router.post('/', protectedRoute, createNote);

// Update a note by ID
router.put('/:id', protectedRoute, updateNote);

// Delete a note by ID
router.delete('/:id', protectedRoute, deleteNote);

// Highlight text in a note (body: { highlight })
router.post('/:id/highlight', protectedRoute, highlightNote);

// Attach a file to a note (multipart/form-data, file field: 'file')
router.post('/:id/attach', protectedRoute, upload.single('file'), handleMulterError, attachFile);
  
export default router;
