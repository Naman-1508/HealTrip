import Cab from '../models/Cab.js';

// @desc    Search cabs by location
// @route   GET /api/cabs/search?location=Bangalore
// @access  Public
export const searchCabs = async (req, res) => {
    try {
        const { location, type } = req.query;

        let query = { isAvailable: true };

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        if (type) {
            query.vehicleType = type;
        }

        const cabs = await Cab.find(query).sort({ rating: -1 });

        res.status(200).json({
            success: true,
            count: cabs.length,
            data: cabs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single cab by ID
// @route   GET /api/cabs/:id
// @access  Public
export const getCabById = async (req, res) => {
    try {
        const cab = await Cab.findById(req.params.id);

        if (!cab) {
            return res.status(404).json({
                success: false,
                message: 'Cab not found'
            });
        }

        res.status(200).json({
            success: true,
            data: cab
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
