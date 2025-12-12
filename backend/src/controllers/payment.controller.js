import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import Hotel from '../models/Hotel.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Payment Controller
 * Handles payment initiation and webhook processing
 */

/**
 * Create payment order
 * POST /api/payment/create-order
 */
export const createPaymentOrder = async (req, res) => {
    try {
        const { bookingId, paymentMethod } = req.body;

        if (!bookingId || !paymentMethod) {
            return errorResponse(res, 400, 'Booking ID and payment method are required');
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return errorResponse(res, 404, 'Booking not found');
        }

        if (booking.userId.toString() !== req.userId) {
            return errorResponse(res, 403, 'Unauthorized access to booking');
        }

        if (booking.payment.status === 'completed') {
            return errorResponse(res, 400, 'Payment already completed');
        }

        // Forward request to payment service
        const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:5001';
        const endpoint = paymentMethod === 'razorpay' ? '/api/razorpay/create-order' : '/api/stripe/create-payment-intent';

        const response = await fetch(`${paymentServiceUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: booking.pricing.total,
                currency: booking.pricing.currency,
                bookingId: booking._id,
                userId: req.userId,
            }),
        });

        const paymentData = await response.json();

        if (!response.ok) {
            return errorResponse(res, response.status, 'Payment service error', [paymentData.message]);
        }

        // Update booking with payment method
        booking.payment.method = paymentMethod;
        await booking.save();

        return successResponse(res, 200, paymentData.data, 'Payment order created successfully');
    } catch (error) {
        console.error('Create payment order error:', error);
        return errorResponse(res, 500, 'Failed to create payment order', [error.message]);
    }
};

/**
 * Verify payment
 * POST /api/payment/verify
 */
export const verifyPayment = async (req, res) => {
    try {
        const { bookingId, paymentId, signature, paymentMethod } = req.body;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return errorResponse(res, 404, 'Booking not found');
        }

        // Forward to payment service for verification
        const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:5001';
        const endpoint = paymentMethod === 'razorpay' ? '/api/razorpay/verify' : '/api/stripe/verify';

        const response = await fetch(`${paymentServiceUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paymentId, signature, bookingId }),
        });

        const verificationData = await response.json();

        if (!response.ok || !verificationData.success) {
            booking.payment.status = 'failed';
            await booking.save();
            return errorResponse(res, 400, 'Payment verification failed');
        }

        // Update booking status
        booking.payment.status = 'completed';
        booking.payment.transactionId = paymentId;
        booking.payment.paidAt = new Date();
        booking.status = 'confirmed';
        await booking.save();

        return successResponse(res, 200, booking, 'Payment verified successfully');
    } catch (error) {
        console.error('Verify payment error:', error);
        return errorResponse(res, 500, 'Failed to verify payment', [error.message]);
    }
};

/**
 * Get booking details
 * GET /api/payment/booking/:id
 */
export const getBookingDetails = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'firstName lastName email')
            .populate('hospital.hospitalId', 'name location contact')
            .populate('hotel.hotelId', 'name location contact')
            .populate('wellnessSession', 'name location schedule');

        if (!booking) {
            return errorResponse(res, 404, 'Booking not found');
        }

        return successResponse(res, 200, booking, 'Booking details fetched successfully');
    } catch (error) {
        console.error('Get booking details error:', error);
        return errorResponse(res, 500, 'Failed to fetch booking details', [error.message]);
    }
};

/**
 * Get user bookings
 * GET /api/payment/my-bookings
 */
export const getUserBookings = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query = { userId: req.userId };
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const bookings = await Booking.find(query)
            .populate('hospital.hospitalId', 'name location')
            .populate('hotel.hotelId', 'name location')
            .populate('wellnessSession', 'name schedule')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Booking.countDocuments(query);

        return successResponse(res, 200, {
            bookings,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
            },
        }, 'Bookings fetched successfully');
    } catch (error) {
        console.error('Get user bookings error:', error);
        return errorResponse(res, 500, 'Failed to fetch bookings', [error.message]);
    }
};

/**
 * Cancel booking
 * POST /api/payment/cancel/:id
 */
export const cancelBooking = async (req, res) => {
    try {
        const { reason } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return errorResponse(res, 404, 'Booking not found');
        }

        if (booking.userId.toString() !== req.userId) {
            return errorResponse(res, 403, 'Unauthorized access to booking');
        }

        if (booking.status === 'cancelled') {
            return errorResponse(res, 400, 'Booking already cancelled');
        }

        booking.status = 'cancelled';
        booking.cancellation.isCancelled = true;
        booking.cancellation.cancelledAt = new Date();
        booking.cancellation.cancelledBy = 'user';
        booking.cancellation.reason = reason;
        booking.cancellation.refundStatus = 'pending';

        await booking.save();

        return successResponse(res, 200, booking, 'Booking cancelled successfully');
    } catch (error) {
        console.error('Cancel booking error:', error);
        return errorResponse(res, 500, 'Failed to cancel booking', [error.message]);
    }
};
