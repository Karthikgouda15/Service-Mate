const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Message = require('../models/Message');

// @desc    Get chat history for a booking
// @route   GET /api/chat/:bookingId
// @access  Private
router.get('/:bookingId', protect, async (req, res) => {
    try {
        const messages = await Message.find({ bookingId: req.params.bookingId })
            .sort({ createdAt: 1 })
            .populate('sender', 'name avatar');
        
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
