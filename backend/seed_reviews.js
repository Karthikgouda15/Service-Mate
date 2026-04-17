const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Provider = require('./models/Provider');
const Booking = require('./models/Booking');
const Review = require('./models/Review');

dotenv.config();

const comments = [
    "Amazing service! Very professional and arrived on time.",
    "Fixed the issue quickly. Highly recommend for any home repairs.",
    "Very polite and cleaned up after the work was done. 5 stars!",
    "Great value for money. The expert knew exactly what was wrong.",
    "Best service I've had in Bangalore. Will definitely book again.",
    "Quick, efficient, and very helpful. Explained everything clearly.",
    "Top notch quality. My issue was resolved in under 30 minutes.",
    "Reliable and skilled. The results were better than expected."
];

const seedReviews = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for Review Seeding...');

        const providers = await Provider.find().populate('userId');
        const customer = await User.findOne({ role: 'customer' });

        if (!customer) {
            console.log('No customer found to write reviews. Please register a customer user first.');
            process.exit(1);
        }

        let reviewCount = 0;

        for (const provider of providers) {
            console.log(`Adding reviews for ${provider.userId.name}...`);
            
            // Generate 2 random reviews per provider
            for (let i = 0; i < 2; i++) {
                // 1. Create a mock completed booking
                const booking = await Booking.create({
                    customerId: customer._id,
                    providerId: provider.userId._id, // References User ID in Booking model
                    serviceType: provider.services[0].category,
                    description: 'Regular maintenance and checkup.',
                    status: 'completed',
                    paymentStatus: 'paid',
                    price: provider.services[0].basePrice,
                    scheduledAt: new Date(),
                    address: 'Test Address, Bangalore',
                    location: { type: 'Point', coordinates: [77.5946, 12.9716] } // Added missing coordinates
                });

                // 2. Create the Review
                await Review.create({
                    bookingId: booking._id,
                    customerId: customer._id,
                    providerId: provider.userId._id,
                    rating: 4 + Math.floor(Math.random() * 2), // 4 or 5 stars
                    comment: comments[Math.floor(Math.random() * comments.length)]
                });
                reviewCount++;
            }
        }

        console.log(`Successfully added ${reviewCount} reviews across the platform!`);
        process.exit();
    } catch (err) {
        console.error('Review Seed Error:', err);
        process.exit(1);
    }
};

seedReviews();
