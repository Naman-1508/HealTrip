import express from 'express';
import { optionalAuth } from '../middlewares/authMiddleware.js';
import {
    getRecommendations,
    estimateCost,
    compareHospitals,
} from '../controllers/diagnosis.controller.js';

const router = express.Router();

/**
 * Diagnosis Routes
 * Base path: /api/diagnosis
 */

// AI-based recommendation and cost estimation routes
router.post('/recommend', optionalAuth, getRecommendations);
router.post('/estimate-cost', optionalAuth, estimateCost);
router.post('/compare', optionalAuth, compareHospitals);

export default router;
