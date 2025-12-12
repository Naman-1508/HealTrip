import clerk from '../config/clerk.js';

/**
 * Verify Clerk Session Token
 * @param {string} token - Session token from client
 * @returns {Object} - Decoded session data
 */
export const verifyClerkToken = async (token) => {
    try {
        // Remove 'Bearer ' prefix if present
        const cleanToken = token.replace('Bearer ', '');

        // Verify the session token
        const session = await clerk.sessions.verifySession(cleanToken);

        return {
            success: true,
            session,
            userId: session.userId,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Get user details from Clerk
 * @param {string} userId - Clerk user ID
 * @returns {Object} - User details
 */
export const getClerkUser = async (userId) => {
    try {
        const user = await clerk.users.getUser(userId);
        return {
            success: true,
            user,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};
