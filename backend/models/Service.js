const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    category: { type: String, required: true, unique: true },
    subcategories: [{
        name: { type: String, required: true },
        basePrice: { type: Number, required: true },
        priceUnit: { type: String, required: true },
        estimatedDuration: { type: Number } // in minutes
    }],
    icon: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
