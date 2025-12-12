import crypto from 'crypto';

/**
 * Webhook Verification Utilities
 */

/**
 * Verify Razorpay webhook signature
 * @param {string} webhookBody - Raw webhook body
 * @param {string} signature - Razorpay signature from header
 * @param {string} secret - Razorpay webhook secret
 * @returns {boolean} - Verification result
 */
export const verifyRazorpayWebhook = (webhookBody, signature, secret) => {
    try {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(webhookBody)
            .digest('hex');

        return expectedSignature === signature;
    } catch (error) {
        console.error('Razorpay webhook verification error:', error);
        return false;
    }
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Signature from client
 * @returns {boolean} - Verification result
 */
export const verifyRazorpayPayment = (orderId, paymentId, signature) => {
    try {
        const secret = process.env.RAZORPAY_KEY_SECRET;
        const body = orderId + '|' + paymentId;

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        return expectedSignature === signature;
    } catch (error) {
        console.error('Razorpay payment verification error:', error);
        return false;
    }
};

/**
 * Verify Stripe webhook signature
 * @param {string} payload - Raw webhook payload
 * @param {string} signature - Stripe signature from header
 * @param {string} secret - Stripe webhook secret
 * @param {object} stripe - Stripe instance
 * @returns {object|null} - Event object or null if verification fails
 */
export const verifyStripeWebhook = (payload, signature, secret, stripe) => {
    try {
        const event = stripe.webhooks.constructEvent(payload, signature, secret);
        return event;
    } catch (error) {
        console.error('Stripe webhook verification error:', error);
        return null;
    }
};
