import express from 'express';
import {
    createPaymentIntent,
    verifyPayment,
    handleWebhook,
} from '../controllers/stripe.controller.js';

const router = express.Router();

/**
 * Stripe Routes
 * Base path: /api/stripe
 */

router.post('/create-payment-intent', createPaymentIntent);
router.post('/verify', verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
