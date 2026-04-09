const express = require('express');
const { getDashboardData, getStats, getAllProviders, updateProviderStatus, getAllBookings } = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes here are admin only
router.use(verifyToken);
router.use(isAdmin);

router.get('/dashboard', getDashboardData);
router.get('/stats', getStats);
router.get('/providers', getAllProviders);
router.put('/providers/:id/:action', updateProviderStatus);
router.get('/bookings', getAllBookings);

module.exports = router;
