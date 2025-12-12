import Hotel from '../models/Hotel.js';
import Hospital from '../models/Hospital.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Hotel Controller
 * Handles hotel CRUD, search near hospitals, and recovery-friendly filters
 */

/**
 * Get all hotels with filters
 * GET /api/hotels
 */
export const getAllHotels = async (req, res) => {
    try {
        const { city, country, minRating, wheelchairAccessible, page = 1, limit = 10 } = req.query;

        const query = { isActive: true };

        if (city) query['location.city'] = new RegExp(city, 'i');
        if (country) query['location.country'] = new RegExp(country, 'i');
        if (minRating) query['ratings.overall'] = { $gte: parseFloat(minRating) };
        if (wheelchairAccessible === 'true') query['recoveryFriendly.wheelchairAccessible'] = true;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const hotels = await Hotel.find(query)
            .populate('nearbyHospitals.hospitalId', 'name location')
            .sort({ 'ratings.overall': -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Hotel.countDocuments(query);

        return successResponse(res, 200, {
            hotels,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
            },
        }, 'Hotels fetched successfully');
    } catch (error) {
        console.error('Get hotels error:', error);
        return errorResponse(res, 500, 'Failed to fetch hotels', [error.message]);
    }
};

/**
 * Get hotel by ID
 * GET /api/hotels/:id
 */
export const getHotelById = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id).populate('nearbyHospitals.hospitalId');

        if (!hotel) {
            return errorResponse(res, 404, 'Hotel not found');
        }

        return successResponse(res, 200, hotel, 'Hotel fetched successfully');
    } catch (error) {
        console.error('Get hotel error:', error);
        return errorResponse(res, 500, 'Failed to fetch hotel', [error.message]);
    }
};

/**
 * Search hotels near a hospital
 * GET /api/hotels/near-hospital/:hospitalId
 */
export const getHotelsNearHospital = async (req, res) => {
    try {
        const { hospitalId } = req.params;
        const { maxDistance = 10, recoveryFriendly } = req.query;

        const hospital = await Hospital.findById(hospitalId);

        if (!hospital) {
            return errorResponse(res, 404, 'Hospital not found');
        }

        const query = {
            isActive: true,
            'nearbyHospitals.hospitalId': hospitalId,
        };

        // Add recovery-friendly filters if requested
        if (recoveryFriendly === 'true') {
            query.$or = [
                { 'recoveryFriendly.wheelchairAccessible': true },
                { 'recoveryFriendly.medicalBeds': true },
                { 'recoveryFriendly.nurseOnCall': true },
            ];
        }

        const hotels = await Hotel.find(query)
            .populate('nearbyHospitals.hospitalId', 'name')
            .sort({ 'ratings.overall': -1 });

        return successResponse(res, 200, hotels, `Found ${hotels.length} hotels near hospital`);
    } catch (error) {
        console.error('Get hotels near hospital error:', error);
        return errorResponse(res, 500, 'Failed to fetch hotels', [error.message]);
    }
};

/**
 * Get recovery-friendly hotels
 * GET /api/hotels/recovery-friendly
 */
export const getRecoveryFriendlyHotels = async (req, res) => {
    try {
        const { city, country } = req.query;

        const query = {
            isActive: true,
            $or: [
                { 'recoveryFriendly.wheelchairAccessible': true },
                { 'recoveryFriendly.medicalBeds': true },
                { 'recoveryFriendly.nurseOnCall': true },
                { 'recoveryFriendly.elevatorAccess': true },
            ],
        };

        if (city) query['location.city'] = new RegExp(city, 'i');
        if (country) query['location.country'] = new RegExp(country, 'i');

        const hotels = await Hotel.find(query)
            .populate('nearbyHospitals.hospitalId', 'name location')
            .sort({ 'ratings.overall': -1 });

        return successResponse(res, 200, hotels, 'Recovery-friendly hotels fetched successfully');
    } catch (error) {
        console.error('Get recovery-friendly hotels error:', error);
        return errorResponse(res, 500, 'Failed to fetch hotels', [error.message]);
    }
};

/**
 * Add hotel review
 * POST /api/hotels/:id/review
 */
export const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return errorResponse(res, 400, 'Rating must be between 1 and 5');
        }

        const hotel = await Hotel.findById(req.params.id);

        if (!hotel) {
            return errorResponse(res, 404, 'Hotel not found');
        }

        hotel.reviews.push({
            userId: req.userId,
            rating,
            comment,
        });

        // Update ratings
        const totalReviews = hotel.reviews.length;
        const sumRatings = hotel.reviews.reduce((sum, review) => sum + review.rating, 0);
        hotel.ratings.overall = sumRatings / totalReviews;
        hotel.ratings.totalReviews = totalReviews;

        await hotel.save();

        return successResponse(res, 200, hotel.reviews, 'Review added successfully');
    } catch (error) {
        console.error('Add review error:', error);
        return errorResponse(res, 500, 'Failed to add review', [error.message]);
    }
};

/**
 * Create hotel (Admin only)
 * POST /api/hotels
 */
export const createHotel = async (req, res) => {
    try {
        const hotel = await Hotel.create(req.body);
        return successResponse(res, 201, hotel, 'Hotel created successfully');
    } catch (error) {
        console.error('Create hotel error:', error);
        return errorResponse(res, 500, 'Failed to create hotel', [error.message]);
    }
};

/**
 * Update hotel
 * PUT /api/hotels/:id
 */
export const updateHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!hotel) {
            return errorResponse(res, 404, 'Hotel not found');
        }

        return successResponse(res, 200, hotel, 'Hotel updated successfully');
    } catch (error) {
        console.error('Update hotel error:', error);
        return errorResponse(res, 500, 'Failed to update hotel', [error.message]);
    }
};
