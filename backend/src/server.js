import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import hospitalRoutes from './routes/hospital.routes.js';
import hotelRoutes from './routes/hotel.routes.js';
import diagnosisRoutes from './routes/diagnosis.routes.js';
import wellnessRoutes from './routes/wellness.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import flightRoutes from './routes/flight.routes.js';
import cabRoutes from './routes/cab.routes.js';

import aiRoutes from './routes/ai.routes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json());
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
        message: 'HealTrip Backend API is running',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/cabs', cabRoutes);
app.use('/api/ai', aiRoutes);

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
        errors: err.errors || [],
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

// Connect to database and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start server
        app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log(`🚀 HealTrip Backend Server`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 Server running on port ${PORT}`);
            console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
            console.log('='.repeat(50));
            console.log('\n📋 Available Routes:');
            console.log('  - /api/auth          (Authentication & User Profile)');
            console.log('  - /api/hospitals     (Hospital Discovery & Search)');
            console.log('  - /api/hotels        (Hotel Search & Booking)');
            console.log('  - /api/diagnosis     (AI Recommendations & Cost Estimation)');
            console.log('  - /api/wellness      (Yoga Shivir & Wellness Sessions)');
            console.log('  - /api/payment       (Payment & Booking Management)');
            console.log('  - /api/flights       (Flight Search & Booking)');
            console.log('  - /api/cabs          (Cab Search & Booking)');
            console.log('='.repeat(50));
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
