import mongoose from 'mongoose';

/**
 * User Model
 * Stores user profile, medical history, and booking references
 */

const userSchema = new mongoose.Schema(
    {
        clerkId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            trim: true,
        },
        profileImage: {
            type: String,
        },
        // Medical Information
        medicalHistory: [
            {
                condition: String,
                diagnosedDate: Date,
                treatment: String,
                notes: String,
            },
        ],
        allergies: [String],
        medications: [
            {
                name: String,
                dosage: String,
                frequency: String,
            },
        ],
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
            default: '',
        },
        // Medical Documents
        documents: [
            {
                name: String,
                url: String,
                type: String, // 'prescription', 'report', 'scan', etc.
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        // Bookings Reference
        bookings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Booking',
            },
        ],
        // Preferences
        preferences: {
            language: {
                type: String,
                default: 'en',
            },
            currency: {
                type: String,
                default: 'USD',
            },
            notifications: {
                email: {
                    type: Boolean,
                    default: true,
                },
                sms: {
                    type: Boolean,
                    default: false,
                },
            },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
userSchema.index({ email: 1, clerkId: 1 });

const User = mongoose.model('User', userSchema);

export default User;
