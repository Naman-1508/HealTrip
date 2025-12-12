import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { upload } from '../utils/uploader.js';
import {
    registerUser,
    getUserProfile,
    updateUserProfile,
    addMedicalHistory,
    uploadDocument,
    addMedication,
} from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * Auth Routes
 * Base path: /api/auth
 */

// Public routes
router.post('/register', registerUser);

// Protected routes (require authentication)
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);
router.post('/medical-history', authenticate, addMedicalHistory);
router.post('/medications', authenticate, addMedication);
router.post('/upload-document', authenticate, upload.single('document'), uploadDocument);

export default router;
