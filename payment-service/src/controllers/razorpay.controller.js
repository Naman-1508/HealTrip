import getRazorpay from '../razorpay/razorpay.js';
import { verifyRazorpayPayment } from '../utils/verifyWebhook.js';

/**
 * Razorpay Controller
 * Handles Razorpay payment creation, verification, and webhooks
 */

/**
 * Create Razorpay order
 * POST /api/razorpay/create-order
 */
export const createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', bookingId, userId } = req.body;

        if (!amount || !bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Amount and booking ID are required',
            });
        }

        // Create Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt: `booking_${bookingId}`,
            notes: {
                bookingId,
                userId,
            },
        };

        const order = await getRazorpay().orders.create(options);

        return res.status(200).json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
            },
            message: 'Razorpay order created successfully',
        });
    } catch (error) {
        console.error('Create Razorpay order error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create Razorpay order',
            error: error.message,
        });
    }
};

/**
 * Verify Razorpay payment
 * POST /api/razorpay/verify
 */
export const verifyPayment = async (req, res) => {
    try {
        const { orderId, paymentId, signature } = req.body;

        if (!orderId || !paymentId || !signature) {
            return res.status(400).json({
                success: false,
                message: 'Order ID, payment ID, and signature are required',
            });
        }

        // Verify signature
        const isValid = verifyRazorpayPayment(orderId, paymentId, signature);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature',
            });
        }

        // Fetch payment details
        const payment = await getRazorpay().payments.fetch(paymentId);

        return res.status(200).json({
            success: true,
            data: {
                paymentId: payment.id,
                orderId: payment.order_id,
                status: payment.status,
                amount: payment.amount / 100,
                currency: payment.currency,
                method: payment.method,
            },
            message: 'Payment verified successfully',
        });
    } catch (error) {
        console.error('Verify Razorpay payment error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: error.message,
        });
    }
};

/**
 * Razorpay webhook handler
 * POST /api/razorpay/webhook
 */
export const handleWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const webhookBody = JSON.stringify(req.body);

        // Verify webhook signature
        const isValid = verifyRazorpayWebhook(
            webhookBody,
            signature,
            process.env.RAZORPAY_WEBHOOK_SECRET
        );

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid webhook signature',
            });
        }

        const event = req.body.event;
        const payload = req.body.payload.payment.entity;

        console.log(`Razorpay webhook received: ${event}`);

        // Handle different events
        switch (event) {
            case 'payment.captured':
                console.log('Payment captured:', payload.id);
                // Update booking status in main backend
                await notifyBackend(payload, 'captured');
                break;

            case 'payment.failed':
                console.log('Payment failed:', payload.id);
                await notifyBackend(payload, 'failed');
                break;

            default:
                console.log('Unhandled event:', event);
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Razorpay webhook error:', error);
        return res.status(500).json({
            success: false,
            message: 'Webhook processing failed',
        });
    }
};

/**
 * Notify main backend about payment status
 */
const notifyBackend = async (payload, status) => {
    try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5174';

        await fetch(`${backendUrl}/api/payment/webhook-update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paymentId: payload.id,
                orderId: payload.order_id,
                status,
                amount: payload.amount / 100,
            }),
        });
    } catch (error) {
        console.error('Failed to notify backend:', error);
    }
};
