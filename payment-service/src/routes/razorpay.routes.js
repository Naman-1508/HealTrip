import express from 'express';
import {
    createOrder,
    verifyPayment,
    handleWebhook,
} from '../controllers/razorpay.controller.js';

const router = express.Router();

/**
 * Razorpay Routes
 * Base path: /api/razorpay
 */

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
