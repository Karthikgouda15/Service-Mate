const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Provider = require('./models/Provider');

dotenv.config();

const providersData = [
    // --- ELECTRICAL ---
    {
        name: 'Kumar Electrician',
        email: 'kumar.elec@example.com',
        phone: '9000000001',
        role: 'provider',
        location: [77.6200, 12.9500],
        category: 'Electrical',
        services: [
            { category: 'Electrical', subcategory: 'Fan/Light Installation', basePrice: 199, priceUnit: 'job' },
            { category: 'Electrical', subcategory: 'Short Circuit Repair', basePrice: 599, priceUnit: 'job' }
        ]
    },
    {
        name: 'Vikas Power Sol.',
        email: 'vikas.elec@example.com',
        phone: '9000000002',
        role: 'provider',
        location: [77.5800, 12.9100],
        category: 'Electrical',
        services: [
            { category: 'Electrical', subcategory: 'Full House Wiring', basePrice: 2499, priceUnit: 'job' }
        ]
    },
    // --- CLEANING ---
    {
        name: 'Priya Deep Clean',
        email: 'priya.clean@example.com',
        phone: '9000000003',
        role: 'provider',
        location: [77.6500, 12.9800],
        category: 'Cleaning',
        services: [
            { category: 'Cleaning', subcategory: 'Home Deep Cleaning', basePrice: 1299, priceUnit: 'job' },
            { category: 'Cleaning', subcategory: 'Kitchen Cleaning', basePrice: 699, priceUnit: 'job' }
        ]
    },
    {
        name: 'Sparkle Services',
        email: 'sparkle@example.com',
        phone: '9000000004',
        role: 'provider',
        location: [77.5500, 12.9900],
        category: 'Cleaning',
        services: [
            { category: 'Cleaning', subcategory: 'Sofa Cleaning', basePrice: 499, priceUnit: 'job' }
        ]
    },
    // --- AC REPAIR ---
    {
        name: 'Cool Air Experts',
        email: 'coolair@example.com',
        phone: '9000000005',
        role: 'provider',
        location: [77.6100, 12.9600],
        category: 'AC Repair',
        services: [
            { category: 'AC Repair', subcategory: 'AC Servicing', basePrice: 599, priceUnit: 'job' },
            { category: 'AC Repair', subcategory: 'Gas Charging', basePrice: 1599, priceUnit: 'job' }
        ]
    },
    // --- CARPENTRY ---
    {
        name: 'Mohit Woodworks',
        email: 'mohit.carp@example.com',
        phone: '9000000006',
        role: 'provider',
        location: [77.5900, 12.9200],
        category: 'Carpentry',
        services: [
            { category: 'Carpentry', subcategory: 'Furniture Repair', basePrice: 399, priceUnit: 'hr' },
            { category: 'Carpentry', subcategory: 'New Wardrobe', basePrice: 5000, priceUnit: 'job' }
        ]
    },
    // --- PAINTING ---
    {
        name: 'Color Me Perfect',
        email: 'color@example.com',
        phone: '9000000007',
        role: 'provider',
        location: [77.6300, 12.9400],
        category: 'Painting',
        services: [
            { category: 'Painting', subcategory: 'Wall Painting', basePrice: 15, priceUnit: 'sqft' },
            { category: 'Painting', subcategory: 'Waterproofing', basePrice: 45, priceUnit: 'sqft' }
        ]
    },
    // --- PEST CONTROL ---
    {
        name: 'Bug Busters',
        email: 'bugs@example.com',
        phone: '9000000008',
        role: 'provider',
        location: [77.5700, 12.9600],
        category: 'Pest Control',
        services: [
            { category: 'Pest Control', subcategory: 'Cockroach Control', basePrice: 899, priceUnit: 'visit' },
            { category: 'Pest Control', subcategory: 'Termite Treatment', basePrice: 2999, priceUnit: 'job' }
        ]
    },
    // --- GARDENING ---
    {
        name: 'Green Thumb',
        email: 'green@example.com',
        phone: '9000000009',
        role: 'provider',
        location: [77.6000, 13.0000],
        category: 'Gardening',
        services: [
            { category: 'Gardening', subcategory: 'Garden Maintenance', basePrice: 499, priceUnit: 'visit' },
            { category: 'Gardening', subcategory: 'Plantation', basePrice: 199, priceUnit: 'job' }
        ]
    }
];

const seedAll = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        for (const data of providersData) {
            let user = await User.findOne({ email: data.email });
            if (!user) {
                user = await User.create({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    password: 'password123',
                    role: 'provider',
                    location: { type: 'Point', coordinates: data.location }
                });
            }

            let provider = await Provider.findOne({ userId: user._id });
            if (!provider) {
                await Provider.create({
                    userId: user._id,
                    services: data.services,
                    isApproved: true,
                    isOnline: true,
                    currentLocation: { type: 'Point', coordinates: data.location },
                    rating: 4.5 + Math.random() * 0.5,
                    totalJobs: Math.floor(Math.random() * 20) + 5,
                    bio: `Professional ${data.category} expert available for immediate service.`
                });
                console.log(`Seeded: ${data.name} (${data.category})`);
            } else {
                provider.isApproved = true;
                provider.isOnline = true;
                await provider.save();
                console.log(`Verified: ${data.name}`);
            }
        }

        console.log('All services seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Seed Error:', err);
        process.exit(1);
    }
};

seedAll();
