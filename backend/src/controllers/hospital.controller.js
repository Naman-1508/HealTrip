import Hospital from '../models/Hospital.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Hospital Controller
 * Handles hospital CRUD, search, filtering, and ratings
 */

/**
 * Get all hospitals with filters
 * GET /api/hospitals
 */
export const getAllHospitals = async (req, res) => {
    try {
        const { city, country, treatment, minRating, page = 1, limit = 10 } = req.query;

        const query = { isActive: true };

        if (city) query['location.city'] = new RegExp(city, 'i');
        if (country) query['location.country'] = new RegExp(country, 'i');
        if (treatment) query['treatments.category'] = new RegExp(treatment, 'i');
        if (minRating) query['ratings.overall'] = { $gte: parseFloat(minRating) };

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const hospitals = await Hospital.find(query)
            .sort({ 'ratings.overall': -1, isFeatured: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Hospital.countDocuments(query);

        return successResponse(res, 200, {
            hospitals,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
            },
        }, 'Hospitals fetched successfully');
    } catch (error) {
        console.error('Get hospitals error:', error);
        return errorResponse(res, 500, 'Failed to fetch hospitals', [error.message]);
    }
};

/**
 * Get hospital by ID
 * GET /api/hospitals/:id
 */
export const getHospitalById = async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return errorResponse(res, 404, 'Hospital not found');
        }

        return successResponse(res, 200, hospital, 'Hospital fetched successfully');
    } catch (error) {
        console.error('Get hospital error:', error);
        return errorResponse(res, 500, 'Failed to fetch hospital', [error.message]);
    }
};

/**
 * Search hospitals by treatment
 * GET /api/hospitals/search/treatment
 */
export const searchByTreatment = async (req, res) => {
    try {
        const { treatment, city, country, maxPrice } = req.query;

        if (!treatment) {
            return errorResponse(res, 400, 'Treatment parameter is required');
        }

        const query = {
            isActive: true,
            'treatments.name': new RegExp(treatment, 'i'),
        };

        if (city) query['location.city'] = new RegExp(city, 'i');
        if (country) query['location.country'] = new RegExp(country, 'i');
        if (maxPrice) query['treatments.pricing.max'] = { $lte: parseFloat(maxPrice) };

        const hospitals = await Hospital.find(query).sort({ 'ratings.overall': -1 });

        return successResponse(res, 200, hospitals, `Found ${hospitals.length} hospitals for ${treatment}`);
    } catch (error) {
        console.error('Search treatment error:', error);
        return errorResponse(res, 500, 'Failed to search hospitals', [error.message]);
    }
};

/**
 * Get nearby hospitals
 * GET /api/hospitals/nearby
 */
export const getNearbyHospitals = async (req, res) => {
    try {
        const { latitude, longitude, maxDistance = 50 } = req.query;

        if (!latitude || !longitude) {
            return errorResponse(res, 400, 'Latitude and longitude are required');
        }

        const hospitals = await Hospital.find({
            isActive: true,
            'location.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)],
                    },
                    $maxDistance: parseFloat(maxDistance) * 1000, // Convert km to meters
                },
            },
        });

        return successResponse(res, 200, hospitals, 'Nearby hospitals fetched successfully');
    } catch (error) {
        console.error('Get nearby hospitals error:', error);
        return errorResponse(res, 500, 'Failed to fetch nearby hospitals', [error.message]);
    }
};

/**
 * Add hospital review
 * POST /api/hospitals/:id/review
 */
export const addReview = async (req, res) => {
    try {
        const { rating, comment, treatment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return errorResponse(res, 400, 'Rating must be between 1 and 5');
        }

        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return errorResponse(res, 404, 'Hospital not found');
        }

        // Add review
        hospital.reviews.push({
            userId: req.userId,
            rating,
            comment,
            treatment,
        });

        // Update ratings
        const totalReviews = hospital.reviews.length;
        const sumRatings = hospital.reviews.reduce((sum, review) => sum + review.rating, 0);
        hospital.ratings.overall = sumRatings / totalReviews;
        hospital.ratings.totalReviews = totalReviews;

        await hospital.save();

        return successResponse(res, 200, hospital.reviews, 'Review added successfully');
    } catch (error) {
        console.error('Add review error:', error);
        return errorResponse(res, 500, 'Failed to add review', [error.message]);
    }
};

/**
 * Create hospital (Admin only - simplified for hackathon)
 * POST /api/hospitals
 */
export const createHospital = async (req, res) => {
    try {
        const hospital = await Hospital.create(req.body);
        return successResponse(res, 201, hospital, 'Hospital created successfully');
    } catch (error) {
        console.error('Create hospital error:', error);
        return errorResponse(res, 500, 'Failed to create hospital', [error.message]);
    }
};

/**
 * Update hospital
 * PUT /api/hospitals/:id
 */
export const updateHospital = async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!hospital) {
            return errorResponse(res, 404, 'Hospital not found');
        }

        return successResponse(res, 200, hospital, 'Hospital updated successfully');
    } catch (error) {
        console.error('Update hospital error:', error);
        return errorResponse(res, 500, 'Failed to update hospital', [error.message]);
    }
};
