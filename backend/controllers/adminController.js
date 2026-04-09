const User = require('../models/User');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');

// Helper to compile stats and emit to admin room
const emitAdminUpdate = async (io) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'customer' });
        const totalProviders = await User.countDocuments({ role: 'provider' });
        const totalBookings = await Booking.countDocuments();
        
        const completedBookings = await Booking.find({ status: 'completed' });
        const totalRevenue = completedBookings.reduce((acc, curr) => acc + (curr.price || 0), 0);

        const pendingProviders = await Provider.find({ isApproved: false }).populate('userId', 'name email phone avatar');

        const data = {
            totalUsers,
            totalProviders,
            totalBookings,
            totalRevenue,
            pendingProvidersCount: pendingProviders.length,
            pendingProviders
        };

        if (io) {
            io.to('admin_room').emit('admin:dashboard:update', data);
        }
        return data;
    } catch (error) {
        console.error('Error emitting admin update:', error);
    }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardData = async (req, res) => {
    try {
        const data = await emitAdminUpdate(req.app.get('io'));
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get legacy admin dashboard stats (optional keep for compatibility)
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'customer' });
        const totalProviders = await User.countDocuments({ role: 'provider' });
        const totalBookings = await Booking.countDocuments();
        
        const completedBookings = await Booking.find({ status: 'completed' });
        const totalRevenue = completedBookings.reduce((acc, curr) => acc + (curr.price || 0), 0);

        const bookingStats = await Booking.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            { $limit: 7 }
        ]);

        res.json({
            users: totalUsers,
            providers: totalProviders,
            bookings: totalBookings,
            revenue: totalRevenue,
            chartData: bookingStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all providers for management
const getAllProviders = async (req, res) => {
    try {
        const providers = await Provider.find().populate('userId', 'name email phone role isVerified');
        res.json(providers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or reject a provider
const updateProviderStatus = async (req, res) => {
    const { id, action } = req.params;

    try {
        const isApproved = action === 'approve';
        const provider = await Provider.findByIdAndUpdate(id, { isApproved }, { new: true }).populate('userId');

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // Emit update to admin dashboard
        await emitAdminUpdate(req.app.get('io'));

        res.json({ message: `Provider ${action}ed successfully`, provider });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings for monitoring
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('customerId', 'name email')
            .populate('providerId', 'userId')
            .sort({ createdAt: -1 });
        
        const populatedBookings = await Booking.populate(bookings, {
            path: 'providerId.userId',
            select: 'name',
            model: 'User'
        });

        res.json(populatedBookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardData,
    emitAdminUpdate,
    getStats,
    getAllProviders,
    updateProviderStatus,
    getAllBookings
};
