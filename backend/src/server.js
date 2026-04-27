import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

// ML + Path imports
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.routes.js';
import hospitalRoutes from './routes/hospital.routes.js';
import hotelRoutes from './routes/hotel.routes.js';
import diagnosisRoutes from './routes/diagnosis.routes.js';
import wellnessRoutes from './routes/wellness.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import flightRoutes from './routes/flight.routes.js';
import buddyRoutes from './routes/buddy.routes.js';
import { createProxyMiddleware } from 'http-proxy-middleware';

// -------------------- PATH SETUP (ES MODULE FIX) --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// HealTrip root directory (from backend/src → HealTrip)
const PROJECT_ROOT = path.resolve(__dirname, '../../');

// -------------------- EXPRESS APP INIT --------------------
const app = express();

// -------------------- MIDDLEWARE --------------------
app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:3000',
    ],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// -------------------- ML PROXY GATEWAY --------------------
// This routes all /api/ml requests to our internal Unified ML Engine
app.use('/api/ml', createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: {
        '^/api/ml': '', // remove /api/ml prefix when sending to the ML engine
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(502).json({ success: false, message: 'ML Service Unavailable' });
    }
}));

// -------------------- HEALTH CHECK --------------------
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'HealTrip Backend API is running',
        timestamp: new Date().toISOString(),
    });
});

// -------------------- API ROUTES --------------------
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/buddy', buddyRoutes);

// -------------------- 404 HANDLER --------------------
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
    });
});

// -------------------- GLOBAL ERROR HANDLER --------------------
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        errors: err.errors || [],
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log('🚀 HealTrip Backend Server Started');
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 Server running on port ${PORT}`);
            console.log('='.repeat(50));
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
