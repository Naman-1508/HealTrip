import express from 'express';
import { authenticate, optionalAuth } from '../middlewares/authMiddleware.js';
import {
    getAllHospitals,
    getHospitalById,
    searchByTreatment,
    getNearbyHospitals,
    addReview,
    createHospital,
    updateHospital,
} from '../controllers/hospital.controller.js';

const router = express.Router();

/**
 * Hospital Routes
 * Base path: /api/hospitals
 */

// Public routes
router.get('/', optionalAuth, getAllHospitals);
router.get('/search/treatment', optionalAuth, searchByTreatment);
router.get('/nearby', optionalAuth, getNearbyHospitals);
router.get('/:id', optionalAuth, getHospitalById);

// Protected routes
router.post('/:id/review', authenticate, addReview);

// Admin routes (simplified for hackathon - add admin middleware in production)
router.post('/', createHospital);
router.put('/:id', updateHospital);

export default router;
