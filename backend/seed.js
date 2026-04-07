const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Provider = require('./models/Provider');
const Service = require('./models/Service');
const bcrypt = require('bcryptjs');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for seeding...');
    } catch (error) {
        console.error('Connection error:', error);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        // Clear collections using drop to remove old indexes
        try { await mongoose.connection.collection('users').drop(); } catch(e){}
        try { await mongoose.connection.collection('providers').drop(); } catch(e){}
        try { await mongoose.connection.collection('services').drop(); } catch(e){}

        // 1. Create Base Services
        const services = [
            { category: 'Plumbing', subcategories: [{ name: 'Pipe Repair', basePrice: 200, priceUnit: 'hr', estimatedDuration: 60 }], icon: '🔧' },
            { category: 'Electrical', subcategories: [{ name: 'Wiring Fix', basePrice: 250, priceUnit: 'hr', estimatedDuration: 60 }], icon: '⚡' },
            { category: 'Cleaning', subcategories: [{ name: 'Deep Cleaning', basePrice: 500, priceUnit: 'job', estimatedDuration: 180 }], icon: '🧹' },
            { category: 'AC Repair', subcategories: [{ name: 'Gas Filling', basePrice: 1500, priceUnit: 'job', estimatedDuration: 90 }], icon: '❄️' },
            { category: 'Carpentry', subcategories: [{ name: 'Furniture Assembly', basePrice: 300, priceUnit: 'hr', estimatedDuration: 120 }], icon: '🪵' },
            { category: 'Painting', subcategories: [{ name: 'Wall Painting', basePrice: 2000, priceUnit: 'room', estimatedDuration: 300 }], icon: '🎨' },
            { category: 'Pest Control', subcategories: [{ name: 'Termite Treat', basePrice: 1200, priceUnit: 'job', estimatedDuration: 120 }], icon: '🐜' },
            { category: 'Gardening', subcategories: [{ name: 'Lawn Mowing', basePrice: 400, priceUnit: 'hr', estimatedDuration: 60 }], icon: '🌿' }
        ];
        await Service.insertMany(services);

        // 2. Create Dummy Providers
        const passwordHash = await bcrypt.hash('123456', 12);
        
        // Base coordinate (e.g. Bangalore center to match the map)
        const baseLat = 12.9716;
        const baseLng = 77.5946;

        const providerUsers = [
            { name: 'Ravi Plumber', email: 'ravi@example.com', phone: '9000000001', password: passwordHash, role: 'provider' },
            { name: 'Arun Electrician', email: 'arun@example.com', phone: '9000000002', password: passwordHash, role: 'provider' },
            { name: 'Suma Cleaners', email: 'suma@example.com', phone: '9000000003', password: passwordHash, role: 'provider' },
            { name: 'Cool Care AC', email: 'cool@example.com', phone: '9000000004', password: passwordHash, role: 'provider' },
            { name: 'Green Garden', email: 'green@example.com', phone: '9000000005', password: passwordHash, role: 'provider' }
        ];

        const insertedUsers = await User.insertMany(providerUsers);

        // 3. Create Corresponding Provider Profiles with slight coordinate offsets for map spread
        const providerProfiles = [
            {
                userId: insertedUsers[0]._id,
                services: [{ category: 'Plumbing', subcategory: 'Pipe Repair', basePrice: 200, priceUnit: 'hr' }],
                currentLocation: { type: 'Point', coordinates: [baseLng + 0.01, baseLat + 0.01] },
                isOnline: true,
                rating: 4.8
            },
            {
                userId: insertedUsers[1]._id,
                services: [{ category: 'Electrical', subcategory: 'Wiring Fix', basePrice: 250, priceUnit: 'hr' }],
                currentLocation: { type: 'Point', coordinates: [baseLng - 0.01, baseLat + 0.015] },
                isOnline: true,
                rating: 4.5
            },
            {
                userId: insertedUsers[2]._id,
                services: [{ category: 'Cleaning', subcategory: 'Deep Cleaning', basePrice: 500, priceUnit: 'job' }],
                currentLocation: { type: 'Point', coordinates: [baseLng + 0.02, baseLat - 0.01] },
                isOnline: true,
                rating: 4.9
            },
            {
                userId: insertedUsers[3]._id,
                services: [{ category: 'AC Repair', subcategory: 'Gas Filling', basePrice: 1500, priceUnit: 'job' }],
                currentLocation: { type: 'Point', coordinates: [baseLng - 0.015, baseLat - 0.015] },
                isOnline: true,
                rating: 4.7
            },
            {
                userId: insertedUsers[4]._id,
                services: [{ category: 'Gardening', subcategory: 'Lawn Mowing', basePrice: 400, priceUnit: 'hr' }],
                currentLocation: { type: 'Point', coordinates: [baseLng + 0.005, baseLat - 0.02] },
                isOnline: true,
                rating: 4.6
            }
        ];

        await Provider.insertMany(providerProfiles);

        console.log('Seeded completely!');
        process.exit();
    } catch (error) {
        console.error('Seeding error', error);
        process.exit(1);
    }
};

seedData();
