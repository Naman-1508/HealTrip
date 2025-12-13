import mongoose from 'mongoose';

/**
 * Booking Model
 * Unified booking system for hospital appointments, hotel stays, and packages
 */

const bookingSchema = new mongoose.Schema(
    {
        // User Reference
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        // Booking Type
        bookingType: {
            type: String,
            enum: ['hospital', 'hotel', 'package', 'wellness'],
            required: true,
            index: true,
        },
        // Hospital Booking Details
        hospital: {
            name: String, // Populated from ML result if ID not available
            location: String,
            hospitalId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Hospital',
            },
            treatment: String,
            doctor: String,
            appointmentDate: Date,
            estimatedDuration: String,
            specialRequests: String,
        },
        // Hotel Booking Details
        hotel: {
            name: String, // Populated from ML result if ID not available
            location: String,
            hotelId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Hotel',
            },
            roomType: String,
            checkInDate: Date,
            checkOutDate: Date,
            numberOfGuests: Number,
            specialRequests: String,
        },
        // Flight Details
        flight: {
            airline: String,
            flightNumber: String,
            origin: String,
            destination: String,
            price: Number,
            departureTime: Date,
            arrivalTime: Date,
            duration: String,
            stops: Number,
        },
        // Package Booking (Combined Hospital + Hotel + Travel)
        package: {
            packageName: String,
            includes: [String],
            startDate: Date,
            endDate: Date,
            hospitalId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Hospital',
            },
            hotelId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Hotel',
            },
        },
        // Wellness Session Reference
        wellnessSession: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WellnessSession',
        },
        // Pricing
        pricing: {
            subtotal: {
                type: Number,
                required: true,
            },
            tax: {
                type: Number,
                default: 0,
            },
            discount: {
                type: Number,
                default: 0,
            },
            total: {
                type: Number,
                required: true,
            },
            currency: {
                type: String,
                default: 'USD',
            },
        },
        // Payment Information
        payment: {
            status: {
                type: String,
                enum: ['pending', 'completed', 'failed', 'refunded'],
                default: 'pending',
            },
            method: {
                type: String,
                enum: ['razorpay', 'stripe', 'upi', 'card', 'qr', 'other'],
            },
            transactionId: String,
            paidAt: Date,
            refundedAt: Date,
            refundAmount: Number,
        },
        // Booking Status
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            default: 'pending',
            index: true,
        },
        // Cancellation
        cancellation: {
            isCancelled: {
                type: Boolean,
                default: false,
            },
            cancelledAt: Date,
            cancelledBy: String, // 'user' or 'admin'
            reason: String,
            refundStatus: {
                type: String,
                enum: ['pending', 'processed', 'rejected', 'none'],
                default: 'none',
            },
        },
        // Additional Information
        notes: String,
        confirmationCode: {
            type: String,
            unique: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Generate confirmation code before saving
bookingSchema.pre('save', function (next) {
    if (!this.confirmationCode) {
        this.confirmationCode = `HT${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    next();
});

// Indexes
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
