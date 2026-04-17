const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Booking = require('./models/Booking');

dotenv.config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const customer = await User.findOne({ email: 'customer@servicemate.com' });
        const provider = await User.findOne({ email: 'provider@servicemate.com' });

        if (!customer || !provider) {
            console.log('Demo accounts not found. Run seed_demo_accounts.js first.');
            process.exit(1);
        }

        console.log('Creating Test Booking...');
        const testBooking = await Booking.create({
            customerId: customer._id,
            providerId: provider._id,
            serviceType: 'Test Connection',
            description: 'Verifying end-to-end sync',
            scheduledAt: new Date(),
            address: '123 Test St',
            location: { type: 'Point', coordinates: [0, 0] },
            price: 99,
            timeline: [{ status: 'pending' }]
        });
        console.log(`Booking created with ID: ${testBooking._id}`);

        // Now simulate the provider query
        const providerBookings = await Booking.find({ providerId: provider._id });
        const found = providerBookings.some(b => b._id.equals(testBooking._id));
        
        console.log(`Provider Sync Status: ${found ? '✅ SUCCESS' : '❌ FAILED'}`);

        // Cleanup
        await Booking.findByIdAndDelete(testBooking._id);
        console.log('Test booking cleaned up.');
        
        process.exit();
    } catch (err) {
        console.error('Verification failed:', err);
        process.exit(1);
    }
};

verify();
