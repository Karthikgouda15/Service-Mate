const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Review = require('../models/Review');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private/Customer
const createBooking = async (req, res) => {
    const { providerId, serviceType, description, scheduledAt, address, location, price } = req.body;

    try {
        const booking = await Booking.create({
            customerId: req.user._id,
            providerId,
            serviceType,
            description,
            scheduledAt,
            address,
            location,
            price,
            timeline: [{ status: 'pending' }]
        });

        // Emit real-time update to provider
        const io = req.app.get('io');
        if (io) {
            io.to(`provider_${providerId}`).emit('new_booking', booking);
        }

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings for logged in customer
// @route   GET /api/bookings/customer/me
// @access  Private/Customer
const getCustomerBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ customerId: req.user._id })
            .populate('providerId', 'name email phone avatar')
            .sort({ createdAt: -1 });
        
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get booking details
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customerId', 'name email phone avatar')
            .populate('providerId', 'name email phone avatar');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking status (Confirm/Start/Complete/Cancel)
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
    const { status, otp } = req.body;

    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Logic for different status updates
        if (status === 'confirmed') {
            // Provider accepts booking
            booking.status = 'confirmed';
            booking.otp = Math.floor(1000 + Math.random() * 9000).toString(); // Simple 4-digit OTP
        } else if (status === 'ongoing') {
            // Check OTP
            if (booking.otp !== otp) {
                return res.status(400).json({ message: 'Invalid OTP' });
            }
            booking.status = 'ongoing';
        } else if (status === 'completed') {
            booking.status = 'completed';
            booking.paymentStatus = 'paid'; // simplify for MVP
            
            // Increment provider total jobs
            await Provider.findByIdAndUpdate(booking.providerId, { $inc: { totalJobs: 1 } });
        } else if (status === 'cancelled') {
            booking.status = 'cancelled';
        }

        booking.timeline.push({ status, timestamp: Date.now() });
        await booking.save();

        // Emit real-time update
        const io = req.app.get('io');
        io.to(`booking_${booking._id}`).emit('booking_status_updated', { 
            status: booking.status,
            otp: booking.otp 
        });

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add review for a completed booking
// @route   POST /api/bookings/:id/review
// @access  Private/Customer
const addReview = async (req, res) => {
    const { rating, comment } = req.body;

    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'completed') {
            return res.status(400).json({ message: 'You can only review completed bookings' });
        }

        if (booking.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to review this booking' });
        }

        const review = await Review.create({
            bookingId: booking._id,
            customerId: req.user._id,
            providerId: booking.providerId,
            rating,
            comment
        });

        // Update provider rating
        const reviews = await Review.find({ providerId: booking.providerId });
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await Provider.findByIdAndUpdate(booking.providerId, { rating: avgRating });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings for logged in provider
// @route   GET /api/bookings/provider/me
// @access  Private/Provider
const getProviderBookings = async (req, res) => {
    try {
        const provider = await Provider.findOne({ userId: req.user._id });
        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }

        const bookings = await Booking.find({ providerId: provider._id })
            .populate('customerId', 'name email phone avatar')
            .sort({ createdAt: -1 });
        
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    getCustomerBookings,
    getProviderBookings,
    getBookingById,
    updateBookingStatus,
    addReview
};
