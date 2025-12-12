import Hospital from '../models/Hospital.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Diagnosis Controller
 * AI-based hospital recommendations and cost estimation
 * Note: This is a simplified version. In production, integrate with OpenAI/Gemini API
 */

/**
 * Get AI-based hospital recommendations
 * POST /api/diagnosis/recommend
 */
export const getRecommendations = async (req, res) => {
    try {
        const { treatment, budget, location, priority } = req.body;

        if (!treatment) {
            return errorResponse(res, 400, 'Treatment is required');
        }

        // Build query
        const query = {
            isActive: true,
            isVerified: true,
            'treatments.name': new RegExp(treatment, 'i'),
        };

        if (location?.city) {
            query['location.city'] = new RegExp(location.city, 'i');
        }

        if (budget) {
            query['treatments.pricing.max'] = { $lte: parseFloat(budget) };
        }

        // Fetch hospitals
        let hospitals = await Hospital.find(query);

        // AI-based ranking (simplified algorithm)
        // In production, use ML model or AI API
        hospitals = hospitals.map(hospital => {
            let score = 0;

            // Rating weight (40%)
            score += (hospital.ratings.overall / 5) * 40;

            // Price weight (30%)
            const treatment = hospital.treatments.find(t =>
                t.name.toLowerCase().includes(treatment.toLowerCase())
            );
            if (treatment && budget) {
                const priceScore = 1 - (treatment.pricing.max / budget);
                score += Math.max(0, priceScore) * 30;
            }

            // Success rate weight (20%)
            if (treatment?.successRate) {
                score += (treatment.successRate / 100) * 20;
            }

            // Verification weight (10%)
            if (hospital.accreditation.blockchainVerified) {
                score += 10;
            }

            return {
                ...hospital.toObject(),
                recommendationScore: score,
            };
        });

        // Sort by recommendation score
        hospitals.sort((a, b) => b.recommendationScore - a.recommendationScore);

        // Take top 10
        const recommendations = hospitals.slice(0, 10);

        return successResponse(res, 200, {
            recommendations,
            totalFound: hospitals.length,
            criteria: { treatment, budget, location, priority },
        }, 'Recommendations generated successfully');
    } catch (error) {
        console.error('Get recommendations error:', error);
        return errorResponse(res, 500, 'Failed to generate recommendations', [error.message]);
    }
};

/**
 * Estimate treatment cost
 * POST /api/diagnosis/estimate-cost
 */
export const estimateCost = async (req, res) => {
    try {
        const { treatment, location, duration } = req.body;

        if (!treatment) {
            return errorResponse(res, 400, 'Treatment is required');
        }

        const query = {
            isActive: true,
            'treatments.name': new RegExp(treatment, 'i'),
        };

        if (location?.country) {
            query['location.country'] = new RegExp(location.country, 'i');
        }

        const hospitals = await Hospital.find(query);

        if (hospitals.length === 0) {
            return errorResponse(res, 404, 'No hospitals found for this treatment');
        }

        // Calculate cost statistics
        const costs = [];
        hospitals.forEach(hospital => {
            hospital.treatments.forEach(t => {
                if (t.name.toLowerCase().includes(treatment.toLowerCase())) {
                    costs.push({
                        hospitalName: hospital.name,
                        min: t.pricing.min,
                        max: t.pricing.max,
                        currency: t.pricing.currency,
                        duration: t.duration,
                    });
                }
            });
        });

        const minCost = Math.min(...costs.map(c => c.min));
        const maxCost = Math.max(...costs.map(c => c.max));
        const avgCost = costs.reduce((sum, c) => sum + ((c.min + c.max) / 2), 0) / costs.length;

        return successResponse(res, 200, {
            treatment,
            location: location?.country || 'All locations',
            estimate: {
                min: Math.round(minCost),
                max: Math.round(maxCost),
                average: Math.round(avgCost),
                currency: costs[0]?.currency || 'USD',
            },
            breakdown: costs,
            totalHospitals: hospitals.length,
        }, 'Cost estimation completed');
    } catch (error) {
        console.error('Estimate cost error:', error);
        return errorResponse(res, 500, 'Failed to estimate cost', [error.message]);
    }
};

/**
 * Compare hospitals
 * POST /api/diagnosis/compare
 */
export const compareHospitals = async (req, res) => {
    try {
        const { hospitalIds } = req.body;

        if (!hospitalIds || hospitalIds.length < 2) {
            return errorResponse(res, 400, 'At least 2 hospital IDs are required');
        }

        const hospitals = await Hospital.find({ _id: { $in: hospitalIds } });

        if (hospitals.length !== hospitalIds.length) {
            return errorResponse(res, 404, 'One or more hospitals not found');
        }

        const comparison = hospitals.map(hospital => ({
            id: hospital._id,
            name: hospital.name,
            location: hospital.location,
            ratings: hospital.ratings,
            treatments: hospital.treatments,
            accreditation: hospital.accreditation,
            facilities: hospital.facilities,
            packages: hospital.packages,
        }));

        return successResponse(res, 200, comparison, 'Hospital comparison completed');
    } catch (error) {
        console.error('Compare hospitals error:', error);
        return errorResponse(res, 500, 'Failed to compare hospitals', [error.message]);
    }
};
