import express from 'express';
import { createGroup, myGroups, joinByCode, joinById, listMessages, postMessage } from '../controllers/groupController.js';
import protectedRoute from '../middleware/protectedRoute.js'; // Protected route middleware

const router = express.Router();

router.get('/', protectedRoute, myGroups); // /api/groups?userId=...
router.post('/', protectedRoute, createGroup); // body: { name, description, userId }
router.post('/join/code/:code', protectedRoute, joinByCode); // body: { userId }
router.post('/join/id/:groupId', protectedRoute, joinById); // body: { userId }

// messages
router.get('/:groupId/messages', protectedRoute, listMessages);
router.post('/:groupId/messages', protectedRoute, postMessage);

export default router;
