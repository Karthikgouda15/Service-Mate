const express = require('express');
const { getServices, createService } = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getServices);
router.post('/', protect, authorize('admin'), createService);

module.exports = router;
