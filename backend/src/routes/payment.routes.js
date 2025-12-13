import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
    createPaymentOrder,
    verifyPayment,
    getBookingDetails,
    getUserBookings,
    cancelBooking,
    createPackageBooking,
} from '../controllers/payment.controller.js';

const router = express.Router();

/**
 * Payment Routes
 * Base path: /api/payment
 */

// All payment routes require authentication
router.post('/create-order', authenticate, createPaymentOrder);
router.post('/verify', authenticate, verifyPayment);
router.get('/booking/:id', authenticate, getBookingDetails);
router.get('/my-bookings', authenticate, getUserBookings);
router.post('/book-package', authenticate, createPackageBooking);
router.post('/cancel/:id', authenticate, cancelBooking);

export default router;
