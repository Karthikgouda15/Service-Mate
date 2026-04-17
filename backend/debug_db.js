const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Provider = require('./models/Provider');
const Booking = require('./models/Booking');

dotenv.config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- DATABASE DEBUG REPORT ---');
        console.log('Connected to:', process.env.MONGODB_URI.split('@')[1]); // Show cluster info only

        const userCount = await User.countDocuments();
        const customerCount = await User.countDocuments({ role: 'customer' });
        const providerUserCount = await User.countDocuments({ role: 'provider' });
        const providerProfileCount = await Provider.countDocuments();
        const approvedProviders = await Provider.countDocuments({ isApproved: true });
        const bookingCount = await Booking.countDocuments();

        console.log(`Total Users: ${userCount}`);
        console.log(`Customers: ${customerCount}`);
        console.log(`Provider Users: ${providerUserCount}`);
        console.log(`Provider Profiles: ${providerProfileCount}`);
        console.log(`Approved Providers: ${approvedProviders}`);
        console.log(`Total Bookings: ${bookingCount}`);

        if (bookingCount > 0) {
            const latest = await Booking.findOne().sort({ createdAt: -1 });
            console.log('\nLatest Booking Details:');
            console.log(`ID: ${latest._id}`);
            console.log(`Status: ${latest.status}`);
            console.log(`Customer ID: ${latest.customerId}`);
            console.log(`Provider ID: ${latest.providerId}`);
        }

        console.log('----------------------------');
        process.exit();
    } catch (err) {
        console.error('Debug failed:', err);
        process.exit(1);
    }
};

debug();
