const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Provider = require('./models/Provider');

dotenv.config();

const pendingData = [
    {
        name: 'John Carpenter',
        email: 'john.carpenter@example.com',
        phone: '9555000001',
        role: 'provider',
        category: 'Carpentry',
        location: [77.5800, 12.9100]
    },
    {
        name: 'Sarah Clean',
        email: 'sarah.cleaner@example.com',
        phone: '9555000002',
        role: 'provider',
        category: 'Cleaning',
        location: [77.6200, 12.9500]
    },
    {
        name: 'Mike Volt',
        email: 'mike.elec@example.com',
        phone: '9555000003',
        role: 'provider',
        category: 'Electrical',
        location: [77.6500, 12.9800]
    }
];

const seedPending = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        for (const data of pendingData) {
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
                    services: [{ category: data.category, subcategory: `General ${data.category}`, basePrice: 499, priceUnit: 'job' }],
                    isApproved: false, // This is a pending provider
                    isOnline: false,
                    currentLocation: { type: 'Point', coordinates: data.location },
                    bio: `Hello, I am ${data.name}. I am applying to join the ServiceMate platform.`
                });
                console.log(`Created pending provider: ${data.name}`);
            }
        }

        console.log('Pending providers seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Seed Error:', err);
        process.exit(1);
    }
};

seedPending();
