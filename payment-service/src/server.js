import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables FIRST before any other imports
dotenv.config({ path: join(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';

// Import routes (these will now have access to env variables)
import razorpayRoutes from './routes/razorpay.routes.js';
import stripeRoutes from './routes/stripe.routes.js';

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        process.env.BACKEND_URL || 'http://localhost:5000',
    ],
    credentials: true,
}));

// JSON parsing for non-webhook routes
app.use((req, res, next) => {
    if (req.originalUrl.includes('/webhook')) {
        next();
    } else {
        express.json()(req, res, next);
    }
});

app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check route
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'HealTrip Payment Service is running',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/stripe', stripeRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

// Start server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`💳 HealTrip Payment Service`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log('='.repeat(50));
    console.log('\n📋 Available Routes:');
    console.log('  - /api/razorpay    (Razorpay Payment Integration)');
    console.log('  - /api/stripe      (Stripe Payment Integration)');
    console.log('='.repeat(50));
});

export default app;
