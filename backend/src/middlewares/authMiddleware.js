import { verifyClerkToken } from '../utils/verifyToken.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Authentication Middleware
 * Verifies Clerk session token and attaches user info to request
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        console.log(`[DEBUG] Auth Middleware. Header present: ${!!authHeader}`);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 401, 'No token provided. Please login.');
        }

        const token = authHeader.split(' ')[1];

        // Verify token with Clerk
        const verification = await verifyClerkToken(token);

        if (!verification.success) {
            return errorResponse(res, 401, 'Invalid or expired token. Please login again.');
        }

        // Attach user info to request
        req.userId = verification.userId;
        req.sessionId = verification.sessionId;
        req.session = verification.session;

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return errorResponse(res, 500, 'Authentication failed', [error.message]);
    }
};

/**
 * Optional Authentication Middleware
 * Verifies token if present, but doesn't block request if missing
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const verification = await verifyClerkToken(token);

            if (verification.success) {
                req.userId = verification.userId;
                req.session = verification.session;
            }
        }

        next();
    } catch (error) {
        // Continue even if authentication fails
        next();
    }
};
