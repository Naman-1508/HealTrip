import express from 'express';
import { authenticate, optionalAuth } from '../middlewares/authMiddleware.js';
import {
    getAllHotels,
    getHotelById,
    getHotelsNearHospital,
    getRecoveryFriendlyHotels,
    addReview,
    createHotel,
    updateHotel,
} from '../controllers/hotel.controller.js';

const router = express.Router();

/**
 * Hotel Routes
 * Base path: /api/hotels
 */

// Public routes
router.get('/', optionalAuth, getAllHotels);
router.get('/recovery-friendly', optionalAuth, getRecoveryFriendlyHotels);
router.get('/near-hospital/:hospitalId', optionalAuth, getHotelsNearHospital);
router.get('/:id', optionalAuth, getHotelById);

// Protected routes
router.post('/:id/review', authenticate, addReview);

// Admin routes
router.post('/', createHotel);
router.put('/:id', updateHotel);

export default router;
