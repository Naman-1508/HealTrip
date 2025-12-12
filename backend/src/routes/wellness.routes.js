import express from 'express';
import { authenticate, optionalAuth } from '../middlewares/authMiddleware.js';
import {
    getAllSessions,
    getSessionById,
    bookSession,
    addReview,
    createSession,
    updateSession,
} from '../controllers/wellness.controller.js';

const router = express.Router();

/**
 * Wellness Routes (Yoga Shivir Booking)
 * Base path: /api/wellness
 */

// Public routes
router.get('/', optionalAuth, getAllSessions);
router.get('/:id', optionalAuth, getSessionById);

// Protected routes
router.post('/:id/book', authenticate, bookSession);
router.post('/:id/review', authenticate, addReview);

// Admin routes
router.post('/', createSession);
router.put('/:id', updateSession);

export default router;
