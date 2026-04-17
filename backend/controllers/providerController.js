const Provider = require('../models/Provider');
const User = require('../models/User');

// @desc    Get nearby providers based on geo query
// @route   GET /api/providers/nearby
// @access  Public
const getNearbyProviders = async (req, res) => {
    const { lat, lng, radius, service } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ message: 'Latitude and Longitude are required' });
    }

    try {
        const radiusMeters = radius ? radius * 1000 : 5000; // default 5km

        const query = {
            isOnline: true,
            currentLocation: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: radiusMeters
                }
            }
        };

        if (service) {
            query.$or = [
                { 'services.category': new RegExp(service, 'i') },
                { 'services.subcategory': new RegExp(service, 'i') }
            ];
        }

        const providers = await Provider.find(query).populate('userId', 'name email phone avatar').lean();
        
        // --- Dynamic Pricing Engine ---
        // Basic Surge logic: If fewer than 5 providers are found nearby, demand is "high" relative to supply.
        // We set a surge multiplier between 1.0 (normal) to 2.0 (high surge).
        const supplyCount = providers.length;
        let surgeMultiplier = 1.0;
        
        if (supplyCount < 2) {
            surgeMultiplier = 1.5;
        } else if (supplyCount < 5) {
            surgeMultiplier = 1.25;
        }

        const enrichedProviders = providers.map(p => {
            const enrichedServices = p.services.map(s => ({
                ...s,
                surgeMultiplier,
                dynamicPrice: Math.round(s.basePrice * surgeMultiplier)
            }));
            return {
                ...p,
                services: enrichedServices,
                isSurging: surgeMultiplier > 1.0
            };
        });

        res.json(enrichedProviders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update provider location
// @route   PUT /api/providers/location
// @access  Private/Provider
const updateLocation = async (req, res) => {
    const { lat, lng } = req.body;

    try {
        const provider = await Provider.findOne({ userId: req.user._id });

        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }

        provider.currentLocation = {
            type: 'Point',
            coordinates: [lng, lat]
        };

        await provider.save();
        res.json({ message: 'Location updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle online status
// @route   PUT /api/providers/status
// @access  Private/Provider
const toggleStatus = async (req, res) => {
    try {
        const provider = await Provider.findOne({ userId: req.user._id });

        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }

        provider.isOnline = !provider.isOnline;
        await provider.save();
        res.json({ isOnline: provider.isOnline });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get provider profile
// @route   GET /api/providers/me
// @access  Private/Provider
const getProviderProfile = async (req, res) => {
    try {
        const provider = await Provider.findOne({ userId: req.user._id }).populate('userId', 'name email phone avatar');
        
        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }
        res.json(provider);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get provider by ID
// @route   GET /api/providers/:id
// @access  Public
const getProviderById = async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id)
            .populate('userId', 'name email phone avatar');

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }
        res.json(provider);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update provider profile
// @route   PUT /api/providers/me
// @access  Private/Provider
const updateProviderProfile = async (req, res) => {
    try {
        const provider = await Provider.findOne({ userId: req.user._id });
        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }

        const { bio, workingHours, serviceAreas } = req.body;
        if (bio !== undefined) provider.bio = bio;
        if (workingHours) provider.workingHours = workingHours;
        if (serviceAreas) provider.serviceAreas = serviceAreas;

        // Also update user name/phone if provided
        if (req.body.name || req.body.phone) {
            const user = await User.findById(req.user._id);
            if (req.body.name) user.name = req.body.name;
            if (req.body.phone) user.phone = req.body.phone;
            await user.save();
        }

        await provider.save();
        const updated = await Provider.findOne({ userId: req.user._id }).populate('userId', 'name email phone avatar');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a service to provider
// @route   POST /api/providers/me/services
// @access  Private/Provider
const addService = async (req, res) => {
    try {
        const provider = await Provider.findOne({ userId: req.user._id });
        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }

        const { category, subcategory, basePrice, priceUnit } = req.body;
        provider.services.push({ category, subcategory, basePrice, priceUnit: priceUnit || 'hr' });
        await provider.save();

        const updated = await Provider.findOne({ userId: req.user._id }).populate('userId', 'name email phone avatar');
        res.status(201).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a service
// @route   PUT /api/providers/me/services/:serviceId
// @access  Private/Provider
const updateService = async (req, res) => {
    try {
        const provider = await Provider.findOne({ userId: req.user._id });
        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }

        const service = provider.services.id(req.params.serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const { category, subcategory, basePrice, priceUnit } = req.body;
        if (category) service.category = category;
        if (subcategory) service.subcategory = subcategory;
        if (basePrice) service.basePrice = basePrice;
        if (priceUnit) service.priceUnit = priceUnit;

        await provider.save();
        const updated = await Provider.findOne({ userId: req.user._id }).populate('userId', 'name email phone avatar');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a service
// @route   DELETE /api/providers/me/services/:serviceId
// @access  Private/Provider
const deleteService = async (req, res) => {
    try {
        const provider = await Provider.findOne({ userId: req.user._id });
        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }

        provider.services = provider.services.filter(s => s._id.toString() !== req.params.serviceId);
        await provider.save();

        const updated = await Provider.findOne({ userId: req.user._id }).populate('userId', 'name email phone avatar');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNearbyProviders,
    updateLocation,
    toggleStatus,
    getProviderProfile,
    getProviderById,
    updateProviderProfile,
    addService,
    updateService,
    deleteService
};
