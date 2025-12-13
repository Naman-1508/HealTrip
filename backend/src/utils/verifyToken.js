import { clerkClient } from "@clerk/clerk-sdk-node";

export const verifyClerkToken = async (token) => {
    try {
        // Verify JWT token properly
        const payload = await clerkClient.verifyToken(token);

        return {
            success: true,
            userId: payload.sub,
            sessionId: payload.sid,
            session: payload,
        };
    } catch (error) {
        console.error("Clerk token verification failed:", error.message);
        return {
            success: false,
            error: error.message,
        };
    }
};

export const getClerkUser = async (userId) => {
    try {
        const user = await clerkClient.users.getUser(userId);
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
