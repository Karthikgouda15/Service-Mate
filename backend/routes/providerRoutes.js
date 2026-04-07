const express = require('express');
const { getNearbyProviders, updateLocation, toggleStatus, getProviderProfile, getProviderById, updateProviderProfile, addService, updateService, deleteService } = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/nearby', getNearbyProviders);
router.get('/me', protect, authorize('provider'), getProviderProfile);
router.put('/me', protect, authorize('provider'), updateProviderProfile);
router.post('/me/services', protect, authorize('provider'), addService);
router.put('/me/services/:serviceId', protect, authorize('provider'), updateService);
router.delete('/me/services/:serviceId', protect, authorize('provider'), deleteService);
router.get('/:id', getProviderById);
router.put('/location', protect, authorize('provider'), updateLocation);
router.put('/status', protect, authorize('provider'), toggleStatus);

module.exports = router;
