const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Provider = require('./models/Provider');

dotenv.config();

const demoAccounts = [
    {
        name: 'Demo Admin',
        email: 'admin@servicemate.com',
        phone: '9000000010',
        password: 'admin123',
        role: 'admin'
    },
    {
        name: 'Demo Provider (Plumber)',
        email: 'provider@servicemate.com',
        phone: '9000000011',
        password: 'provider123',
        role: 'provider',
        isProvider: true
    },
    {
        name: 'Demo Customer',
        email: 'customer@servicemate.com',
        phone: '9000000012',
        password: 'customer123',
        role: 'customer'
    }
];

const seedDemo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        for (const account of demoAccounts) {
            // Hash password will be handled by User model pre-save hook
            let user = await User.findOne({ email: account.email });
            
            if (user) {
                // Update existing
                user.role = account.role;
                user.password = account.password; // Model will re-hash it
                await user.save();
                console.log(`Updated: ${account.email}`);
            } else {
                // Create new
                user = await User.create(account);
                console.log(`Created: ${account.email}`);
            }

            // If it's a provider, ensure they have a profile and are approved
            if (account.role === 'provider') {
                let provider = await Provider.findOne({ userId: user._id });
                if (!provider) {
                    await Provider.create({
                        userId: user._id,
                        services: [
                            { category: 'Plumbing', subcategory: 'Emergency Repair', basePrice: 500, priceUnit: 'job' }
                        ],
                        isApproved: true,
                        isOnline: true,
                        currentLocation: { type: 'Point', coordinates: [77.5946, 12.9716] },
                        bio: 'Demo Provider for ServiceMate presentation.'
                    });
                } else {
                    provider.isApproved = true;
                    provider.isOnline = true;
                    await provider.save();
                }
            }
        }

        console.log('Demo accounts ready!');
        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

seedDemo();
