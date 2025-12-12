import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
    airline: {
        type: String,
        required: true,
        trim: true
    },
    flightNumber: {
        type: String,
        required: true,
        uppercase: true
    },
    origin: {
        type: String,
        required: true,
        index: true // Indexed for search
    },
    destination: {
        type: String,
        required: true,
        index: true // Indexed for search
    },
    departureTime: {
        type: Date,
        required: true
    },
    arrivalTime: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    duration: {
        type: String, // e.g., "2h 30m"
        required: true
    },
    stops: {
        type: Number,
        default: 0
    },
    availableSeats: {
        type: Number,
        default: 60
    }
}, {
    timestamps: true
});

const Flight = mongoose.model('Flight', flightSchema);

export default Flight;
