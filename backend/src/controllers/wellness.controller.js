import WellnessSession from '../models/WellnessSession.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Wellness Controller
 * Handles yoga shivir and wellness session bookings
 */

/**
 * Get all wellness sessions
 * GET /api/wellness
 */
export const getAllSessions = async (req, res) => {
    try {
        const { type, city, country, startDate, page = 1, limit = 10 } = req.query;

        const query = { isActive: true };

        if (type) query.type = type;
        if (city) query['location.city'] = new RegExp(city, 'i');
        if (country) query['location.country'] = new RegExp(country, 'i');
        if (startDate) {
            query['schedule.startDate'] = { $gte: new Date(startDate) };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const sessions = await WellnessSession.find(query)
            .sort({ 'schedule.startDate': 1, isFeatured: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await WellnessSession.countDocuments(query);

        return successResponse(res, 200, {
            sessions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
            },
        }, 'Wellness sessions fetched successfully');
    } catch (error) {
        console.error('Get wellness sessions error:', error);
        return errorResponse(res, 500, 'Failed to fetch wellness sessions', [error.message]);
    }
};

/**
 * Get wellness session by ID
 * GET /api/wellness/:id
 */
export const getSessionById = async (req, res) => {
    try {
        const session = await WellnessSession.findById(req.params.id);

        if (!session) {
            return errorResponse(res, 404, 'Wellness session not found');
        }

        return successResponse(res, 200, session, 'Wellness session fetched successfully');
    } catch (error) {
        console.error('Get wellness session error:', error);
        return errorResponse(res, 500, 'Failed to fetch wellness session', [error.message]);
    }
};

/**
 * Book wellness session
 * POST /api/wellness/:id/book
 */
export const bookSession = async (req, res) => {
    try {
        const { numberOfParticipants = 1 } = req.body;

        const session = await WellnessSession.findById(req.params.id);

        if (!session) {
            return errorResponse(res, 404, 'Wellness session not found');
        }

        // Check availability
        if (session.capacity.available < numberOfParticipants) {
            return errorResponse(res, 400, 'Not enough seats available');
        }

        // Calculate total price
        const total = session.pricing.perPerson * numberOfParticipants;

        // Create booking
        const booking = await Booking.create({
            userId: req.userId,
            bookingType: 'wellness',
            wellnessSession: session._id,
            pricing: {
                subtotal: total,
                total,
                currency: session.pricing.currency,
            },
            status: 'pending',
        });

        // Update session capacity
        session.capacity.booked += numberOfParticipants;
        session.participants.push({
            userId: req.userId,
            bookingId: booking._id,
        });
        await session.save();

        // Update user bookings
        await User.findOneAndUpdate(
            { clerkId: req.userId },
            { $push: { bookings: booking._id } }
        );

        return successResponse(res, 201, {
            booking,
            session: {
                name: session.name,
                schedule: session.schedule,
                location: session.location,
            },
        }, 'Wellness session booked successfully');
    } catch (error) {
        console.error('Book wellness session error:', error);
        return errorResponse(res, 500, 'Failed to book wellness session', [error.message]);
    }
};

/**
 * Add session review
 * POST /api/wellness/:id/review
 */
export const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return errorResponse(res, 400, 'Rating must be between 1 and 5');
        }

        const session = await WellnessSession.findById(req.params.id);

        if (!session) {
            return errorResponse(res, 404, 'Wellness session not found');
        }

        session.reviews.push({
            userId: req.userId,
            rating,
            comment,
        });

        // Update ratings
        const totalReviews = session.reviews.length;
        const sumRatings = session.reviews.reduce((sum, review) => sum + review.rating, 0);
        session.ratings.overall = sumRatings / totalReviews;
        session.ratings.totalReviews = totalReviews;

        await session.save();

        return successResponse(res, 200, session.reviews, 'Review added successfully');
    } catch (error) {
        console.error('Add review error:', error);
        return errorResponse(res, 500, 'Failed to add review', [error.message]);
    }
};

/**
 * Create wellness session (Admin only)
 * POST /api/wellness
 */
export const createSession = async (req, res) => {
    try {
        const session = await WellnessSession.create(req.body);
        return successResponse(res, 201, session, 'Wellness session created successfully');
    } catch (error) {
        console.error('Create wellness session error:', error);
        return errorResponse(res, 500, 'Failed to create wellness session', [error.message]);
    }
};

/**
 * Update wellness session
 * PUT /api/wellness/:id
 */
export const updateSession = async (req, res) => {
    try {
        const session = await WellnessSession.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!session) {
            return errorResponse(res, 404, 'Wellness session not found');
        }

        return successResponse(res, 200, session, 'Wellness session updated successfully');
    } catch (error) {
        console.error('Update wellness session error:', error);
        return errorResponse(res, 500, 'Failed to update wellness session', [error.message]);
    }
};
