import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import Hotel from '../models/Hotel.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { getClerkUser } from '../utils/verifyToken.js';

/**
 * Payment Controller
 * Handles payment initiation and webhook processing
 */

/**
 * Create payment order
 * POST /api/payment/create-order
 */
export const createPaymentOrder = async (req, res) => {
    try {
        const { bookingId, paymentMethod } = req.body;

        if (!bookingId || !paymentMethod) {
            return errorResponse(res, 400, 'Booking ID and payment method are required');
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return errorResponse(res, 404, 'Booking not found');
        }

        if (booking.payment.status === 'completed') {
            return errorResponse(res, 400, 'Payment already completed');
        }

        // Verify user ownership
        // Verify user ownership
        let user = await User.findOne({ clerkId: req.userId });

        // Auto-create user if missing (Sync with Clerk)
        if (!user) {
            const clerkUserRes = await getClerkUser(req.userId);
            if (clerkUserRes.success) {
                const clerkUser = clerkUserRes.user;
                try {
                    user = await User.create({
                        clerkId: req.userId,
                        email: clerkUser.emailAddresses[0]?.emailAddress,
                        firstName: clerkUser.firstName || 'Traveler',
                        lastName: clerkUser.lastName || '',
                        profileImage: clerkUser.imageUrl
                    });
                } catch (e) { console.error("Sync error", e); }
            }
        }

        if (!user || booking.userId.toString() !== user._id.toString()) {
            return errorResponse(res, 403, 'Unauthorized access to booking');
        }

        // Forward request to payment service
        const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:5001';
        const endpoint = paymentMethod === 'razorpay' ? '/api/razorpay/create-order' : '/api/stripe/create-payment-intent';

        const response = await fetch(`${paymentServiceUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: booking.pricing.total,
                currency: booking.pricing.currency,
                bookingId: booking._id,
                userId: req.userId,
            }),
        });

        const paymentData = await response.json();

        if (!response.ok) {
            return errorResponse(res, response.status, 'Payment service error', [paymentData.message]);
        }

        // Update booking with payment method
        booking.payment.method = paymentMethod;
        await booking.save();

        return successResponse(res, 200, paymentData.data, 'Payment order created successfully');
    } catch (error) {
        console.error('Create payment order error:', error);
        return errorResponse(res, 500, 'Failed to create payment order', [error.message]);
    }
};

/**
 * Verify payment
 * POST /api/payment/verify
 */
export const verifyPayment = async (req, res) => {
    try {
        const { bookingId, paymentId, signature, paymentMethod } = req.body;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return errorResponse(res, 404, 'Booking not found');
        }

        // Forward to payment service for verification
        const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:5001';
        const endpoint = paymentMethod === 'razorpay' ? '/api/razorpay/verify' : '/api/stripe/verify';

        const response = await fetch(`${paymentServiceUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paymentId, signature, bookingId }),
        });

        const verificationData = await response.json();

        if (!response.ok || !verificationData.success) {
            booking.payment.status = 'failed';
            await booking.save();
            return errorResponse(res, 400, 'Payment verification failed');
        }

        // Update booking status
        booking.payment.status = 'completed';
        booking.payment.transactionId = paymentId;
        booking.payment.paidAt = new Date();
        booking.status = 'confirmed';
        await booking.save();

        return successResponse(res, 200, booking, 'Payment verified successfully');
    } catch (error) {
        console.error('Verify payment error:', error);
        return errorResponse(res, 500, 'Failed to verify payment', [error.message]);
    }
};

/**
 * Get booking details
 * GET /api/payment/booking/:id
 */
