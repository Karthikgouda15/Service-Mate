const express = require('express');
const { createBooking, getBookingById, updateBookingStatus, getCustomerBookings, getProviderBookings, addReview } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/customer/me', protect, getCustomerBookings);
router.get('/provider/me', protect, authorize('provider'), getProviderBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, updateBookingStatus);
router.post('/:id/review', protect, addReview);

module.exports = router;
