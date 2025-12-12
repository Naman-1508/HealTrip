/**
 * Standardized API Response Utility
 * Ensures consistent response format across all endpoints
 */

export class ApiResponse {
    constructor(statusCode, data, message = 'Success') {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
        this.timestamp = new Date().toISOString();
    }
}

export class ApiError extends Error {
    constructor(statusCode, message = 'Something went wrong', errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.success = false;
        this.errors = errors;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * Success response helper
 */
export const successResponse = (res, statusCode, data, message) => {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
};

/**
 * Error response helper
 */
export const errorResponse = (res, statusCode, message, errors = []) => {
    return res.status(statusCode).json(new ApiError(statusCode, message, errors));
};
