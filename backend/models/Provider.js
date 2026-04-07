const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    services: [{
        category: { type: String, required: true },
        subcategory: { type: String, required: true },
        basePrice: { type: Number, required: true },
        priceUnit: { type: String, required: true }
    }],
    serviceAreas: [String],
    isOnline: { type: Boolean, default: false },
    currentLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    rating: { type: Number, default: 0 },
    totalJobs: { type: Number, default: 0 },
    documents: [String],
    bio: { type: String, default: '' },
    workingHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '18:00' }
    },
    isApproved: { type: Boolean, default: false }
}, { timestamps: true });

providerSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Provider', providerSchema);