export const getBookingDetails = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'firstName lastName email')
            .populate('hospital.hospitalId', 'name location contact')
            .populate('hotel.hotelId', 'name location contact')
            .populate('wellnessSession', 'name location schedule');

        if (!booking) {
            return errorResponse(res, 404, 'Booking not found');
        }

        // Verify user ownership
        // Note: Booking uses ObjectId, req.userId is Clerk ID String
        const user = await User.findOne({ clerkId: req.userId });
        if (!user || booking.userId._id.toString() !== user._id.toString()) {
            // Fallback legacy check
            if (booking.userId.toString() !== req.userId) {
                return errorResponse(res, 403, 'Unauthorized access to booking');
            }
        }

        return successResponse(res, 200, booking, 'Booking details fetched successfully');
    } catch (error) {
        console.error('Get booking details error:', error);
        return errorResponse(res, 500, 'Failed to fetch booking details', [error.message]);
    }
};

/**
 * Get user bookings
 * GET /api/payment/my-bookings
 */
export const getUserBookings = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        console.log(`[DEBUG] getUserBookings called. UserID: ${req.userId}, Query:`, req.query);

        // Find user by Clerk ID
        // Find user by Clerk ID
        let user = await User.findOne({ clerkId: req.userId });

        // Auto-create user if missing (Sync with Clerk)
        if (!user) {
            console.log(`User sync: Creating local record for Clerk ID ${req.userId}`);
            const clerkUserRes = await getClerkUser(req.userId);

            if (clerkUserRes.success) {
                const clerkUser = clerkUserRes.user;
                const email = clerkUser.emailAddresses[0]?.emailAddress;
                // fallback to id if email missing (unlikely)

                try {
                    user = await User.create({
                        clerkId: req.userId,
                        email: email || `user_${req.userId}@healtrip.com`,
                        firstName: clerkUser.firstName || 'Traveler',
                        lastName: clerkUser.lastName || '',
                        profileImage: clerkUser.imageUrl
                    });
                } catch (createErr) {
                    console.error("Error creating user during sync:", createErr);
                    // Return empty bookings if user creation fails
                    return successResponse(res, 200, {
                        bookings: [],
                        pagination: { total: 0, page: parseInt(page), pages: 0 },
                    }, 'No bookings found (User sync failed)');
                }
            } else {
                console.log(`[DEBUG] User sync failed. Clerk returned success:false for ID ${req.userId}`);
                // Return empty bookings if user not found in Clerk
                return successResponse(res, 200, {
                    bookings: [],
                    pagination: { total: 0, page: parseInt(page), pages: 0 },
                }, 'No bookings found (User not found)');
            }
        } else {
            console.log(`[DEBUG] User found in DB: ${user._id}`);
        }

        const query = { userId: user._id };
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const bookings = await Booking.find(query)
            .populate('hospital.hospitalId', 'name location')
            .populate('hotel.hotelId', 'name location')
            .populate('wellnessSession', 'name schedule')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Booking.countDocuments(query);

        return successResponse(res, 200, {
            bookings,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
            },
        }, 'Bookings fetched successfully');
    } catch (error) {
        console.error('Get user bookings error:', error);
        return errorResponse(res, 500, 'Failed to fetch bookings', [error.message]);
    }
};

/**
 * Create Package Booking (Mock/Direct)
 * POST /api/payment/book-package
 */
