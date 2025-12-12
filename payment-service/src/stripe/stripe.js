import Stripe from 'stripe';

/**
 * Stripe Configuration
 * Initialize Stripe instance for payment processing
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;
