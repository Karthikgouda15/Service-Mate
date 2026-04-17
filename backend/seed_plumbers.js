const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Provider = require('./models/Provider');

dotenv.config();

const plumbers = [
    {
        name: 'Rahul Sharma',
        email: 'rahul.plumber@example.com',
        phone: '9876543210',
        password: 'password123',
        role: 'provider',
        location: { type: 'Point', coordinates: [77.6413, 12.9788] } // Indiranagar, Bangalore
    },
    {
        name: 'Amit Kumar',
        email: 'amit.pro@example.com',
        phone: '9876543211',
        password: 'password123',
        role: 'provider',
        location: { type: 'Point', coordinates: [77.5946, 12.9716] } // Central Bangalore
    },
    {
        name: 'Suresh Tank',
        email: 'suresh.expert@example.com',
        phone: '9876543212',
        password: 'password123',
        role: 'provider',
        location: { type: 'Point', coordinates: [77.6101, 12.9352] } // Koramangala, Bangalore
    }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        for (const data of plumbers) {
            // 1. Create User
            let user = await User.findOne({ email: data.email });
            if (!user) {
                user = await User.create(data);
                console.log(`Created user: ${user.name}`);
            }

            // 2. Create Provider Profile
            let provider = await Provider.findOne({ userId: user._id });
            if (!provider) {
                provider = await Provider.create({
                    userId: user._id,
                    services: [
                        { category: 'Plumbing', subcategory: 'Pipe Leakage Repair', basePrice: 499, priceUnit: 'job' },
                        { category: 'Plumbing', subcategory: 'Tap & Shower Fix', basePrice: 299, priceUnit: 'job' },
                        { category: 'Plumbing', subcategory: 'Full Bathroom Checkup', basePrice: 799, priceUnit: 'visit' }
                    ],
                    isApproved: true,
                    isOnline: true,
                    currentLocation: data.location,
                    rating: 4.8,
                    totalJobs: 12,
                    bio: 'Expert plumber with 10 years of experience in high-end residential repairs.'
                });
                console.log(`Created provider profile for: ${user.name}`);
            } else {
                // Ensure they are online and approved for the demo
                provider.isOnline = true;
                provider.isApproved = true;
                await provider.save();
                console.log(`Updated status for: ${user.name}`);
            }
        }

        console.log('Seed completed successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
