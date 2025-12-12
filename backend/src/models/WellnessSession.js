import mongoose from 'mongoose';

/**
 * Wellness Session Model
 * For yoga shivir and wellness program bookings
 */

const wellnessSessionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['yoga', 'meditation', 'ayurveda', 'spa', 'fitness', 'retreat'],
            required: true,
            index: true,
        },
        // Location
        location: {
            address: String,
            city: {
                type: String,
                required: true,
            },
            state: String,
            country: {
                type: String,
                required: true,
            },
            coordinates: {
                latitude: Number,
                longitude: Number,
            },
        },
        // Instructor/Guide
        instructor: {
            name: String,
            qualification: String,
            experience: Number,
            bio: String,
            image: String,
        },
        // Session Details
        schedule: {
            startDate: {
                type: Date,
                required: true,
            },
            endDate: {
                type: Date,
                required: true,
            },
            duration: String, // '7 days', '2 weeks', etc.
            timings: String, // '6:00 AM - 8:00 AM'
        },
        // Capacity
        capacity: {
            total: {
                type: Number,
                required: true,
            },
            booked: {
                type: Number,
                default: 0,
            },
            available: {
                type: Number,
            },
        },
        // Pricing
        pricing: {
            perPerson: {
                type: Number,
                required: true,
            },
            currency: {
                type: String,
                default: 'USD',
            },
            includes: [String], // ['Meals', 'Accommodation', 'Materials', etc.]
        },
        // What's Included
        includes: [String],
        // What to Bring
        requirements: [String],
        // Benefits
        benefits: [String],
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
        // Participants
        participants: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                bookingId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Booking',
                },
                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        // Status
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Update available capacity before saving
wellnessSessionSchema.pre('save', function (next) {
    this.capacity.available = this.capacity.total - this.capacity.booked;
    next();
});

// Indexes
wellnessSessionSchema.index({ type: 1, 'location.city': 1 });
wellnessSessionSchema.index({ 'schedule.startDate': 1 });
wellnessSessionSchema.index({ 'ratings.overall': -1 });

const WellnessSession = mongoose.model('WellnessSession', wellnessSessionSchema);

export default WellnessSession;
