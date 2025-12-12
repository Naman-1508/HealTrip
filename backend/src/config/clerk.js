import { Clerk } from '@clerk/clerk-sdk-node';

/**
 * Clerk Authentication Configuration
 * Initializes Clerk SDK for user authentication and management
 */

const clerk = Clerk({
    apiKey: process.env.CLERK_SECRET_KEY,
});

export default clerk;
