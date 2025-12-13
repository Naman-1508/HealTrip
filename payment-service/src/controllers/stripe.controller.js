import stripe from '../stripe/stripe.js';
import { verifyStripeWebhook } from '../utils/verifyWebhook.js';

/**
 * Stripe Controller
 * Handles Stripe payment intents, verification, and webhooks
 */

/**
 * Create Stripe payment intent
 * POST /api/stripe/create-payment-intent
 */
export const createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency = 'usd', bookingId, userId } = req.body;

        if (!amount || !bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Amount and booking ID are required',
            });
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency.toLowerCase(),
            metadata: {
                bookingId,
                userId,
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return res.status(200).json({
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
            },
            message: 'Payment intent created successfully',
        });
    } catch (error) {
        console.error('Create Stripe payment intent error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create payment intent',
            error: error.message,
        });
    }
};

/**
 * Verify Stripe payment
 * POST /api/stripe/verify
 */
export const verifyPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment intent ID is required',
            });
        }

        // Retrieve payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({
                success: false,
                message: 'Payment not completed',
                status: paymentIntent.status,
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                metadata: paymentIntent.metadata,
            },
            message: 'Payment verified successfully',
        });
    } catch (error) {
        console.error('Verify Stripe payment error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: error.message,
        });
    }
};

/**
 * Stripe webhook handler
 * POST /api/stripe/webhook
 */
export const handleWebhook = async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        const payload = req.body;

        // Verify webhook
        const event = verifyStripeWebhook(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET,
            stripe
        );

        if (!event) {
            return res.status(400).json({
                success: false,
                message: 'Invalid webhook signature',
            });
        }

        console.log(`Stripe webhook received: ${event.type}`);

        // Handle different events
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('Payment succeeded:', paymentIntent.id);
                await notifyBackend(paymentIntent, 'succeeded');
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log('Payment failed:', failedPayment.id);
                await notifyBackend(failedPayment, 'failed');
                break;

            default:
                console.log('Unhandled event:', event.type);
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Stripe webhook error:', error);
        return res.status(500).json({
            success: false,
            message: 'Webhook processing failed',
        });
    }
};

/**
 * Notify main backend about payment status
 */
const notifyBackend = async (paymentIntent, status) => {
    try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5';

        await fetch(`${backendUrl}/api/payment/webhook-update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paymentId: paymentIntent.id,
                status,
                amount: paymentIntent.amount / 100,
                metadata: paymentIntent.metadata,
            }),
        });
    } catch (error) {
        console.error('Failed to notify backend:', error);
    }
};
