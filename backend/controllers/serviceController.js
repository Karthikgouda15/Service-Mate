const Service = require('../models/Service');

// @desc    Get all active services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
    try {
        const services = await Service.find({ isActive: true });
        res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new service (Admin only)
// @route   POST /api/services
// @access  Private/Admin
const createService = async (req, res) => {
    const { category, subcategories, icon } = req.body;

    try {
        const service = await Service.create({
            category,
            subcategories,
            icon
        });
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getServices,
    createService
};
