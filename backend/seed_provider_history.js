const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Booking = require('./models/Booking');
const Provider = require('./models/Provider');
const Review = require('./models/Review');

const providerUserId = '69dc907708f50d2a2f461212'; // provider@servicemate.com
const customerEmails = ['anjali@example.com', 'rohan@example.com', 'sarah@example.com', 'priya@example.com', 'vikram@example.com'];

const history = [
    { service: 'Full Kitchen Plumbing', price: 2450, rating: 5, comment: 'Incredible work! Fixed a leak that three other plumbers couldn\'t find. Very professional.' },
    { service: 'Emergency Pipe Repair', price: 1200, rating: 5, comment: 'Came late at night and saved our wooden flooring from flooding. Exceptional service!' },
    { service: 'Bathroom Fitting', price: 5600, rating: 4, comment: 'Good work, very clean and efficient. Highly recommended for home repairs.' },
    { service: 'Tap Installation', price: 450, rating: 5, comment: 'Fast, affordable, and very polite. Will definitely book again.' },
    { service: 'Water Heater Service', price: 1800, rating: 5, comment: 'Expert knowledge. Explained everything clearly and fixed the issue in 20 minutes.' }
];

const seedHistory = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const provider = await Provider.findOne({ userId: providerUserId });
        if (!provider) throw new Error('Provider not found');

        for (let i = 0; i < history.length; i++) {
            const h = history[i];
            const customerEmail = customerEmails[i % customerEmails.length];
            const customer = await User.findOne({ email: customerEmail });

            if (!customer) {
                console.log(`Customer ${customerEmail} not found, skipping...`);
                continue;
            }

            // Create Completed Booking
            const booking = await Booking.create({
                customerId: customer._id,
                providerId: providerUserId,
                serviceType: h.service,
                description: h.service,
                scheduledAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000), // Past dates
                address: '123 Demo St, Bangalore',
                location: { type: 'Point', coordinates: [77.5946, 12.9716] },
                status: 'completed',
                price: h.price,
                paymentStatus: 'paid',
                timeline: [
                    { status: 'pending', timestamp: new Date(Date.now() - (i + 1.1) * 24 * 60 * 60 * 1000) },
                    { status: 'completed', timestamp: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000) }
                ]
            });

            // Create Review
            await Review.create({
                bookingId: booking._id,
                customerId: customer._id,
                providerId: providerUserId,
                rating: h.rating,
                comment: h.comment
            });

            console.log(`Created history for ${customer.name}: ${h.service}`);
        }

        // Update Provider Stats
        const reviews = await Review.find({ providerId: providerUserId });
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        
        provider.rating = avgRating;
        provider.totalJobs += history.length;
        await provider.save();

        console.log(`Provider stats updated: Rating ${avgRating.toFixed(1)}, Jobs ${provider.totalJobs}`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedHistory();
