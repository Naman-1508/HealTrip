import Flight from '../models/Flight.js';

// @desc    Search flights
// @route   GET /api/flights/search?from=BLR&to=DEL&date=2024-12-15
// @access  Public
export const searchFlights = async (req, res) => {
    try {
        const { from, to, date } = req.query;

        let query = {};

        if (from) {
            query.origin = { $regex: from, $options: 'i' };
        }
        if (to) {
            query.destination = { $regex: to, $options: 'i' };
        }
        if (date) {
            // Match flights on that specific date (ignoring time)
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);

            query.departureTime = {
                $gte: startDate,
                $lt: endDate
            };
        }

        const flights = await Flight.find(query).sort({ price: 1 });

        res.status(200).json({
            success: true,
            count: flights.length,
            data: flights
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single flight by ID
// @route   GET /api/flights/:id
// @access  Public
export const getFlightById = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);

        if (!flight) {
            return res.status(404).json({
                success: false,
                message: 'Flight not found'
            });
        }

        res.status(200).json({
            success: true,
            data: flight
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