export const createPackageBooking = async (req, res) => {
    try {
        console.log("[DEBUG] createPackageBooking called");
        const { packageData, paymentMethod } = req.body;

        if (!packageData) {
            return errorResponse(res, 400, "Missing packageData");
        }

        // Find user by Clerk ID
        let user = await User.findOne({ clerkId: req.userId });

        // Sync Logic
        if (!user) {
            console.log(`[DEBUG] User not found by ClerkID, attempting sync...`);
            const clerkUserRes = await getClerkUser(req.userId);

            if (clerkUserRes.success) {
                const clerkUser = clerkUserRes.user;
                const email = clerkUser.emailAddresses?.[0]?.emailAddress;

                // 1. Try to find by EMAIL first (to avoid E11000 duplicate error)
                if (email) {
                    user = await User.findOne({ email: email });
                    if (user) {
                        console.log(`[DEBUG] User found by email. Updating ClerkID.`);
                        user.clerkId = req.userId;
                        await user.save();
                    }
                }

                // 2. If still no user, Create new
                if (!user) {
                    console.log("[DEBUG] Creating new user record...");
                    try {
                        user = await User.create({
                            clerkId: req.userId,
                            email: email || `user_${req.userId}@healtrip.com`,
                            firstName: clerkUser.firstName || 'Traveler',
                            lastName: clerkUser.lastName || '',
                            profileImage: clerkUser.imageUrl
                        });
                    } catch (dbErr) {
                        console.error("[DEBUG] User create error:", dbErr);
                        if (dbErr.code === 11000) {
                            console.log("[DEBUG] Duplicate key error caught. Retrying fetch...");
                            user = await User.findOne({ email: email });
                            if (user) {
                                user.clerkId = req.userId;
                                await user.save();
                            } else {
                                throw dbErr;
                            }
                        } else {
                            throw dbErr;
                        }
                    }
                }
            } else {
                return errorResponse(res, 401, 'User not found in authentication provider');
            }
        }

        const newBooking = new Booking({
            userId: user._id,
            bookingType: 'package',
            // Hospital Mapping
            hospital: {
                name: packageData.hospital?.name,
                location: packageData.hospital?.city,
                treatment: packageData.hospital?.specialty,
            },
            // Hotel Mapping
            hotel: {
                name: packageData.hotel?.name,
                location: packageData.hotel?.city || packageData.hospital?.city, // Fallback
                roomType: 'Standard Suite',
                numberOfGuests: packageData.packageDetails?.travelers || 1,
            },
            // Flight Mapping
            flight: {
                airline: packageData.flight?.airline,
                origin: packageData.flight?.origin,
                destination: packageData.flight?.destination,
                price: packageData.flight?.price,
                duration: packageData.flight?.duration,
            },
            // Package Meta
            package: {
                packageName: "Custom Medical Package",
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + (parseInt(packageData.packageDetails?.duration) || 3))),
            },
            // Pricing
            pricing: {
                subtotal: packageData.packageDetails?.totalAmount || 0,
                total: packageData.packageDetails?.totalAmount || 0,
                currency: 'INR'
            },
            // Payment
            payment: {
                status: 'completed', // Auto-complete for this mock flow
                method: paymentMethod || 'upi',
                transactionId: `TXN_${Date.now()}`,
                paidAt: new Date(),
            },
            status: 'confirmed'
        });

        await newBooking.save();

        return successResponse(res, 201, newBooking, 'Booking created successfully');

    } catch (error) {
        console.error('Create package booking error:', error);
        return errorResponse(res, 500, 'Failed to create booking', [error.message]);
    }
};

/**
 * Cancel booking
 * POST /api/payment/cancel/:id
 */
export const cancelBooking = async (req, res) => {
    try {
        const { reason } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return errorResponse(res, 404, 'Booking not found');
        }

        // Verify user ownership
        const user = await User.findOne({ clerkId: req.userId });
        if (!user || booking.userId.toString() !== user._id.toString()) {
            return errorResponse(res, 403, 'Unauthorized access to booking');
        }

        if (booking.status === 'cancelled') {
            return errorResponse(res, 400, 'Booking already cancelled');
        }

        booking.status = 'cancelled';
        booking.cancellation.isCancelled = true;
        booking.cancellation.cancelledAt = new Date();
        booking.cancellation.cancelledBy = 'user';
        booking.cancellation.reason = reason;
        booking.cancellation.refundStatus = 'pending';

        await booking.save();

        return successResponse(res, 200, booking, 'Booking cancelled successfully');
    } catch (error) {
        console.error('Cancel booking error:', error);
        return errorResponse(res, 500, 'Failed to cancel booking', [error.message]);
    }
};
