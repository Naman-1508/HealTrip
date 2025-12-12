import mongoose from 'mongoose';

/**
 * Hotel Model
 * Stores hotel information with recovery-friendly amenities
 */

const hotelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
        },
        // Location
        location: {
            address: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
                index: true,
            },
            state: {
                type: String,
                required: true,
            },
            country: {
                type: String,
                required: true,
            },
            zipCode: String,
            coordinates: {
                latitude: {
                    type: Number,
                    required: true,
                },
                longitude: {
                    type: Number,
                    required: true,
                },
            },
        },
        // Contact Information
        contact: {
            phone: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
            },
            website: String,
        },
        // Nearby Hospitals
        nearbyHospitals: [
            {
                hospitalId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Hospital',
                },
                distance: Number, // in kilometers
                travelTime: String, // '10 mins', '30 mins', etc.
            },
        ],
        // Recovery-Friendly Features
        recoveryFriendly: {
            wheelchairAccessible: {
                type: Boolean,
                default: false,
            },
            medicalBeds: {
                type: Boolean,
                default: false,
            },
            nurseOnCall: {
                type: Boolean,
                default: false,
            },
            elevatorAccess: {
                type: Boolean,
                default: false,
            },
            groundFloorRooms: {
                type: Boolean,
                default: false,
            },
            specialDiet: {
                type: Boolean,
                default: false,
            },
        },
        // Room Types
        rooms: [
            {
                type: {
                    type: String,
                    required: true,
                }, // 'Standard', 'Deluxe', 'Suite', etc.
                description: String,
                capacity: Number,
                price: {
                    type: Number,
                    required: true,
                },
                currency: {
                    type: String,
                    default: 'USD',
                },
                amenities: [String],
                images: [String],
                available: {
                    type: Boolean,
                    default: true,
                },
            },
        ],
        // General Amenities
        amenities: [String], // ['WiFi', 'Parking', 'Restaurant', 'Laundry', etc.]
        // Ratings & Reviews
        ratings: {
            overall: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
            },
            totalReviews: {
                type: Number,
                default: 0,
            },
            breakdown: {
                cleanliness: { type: Number, default: 0 },
                comfort: { type: Number, default: 0 },
                location: { type: Number, default: 0 },
                service: { type: Number, default: 0 },
                valueForMoney: { type: Number, default: 0 },
            },
        },
        reviews: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                rating: Number,
                comment: String,
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        // Images
        images: [
            {
                url: String,
                caption: String,
                isPrimary: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        // Policies
        policies: {
            checkIn: String,
            checkOut: String,
            cancellation: String,
            petPolicy: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
hotelSchema.index({ 'location.city': 1, 'location.country': 1 });
hotelSchema.index({ 'ratings.overall': -1 });
hotelSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });

const Hotel = mongoose.model('Hotel', hotelSchema);

export default Hotel;
