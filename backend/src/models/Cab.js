import mongoose from 'mongoose';

const cabSchema = new mongoose.Schema({
    driverName: {
        type: String,
        required: true
    },
    vehicleModel: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['Sedan', 'SUV', 'Hatchback', 'Luxury'],
        required: true
    },
    licensePlate: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true,
        index: true // Indexed for search
    },
    pricePerKm: {
        type: Number,
        required: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        default: 4.5
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    contactNumber: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Cab = mongoose.model('Cab', cabSchema);

export default Cab;
